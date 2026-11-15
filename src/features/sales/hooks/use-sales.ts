import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { pagedQueryOptions } from '@/components/shared/infinite-list';
import { toast } from '@/components/shared/toast';
import { dashboardKey } from '@/features/dashboard/hooks/use-dashboard';
import { movementsKey } from '@/features/movements/hooks/use-movements';
import { productsKey } from '@/features/products/hooks/use-products';

import {
  cancelSale,
  createSale,
  getSale,
  listSales,
  type CreateSaleInput,
} from '../services/sale-service';
import type { SaleFilters } from '../types';

export const salesKey = ['sales'] as const;

/** Una venta o su anulación cambia existencias, movimientos e indicadores. */
function invalidateSales(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: salesKey }),
    queryClient.invalidateQueries({ queryKey: productsKey }),
    queryClient.invalidateQueries({ queryKey: dashboardKey }),
    queryClient.invalidateQueries({ queryKey: movementsKey }),
  ]);
}

/** Historial de ventas con carga progresiva. */
export function useSales(filters: Omit<SaleFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: [...salesKey, 'list', filters],
    queryFn: ({ pageParam }) => listSales({ ...filters, page: pageParam }),
    ...pagedQueryOptions,
  });
}

export function useSale(id: string) {
  return useQuery({ queryKey: [...salesKey, 'detail', id], queryFn: () => getSale(id) });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSaleInput) => createSale(input),
    onSuccess: ({ saleNumber }) => toast.success(`Venta N.º ${saleNumber} registrada`),
    // También tras un error: si faltaron existencias, la lista de productos debe refrescarse.
    onSettled: () => invalidateSales(queryClient),
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelSale(id, reason),
    onSuccess: () => toast.success('Venta anulada. Las existencias volvieron al inventario'),
    onSettled: () => invalidateSales(queryClient),
  });
}
