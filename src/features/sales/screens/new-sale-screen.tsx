import { router, Tabs } from 'expo-router';
import { History, Package, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { HeaderButton } from '@/components/shared/header-button';
import { InfiniteList } from '@/components/shared/infinite-list';
import { Screen } from '@/components/shared/screen';
import { SearchInput } from '@/components/shared/search-input';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { ProductRow } from '@/features/products/components/product-row';
import { useProducts } from '@/features/products/hooks/use-products';
import { formatCOP } from '@/lib/format';

import { useSaleCart } from '../cart-context';
import { CartBar } from '../components/cart-bar';

/** Punto de venta: se buscan productos activos y se agregan al carrito tocándolos. */
export function NewSaleScreen() {
  const cart = useSaleCart();
  const [search, setSearch] = useState('');
  const products = useProducts({ search, categoryId: null, availability: 'all', active: 'active' });

  return (
    <Screen>
      <Tabs.Screen
        options={{
          title: 'Vender',
          headerRight: () => (
            <HeaderButton
              icon={History}
              label="Historial de ventas"
              onPress={() => router.push('/ventas')}
            />
          ),
        }}
      />
      <View className="border-b border-border p-4">
        <SearchInput
          placeholder="Buscar producto por nombre o código…"
          value={search}
          onChange={setSearch}
        />
      </View>
      <InfiniteList
        query={products}
        noun="productos"
        keyExtractor={(product) => product.id}
        hasFilters={search.trim() !== ''}
        emptyIcon={Package}
        emptyTitle="No hay productos activos"
        emptyDescription="Registra productos para poder venderlos."
        renderItem={(product) => {
          const inCart = cart.lines.find((line) => line.productId === product.id)?.quantity ?? 0;
          const remaining = product.stock - inCart;
          return (
            <ProductRow
              product={product}
              accessibleLabel={`Agregar ${product.name}`}
              disabled={remaining <= 0}
              onPress={() => cart.add(product)}
              subtitle={
                product.stock === 0
                  ? 'Agotado'
                  : remaining <= 0
                    ? 'Todas las existencias están en la venta'
                    : `${remaining} ${remaining === 1 ? 'disponible' : 'disponibles'}`
              }
              trailing={
                <View className="flex-row items-center gap-3">
                  <Text className="text-sm font-medium tabular-nums">
                    {formatCOP(product.price)}
                  </Text>
                  {inCart > 0 ? (
                    <Badge aria-label={`${inCart} en la venta`}>
                      <Text>{inCart}</Text>
                    </Badge>
                  ) : (
                    <Icon as={Plus} size={18} className="text-muted-foreground" />
                  )}
                </View>
              }
            />
          );
        }}
      />
      <CartBar />
    </Screen>
  );
}
