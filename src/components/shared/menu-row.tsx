import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface MenuRowProps {
  icon: LucideIcon;
  label: string;
  description?: string;
  onPress: () => void;
  destructive?: boolean;
}

/** Opción de un menú de navegación (pestaña "Más", configuración). */
export function MenuRow({ icon, label, description, onPress, destructive }: MenuRowProps) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3.5 active:bg-accent">
      <Icon
        as={icon}
        size={18}
        className={destructive ? 'text-destructive' : 'text-muted-foreground'}
      />
      <View className="flex-1">
        <Text className={cn('font-medium', destructive && 'text-destructive')}>{label}</Text>
        {description && <Text className="text-xs text-muted-foreground">{description}</Text>}
      </View>
      {!destructive && <Icon as={ChevronRight} size={16} className="text-muted-foreground" />}
    </Pressable>
  );
}

/** Grupo de opciones con borde, separadas por líneas. */
export function MenuGroup({ children }: { children: React.ReactNode }) {
  return (
    <View className="overflow-hidden rounded-lg border border-border bg-card">{children}</View>
  );
}
