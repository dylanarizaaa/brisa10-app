import { TriangleAlert, UserX } from 'lucide-react-native';

import { FullScreenLoader, FullScreenMessage } from '@/components/shared/full-screen-message';
import { LoadingButton } from '@/components/shared/loading-button';

import { useAuth } from '../auth-context';
import { useSignOut } from '../hooks/use-auth-actions';

/** Sesión iniciada sin acceso: cuenta desactivada o perfil que no se pudo cargar. */
export function AccountStatusScreen() {
  const auth = useAuth();
  const signOut = useSignOut();
  const signOutButton = (
    <LoadingButton
      label="Cerrar sesión"
      variant="outline"
      loading={signOut.isPending}
      onPress={() => signOut.mutate()}
    />
  );

  if (auth.status === 'inactive') {
    return (
      <FullScreenMessage
        icon={UserX}
        title="Cuenta desactivada"
        description="Tu cuenta fue desactivada. Contacta al administrador del negocio para recuperar el acceso.">
        {signOutButton}
      </FullScreenMessage>
    );
  }

  if (auth.status === 'error') {
    return (
      <FullScreenMessage
        icon={TriangleAlert}
        title="No se pudo cargar tu cuenta"
        description={auth.message}>
        <LoadingButton label="Reintentar" onPress={auth.retry} />
        {signOutButton}
      </FullScreenMessage>
    );
  }

  return <FullScreenLoader />;
}
