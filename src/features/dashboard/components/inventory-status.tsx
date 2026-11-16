import { router } from 'expo-router';
import {
  CircleCheck,
  CircleSlash,
  Package,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { SectionCard } from '@/components/shared/section-card';
import { EmptyState } from '@/components/shared/state-message';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import type { AvailabilityFilter } from '@/features/products/types';

import type { DashboardSummary } from '../types';

interface Segment {
  label: string;
  count: number;
  barClassName: string;
  iconClassName: string;
  icon: LucideIcon;
  filter: AvailabilityFilter;
}

/** Composición del inventario activo; cada estado abre el inventario filtrado. */
export function InventoryStatus({ summary }: { summary: DashboardSummary | undefined }) {
  const segments: Segment[] = summary
    ? [
        {
          label: 'Con existencias suficientes',
          count: Math.max(0, summary.available_products - summary.low_stock_products),
          barClassName: 'bg-success-foreground',
          iconClassName: 'text-success-foreground',
          icon: CircleCheck,
          filter: 'in_stock',
        },
        {
          label: 'Bajo inventario',
          count: summary.low_stock_products,
          barClassName: 'bg-warning-foreground',
          iconClassName: 'text-warning-foreground',
          icon: TriangleAlert,
          filter: 'low',
        },
        {
          label: 'Agotados',
          count: summary.out_of_stock_products,
          barClassName: 'bg-danger-foreground',
          iconClassName: 'text-danger-foreground',
          icon: CircleSlash,
          filter: 'out',
        },
      ]
    : [];
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const share = (count: number) => `${Math.round((count / total) * 100)} %`;

  return (
    <SectionCard
      title="Estado del inventario"
      description={
        summary ? `${total} ${total === 1 ? 'producto activo' : 'productos activos'}` : undefined
      }>
      {!summary ? (
        <View className="gap-3 p-4">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-16 w-full" />
        </View>
      ) : total === 0 ? (
        <EmptyState icon={Package} title="Sin productos activos" />
      ) : (
        <View className="gap-3 p-4">
          <View className="h-2 flex-row gap-0.5 overflow-hidden rounded-full">
            {segments
              .filter((segment) => segment.count > 0)
              .map((segment) => (
                <View
                  key={segment.label}
                  className={segment.barClassName}
                  style={{ flexGrow: segment.count }}
                />
              ))}
          </View>
          {segments.map((segment) => (
            <Pressable
              key={segment.label}
              role="link"
              aria-label={`${segment.label}: ${segment.count}`}
              onPress={() =>
                router.push({ pathname: '/inventario', params: { existencias: segment.filter } })
              }
              className="-mx-2 flex-row items-center gap-2 rounded-md px-2 py-1.5 active:bg-accent">
              <Icon as={segment.icon} size={16} className={segment.iconClassName} />
              <Text className="flex-1 text-sm">{segment.label}</Text>
              <Text className="text-sm font-medium tabular-nums">{segment.count}</Text>
              <Text className="w-12 text-right text-xs tabular-nums text-muted-foreground">
                {share(segment.count)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </SectionCard>
  );
}
