import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { Search, type LucideIcon } from 'lucide-react-native';
import type { ReactElement, ReactNode } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';

import { ListSkeleton } from '@/components/shared/list-skeleton';
import { EmptyState, ErrorState } from '@/components/shared/state-message';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';

/** Forma de cada página que devuelven los servicios de listado. */
export interface ListPage<T> {
  items: T[];
  total: number;
}

/** Opciones comunes de paginación para useInfiniteQuery sobre servicios que reciben `page`. */
export const pagedQueryOptions = {
  initialPageParam: 1,
  getNextPageParam: <T,>(lastPage: ListPage<T>, allPages: ListPage<T>[]) => {
    const loaded = allPages.reduce((count, page) => count + page.items.length, 0);
    return lastPage.items.length > 0 && loaded < lastPage.total ? allPages.length + 1 : undefined;
  },
};

interface InfiniteListProps<T> {
  query: UseInfiniteQueryResult<InfiniteData<ListPage<T>>, Error>;
  renderItem: (item: T) => ReactElement;
  keyExtractor: (item: T) => string;
  /** Nombre de lo que se lista, en plural y minúscula ("productos"), para los textos de estado. */
  noun: string;
  /** Estado vacío cuando no hay ningún dato. */
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  /** Con filtros activos, una lista vacía se explica como "sin resultados". */
  hasFilters?: boolean;
  /** Contenido sobre la lista que se desplaza con ella (buscador, filtros). */
  header?: ReactElement;
}

/**
 * Lista con carga progresiva: resuelve los estados de carga, error y vacío, tira para
 * actualizar y pide la página siguiente al llegar al final. Es la lista estándar de la app.
 */
export function InfiniteList<T>({
  query,
  renderItem,
  keyExtractor,
  noun,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  hasFilters,
  header,
}: InfiniteListProps<T>) {
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  const empty = query.isPending ? (
    <ListSkeleton label={`Cargando ${noun}`} />
  ) : query.isError ? (
    <ErrorState message={query.error.message} onRetry={() => void query.refetch()} />
  ) : hasFilters ? (
    <EmptyState
      icon={Search}
      title="Sin resultados"
      description={`No hay ${noun} que coincidan con la búsqueda o los filtros.`}
    />
  ) : (
    <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription}>
      {emptyAction}
    </EmptyState>
  );

  return (
    <FlatList
      data={query.isError ? [] : items}
      keyExtractor={keyExtractor}
      renderItem={({ item }) => renderItem(item)}
      ItemSeparatorComponent={Separator}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={
        items.length > 0 && !query.isError ? (
          <View className="items-center gap-2 py-4">
            {query.isFetchingNextPage && <ActivityIndicator color={THEME.mutedForeground} />}
            <Text className="text-xs text-muted-foreground">
              {items.length} de {total} {noun}
            </Text>
          </View>
        ) : undefined
      }
      contentContainerClassName="grow pb-6"
      keyboardShouldPersistTaps="handled"
      onEndReachedThreshold={0.4}
      onEndReached={() => {
        if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
      }}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching && !query.isFetchingNextPage}
          onRefresh={() => void query.refetch()}
          tintColor={THEME.mutedForeground}
        />
      }
    />
  );
}
