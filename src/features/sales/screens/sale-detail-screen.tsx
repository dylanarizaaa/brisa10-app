import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Ban, ReceiptText } from 'lucide-react-native';
import { View } from 'react-native';

import { DetailItem, DetailList } from '@/components/shared/detail-list';
import { LoadingButton } from '@/components/shared/loading-button';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { ScrollScreen } from '@/components/shared/screen';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/features/auth/auth-context';
import { formatCOP, formatDateTime } from '@/lib/format';

import { SaleStatusBadge } from '../components/sale-status-badge';
import { useSale } from '../hooks/use-sales';
import { paymentMethodLabels, type SaleDetail } from '../types';

function SaleDetailContent({ sale }: { sale: SaleDetail }) {
  const { isAdmin } = useCurrentUser();
  const cancelled = sale.status === 'anulada';

  return (
    <ScrollScreen>
      <Stack.Screen options={{ title: 'Detalle de venta' }} />

      <View className="gap-2">
        <Text role="heading" className="text-2xl font-semibold tracking-tight">
          Venta N.º {sale.sale_number}
        </Text>
        <Text className="text-sm text-muted-foreground">{formatDateTime(sale.created_at)}</Text>
        <View className="flex-row">
          <SaleStatusBadge status={sale.status} />
        </View>
      </View>

      {cancelled && (
        <View className="gap-1 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <Text className="text-sm font-medium">Venta anulada</Text>
          <Text className="text-sm text-muted-foreground">
            {sale.cancelled_at && formatDateTime(sale.cancelled_at)}
            {sale.cancelled_by_name && ` · ${sale.cancelled_by_name}`}
          </Text>
          {sale.cancel_reason && <Text className="text-sm">Motivo: {sale.cancel_reason}</Text>}
        </View>
      )}

      <DetailList>
        <DetailItem label="Vendedor">{sale.seller_name}</DetailItem>
        <DetailItem label="Método de pago">{paymentMethodLabels[sale.payment_method]}</DetailItem>
        {sale.notes ? <DetailItem label="Notas">{sale.notes}</DetailItem> : null}
      </DetailList>

      <View className="overflow-hidden rounded-lg border border-border">
        {sale.items.map((item, index) => (
          <View key={item.id}>
            {index > 0 && <Separator />}
            <View className="flex-row items-center gap-3 px-4 py-3">
              <View className="flex-1">
                <Text className="text-sm font-medium">{item.product_name}</Text>
                <Text className="text-xs tabular-nums text-muted-foreground">
                  {item.quantity} × {formatCOP(item.unit_price)}
                </Text>
              </View>
              <Text className="text-sm tabular-nums">{formatCOP(item.subtotal)}</Text>
            </View>
          </View>
        ))}
        <Separator />
        <View className="flex-row items-center justify-between bg-muted/50 px-4 py-3">
          <Text className="font-medium">Total</Text>
          <Text
            className={
              cancelled
                ? 'text-lg font-semibold text-muted-foreground line-through'
                : 'text-lg font-semibold'
            }>
            {formatCOP(sale.total)}
          </Text>
        </View>
      </View>

      {isAdmin && !cancelled && (
        <LoadingButton
          label="Anular venta"
          variant="outline"
          icon={Ban}
          onPress={() => router.push({ pathname: '/anular-venta', params: { id: sale.id } })}
        />
      )}
    </ScrollScreen>
  );
}

export function SaleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sale = useSale(id);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Detalle de venta' }} />
      <QueryBoundary query={sale} notFoundIcon={ReceiptText} notFoundTitle="Venta no encontrada">
        {(data) => <SaleDetailContent sale={data} />}
      </QueryBoundary>
    </View>
  );
}
