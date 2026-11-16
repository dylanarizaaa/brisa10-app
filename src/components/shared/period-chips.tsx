import { bogotaDay } from '@/lib/format';

import { FilterChips } from './filter-chips';

export type Period = 'all' | 'today' | '7d' | '30d';

const options: { value: Period; label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'today', label: 'Hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
];

/** Rango de fechas (AAAA-MM-DD, hora de Colombia) que corresponde a cada periodo. */
export function periodRange(period: Period): { from: string; to: string } {
  switch (period) {
    case 'today':
      return { from: bogotaDay(0), to: bogotaDay(0) };
    case '7d':
      return { from: bogotaDay(6), to: '' };
    case '30d':
      return { from: bogotaDay(29), to: '' };
    case 'all':
      return { from: '', to: '' };
  }
}

/** Filtro de periodo con atajos pensados para el móvil (en lugar de selectores de fecha). */
export function PeriodChips({
  value,
  onChange,
}: {
  value: Period;
  onChange: (period: Period) => void;
}) {
  return (
    <FilterChips label="Filtrar por periodo" options={options} value={value} onChange={onChange} />
  );
}
