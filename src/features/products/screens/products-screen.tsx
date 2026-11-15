import { router, Tabs } from 'expo-router';
import { Package, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Fab } from '@/components/shared/fab';
import { InfiniteList } from '@/components/shared/infinite-list';
import { Screen } from '@/components/shared/screen';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/features/auth/auth-context';
import { formatCOP } from '@/lib/format';

import {
  defaultProductFilters,
  hasProductFilters,
  ProductFiltersBar,
  type ProductListFilters,
} from '../components/product-filters';
import { ProductRow } from '../components/product-row';
import { StockBadge } from '../components/stock-badge';
import { useProducts } from '../hooks/use-products';

export function ProductsScreen() {
  const { isAdmin } = useCurrentUser();
  const [filters, setFilters] = useState<ProductListFilters>(defaultProductFilters);
  const products = useProducts(filters);

  return (
    <Screen>
      <Tabs.Screen options={{ title: 'Productos' }} />
      <ProductFiltersBar filters={filters} onChange={setFilters} />
      <InfiniteList
        query={products}
        noun="productos"
        keyExtractor={(product) => product.id}
        hasFilters={hasProductFilters(filters)}
        emptyIcon={Package}
        emptyTitle="Aún no hay productos"
        emptyDescription={
          isAdmin
            ? 'Crea el primer producto para empezar a armar el catálogo.'
            : 'El administrador todavía no ha registrado productos.'
        }
        renderItem={(product) => (
          <ProductRow
            product={product}
            onPress={() => router.push(`/producto/${product.id}`)}
            trailing={
              <View className="items-end gap-1">
                <Text className="text-sm font-medium tabular-nums">{formatCOP(product.price)}</Text>
                <StockBadge status={product.stock_status} />
              </View>
            }
          />
        )}
      />
      {isAdmin && <Fab icon={Plus} label="Nuevo" onPress={() => router.push('/producto/nuevo')} />}
    </Screen>
  );
}
