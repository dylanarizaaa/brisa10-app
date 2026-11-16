import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { pagedQueryOptions } from '@/components/shared/infinite-list';
import { toast } from '@/components/shared/toast';
import { useCurrentUser } from '@/features/auth/auth-context';
import { categoriesKey } from '@/features/categories/hooks/use-categories';
import { dashboardKey } from '@/features/dashboard/hooks/use-dashboard';

import type { ProductValues } from '../schemas/product-schema';
import {
  deleteProductImage,
  reorderProductImages,
  uploadProductImage,
  type PickedImage,
} from '../services/product-image-service';
import {
  createProduct,
  getProduct,
  listProducts,
  setProductActive,
  setProductCatalog,
  updateProduct,
} from '../services/product-service';
import type { ProductFilters, ProductImage } from '../types';

export const productsKey = ['products'] as const;

/** Un cambio en productos afecta también los contadores del panel y de categorías. */
function invalidateProducts(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: productsKey }),
    queryClient.invalidateQueries({ queryKey: dashboardKey }),
    queryClient.invalidateQueries({ queryKey: categoriesKey }),
  ]);
}

/** Lista de productos con carga progresiva. */
export function useProducts(filters: Omit<ProductFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: [...productsKey, 'list', filters],
    queryFn: ({ pageParam }) => listProducts({ ...filters, page: pageParam }),
    ...pagedQueryOptions,
  });
}

export function useProduct(id: string) {
  const { isAdmin } = useCurrentUser();
  return useQuery({
    queryKey: [...productsKey, 'detail', id, { isAdmin }],
    queryFn: () => getProduct(id, isAdmin),
  });
}

/** Crea un producto, o lo edita si se indica `id`. Devuelve el id del producto guardado. */
export function useSaveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: ProductValues }) => {
      if (!id) {
        const created = await createProduct(values);
        created.warnings.forEach((warning) => toast.warning(warning));
        return created.id;
      }
      await updateProduct(id, values);
      return id;
    },
    onSuccess: (_id, { id }) => {
      toast.success(id ? 'Producto actualizado' : 'Producto creado');
    },
    // También tras un error: el producto pudo guardarse aunque fallara el costo.
    onSettled: () => invalidateProducts(queryClient),
  });
}

export function useSetProductActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setProductActive(id, isActive),
    onSuccess: (_data, { isActive }) => {
      toast.success(isActive ? 'Producto activado' : 'Producto desactivado');
      return invalidateProducts(queryClient);
    },
    onError: (error) => toast.error(error.message),
  });
}

/** Publica o retira el producto de la tienda virtual, o cambia si es destacado. */
export function useSetProductCatalog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...changes
    }: {
      id: string;
      is_published?: boolean;
      is_featured?: boolean;
    }) => setProductCatalog(id, changes),
    onSuccess: (_data, changes) => {
      if (changes.is_published !== undefined) {
        toast.success(
          changes.is_published ? 'Publicado en la tienda virtual' : 'Retirado de la tienda virtual'
        );
      } else {
        toast.success(changes.is_featured ? 'Marcado como destacado' : 'Ya no es destacado');
      }
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: productsKey }),
  });
}

export function useUploadProductImages(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    /** Sube las imágenes una por una; devuelve los mensajes de las que fallaron. */
    mutationFn: async ({
      images,
      startPosition,
    }: {
      images: PickedImage[];
      startPosition: number;
    }) => {
      const errors: string[] = [];
      let position = startPosition;
      for (const image of images) {
        try {
          await uploadProductImage(productId, image, position);
          position += 1;
        } catch (error) {
          errors.push(error instanceof Error ? error.message : 'No se pudo subir una fotografía');
        }
      }
      return { uploaded: position - startPosition, errors };
    },
    onSuccess: ({ uploaded, errors }) => {
      if (uploaded > 0) {
        toast.success(uploaded === 1 ? 'Fotografía agregada' : `${uploaded} fotografías agregadas`);
      }
      errors.forEach((message) => toast.error(message));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: productsKey }),
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (image: ProductImage) => deleteProductImage(image),
    onSuccess: () => toast.success('Fotografía eliminada'),
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: productsKey }),
  });
}

export function useReorderProductImages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderProductImages(orderedIds),
    onSuccess: () => toast.success('Fotografía principal actualizada'),
    onError: (error) => toast.error(error.message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: productsKey }),
  });
}
