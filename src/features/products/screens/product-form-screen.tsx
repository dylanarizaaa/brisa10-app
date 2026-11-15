import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { PackageX } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { FormError, FormField } from '@/components/shared/form-field';
import { LoadingButton } from '@/components/shared/loading-button';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { ScrollScreen } from '@/components/shared/screen';
import { SelectField } from '@/components/shared/select-field';
import { SwitchField } from '@/components/shared/switch-field';
import { TextField } from '@/components/shared/text-field';
import { Separator } from '@/components/ui/separator';
import { useCategories } from '@/features/categories/hooks/use-categories';

import { useProduct, useSaveProduct } from '../hooks/use-products';
import { productSchema, type ProductValues } from '../schemas/product-schema';
import type { ProductDetail } from '../types';

function ProductForm({ product }: { product?: ProductDetail }) {
  const save = useSaveProduct();
  const categories = useCategories();
  const { control, handleSubmit } = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      sku: product?.sku ?? '',
      description: product?.description ?? '',
      categoryId: product?.category_id ?? '',
      price: product ? String(product.price) : '',
      cost: product?.cost != null ? String(product.cost) : '',
      minStock: product?.min_stock != null ? String(product.min_stock) : '',
      isPublished: product?.is_published ?? false,
      isFeatured: product?.is_featured ?? false,
      initialStock: '',
    },
  });

  // Solo categorías activas, más la actual del producto aunque esté inactiva.
  const categoryOptions = (categories.data ?? [])
    .filter((category) => category.is_active || category.id === product?.category_id)
    .map((category) => ({ value: category.id, label: category.name }));

  const submit = handleSubmit((values) =>
    save.mutate(
      { id: product?.id, values },
      {
        onSuccess: (id) => {
          if (product) router.back();
          else router.replace(`/producto/${id}`);
        },
      }
    )
  );

  return (
    <ScrollScreen
      footer={
        <View className="gap-3">
          <FormError message={save.error?.message} />
          <LoadingButton
            label={product ? 'Guardar cambios' : 'Crear producto'}
            loading={save.isPending}
            onPress={() => void submit()}
          />
        </View>
      }>
      <TextField
        control={control}
        name="name"
        label="Nombre"
        placeholder="Ej. Taza de cerámica pintada a mano"
      />

      <Controller
        control={control}
        name="categoryId"
        render={({ field, fieldState }) => (
          <FormField label="Categoría" error={fieldState.error?.message}>
            <SelectField
              label="Categoría"
              options={categoryOptions}
              value={field.value}
              onChange={field.onChange}
              placeholder={categories.isPending ? 'Cargando…' : 'Selecciona una categoría'}
              disabled={categories.isPending}
              invalid={Boolean(fieldState.error)}
            />
          </FormField>
        )}
      />

      <View className="flex-row gap-3">
        <TextField
          control={control}
          name="price"
          label="Precio de venta"
          hint="En pesos, sin puntos."
          numeric
          placeholder="25000"
          containerClassName="flex-1"
        />
        <TextField
          control={control}
          name="cost"
          label="Costo"
          optional
          numeric
          containerClassName="flex-1"
        />
      </View>

      <TextField
        control={control}
        name="minStock"
        label="Stock mínimo"
        optional
        numeric
        hint="Si lo dejas vacío se usa el umbral general del negocio."
      />

      {!product && (
        <TextField
          control={control}
          name="initialStock"
          label="Existencias iniciales"
          optional
          numeric
          hint="Unidades que tienes hoy. Se registran como una entrada de inventario."
        />
      )}

      <TextField
        control={control}
        name="sku"
        label="Código (SKU)"
        optional
        autoCapitalize="characters"
        hint="Código propio o de barras, para encontrar el producto rápido."
      />

      <TextField control={control} name="description" label="Descripción" optional multiline />

      <Separator />

      <SwitchField
        control={control}
        name="isPublished"
        label="Publicar en la tienda virtual"
        description="Solo se muestra si el producto está activo."
      />
      <SwitchField
        control={control}
        name="isFeatured"
        label="Destacado"
        description="Aparece primero en la tienda virtual."
      />
    </ScrollScreen>
  );
}

export function ProductCreateScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Nuevo producto' }} />
      <ProductForm />
    </>
  );
}

export function ProductEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProduct(id);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Editar producto' }} />
      <QueryBoundary query={product} notFoundIcon={PackageX} notFoundTitle="Producto no encontrado">
        {(data) => <ProductForm product={data} />}
      </QueryBoundary>
    </View>
  );
}
