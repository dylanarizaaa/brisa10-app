import { useQueryClient } from '@tanstack/react-query';
import {
  Banknote,
  CircleCheck,
  CircleSlash,
  Package,
  ShoppingCart,
  TriangleAlert,
} from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { ScrollScreen } from '@/components/shared/screen';
import { ErrorState } from '@/components/shared/state-message';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/features/auth/auth-context';
import { formatCOP } from '@/lib/format';

import { InventoryStatus } from '../components/inventory-status';
import { RecentActivity } from '../components/recent-activity';
import { SalesChart } from '../components/sales-chart';
import { StatCard } from '../components/stat-card';
import { TopProducts } from '../components/top-products';
import { dashboardKey, useDashboardSummary } from '../hooks/use-dashboard';

export function DashboardScreen() {
  const user = useCurrentUser();
  const summary = useDashboardSummary();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const data = summary.data;
  const firstName = user.full_name.split(' ')[0];

  async function refresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: dashboardKey });
    setRefreshing(false);
  }

  return (
    <ScrollScreen refreshing={refreshing} onRefresh={() => void refresh()}>
      <View>
        <Text role="heading" className="text-2xl font-semibold tracking-tight">
          Hola, {firstName}
        </Text>
        <Text className="text-sm text-muted-foreground">Este es el estado del negocio hoy.</Text>
      </View>

      {summary.isError ? (
        <View className="rounded-lg border border-border">
          <ErrorState message={summary.error.message} onRetry={() => void summary.refetch()} />
        </View>
      ) : (
        <View className="gap-3">
          <View className="flex-row gap-3">
            <StatCard
              className="flex-1"
              label="Ventas de hoy"
              value={data?.sales_today_count}
              icon={ShoppingCart}
            />
            <StatCard
              className="flex-1"
              label="Ingresos de hoy"
              value={data && formatCOP(data.sales_today_revenue)}
              icon={Banknote}
            />
          </View>
          <View className="flex-row gap-3">
            <StatCard
              className="flex-1"
              label="Productos"
              value={data?.total_products}
              icon={Package}
              hint={
                data && data.inactive_products > 0
                  ? `${data.inactive_products} inactivos`
                  : undefined
              }
            />
            <StatCard
              className="flex-1"
              label="Disponibles"
              value={data?.available_products}
              icon={CircleCheck}
            />
          </View>
          <View className="flex-row gap-3">
            <StatCard
              className="flex-1"
              label="Bajo inventario"
              value={data?.low_stock_products}
              icon={TriangleAlert}
              tone={data && data.low_stock_products > 0 ? 'warning' : 'default'}
            />
            <StatCard
              className="flex-1"
              label="Agotados"
              value={data?.out_of_stock_products}
              icon={CircleSlash}
              tone={data && data.out_of_stock_products > 0 ? 'danger' : 'default'}
            />
          </View>
        </View>
      )}

      <SalesChart />
      <InventoryStatus summary={summary.isError ? undefined : data} />
      <TopProducts />
      <RecentActivity />
    </ScrollScreen>
  );
}
