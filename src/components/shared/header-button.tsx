import type { LucideIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

interface HeaderButtonProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/** Botón de icono para la barra superior de una pantalla. */
export function HeaderButton({ icon, label, onPress, disabled }: HeaderButtonProps) {
  return (
    <Button variant="ghost" size="icon" aria-label={label} disabled={disabled} onPress={onPress}>
      <Icon as={icon} size={20} />
    </Button>
  );
}
