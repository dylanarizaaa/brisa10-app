import { Stack } from 'expo-router';
import { UserCheck, UserX } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { ListSkeleton } from '@/components/shared/list-skeleton';
import { Screen } from '@/components/shared/screen';
import { SelectField } from '@/components/shared/select-field';
import { ErrorState } from '@/components/shared/state-message';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/features/auth/auth-context';
import { roleLabels } from '@/features/auth/types';
import { THEME } from '@/lib/theme';
import type { UserRole } from '@/types/database';

import { useUpdateUser, useUsers } from '../hooks/use-settings';
import type { UserAccount } from '../types';

type PendingChange =
  | { kind: 'role'; user: UserAccount; role: UserRole }
  | { kind: 'deactivate'; user: UserAccount }
  | null;

const roleOptions = [
  { value: 'admin', label: roleLabels.admin },
  { value: 'operador', label: roleLabels.operador },
];

/** Roles y acceso de los usuarios (solo administrador). */
export function UsersScreen() {
  const currentUser = useCurrentUser();
  const users = useUsers();
  const update = useUpdateUser();
  const [pending, setPending] = useState<PendingChange>(null);

  function confirm() {
    if (!pending) return;
    const changes = pending.kind === 'role' ? { role: pending.role } : { is_active: false };
    update.mutate({ id: pending.user.id, ...changes }, { onSettled: () => setPending(null) });
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Usuarios' }} />
      <FlatList
        data={users.data ?? []}
        keyExtractor={(user) => user.id}
        ItemSeparatorComponent={Separator}
        contentContainerClassName="grow pb-6"
        refreshControl={
          <RefreshControl
            refreshing={users.isRefetching}
            onRefresh={() => void users.refetch()}
            tintColor={THEME.mutedForeground}
          />
        }
        ListHeaderComponent={
          <Text className="border-b border-border p-4 text-sm text-muted-foreground">
            Los usuarios nuevos se crean en el panel de Supabase (Authentication → Users) y aparecen
            aquí como operadores.
          </Text>
        }
        ListEmptyComponent={
          users.isPending ? (
            <ListSkeleton rows={3} label="Cargando usuarios" />
          ) : users.isError ? (
            <ErrorState message={users.error.message} onRetry={() => void users.refetch()} />
          ) : undefined
        }
        renderItem={({ item: user }) => {
          const isSelf = user.id === currentUser.id;
          return (
            <View className="gap-3 px-4 py-3">
              <View className="flex-row items-center gap-2">
                <View className="flex-1">
                  <Text className="font-medium">
                    {user.full_name}
                    {isSelf ? ' (tú)' : ''}
                  </Text>
                  <Text numberOfLines={1} className="text-xs text-muted-foreground">
                    {user.email}
                  </Text>
                </View>
                <StatusBadge
                  label={user.is_active ? 'Activo' : 'Inactivo'}
                  active={user.is_active}
                />
              </View>
              {isSelf ? (
                <Text className="text-sm text-muted-foreground">
                  {roleLabels[user.role]} · No puedes cambiar tu propio rol ni desactivarte.
                </Text>
              ) : (
                <View className="flex-row items-center gap-2">
                  <View className="flex-1">
                    <SelectField
                      label={`Rol de ${user.full_name}`}
                      options={roleOptions}
                      value={user.role}
                      disabled={update.isPending}
                      onChange={(role) =>
                        role !== user.role &&
                        setPending({ kind: 'role', user, role: role as UserRole })
                      }
                    />
                  </View>
                  <Button
                    variant="outline"
                    disabled={update.isPending}
                    aria-label={`${user.is_active ? 'Desactivar' : 'Activar'} a ${user.full_name}`}
                    onPress={() =>
                      user.is_active
                        ? setPending({ kind: 'deactivate', user })
                        : update.mutate({ id: user.id, is_active: true })
                    }>
                    <Icon as={user.is_active ? UserX : UserCheck} size={16} />
                    <Text>{user.is_active ? 'Desactivar' : 'Activar'}</Text>
                  </Button>
                </View>
              )}
            </View>
          );
        }}
      />

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title={pending?.kind === 'role' ? '¿Cambiar rol?' : '¿Desactivar usuario?'}
        description={
          pending?.kind === 'role'
            ? pending.role === 'admin'
              ? `${pending.user.full_name} podrá editar productos y categorías, ajustar inventario, anular ventas y administrar usuarios y configuración.`
              : `${pending.user.full_name} solo podrá registrar ventas y entradas o salidas de mercancía, y consultar la información.`
            : pending
              ? `${pending.user.full_name} no podrá entrar al sistema. Su historial se conserva y puedes reactivarlo cuando quieras.`
              : ''
        }
        confirmLabel={pending?.kind === 'role' ? 'Cambiar rol' : 'Desactivar'}
        destructive={pending?.kind === 'deactivate'}
        loading={update.isPending}
        onConfirm={confirm}
      />
    </Screen>
  );
}
