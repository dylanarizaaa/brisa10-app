import { Minus, Plus } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

interface QuantityStepperProps {
  /** Nombre de lo que se cuenta, para lectores de pantalla ("Taza de cerámica"). */
  label: string;
  value: number;
  min?: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

/** Selector de cantidad con botones − / + y campo editable. */
export function QuantityStepper({
  label,
  value,
  min = 1,
  max,
  disabled,
  onChange,
}: QuantityStepperProps) {
  return (
    <View className="flex-row items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        aria-label={`Restar una unidad de ${label}`}
        disabled={disabled || value <= min}
        onPress={() => onChange(value - 1)}>
        <Icon as={Minus} size={16} />
      </Button>
      <Input
        aria-label={`Cantidad de ${label}`}
        className="w-14 px-1 text-center"
        keyboardType="number-pad"
        selectTextOnFocus
        editable={!disabled}
        value={String(value)}
        onChangeText={(text) => onChange(Number(text.replace(/\D/g, '')))}
      />
      <Button
        variant="outline"
        size="icon"
        aria-label={`Sumar una unidad de ${label}`}
        disabled={disabled || value >= max}
        onPress={() => onChange(value + 1)}>
        <Icon as={Plus} size={16} />
      </Button>
    </View>
  );
}
