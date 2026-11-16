import { Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/utils';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  /** Nombre accesible del control (el mismo texto de su etiqueta). */
  label: string;
  options: SelectOption[];
  /** Valor seleccionado; cadena vacía cuando no hay selección. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

/** Lista desplegable con una API simple de valor y opciones. Para listas largas (categorías, usuarios). */
export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = 'Selecciona una opción',
  disabled,
  invalid,
  className,
}: SelectFieldProps) {
  const insets = useSafeAreaInsets();
  const selected = options.find((option) => option.value === value);

  return (
    <Select
      value={selected}
      onValueChange={(option) => option && onChange(option.value)}
      disabled={disabled}>
      <SelectTrigger
        aria-label={label}
        aria-invalid={invalid}
        className={cn(className ?? 'w-full', Platform.select({ web: 'overflow-hidden' }))}>
        <SelectValue placeholder={placeholder} className="flex-1" />
      </SelectTrigger>
      <SelectContent
        insets={{
          top: insets.top,
          bottom: Platform.select({ ios: insets.bottom, android: insets.bottom + 24 }),
          left: 12,
          right: 12,
        }}>
        <ScrollView className="max-h-72">
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} label={option.label} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </ScrollView>
      </SelectContent>
    </Select>
  );
}
