import { router, Stack } from 'expo-router';
import { Receipt } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { FilterChips } from '@/components/shared/filter-chips';
import { InfiniteList } from '@/components/shared/infinite-list';
import { PeriodChips, periodRange, type Period } from '@/components/shared/period-chips';
import { Screen } from '@/components/shared/screen';
import { SelectField } from '@/components/shared/select-field';
import { Text } from '@/components/ui/text';
import { formatCOP, formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

import { SaleStatusBadge } from '../components/sale-status-badge';
import { useSales } from '../hooks/use-sales';
import {
  paymentMethodLabels,
  paymentMethods,
  type PaymentFilter,
  type SaleStatusFilter,
} from '../types';

const statusOptions: { value: SaleStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'completada', label: 'Completadas' },
  { value: 'anulada', label: 'Anuladas' },
];

const paymentOptions = [
  { value: 'all', label: 'Todos los pagos' },
  ...paymentMethods.map((method) => ({ value: method, label: paymentMethodLabels[method] })),
];

export function SalesScreen() {
  const [period, setPeriod] = useState<Period>('all');
  const [status, setStatus] = useState<SaleStatusFilter>('all');
  const [payment, setPayment] = useState<PaymentFilter>('all');
  const sales = useSales({ status, payment, ...periodRange(period) });

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Historial de ventas' }} />
      <View className="gap-3 border-b border-border p-4">
        <PeriodChips value={period} onChange={setPeriod} />
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <SelectField
              label="Filtrar por método de pago"
              options={paymentOptions}
              value={payment}
              onChange={(value) => setPayment(value as PaymentFilter)}
            />
          </View>
        </View>
        <FilterChips
          label="Filtrar por estado"
          options={statusOptions}
          value={status}
          onChange={setStatus}
        />
      </View>
      <InfiniteList
        query={sales}
        noun="ventas"
        keyExtractor={(sale) => sale.id}
        hasFilters={period !== 'all' || status !== 'all' || payment !== 'all'}
        emptyIcon={Receipt}
        emptyTitle="Aún no hay ventas"
        emptyDescription="Las ventas que registres aparecerán aquí."
        renderItem={(sale) => (
          <Pressable
            role="button"
            aria-label={`Venta N.º ${sale.sale_number}, ${formatCOP(sale.total)}`}
            onPress={() => router.push(`/venta/${sale.id}`)}
            className="flex-row items-center gap-3 px-4 py-3 active:bg-accent">
            <View className="flex-1 gap-0.5">
              <Text className="font-medium">N.º {sale.sale_number}</Text>
              <Text numberOfLines={1} className="text-xs text-muted-foreground">
                {formatDateTime(sale.created_at)} · {paymentMethodLabels[sale.payment_method]} ·{' '}
                {sale.seller_name}
              </Text>
            </View>
            <View className="items-end gap-1">
              <Text
                className={cn(
                  'font-medium tabular-nums',
                  sale.status === 'anulada' && 'text-muted-foreground line-through'
                )}>
                {formatCOP(sale.total)}
              </Text>
              <SaleStatusBadge status={sale.status} />
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}
