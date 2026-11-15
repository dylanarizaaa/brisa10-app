import { router } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { ListSkeleton } from '@/components/shared/list-skeleton';
import { SectionCard } from '@/components/shared/section-card';
import { EmptyState, ErrorState } from '@/components/shared/state-message';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { formatCOP } from '@/lib/format';

import { TOP_PRODUCTS_DAYS, useTopProducts } from '../hooks/use-dashboard';

export function TopProducts() {
  const top = useTopProducts();

  return (
    <SectionCard title="Productos más vendidos" description={`Últimos ${TOP_PRODUCTS_DAYS} días`}>
      {top.isPending ? (
        <ListSkeleton rows={3} label="Cargando productos más vendidos" />
      ) : top.isError ? (
        <ErrorState message={top.error.message} onRetry={() => void top.refetch()} />
      ) : top.data.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Sin ventas en el periodo"
          description="Aquí aparecerán los productos que más se vendan."
        />
      ) : (
        top.data.map((product, index) => (
          <View key={product.product_id}>
            {index > 0 && <Separator />}
            <Pressable
              role="link"
              aria-label={`${index + 1}. ${product.product_name}: ${product.units} unidades`}
              onPress={() => router.push(`/producto/${product.product_id}`)}
              className="flex-row items-center gap-3 px-4 py-3 active:bg-accent">
              <Text className="w-5 text-sm tabular-nums text-muted-foreground">{index + 1}</Text>
              <Text numberOfLines={1} className="flex-1 text-sm font-medium">
                {product.product_name}
              </Text>
              <View className="items-end">
                <Text className="text-sm tabular-nums">
                  {product.units} {product.units === 1 ? 'unidad' : 'unidades'}
                </Text>
                <Text className="text-xs tabular-nums text-muted-foreground">
                  {formatCOP(product.revenue)}
                </Text>
              </View>
            </Pressable>
          </View>
        ))
      )}
    </SectionCard>
  );
}
