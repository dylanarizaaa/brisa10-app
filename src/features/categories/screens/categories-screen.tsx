import { router, Stack } from 'expo-router';
import { ChevronRight, Plus, Tags } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';

import { HeaderButton } from '@/components/shared/header-button';
import { ListSkeleton } from '@/components/shared/list-skeleton';
import { Screen } from '@/components/shared/screen';
import { SearchInput } from '@/components/shared/search-input';
import { EmptyState, ErrorState } from '@/components/shared/state-message';
import { StatusBadge } from '@/components/shared/status-badge';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { useCurrentUser } from '@/features/auth/auth-context';
import { THEME } from '@/lib/theme';
import { normalizeText } from '@/lib/text';

import { useCategories } from '../hooks/use-categories';

export function CategoriesScreen() {
  const { isAdmin } = useCurrentUser();
  const categories = useCategories();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = normalizeText(search.trim());
    return (categories.data ?? []).filter(
      (category) => !term || normalizeText(category.name).includes(term)
    );
  }, [categories.data, search]);

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: 'Categorías',
          headerRight: isAdmin
            ? () => (
                <HeaderButton
                  icon={Plus}
                  label="Nueva categoría"
                  onPress={() => router.push('/categoria')}
                />
              )
            : undefined,
        }}
      />
      <View className="border-b border-border p-4">
        <SearchInput
          placeholder="Buscar categoría…"
          value={search}
          onChange={setSearch}
          delay={0}
        />
      </View>
      <FlatList
        data={categories.isError ? [] : filtered}
        keyExtractor={(category) => category.id}
        ItemSeparatorComponent={Separator}
        contentContainerClassName="grow pb-6"
        refreshControl={
          <RefreshControl
            refreshing={categories.isRefetching}
            onRefresh={() => void categories.refetch()}
            tintColor={THEME.mutedForeground}
          />
        }
        ListEmptyComponent={
          categories.isPending ? (
            <ListSkeleton label="Cargando categorías" />
          ) : categories.isError ? (
            <ErrorState
              message={categories.error.message}
              onRetry={() => void categories.refetch()}
            />
          ) : search.trim() ? (
            <EmptyState
              icon={Tags}
              title="Sin resultados"
              description="Ninguna categoría coincide con la búsqueda."
            />
          ) : (
            <EmptyState
              icon={Tags}
              title="Aún no hay categorías"
              description="Crea la primera para organizar los productos."
            />
          )
        }
        renderItem={({ item: category }) => (
          <Pressable
            disabled={!isAdmin}
            role={isAdmin ? 'button' : undefined}
            aria-label={isAdmin ? `Editar ${category.name}` : category.name}
            onPress={() => router.push({ pathname: '/categoria', params: { id: category.id } })}
            className="flex-row items-center gap-3 px-4 py-3 active:bg-accent">
            <View className="flex-1 gap-0.5">
              <Text className="font-medium">{category.name}</Text>
              <Text numberOfLines={1} className="text-xs text-muted-foreground">
                {category.product_count} {category.product_count === 1 ? 'producto' : 'productos'}
                {category.description ? ` · ${category.description}` : ''}
              </Text>
            </View>
            <StatusBadge
              label={category.is_active ? 'Activa' : 'Inactiva'}
              active={category.is_active}
            />
            {isAdmin && <Icon as={ChevronRight} size={16} className="text-muted-foreground" />}
          </Pressable>
        )}
      />
    </Screen>
  );
}
