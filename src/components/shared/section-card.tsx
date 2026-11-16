import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  description?: string;
  /** Elemento a la derecha del título (enlace, botón). */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Tarjeta con encabezado y contenido sin relleno, para listas y bloques del panel. */
export function SectionCard({ title, description, action, className, children }: SectionCardProps) {
  return (
    <View className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}>
      <View className="flex-row items-start justify-between gap-3 border-b border-border px-4 py-3">
        <View className="flex-1">
          <Text role="heading" className="font-medium">
            {title}
          </Text>
          {description && <Text className="text-sm text-muted-foreground">{description}</Text>}
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}
