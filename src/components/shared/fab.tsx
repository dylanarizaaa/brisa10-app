import type { LucideIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

interface FabProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}

/** Botón flotante para la acción principal de una lista (p. ej. "Nuevo producto"). */
export function Fab({ icon, label, onPress }: FabProps) {
  return (
    <Button
      aria-label={label}
      onPress={onPress}
      className="absolute bottom-5 right-5 h-12 rounded-full px-5 shadow-lg shadow-black/20">
      <Icon as={icon} size={18} />
      <Text>{label}</Text>
    </Button>
  );
}
