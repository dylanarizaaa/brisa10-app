import { TriangleAlert, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Acción sugerida (p. ej. botón "Crear"). */
  children?: ReactNode;
  className?: string;
}

/** Estado vacío para listas y secciones sin datos. */
export function EmptyState({ icon, title, description, children, className }: EmptyStateProps) {
  return (
    <View className={cn('items-center justify-center gap-2 px-6 py-12', className)}>
      <Icon as={icon} size={32} className="text-muted-foreground" />
      <Text className="text-center font-medium">{title}</Text>
      {description && (
        <Text className="max-w-sm text-center text-sm text-muted-foreground">{description}</Text>
      )}
      {children && <View className="mt-2">{children}</View>}
    </View>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

/** Estado de error para consultas fallidas, con opción de reintentar. */
export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <View role="alert" className={cn('items-center justify-center gap-2 px-6 py-12', className)}>
      <Icon as={TriangleAlert} size={32} className="text-destructive" />
      <Text className="text-center font-medium">No se pudo cargar la información</Text>
      <Text className="max-w-sm text-center text-sm text-muted-foreground">{message}</Text>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-2" onPress={onRetry}>
          <Text>Reintentar</Text>
        </Button>
      )}
    </View>
  );
}
