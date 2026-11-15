import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  /** El control (Input, Select, Switch…). Debe llevar `aria-label` con el mismo texto de la etiqueta. */
  children: ReactNode;
}

/** Etiqueta + control + mensaje de error o ayuda. Base de todos los formularios. */
export function FormField({ label, optional, hint, error, className, children }: FormFieldProps) {
  return (
    <View className={cn('gap-2', className)}>
      <Label>
        {label}
        {optional && <Text className="text-sm font-normal text-muted-foreground"> (opcional)</Text>}
      </Label>
      {children}
      {error ? (
        <Text className="text-sm text-destructive">{error}</Text>
      ) : (
        hint && <Text className="text-xs text-muted-foreground">{hint}</Text>
      )}
    </View>
  );
}

/** Mensaje de error de un formulario completo (respuesta del servidor). */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View role="alert" className="rounded-md bg-destructive/10 px-3 py-2">
      <Text className="text-sm text-destructive">{message}</Text>
    </View>
  );
}
