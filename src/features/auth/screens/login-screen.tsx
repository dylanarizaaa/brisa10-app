import { zodResolver } from '@hookform/resolvers/zod';
import { Store } from 'lucide-react-native';
import { useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type TextInputInstance,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormError, FormField } from '@/components/shared/form-field';
import { LoadingButton } from '@/components/shared/loading-button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

import { useSignIn } from '../hooks/use-auth-actions';
import { loginSchema, type LoginValues } from '../schemas/login-schema';

export function LoginScreen() {
  const signIn = useSignIn();
  const passwordRef = useRef<TextInputInstance>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit((values) => signIn.mutate(values));
  const onSubmit = () => void submit();

  return (
    <SafeAreaView className="flex-1 bg-muted/40">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerClassName="flex-grow items-center justify-center gap-6 p-6"
          keyboardShouldPersistTaps="handled">
          <View className="flex-row items-center gap-2">
            <View className="size-9 items-center justify-center rounded-md bg-primary">
              <Icon as={Store} size={18} className="text-primary-foreground" />
            </View>
            <Text className="text-xl font-semibold">Brisa10</Text>
          </View>

          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Iniciar sesión</CardTitle>
              <CardDescription>Ingresa con tu cuenta para administrar el negocio.</CardDescription>
            </CardHeader>
            <CardContent className="gap-4">
              <FormField label="Correo electrónico" error={errors.email?.message}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <Input
                      aria-label="Correo electrónico"
                      aria-invalid={Boolean(errors.email)}
                      placeholder="nombre@correo.com"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      keyboardType="email-address"
                      returnKeyType="next"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                  )}
                />
              </FormField>

              <FormField label="Contraseña" error={errors.password?.message}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <Input
                      ref={passwordRef}
                      aria-label="Contraseña"
                      aria-invalid={Boolean(errors.password)}
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="current-password"
                      returnKeyType="go"
                      value={field.value}
                      onChangeText={field.onChange}
                      onBlur={field.onBlur}
                      onSubmitEditing={onSubmit}
                    />
                  )}
                />
              </FormField>

              <FormError message={signIn.error?.message} />

              <LoadingButton label="Iniciar sesión" loading={signIn.isPending} onPress={onSubmit} />
            </CardContent>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
