import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowRight, PackageX } from 'lucide-react-native';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { View } from 'react-native';

import { FilterChips } from '@/components/shared/filter-chips';
import { FormError } from '@/components/shared/form-field';
import { LoadingButton } from '@/components/shared/loading-button';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { ScrollScreen } from '@/components/shared/screen';
import { TextField } from '@/components/shared/text-field';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/features/auth/auth-context';
import { ProductRow } from '@/features/products/components/product-row';
import { useProduct } from '@/features/products/hooks/use-products';
import type { ProductDetail } from '@/features/products/types';

import { useStockOperation } from '../hooks/use-inventory';
import { movementSchema, type MovementValues } from '../schemas/movement-schema';
import { movementModeLabels, type MovementMode } from '../types';

const fieldCopy: Record<MovementMode, { quantity: string; placeholder: string }> = {
  entrada: { quantity: 'Unidades que entran', placeholder: 'Ej. Compra a proveedor' },
  salida: { quantity: 'Unidades que salen', placeholder: 'Ej. Producto dañado' },
  ajuste: { quantity: 'Existencias reales contadas', placeholder: 'Ej. Conteo físico' },
};

function MovementForm({ mode, product }: { mode: MovementMode; product: ProductDetail }) {
  const operation = useStockOperation();
  const copy = fieldCopy[mode];
  const { control, handleSubmit } = useForm<MovementValues>({
    resolver: zodResolver(movementSchema(mode, product.stock)),
    defaultValues: { quantity: '', reason: '' },
  });

  // Vista previa de cómo quedarán las existencias con lo que se está escribiendo.
  const typed = useWatch({ control, name: 'quantity' }).trim();
  const amount = /^\d+$/.test(typed) ? Number(typed) : null;
  const resulting =
    amount === null
      ? null
      : mode === 'ajuste'
        ? amount
        : mode === 'entrada'
          ? product.stock + amount
          : product.stock - amount;

  const submit = handleSubmit((values) =>
    operation.mutate(
      { productId: product.id, mode, quantity: Number(values.quantity), reason: values.reason },
      { onSuccess: () => router.back() }
    )
  );

  return (
    <View className="gap-5">
      <View className="flex-row items-center gap-3 rounded-md bg-muted px-3 py-2">
        <Text className="text-sm text-muted-foreground">Existencias</Text>
        <Text className="font-medium tabular-nums">{product.stock}</Text>
        {resulting !== null && resulting >= 0 && resulting !== product.stock && (
          <>
            <Icon as={ArrowRight} size={16} className="text-muted-foreground" />
            <Text
              className="font-medium tabular-nums"
              aria-label="Existencias después de la operación">
              {resulting}
            </Text>
          </>
        )}
      </View>

      <TextField control={control} name="quantity" label={copy.quantity} numeric autoFocus />
      <TextField
        control={control}
        name="reason"
        label="Motivo"
        optional={mode === 'entrada'}
        placeholder={copy.placeholder}
        multiline
      />

      <FormError message={operation.error?.message} />
      <LoadingButton
        label={movementModeLabels[mode].action}
        loading={operation.isPending}
        onPress={() => void submit()}
      />
    </View>
  );
}

function MovementContent({
  product,
  initialMode,
}: {
  product: ProductDetail;
  initialMode: MovementMode;
}) {
  const { isAdmin } = useCurrentUser();
  const [mode, setMode] = useState<MovementMode>(initialMode);
  const modes: { value: MovementMode; label: string }[] = [
    { value: 'entrada', label: 'Entrada' },
    ...(product.stock > 0 ? [{ value: 'salida' as const, label: 'Salida' }] : []),
    ...(isAdmin ? [{ value: 'ajuste' as const, label: 'Ajuste' }] : []),
  ];

  return (
    <ScrollScreen className="p-0 pb-10">
      <ProductRow product={product} />
      <View className="gap-5 px-4">
        <FilterChips label="Tipo de movimiento" options={modes} value={mode} onChange={setMode} />
        {/* El formulario se monta de nuevo al cambiar de tipo: parte de valores limpios. */}
        <MovementForm key={mode} mode={mode} product={product} />
      </View>
    </ScrollScreen>
  );
}

/** Entrada, salida o ajuste de existencias de un producto. Se abre como hoja modal. */
export function MovementScreen() {
  const { productId, modo } = useLocalSearchParams<{ productId: string; modo?: string }>();
  const product = useProduct(productId);
  const initialMode: MovementMode = modo === 'salida' || modo === 'ajuste' ? modo : 'entrada';

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Movimiento de inventario' }} />
      <QueryBoundary query={product} notFoundIcon={PackageX} notFoundTitle="Producto no encontrado">
        {(data) => <MovementContent product={data} initialMode={initialMode} />}
      </QueryBoundary>
    </View>
  );
}
