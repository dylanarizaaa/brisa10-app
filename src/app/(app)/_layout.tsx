import { Stack } from 'expo-router';

import { useCurrentUser } from '@/features/auth/auth-context';
import { CartProvider } from '@/features/sales/cart-context';

// Una pantalla abierta por enlace directo (o al recargar en web) tiene debajo las pestañas,
// así siempre hay una flecha para volver.
export const unstable_settings = {
  anchor: '(tabs)',
};

/** Navegación de la app con sesión iniciada: pestañas + pantallas de detalle y hojas modales. */
export default function AppLayout() {
  const { isAdmin } = useCurrentUser();

  return (
    <CartProvider>
      <Stack
        screenOptions={{
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '600' },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="movimiento" options={{ presentation: 'modal' }} />

        {/* Solo administrador. La base de datos también lo exige (RLS y funciones RPC). */}
        <Stack.Protected guard={isAdmin}>
          <Stack.Screen name="producto/nuevo" />
          <Stack.Screen name="producto/editar/[id]" />
          <Stack.Screen name="categoria" options={{ presentation: 'modal' }} />
          <Stack.Screen name="anular-venta" options={{ presentation: 'modal' }} />
          <Stack.Screen name="usuarios" />
        </Stack.Protected>
      </Stack>
    </CartProvider>
  );
}
