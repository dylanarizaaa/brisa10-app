import { Stack } from 'expo-router';
import { History } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { FilterChips } from '@/components/shared/filter-chips';
import { InfiniteList } from '@/components/shared/infinite-list';
import { PeriodChips, periodRange, type Period } from '@/components/shared/period-chips';
import { Screen } from '@/components/shared/screen';
import { SearchInput } from '@/components/shared/search-input';
import { SelectField } from '@/components/shared/select-field';
import type { MovementType } from '@/types/database';

import { MovementRow } from '../components/movement-row';
import { useMovements, useMovementUsers } from '../hooks/use-movements';
import { movementTypeLabels, movementTypes } from '../types';

const typeOptions: { value: MovementType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  ...movementTypes.map((type) => ({ value: type, label: movementTypeLabels[type] })),
];

/** Historial auditable de movimientos de inventario. Solo lectura. */
export function MovementsScreen() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<MovementType | 'all'>('all');
  const [userId, setUserId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('all');
  const users = useMovementUsers();
  const movements = useMovements({ search, type, userId, ...periodRange(period) });

  const userOptions = [
    { value: 'all', label: 'Todos los usuarios' },
    ...(users.data ?? []).map((user) => ({ value: user.id, label: user.full_name })),
  ];

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Movimientos' }} />
      <View className="gap-3 border-b border-border p-4">
        <SearchInput placeholder="Buscar producto…" value={search} onChange={setSearch} />
        <FilterChips
          label="Filtrar por tipo de movimiento"
          options={typeOptions}
          value={type}
          onChange={setType}
        />
        <PeriodChips value={period} onChange={setPeriod} />
        <SelectField
          label="Filtrar por usuario"
          options={userOptions}
          value={userId ?? 'all'}
          onChange={(value) => setUserId(value === 'all' ? null : value)}
        />
      </View>
      <InfiniteList
        query={movements}
        noun="movimientos"
        keyExtractor={(movement) => movement.id}
        hasFilters={search.trim() !== '' || type !== 'all' || userId !== null || period !== 'all'}
        emptyIcon={History}
        emptyTitle="Aún no hay movimientos"
        emptyDescription="Aquí quedará el registro de cada entrada, salida, venta y ajuste."
        renderItem={(movement) => (
          <MovementRow
            productName={movement.product_name}
            type={movement.type}
            quantity={movement.quantity}
            userName={movement.user_name}
            createdAt={movement.created_at}
            stockBefore={movement.stock_before}
            stockAfter={movement.stock_after}
            detail={
              movement.type === 'venta' && movement.sale_number
                ? `Venta N.º ${movement.sale_number}`
                : movement.reason
            }
          />
        )}
      />
    </Screen>
  );
}
