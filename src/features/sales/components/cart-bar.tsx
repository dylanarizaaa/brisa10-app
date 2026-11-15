import { router } from 'expo-router';
import { ShoppingCart } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { formatCOP } from '@/lib/format';

import { useSaleCart } from '../cart-context';

/** Resumen fijo al pie de "Vender": unidades, total y acceso a confirmar la venta. */
export function CartBar() {
  const cart = useSaleCart();
  if (cart.lines.length === 0) return null;

  return (
    <View className="flex-row items-center gap-3 border-t border-border bg-background px-4 py-3">
      <View className="flex-1">
        <Text className="text-xs text-muted-foreground">
          {cart.units} {cart.units === 1 ? 'unidad' : 'unidades'}
        </Text>
        <Text className="text-lg font-semibold tabular-nums" aria-label="Total de la venta">
          {formatCOP(cart.total)}
        </Text>
      </View>
      <Button aria-label="Revisar venta" onPress={() => router.push('/venta/confirmar')}>
        <Icon as={ShoppingCart} size={16} />
        <Text>Revisar venta</Text>
      </Button>
    </View>
  );
}
