import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import type { StockStatus } from '@/types/database';

import { stockStatusLabels } from '../types';

const styles: Record<StockStatus, { badge: string; text: string }> = {
  disponible: { badge: 'bg-success-soft border-transparent', text: 'text-success' },
  bajo: { badge: 'bg-warning-soft border-transparent', text: 'text-warning' },
  agotado: { badge: 'bg-danger-soft border-transparent', text: 'text-danger' },
};

/** Disponibilidad de un producto: disponible, bajo inventario o agotado. */
export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <Badge variant="outline" className={styles[status].badge}>
      <Text className={styles[status].text}>{stockStatusLabels[status]}</Text>
    </Badge>
  );
}
