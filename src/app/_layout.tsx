import '@/global.css';

import { SplashScreen, Stack } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useEffect } from 'react';

import { FullScreenLoader, FullScreenMessage } from '@/components/shared/full-screen-message';
import { AppProviders } from '@/components/shared/providers';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth/auth-context';

export { ErrorBoundary } from 'expo-router';

// La pantalla de inicio se mantiene hasta saber si hay una sesión guardada.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  if (!env) return <MissingConfiguration />;

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

function MissingConfiguration() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <FullScreenMessage
      icon={Settings}
      title="Falta configurar la conexión"
      description="Esta versión de la app se compiló sin los datos de conexión a Supabase (EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY). Configúralos y vuelve a generar la app."
    />
  );
}

function RootNavigator() {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'loading') void SplashScreen.hideAsync();
  }, [status]);

  // La navegación se monta cuando ya se sabe si hay sesión. Así, una dirección abierta
  // directamente (enlace o recarga en web) llega a su pantalla en lugar de redirigirse
  // al inicio mientras la sesión se carga. Mientras tanto sigue visible la pantalla de inicio.
  if (status === 'loading') return <FullScreenLoader />;

  // Exactamente un grupo está disponible en cada momento; al cambiar el estado de la
  // sesión, Expo Router redirige solo a la pantalla que corresponde.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={status === 'authenticated'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'unauthenticated'}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'inactive' || status === 'error'}>
        <Stack.Screen name="estado" />
      </Stack.Protected>
    </Stack>
  );
}
