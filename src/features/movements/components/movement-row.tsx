import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { MovementType } from '@/types/database';

import { movementTypeLabels } from '../types';

interface MovementRowProps {
  productName: string;
  type: MovementType;
  quantity: number;
  userName: string;
  createdAt: string;
  /** Existencias antes → después (solo en el historial completo). */
  stockBefore?: number;
  stockAfter?: number;
  /** Motivo o número de venta. */
  detail?: string | null;
}

/** Fila de un movimiento de inventario. Se usa en el panel y en el historial. */
export function MovementRow({
  productName,
  type,
  quantity,
  userName,
  createdAt,
  stockBefore,
  stockAfter,
  detail,
}: MovementRowProps) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      <View className="flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-sm font-medium">
          {productName}
        </Text>
        <Text numberOfLines={1} className="text-xs text-muted-foreground">
          {movementTypeLabels[type]} · {userName} · {formatDateTime(createdAt)}
        </Text>
        {detail ? (
          <Text numberOfLines={1} className="text-xs text-muted-foreground">
            {detail}
          </Text>
        ) : null}
      </View>
      <View className="items-end">
        <Text className={cn('text-sm font-semibold tabular-nums', quantity > 0 && 'text-success')}>
          {quantity > 0 ? `+${quantity}` : quantity}
        </Text>
        {stockBefore !== undefined && stockAfter !== undefined && (
          <Text className="text-xs tabular-nums text-muted-foreground">
            {stockBefore} → {stockAfter}
          </Text>
        )}
      </View>
    </View>
  );
}
