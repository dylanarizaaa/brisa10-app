import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';

/** Insignia neutra de estado (activo/inactivo, publicado…). */
export function StatusBadge({ label, active = true }: { label: string; active?: boolean }) {
  return (
    <Badge variant={active ? 'secondary' : 'outline'}>
      <Text>{label}</Text>
    </Badge>
  );
}
