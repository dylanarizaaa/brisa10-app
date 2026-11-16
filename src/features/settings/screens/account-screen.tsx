import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from 'expo-router';
import { useForm } from 'react-hook-form';

import { FormError, FormField } from '@/components/shared/form-field';
import { LoadingButton } from '@/components/shared/loading-button';
import { ScrollScreen } from '@/components/shared/screen';
import { TextField } from '@/components/shared/text-field';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/features/auth/auth-context';
import { roleLabels } from '@/features/auth/types';

import { useUpdateOwnName } from '../hooks/use-settings';
import { accountSchema, type AccountValues } from '../schemas/settings-schema';

export function AccountScreen() {
  const user = useCurrentUser();
  const update = useUpdateOwnName(user.id);
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: { fullName: user.full_name },
  });

  const submit = handleSubmit((values) =>
    update.mutate(values.fullName, { onSuccess: () => reset(values) })
  );

  return (
    <ScrollScreen>
      <Stack.Screen options={{ title: 'Mi cuenta' }} />
      <TextField control={control} name="fullName" label="Nombre" />
      <FormField
        label="Correo"
        hint="El correo y la contraseña se cambian desde el panel de Supabase.">
        <Input aria-label="Correo" value={user.email} editable={false} />
      </FormField>
      <FormField label="Rol">
        <Input aria-label="Rol" value={roleLabels[user.role]} editable={false} />
      </FormField>
      <FormError message={update.error?.message} />
      <LoadingButton
        label="Guardar nombre"
        loading={update.isPending}
        disabled={!isDirty}
        onPress={() => void submit()}
      />
    </ScrollScreen>
  );
}
