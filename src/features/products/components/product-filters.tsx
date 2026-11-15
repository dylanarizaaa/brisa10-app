import { View } from 'react-native';

import { FilterChips } from '@/components/shared/filter-chips';
import { SearchInput } from '@/components/shared/search-input';
import { SelectField } from '@/components/shared/select-field';
import { useCategories } from '@/features/categories/hooks/use-categories';

import type { ActiveFilter, AvailabilityFilter, ProductFilters } from '../types';

export type ProductListFilters = Omit<ProductFilters, 'page'>;

export const defaultProductFilters: ProductListFilters = {
  search: '',
  categoryId: null,
  availability: 'all',
  active: 'all',
};

const availabilityOptions: { value: AvailabilityFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'in_stock', label: 'Con existencias' },
  { value: 'low', label: 'Bajo inventario' },
  { value: 'out', label: 'Agotados' },
];

const activeOptions = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];

interface ProductFiltersBarProps {
  filters: ProductListFilters;
  onChange: (filters: ProductListFilters) => void;
  /** Muestra los selectores de categoría y estado (no en la pantalla de venta). */
  showSelects?: boolean;
}

export function hasProductFilters(filters: ProductListFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.categoryId !== null ||
    filters.availability !== 'all' ||
    filters.active !== 'all'
  );
}

/** Búsqueda y filtros de productos, compartidos por Productos e Inventario. */
export function ProductFiltersBar({
  filters,
  onChange,
  showSelects = true,
}: ProductFiltersBarProps) {
  const categories = useCategories();
  const categoryOptions = [
    { value: 'all', label: 'Todas las categorías' },
    ...(categories.data ?? []).map((category) => ({ value: category.id, label: category.name })),
  ];

  return (
    <View className="gap-3 border-b border-border bg-background px-4 pb-3 pt-3">
      <SearchInput
        placeholder="Buscar por nombre o código…"
        value={filters.search}
        onChange={(search) => onChange({ ...filters, search })}
      />
      <FilterChips
        label="Filtrar por disponibilidad"
        options={availabilityOptions}
        value={filters.availability}
        onChange={(availability) => onChange({ ...filters, availability })}
      />
      {showSelects && (
        <View className="flex-row gap-2">
          <View className="flex-1">
            <SelectField
              label="Filtrar por categoría"
              options={categoryOptions}
              value={filters.categoryId ?? 'all'}
              onChange={(value) =>
                onChange({ ...filters, categoryId: value === 'all' ? null : value })
              }
            />
          </View>
          <View className="flex-1">
            <SelectField
              label="Filtrar por estado"
              options={activeOptions}
              value={filters.active}
              onChange={(value) => onChange({ ...filters, active: value as ActiveFilter })}
            />
          </View>
        </View>
      )}
    </View>
  );
}
