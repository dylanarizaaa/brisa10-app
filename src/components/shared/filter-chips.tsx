import { ScrollView } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface FilterChipsProps<T extends string> {
  /** Describe el grupo para lectores de pantalla (p. ej. "Filtrar por estado"). */
  label: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Fila de opciones excluyentes que se desplaza en horizontal. Para filtros con pocas opciones. */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      aria-label={label}
      role="radiogroup"
      contentContainerClassName="gap-2 px-4"
      className="-mx-4 grow-0">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Button
            key={option.value}
            size="sm"
            variant={selected ? 'default' : 'outline'}
            className="rounded-full"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            onPress={() => onChange(option.value)}>
            <Text>{option.label}</Text>
          </Button>
        );
      })}
    </ScrollView>
  );
}
