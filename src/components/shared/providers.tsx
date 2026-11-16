import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Toaster } from '@/components/shared/toast';
import { AuthProvider } from '@/features/auth/auth-provider';
import { queryClient, subscribeToAppFocus } from '@/lib/query-client';
import { NAV_THEME } from '@/lib/theme';

/** Proveedores globales: datos, sesión, tema de navegación, portales (diálogos) y avisos. */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => subscribeToAppFocus(), []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider value={NAV_THEME}>
            <StatusBar style="dark" />
            {children}
            {/* Los diálogos y menús de la interfaz se dibujan aquí, por encima de las pantallas. */}
            <PortalHost />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
