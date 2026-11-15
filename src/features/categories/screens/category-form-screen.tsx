import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Power, PowerOff } from 'lucide-react-native';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';

import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { FormError } from '@/components/shared/form-field';
import { LoadingButton } from '@/components/shared/loading-button';
import { ScrollScreen } from '@/components/shared/screen';
import { TextField } from '@/components/shared/text-field';

import { useCategories, useSaveCategory, useSetCategoryActive } from '../hooks/use-categories';
import { categorySchema, type CategoryValues } from '../schemas/category-schema';
import type { Category } from '../types';

function CategoryForm({ category }: { category?: Category }) {
  const save = useSaveCategory();
  const setActive = useSetCategoryActive();
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const { control, handleSubmit } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: category?.name ?? '', description: category?.description ?? '' },
  });

  const submit = handleSubmit((values) =>
    save.mutate({ id: category?.id, values }, { onSuccess: () => router.back() })
  );

  return (
    <ScrollScreen>
      <TextField
        control={control}
        name="name"
        label="Nombre"
        placeholder="Ej. Cerámicas"
        autoFocus={!category}
      />
      <TextField control={control} name="description" label="Descripción" optional multiline />
      <FormError message={save.error?.message} />
      <LoadingButton
        label={category ? 'Guardar cambios' : 'Crear categoría'}
        loading={save.isPending}
        onPress={() => void submit()}
      />

      {category && (
        <View className="border-t border-border pt-5">
          <LoadingButton
            label={category.is_active ? 'Desactivar categoría' : 'Activar categoría'}
            variant="outline"
            icon={category.is_active ? PowerOff : Power}
            loading={setActive.isPending && !confirmDeactivate}
            onPress={() =>
              category.is_active
                ? setConfirmDeactivate(true)
                : setActive.mutate(
                    { id: category.id, isActive: true },
                    { onSuccess: () => router.back() }
                  )
            }
          />
        </View>
      )}

      {category && (
        <ConfirmDialog
          open={confirmDeactivate}
          onOpenChange={setConfirmDeactivate}
          title="¿Desactivar categoría?"
          description={`"${category.name}" dejará de estar disponible para productos nuevos. Los productos que ya la usan no cambian.`}
          confirmLabel="Desactivar"
          destructive
          loading={setActive.isPending}
          onConfirm={() =>
            setActive.mutate(
              { id: category.id, isActive: false },
              {
                onSettled: () => setConfirmDeactivate(false),
                onSuccess: () => router.back(),
              }
            )
          }
        />
      )}
    </ScrollScreen>
  );
}

/** Crear o editar una categoría. Se abre como hoja modal; con `?id=` edita. */
export function CategoryFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const categories = useCategories();
  const category = id ? categories.data?.find((item) => item.id === id) : undefined;
  const waiting = Boolean(id) && categories.isPending;

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: id ? 'Editar categoría' : 'Nueva categoría' }} />
      {/* Al editar, el formulario espera la categoría para partir de sus valores. */}
      {!waiting && <CategoryForm key={category?.id ?? 'nueva'} category={category} />}
    </View>
  );
}
