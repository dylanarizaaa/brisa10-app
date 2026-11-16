import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  /** undefined mientras carga. */
  value: string | number | undefined;
  hint?: string;
  icon: LucideIcon;
  /** Resalta el indicador cuando requiere atención. */
  tone?: 'default' | 'warning' | 'danger';
  className?: string;
}

const toneClasses = {
  default: 'text-muted-foreground',
  warning: 'text-warning-foreground',
  danger: 'text-danger-foreground',
};

export function StatCard({ label, value, hint, icon, tone = 'default', className }: StatCardProps) {
  return (
    <View
      className={cn('gap-2 rounded-lg border border-border bg-card p-4', className)}
      aria-label={value === undefined ? label : `${label}: ${value}`}>
      <View className="flex-row items-center justify-between gap-2">
        <Text numberOfLines={1} className="shrink text-sm text-muted-foreground">
          {label}
        </Text>
        <Icon as={icon} size={16} className={toneClasses[tone]} />
      </View>
      {value === undefined ? (
        <Skeleton className="h-7 w-16" />
      ) : (
        <Text className="text-2xl font-semibold tabular-nums tracking-tight">{value}</Text>
      )}
      {hint && (
        <Text numberOfLines={1} className="text-xs text-muted-foreground">
          {hint}
        </Text>
      )}
    </View>
  );
}
