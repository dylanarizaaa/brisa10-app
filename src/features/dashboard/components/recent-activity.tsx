import { router } from 'expo-router';
import { History } from 'lucide-react-native';
import { View } from 'react-native';

import { ListSkeleton } from '@/components/shared/list-skeleton';
import { SectionCard } from '@/components/shared/section-card';
import { EmptyState, ErrorState } from '@/components/shared/state-message';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { MovementRow } from '@/features/movements/components/movement-row';

import { useRecentMovements } from '../hooks/use-dashboard';

export function RecentActivity() {
  const movements = useRecentMovements();

  return (
    <SectionCard
      title="Actividad reciente"
      description="Últimos movimientos de inventario"
      action={
        <Button
          variant="link"
          size="sm"
          className="h-auto px-0"
          onPress={() => router.push('/movimientos')}>
          <Text>Ver todo</Text>
        </Button>
      }>
      {movements.isPending ? (
        <ListSkeleton rows={3} label="Cargando actividad" />
      ) : movements.isError ? (
        <ErrorState message={movements.error.message} onRetry={() => void movements.refetch()} />
      ) : movements.data.length === 0 ? (
        <EmptyState
          icon={History}
          title="Sin actividad todavía"
          description="Aquí aparecerán las entradas, salidas y ventas a medida que se registren."
        />
      ) : (
        movements.data.map((movement, index) => (
          <View key={movement.id}>
            {index > 0 && <Separator />}
            <MovementRow
              productName={movement.product_name}
              type={movement.type}
              quantity={movement.quantity}
              userName={movement.user_name}
              createdAt={movement.created_at}
            />
          </View>
        ))
      )}
    </SectionCard>
  );
}
