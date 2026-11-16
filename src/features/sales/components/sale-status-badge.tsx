import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import type { SaleStatus } from '@/types/database';

import { saleStatusLabels } from '../types';

export function SaleStatusBadge({ status }: { status: SaleStatus }) {
  const completed = status === 'completada';
  return (
    <Badge
      variant="outline"
      className={
        completed ? 'border-transparent bg-success-soft' : 'border-transparent bg-danger-soft'
      }>
      <Text className={completed ? 'text-success' : 'text-danger'}>{saleStatusLabels[status]}</Text>
    </Badge>
  );
}
