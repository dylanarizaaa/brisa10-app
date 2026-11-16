import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';

/** Cuadrícula de datos "etiqueta: valor" a dos columnas. */
export function DetailList({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row flex-wrap gap-y-4 rounded-lg border border-border p-4">
      {children}
    </View>
  );
}

export function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="w-1/2 gap-1 pr-3">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text className="text-sm font-medium">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}
