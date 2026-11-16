import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from 'expo-router';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { FormError } from '@/components/shared/form-field';
import { ListSkeleton } from '@/components/shared/list-skeleton';
import { LoadingButton } from '@/components/shared/loading-button';
import { ScrollScreen } from '@/components/shared/screen';
import { ErrorState } from '@/components/shared/state-message';
import { TextField } from '@/components/shared/text-field';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/features/auth/auth-context';

import { useBusinessSettings, useUpdateBusinessSettings } from '../hooks/use-settings';
import { businessSchema, type BusinessValues } from '../schemas/settings-schema';
import type { BusinessSettings } from '../types';

function BusinessForm({ settings, canEdit }: { settings: BusinessSettings; canEdit: boolean }) {
  const update = useUpdateBusinessSettings();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<BusinessValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessName: settings.business_name,
      nit: settings.nit ?? '',
      phone: settings.phone ?? '',
      address: settings.address ?? '',
      email: settings.email ?? '',
      lowStockThreshold: String(settings.low_stock_threshold),
    },
  });

  // Tras guardar, los valores enviados pasan a ser el punto de partida del formulario.
  const submit = handleSubmit((values) =>
    update.mutate(values, { onSuccess: () => reset(values) })
  );

  return (
    <ScrollScreen
      footer={
        canEdit ? (
          <View className="gap-3">
            <FormError message={update.error?.message} />
            <LoadingButton
              label="Guardar cambios"
              loading={update.isPending}
              disabled={!isDirty}
              onPress={() => void submit()}
            />
          </View>
        ) : undefined
      }>
      {!canEdit && (
        <View className="rounded-md bg-muted px-3 py-2">
          <Text className="text-sm text-muted-foreground">
            Solo un administrador puede cambiar esta información.
          </Text>
        </View>
      )}
      <TextField
        control={control}
        name="businessName"
        label="Nombre del negocio"
        editable={canEdit}
      />
      <TextField control={control} name="nit" label="NIT" optional editable={canEdit} />
      <TextField
        control={control}
        name="phone"
        label="Teléfono"
        optional
        keyboardType="phone-pad"
        editable={canEdit}
      />
      <TextField control={control} name="address" label="Dirección" optional editable={canEdit} />
      <TextField
        control={control}
        name="email"
        label="Correo de contacto"
        optional
        keyboardType="email-address"
        autoCapitalize="none"
        editable={canEdit}
      />
      <TextField
        control={control}
        name="lowStockThreshold"
        label="Umbral de bajo inventario"
        numeric
        editable={canEdit}
        hint="Un producto queda en bajo inventario cuando sus existencias son iguales o menores a este número, salvo que tenga su propio stock mínimo."
      />
    </ScrollScreen>
  );
}

export function BusinessScreen() {
  const { isAdmin } = useCurrentUser();
  const settings = useBusinessSettings();

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Datos del negocio' }} />
      {settings.isPending ? (
        <ListSkeleton rows={4} label="Cargando configuración" />
      ) : settings.isError ? (
        <ErrorState message={settings.error.message} onRetry={() => void settings.refetch()} />
      ) : (
        <BusinessForm settings={settings.data} canEdit={isAdmin} />
      )}
    </View>
  );
}
