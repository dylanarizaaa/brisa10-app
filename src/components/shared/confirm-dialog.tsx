import { ActivityIndicator } from 'react-native';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  /** Resalta la acción como destructiva. */
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}

/** Diálogo de confirmación controlado. Quien lo usa lo cierra cuando la acción termina. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive,
  loading,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            <Text>Cancelar</Text>
          </AlertDialogCancel>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            disabled={loading}
            aria-label={confirmLabel}
            onPress={onConfirm}>
            {loading && <ActivityIndicator size="small" color={THEME.primaryForeground} />}
            <Text>{confirmLabel}</Text>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
