import type { UseQueryResult } from '@tanstack/react-query';
import { router } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ListSkeleton } from '@/components/shared/list-skeleton';
import { EmptyState, ErrorState } from '@/components/shared/state-message';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

interface QueryBoundaryProps<T> {
  /** Consulta de un registro: `null` significa que no existe. */
  query: UseQueryResult<T | null, Error>;
  notFoundIcon: LucideIcon;
  notFoundTitle: string;
  children: (data: T) => ReactNode;
}

/** Resuelve carga, error y "no existe" de un registro antes de mostrar su pantalla. */
export function QueryBoundary<T>({
  query,
  notFoundIcon,
  notFoundTitle,
  children,
}: QueryBoundaryProps<T>) {
  if (query.isPending) return <ListSkeleton rows={4} label="Cargando" />;
  if (query.isError) {
    return <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />;
  }
  if (query.data === null) {
    return (
      <View className="flex-1">
        <EmptyState
          icon={notFoundIcon}
          title={notFoundTitle}
          description="Puede que se haya eliminado o que el enlace sea incorrecto.">
          <Button variant="outline" size="sm" onPress={() => router.back()}>
            <Text>Volver</Text>
          </Button>
        </EmptyState>
      </View>
    );
  }
  return <>{children(query.data)}</>;
}
