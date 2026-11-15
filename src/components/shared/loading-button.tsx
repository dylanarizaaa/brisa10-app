import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';

import { Button, type ButtonProps } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

interface LoadingButtonProps extends Omit<ButtonProps, 'children'> {
  label: string;
  loading?: boolean;
  icon?: LucideIcon;
}

/** Botón con texto, icono opcional y estado de carga. Es el botón estándar de la app. */
export function LoadingButton({
  label,
  loading,
  icon,
  disabled,
  variant,
  ...props
}: LoadingButtonProps) {
  const onDark = !variant || variant === 'default' || variant === 'destructive';
  return (
    <Button variant={variant} disabled={disabled || loading} aria-label={label} {...props}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={onDark ? THEME.primaryForeground : THEME.foreground}
        />
      ) : (
        icon && <Icon as={icon} size={16} />
      )}
      <Text>{label}</Text>
    </Button>
  );
}
