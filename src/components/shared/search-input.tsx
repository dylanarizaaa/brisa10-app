import { Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  /** Valor aplicado a la consulta. */
  value: string;
  /** Se llama cuando el usuario deja de escribir. */
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  delay?: number;
}

/** Campo de búsqueda que espera a que el usuario termine de escribir antes de avisar. */
export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  delay = 300,
}: SearchInputProps) {
  const [text, setText] = useState(value);
  // Si el valor aplicado cambia desde fuera (filtros reiniciados), el campo lo refleja.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }

  useEffect(() => {
    if (text === value) return;
    const timer = setTimeout(() => onChange(text), delay);
    return () => clearTimeout(timer);
  }, [text, value, onChange, delay]);

  return (
    <View className={cn('justify-center', className)}>
      <View className="absolute left-3 z-10" pointerEvents="none">
        <Icon as={Search} size={16} className="text-muted-foreground" />
      </View>
      <Input
        aria-label={placeholder}
        placeholder={placeholder}
        className="px-9"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        value={text}
        onChangeText={setText}
      />
      {text !== '' && (
        <Pressable
          aria-label="Borrar búsqueda"
          role="button"
          hitSlop={8}
          className="absolute right-3"
          onPress={() => {
            setText('');
            onChange('');
          }}>
          <Icon as={X} size={16} className="text-muted-foreground" />
        </Pressable>
      )}
    </View>
  );
}
