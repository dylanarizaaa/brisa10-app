import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform, type AppStateStatus } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

/**
 * En el móvil no hay "foco de ventana": al volver a la app desde segundo plano se avisa a
 * TanStack Query para que actualice los datos que ya están desactualizados.
 */
export function subscribeToAppFocus(): () => void {
  if (Platform.OS === 'web') return () => {};
  const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
    focusManager.setFocused(status === 'active');
  });
  return () => subscription.remove();
}
