import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { pagedQueryOptions } from '@/components/shared/infinite-list';

import { listMovements, listMovementUsers } from '../services/movement-service';
import type { MovementFilters } from '../types';

export const movementsKey = ['movements'] as const;

/** Historial de movimientos con carga progresiva. */
export function useMovements(filters: Omit<MovementFilters, 'page'>) {
  return useInfiniteQuery({
    queryKey: [...movementsKey, 'list', filters],
    queryFn: ({ pageParam }) => listMovements({ ...filters, page: pageParam }),
    ...pagedQueryOptions,
    // El historial cambia con cada venta o movimiento: se consulta de nuevo al abrirlo.
    staleTime: 0,
  });
}

export function useMovementUsers() {
  return useQuery({
    queryKey: [...movementsKey, 'users'],
    queryFn: listMovementUsers,
    staleTime: 5 * 60_000,
  });
}
