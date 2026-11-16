import { router, Stack } from 'expo-router';
import { ShoppingCart, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { FilterChips } from '@/components/shared/filter-chips';
import { FormError, FormField } from '@/components/shared/form-field';
import { LoadingButton } from '@/components/shared/loading-button';
import { QuantityStepper } from '@/components/shared/quantity-stepper';
import { ScrollScreen } from '@/components/shared/screen';
import { EmptyState } from '@/components/shared/state-message';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { formatCOP } from '@/lib/format';
import type { PaymentMethod } from '@/types/database';

import { useSaleCart } from '../cart-context';
import { useCreateSale } from '../hooks/use-sales';
import { NOTES_MAX_LENGTH } from '../schemas/sale-schema';
import { paymentMethodLabels, paymentMethods } from '../types';

const paymentOptions = paymentMethods.map((method) => ({
  value: method,
  label: paymentMethodLabels[method],
}));

export function ConfirmSaleScreen() {
  const cart = useSaleCart();
  const createSale = useCreateSale();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string>();
  const [confirming, setConfirming] = useState(false);

  if (cart.lines.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <Stack.Screen options={{ title: 'Venta en curso' }} />
        <EmptyState
          icon={ShoppingCart}
          title="Sin productos"
          description="Agrega productos desde la pestaña Vender.">
          <Button variant="outline" size="sm" onPress={() => router.back()}>
            <Text>Volver</Text>
          </Button>
        </EmptyState>
      </View>
    );
  }

  function handleSubmit() {
    if (!paymentMethod) {
      setValidationError('Selecciona el método de pago');
      return;
    }
    setValidationError(undefined);
    createSale.reset();
    setConfirming(true);
  }

  function handleConfirm() {
    if (!paymentMethod) return;
    createSale.mutate(
      {
        items: cart.lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
        paymentMethod,
        notes,
      },
      {
        onSuccess: ({ id }) => {
          cart.clear();
          router.replace(`/venta/${id}`);
        },
        onSettled: () => setConfirming(false),
      }
    );
  }

  return (
    <ScrollScreen
      footer={
        <View className="gap-3">
          <View className="flex-row items-baseline justify-between">
            <Text className="text-sm text-muted-foreground">Total</Text>
            <Text className="text-2xl font-semibold tabular-nums" aria-label="Total de la venta">
              {formatCOP(cart.total)}
            </Text>
          </View>
          <FormError message={validationError ?? createSale.error?.message} />
          <LoadingButton
            label="Confirmar venta"
            size="lg"
            loading={createSale.isPending}
            onPress={handleSubmit}
          />
        </View>
      }>
      <Stack.Screen options={{ title: 'Venta en curso' }} />

      <View className="overflow-hidden rounded-lg border border-border">
        {cart.lines.map((line, index) => (
          <View key={line.productId}>
            {index > 0 && <Separator />}
            <View className="gap-2 p-4">
              <View className="flex-row items-start gap-3">
                <View className="flex-1">
                  <Text className="font-medium">{line.name}</Text>
                  <Text className="text-xs text-muted-foreground">{formatCOP(line.price)} c/u</Text>
                </View>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Quitar ${line.name}`}
                  disabled={createSale.isPending}
                  onPress={() => cart.remove(line.productId)}>
                  <Icon as={Trash2} size={16} />
                </Button>
              </View>
              <View className="flex-row items-center justify-between">
                <QuantityStepper
                  label={line.name}
                  value={line.quantity}
                  max={line.stock}
                  disabled={createSale.isPending}
                  onChange={(quantity) => cart.setQuantity(line.productId, quantity)}
                />
                <Text className="font-medium tabular-nums" aria-label={`Subtotal de ${line.name}`}>
                  {formatCOP(line.price * line.quantity)}
                </Text>
              </View>
              {line.quantity >= line.stock && (
                <Text className="text-xs text-muted-foreground">
                  Máximo disponible: {line.stock}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <FormField label="Método de pago">
        <FilterChips
          label="Método de pago"
          options={paymentOptions}
          value={paymentMethod}
          onChange={(method) => {
            setPaymentMethod(method as PaymentMethod);
            setValidationError(undefined);
          }}
        />
      </FormField>

      <FormField label="Notas" optional>
        <Textarea
          aria-label="Notas"
          maxLength={NOTES_MAX_LENGTH}
          editable={!createSale.isPending}
          value={notes}
          onChangeText={setNotes}
        />
      </FormField>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="¿Confirmar venta?"
        description={
          paymentMethod
            ? `${cart.units} ${cart.units === 1 ? 'unidad' : 'unidades'} por ${formatCOP(cart.total)}, pago con ${paymentMethodLabels[paymentMethod].toLowerCase()}. Las existencias se descontarán del inventario.`
            : ''
        }
        confirmLabel="Confirmar venta"
        loading={createSale.isPending}
        onConfirm={handleConfirm}
      />
    </ScrollScreen>
  );
}
