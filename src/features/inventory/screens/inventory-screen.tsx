import { router, Tabs, useLocalSearchParams } from 'expo-router';
import { Warehouse } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { InfiniteList } from '@/components/shared/infinite-list';
import { Screen } from '@/components/shared/screen';
import { Text } from '@/components/ui/text';
import {
  defaultProductFilters,
  hasProductFilters,
  ProductFiltersBar,
  type ProductListFilters,
} from '@/features/products/components/product-filters';
import { ProductRow } from '@/features/products/components/product-row';
import { StockBadge } from '@/features/products/components/stock-badge';
import { useProducts } from '@/features/products/hooks/use-products';
import type { AvailabilityFilter } from '@/features/products/types';

const availabilityValues: AvailabilityFilter[] = ['all', 'in_stock', 'low', 'out'];

export function InventoryScreen() {
  // El panel puede abrir el inventario ya filtrado (?existencias=low).
  const { existencias } = useLocalSearchParams<{ existencias?: string }>();
  const fromLink = availabilityValues.find((value) => value === existencias) ?? 'all';
  const [filters, setFilters] = useState<ProductListFilters>({
    ...defaultProductFilters,
    availability: fromLink,
  });
  const [lastLink, setLastLink] = useState(fromLink);
  if (fromLink !== lastLink) {
    setLastLink(fromLink);
    setFilters((current) => ({ ...current, availability: fromLink }));
  }
  const products = useProducts(filters);

  return (
    <Screen>
      <Tabs.Screen options={{ title: 'Inventario' }} />
      <ProductFiltersBar filters={filters} onChange={setFilters} />
      <InfiniteList
        query={products}
        noun="productos"
        keyExtractor={(product) => product.id}
        hasFilters={hasProductFilters(filters)}
        emptyIcon={Warehouse}
        emptyTitle="Aún no hay productos"
        emptyDescription="El inventario se lleva por producto. Registra primero los productos del negocio."
        renderItem={(product) => (
          <ProductRow
            product={product}
            accessibleLabel={`${product.name}: ${product.stock} en existencias. Registrar movimiento`}
            subtitle={`Mínimo ${product.effective_min_stock}${product.sku ? ` · ${product.sku}` : ''}`}
            onPress={() =>
              router.push({ pathname: '/movimiento', params: { productId: product.id } })
            }
            trailing={
              <View className="items-end gap-1">
                <Text className="text-lg font-semibold tabular-nums">{product.stock}</Text>
                <StockBadge status={product.stock_status} />
              </View>
            }
          />
        )}
      />
    </Screen>
  );
}
