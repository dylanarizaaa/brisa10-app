import { CircleCheck, OctagonX, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/components/ui/native-only-animated-view';
import { Text } from '@/components/ui/text';

type ToastKind = 'success' | 'error' | 'warning';

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

const DURATION_MS: Record<ToastKind, number> = { success: 3000, warning: 5000, error: 5000 };

const appearance: Record<ToastKind, { icon: LucideIcon; iconClassName: string }> = {
  success: { icon: CircleCheck, iconClassName: 'text-success-foreground' },
  warning: { icon: TriangleAlert, iconClassName: 'text-warning-foreground' },
  error: { icon: OctagonX, iconClassName: 'text-danger-foreground' },
};

// Almacén mínimo fuera de React: permite avisar desde hooks y servicios sin pasar contexto.
let nextId = 1;
const listeners = new Set<(item: ToastItem) => void>();

function show(kind: ToastKind, message: string) {
  const item = { id: nextId++, kind, message };
  listeners.forEach((listener) => listener(item));
}

/** Avisos breves en la parte superior de la pantalla. */
export const toast = {
  success: (message: string) => show('success', message),
  warning: (message: string) => show('warning', message),
  error: (message: string) => show('error', message),
};

/** Muestra los avisos. Se monta una sola vez, en la raíz de la app. */
export function Toaster() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (item: ToastItem) => {
      // Como máximo tres avisos a la vez; los más antiguos salen primero.
      setItems((current) => [...current, item].slice(-3));
      setTimeout(
        () => setItems((current) => current.filter((other) => other.id !== item.id)),
        DURATION_MS[item.kind]
      );
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 z-50 items-center gap-2 px-4"
      style={{ top: insets.top + 8 }}>
      {items.map((item) => {
        const { icon, iconClassName } = appearance[item.kind];
        return (
          <NativeOnlyAnimatedView key={item.id} entering={FadeInUp} exiting={FadeOutUp}>
            <Pressable
              role={item.kind === 'error' ? 'alert' : 'status'}
              aria-label={item.message}
              onPress={() => setItems((current) => current.filter((other) => other.id !== item.id))}
              className="w-full max-w-md flex-row items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-md shadow-black/10">
              <Icon as={icon} size={18} className={iconClassName} />
              <Text className="flex-1 text-sm">{item.message}</Text>
            </Pressable>
          </NativeOnlyAnimatedView>
        );
      })}
    </View>
  );
}
