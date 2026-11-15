import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { View } from 'react-native';

import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';

interface SwitchFieldProps<Values extends FieldValues> {
  control: Control<Values>;
  name: FieldPath<Values>;
  label: string;
  description?: string;
}

/** Interruptor con título y descripción, conectado a React Hook Form. */
export function SwitchField<Values extends FieldValues>({
  control,
  name,
  label,
  description,
}: SwitchFieldProps<Values>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Text className="text-sm font-medium">{label}</Text>
            {description && <Text className="text-xs text-muted-foreground">{description}</Text>}
          </View>
          <Switch
            aria-label={label}
            checked={Boolean(field.value)}
            onCheckedChange={field.onChange}
          />
        </View>
      )}
    />
  );
}
