import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';

import { FormField } from '@/components/shared/form-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TextFieldProps<Values extends FieldValues> extends Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChangeText' | 'onBlur'
> {
  control: Control<Values>;
  name: FieldPath<Values>;
  label: string;
  optional?: boolean;
  hint?: string;
  /** Campo de varias líneas. */
  multiline?: boolean;
  /** Solo dígitos: abre el teclado numérico. */
  numeric?: boolean;
  /** Clases del contenedor (p. ej. flex-1 para poner dos campos en una fila). */
  containerClassName?: string;
}

/** Campo de texto conectado a React Hook Form, con etiqueta, ayuda y error. */
export function TextField<Values extends FieldValues>({
  control,
  name,
  label,
  optional,
  hint,
  multiline,
  numeric,
  containerClassName,
  ...inputProps
}: TextFieldProps<Values>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const props = {
          'aria-label': label,
          'aria-invalid': Boolean(fieldState.error),
          value: (field.value as string | undefined) ?? '',
          onChangeText: field.onChange,
          onBlur: field.onBlur,
          ...(numeric ? { keyboardType: 'number-pad' as const } : null),
          ...inputProps,
        };
        return (
          <FormField
            label={label}
            optional={optional}
            hint={hint}
            error={fieldState.error?.message}
            className={containerClassName}>
            {multiline ? <Textarea {...props} /> : <Input {...props} />}
          </FormField>
        );
      }}
    />
  );
}
