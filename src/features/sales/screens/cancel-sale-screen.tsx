import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { FormError } from '@/components/shared/form-field';
import { LoadingButton } from '@/components/shared/loading-button';
import { ScrollScreen } from '@/components/shared/screen';
import { TextField } from '@/components/shared/text-field';
import { Text } from '@/components/ui/text';

import { useCancelSale, useSale } from '../hooks/use-sales';
import { cancelSaleSchema, type CancelSaleValues } from '../schemas/sale-schema';

/** Anular una venta (solo administrador). Se abre como hoja modal. */
export function CancelSaleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sale = useSale(id);
  const cancel = useCancelSale();
  const { control, handleSubmit } = useForm<CancelSaleValues>({
    resolver: zodResolver(cancelSaleSchema),
    defaultValues: { reason: '' },
  });

  const submit = handleSubmit(({ reason }) =>
    cancel.mutate({ id, reason }, { onSuccess: () => router.back() })
  );

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: sale.data ? `Anular venta N.º ${sale.data.sale_number}` : 'Anular venta',
        }}
      />
      <ScrollScreen>
        <Text className="text-sm text-muted-foreground">
          Los productos vuelven al inventario y la venta deja de contar en los ingresos. La
          anulación queda registrada y no se puede deshacer.
        </Text>
        <TextField
          control={control}
          name="reason"
          label="Motivo"
          placeholder="Ej. El cliente devolvió los productos"
          multiline
          autoFocus
        />
        <FormError message={cancel.error?.message} />
        <LoadingButton
          label="Anular venta"
          variant="destructive"
          loading={cancel.isPending}
          onPress={() => void submit()}
        />
      </ScrollScreen>
    </View>
  );
}
