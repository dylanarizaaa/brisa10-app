import { router, Tabs } from 'expo-router';
import {
  ArrowLeftRight,
  Building2,
  LogOut,
  Receipt,
  Tags,
  UserRound,
  Users,
} from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { MenuGroup, MenuRow } from '@/components/shared/menu-row';
import { ScrollScreen } from '@/components/shared/screen';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/features/auth/auth-context';
import { useSignOut } from '@/features/auth/hooks/use-auth-actions';
import { roleLabels } from '@/features/auth/types';
import { getInitials } from '@/lib/text';

export function MoreScreen() {
  const user = useCurrentUser();
  const signOut = useSignOut();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  return (
    <ScrollScreen>
      <Tabs.Screen options={{ title: 'Más' }} />

      <View className="flex-row items-center gap-3">
        <Avatar alt={user.full_name} className="size-12">
          <AvatarFallback>
            <Text className="font-medium">{getInitials(user.full_name)}</Text>
          </AvatarFallback>
        </Avatar>
        <View className="flex-1">
          <Text className="font-semibold">{user.full_name}</Text>
          <Text numberOfLines={1} className="text-sm text-muted-foreground">
            {user.email}
          </Text>
          <Text className="text-xs text-muted-foreground">{roleLabels[user.role]}</Text>
        </View>
      </View>

      <MenuGroup>
        <MenuRow
          icon={Receipt}
          label="Historial de ventas"
          onPress={() => router.push('/ventas')}
        />
        <Separator />
        <MenuRow
          icon={ArrowLeftRight}
          label="Movimientos de inventario"
          onPress={() => router.push('/movimientos')}
        />
        <Separator />
        <MenuRow icon={Tags} label="Categorías" onPress={() => router.push('/categorias')} />
      </MenuGroup>

      <MenuGroup>
        <MenuRow
          icon={Building2}
          label="Datos del negocio"
          description="Nombre, contacto y umbral de bajo inventario"
          onPress={() => router.push('/negocio')}
        />
        {user.isAdmin && (
          <>
            <Separator />
            <MenuRow
              icon={Users}
              label="Usuarios"
              description="Roles y acceso"
              onPress={() => router.push('/usuarios')}
            />
          </>
        )}
        <Separator />
        <MenuRow icon={UserRound} label="Mi cuenta" onPress={() => router.push('/cuenta')} />
      </MenuGroup>

      <MenuGroup>
        <MenuRow
          icon={LogOut}
          label="Cerrar sesión"
          destructive
          onPress={() => setConfirmSignOut(true)}
        />
      </MenuGroup>

      <ConfirmDialog
        open={confirmSignOut}
        onOpenChange={setConfirmSignOut}
        title="¿Cerrar sesión?"
        description="Tendrás que volver a ingresar tu correo y contraseña. La venta en curso, si la hay, se descarta."
        confirmLabel="Cerrar sesión"
        loading={signOut.isPending}
        onConfirm={() => signOut.mutate(undefined, { onSettled: () => setConfirmSignOut(false) })}
      />
    </ScrollScreen>
  );
}
