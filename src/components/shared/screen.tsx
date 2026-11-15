import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, View } from 'react-native';

import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';

/** Fondo y relleno estándar de una pantalla cuyo contenido es una lista propia. */
export function Screen({ className, children }: { className?: string; children: ReactNode }) {
  return <View className={cn('flex-1 bg-background', className)}>{children}</View>;
}

interface ScrollScreenProps {
  children: ReactNode;
  className?: string;
  /** Activa "tirar para actualizar". */
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Barra fija al pie (acción principal de un formulario). */
  footer?: ReactNode;
}

/** Pantalla con contenido desplazable, márgenes estándar y manejo del teclado. */
export function ScrollScreen({
  children,
  className,
  refreshing,
  onRefresh,
  footer,
}: ScrollScreenProps) {
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
      <ScrollView
        contentContainerClassName={cn('gap-5 p-4 pb-10', className)}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={Boolean(refreshing)}
              onRefresh={onRefresh}
              tintColor={THEME.mutedForeground}
            />
          ) : undefined
        }>
        {children}
      </ScrollView>
      {footer && <View className="border-t border-border bg-background p-4">{footer}</View>}
    </KeyboardAvoidingView>
  );
}
