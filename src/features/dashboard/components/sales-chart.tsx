import { ChartColumn } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { SectionCard } from '@/components/shared/section-card';
import { EmptyState, ErrorState } from '@/components/shared/state-message';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { formatCompactCOP, formatCOP, formatLongDay, formatShortDay } from '@/lib/format';
import { cn } from '@/lib/utils';

import { SALES_CHART_DAYS, useSalesByDay } from '../hooks/use-dashboard';

const CHART_HEIGHT = 150;
const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

/** Redondea hacia arriba a un número limpio para el tope del eje. */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = NICE_STEPS.find((candidate) => candidate * magnitude >= value) ?? 10;
  return step * magnitude;
}

function salesLabel(count: number): string {
  return `${count} ${count === 1 ? 'venta' : 'ventas'}`;
}

/** Ingresos de cada día. Al tocar una barra se muestra el detalle de ese día. */
export function SalesChart() {
  const sales = useSalesByDay();
  const data = sales.data ?? [];
  // Por defecto se muestra el detalle de hoy (última barra).
  const [selected, setSelected] = useState<number | null>(null);
  const activeIndex = selected ?? data.length - 1;
  const active = data[activeIndex];
  const max = niceMax(Math.max(0, ...data.map((day) => day.revenue)));
  const totalRevenue = data.reduce((sum, day) => sum + day.revenue, 0);
  const totalSales = data.reduce((sum, day) => sum + day.sales_count, 0);

  return (
    <SectionCard
      title="Ingresos por día"
      description={
        sales.data && totalSales > 0
          ? `Últimos ${SALES_CHART_DAYS} días · ${formatCOP(totalRevenue)}`
          : `Últimos ${SALES_CHART_DAYS} días`
      }>
      {sales.isPending ? (
        <View className="p-4" aria-label="Cargando ventas por día">
          <Skeleton className="h-40 w-full" />
        </View>
      ) : sales.isError ? (
        <ErrorState message={sales.error.message} onRetry={() => void sales.refetch()} />
      ) : totalSales === 0 ? (
        <EmptyState
          icon={ChartColumn}
          title="Sin ventas en el periodo"
          description="Cuando registres ventas verás aquí los ingresos de cada día."
        />
      ) : (
        <View className="gap-3 p-4">
          {active && (
            <View>
              <Text className="text-lg font-semibold tabular-nums">
                {formatCOP(active.revenue)}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {formatLongDay(active.day)} · {salesLabel(active.sales_count)}
              </Text>
            </View>
          )}

          <View className="flex-row gap-2">
            <View className="justify-between" style={{ height: CHART_HEIGHT }}>
              <Text className="text-[10px] text-muted-foreground">{formatCompactCOP(max)}</Text>
              <Text className="text-[10px] text-muted-foreground">0</Text>
            </View>
            <View className="flex-1">
              <View
                className="flex-row items-end border-b border-border"
                style={{ height: CHART_HEIGHT }}
                aria-label="Ingresos por día">
                {data.map((day, index) => (
                  <Pressable
                    key={day.day}
                    role="button"
                    aria-label={`${formatLongDay(day.day)}: ${formatCOP(day.revenue)}, ${salesLabel(day.sales_count)}`}
                    aria-selected={index === activeIndex}
                    onPress={() => setSelected(index)}
                    className="h-full flex-1 items-center justify-end px-[2px]">
                    <View
                      className={cn(
                        'w-full max-w-6 rounded-t-[4px] bg-chart',
                        index !== activeIndex && 'opacity-50'
                      )}
                      // Un día con ventas siempre deja ver al menos una línea.
                      style={{
                        height:
                          day.revenue > 0 ? Math.max(2, (day.revenue / max) * CHART_HEIGHT) : 0,
                      }}
                    />
                  </Pressable>
                ))}
              </View>
              <View className="mt-1 flex-row justify-between">
                <Text className="text-[10px] text-muted-foreground">
                  {data[0] && formatShortDay(data[0].day)}
                </Text>
                <Text className="text-[10px] text-muted-foreground">Hoy</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </SectionCard>
  );
}
