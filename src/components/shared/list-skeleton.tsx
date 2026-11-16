import { View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';

/** Filas de carga para listas. */
export function ListSkeleton({ rows = 6, label }: { rows?: number; label: string }) {
  return (
    <View className="gap-3 p-4" role="progressbar" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} className="flex-row items-center gap-3">
          <Skeleton className="size-10 rounded-md" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </View>
        </View>
      ))}
    </View>
  );
}
