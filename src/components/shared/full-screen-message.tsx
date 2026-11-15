import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

interface FullScreenMessageProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Acciones (botones) bajo el mensaje. */
  children?: ReactNode;
}

/** Mensaje centrado a pantalla completa: configuración faltante, cuenta desactivada, errores. */
export function FullScreenMessage({ icon, title, description, children }: FullScreenMessageProps) {
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-3 bg-muted/40 p-6">
      {icon && <Icon as={icon} size={32} className="text-muted-foreground" />}
      <Text role="heading" className="text-center text-lg font-semibold">
        {title}
      </Text>
      {description && (
        <Text className="max-w-sm text-center text-sm text-muted-foreground">{description}</Text>
      )}
      {children && <View className="mt-2 w-full max-w-sm gap-2">{children}</View>}
    </SafeAreaView>
  );
}

export function FullScreenLoader() {
  return (
    <View className="flex-1 items-center justify-center bg-background" aria-label="Cargando">
      <ActivityIndicator color={THEME.mutedForeground} />
    </View>
  );
}
