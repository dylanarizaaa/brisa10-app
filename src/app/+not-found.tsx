import { router, Stack } from 'expo-router';
import { Compass } from 'lucide-react-native';

import { FullScreenMessage } from '@/components/shared/full-screen-message';
import { LoadingButton } from '@/components/shared/loading-button';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FullScreenMessage icon={Compass} title="Esta pantalla no existe">
        <LoadingButton label="Ir al inicio" onPress={() => router.replace('/')} />
      </FullScreenMessage>
    </>
  );
}
