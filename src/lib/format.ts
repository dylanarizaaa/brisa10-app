// Formato de moneda y fechas escrito a mano, sin Intl: el resultado es idéntico en Android,
// iOS y web, y no depende del idioma ni de la zona horaria configurados en el teléfono.
// Las fechas siempre se muestran en hora de Colombia (UTC-5, sin horario de verano).

const BOGOTA_OFFSET_MS = -5 * 60 * 60 * 1000;
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function groupThousands(value: number): string {
  return Math.abs(Math.trunc(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Pesos colombianos sin decimales: 25000 → "$ 25.000". */
export function formatCOP(value: number): string {
  return `${value < 0 ? '-' : ''}$ ${groupThousands(value)}`;
}

/** Versión corta para ejes de gráficos: 1250000 → "$ 1,3 M", 300000 → "$ 300 mil". */
export function formatCompactCOP(value: number): string {
  const short = (amount: number) => (Math.round(amount * 10) / 10).toString().replace('.', ',');
  if (value >= 1_000_000) return `$ ${short(value / 1_000_000)} M`;
  if (value >= 1_000) return `$ ${short(value / 1_000)} mil`;
  return `$ ${value}`;
}

/** Fecha desplazada a hora de Colombia; leer sus campos con getUTC*. */
function toBogota(value: string | Date): Date {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Date(date.getTime() + BOGOTA_OFFSET_MS);
}

/** "11 nov 2026". */
export function formatDate(value: string | Date): string {
  const date = toBogota(value);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/** "11 nov 2026, 3:05 p. m." */
export function formatDateTime(value: string | Date): string {
  const date = toBogota(value);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${formatDate(value)}, ${hours % 12 || 12}:${minutes} ${hours < 12 ? 'a. m.' : 'p. m.'}`;
}

/** Día en formato AAAA-MM-DD → "11 nov". */
export function formatShortDay(day: string): string {
  const [, month, date] = day.split('-').map(Number);
  return `${date} ${MONTHS[(month ?? 1) - 1]}`;
}

/** Día en formato AAAA-MM-DD → "miércoles 11 nov". */
export function formatLongDay(day: string): string {
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  return `${WEEKDAYS[weekday]} ${formatShortDay(day)}`;
}

/** Hoy en Colombia como AAAA-MM-DD, desplazado `daysAgo` días hacia atrás. */
export function bogotaDay(daysAgo = 0): string {
  const date = toBogota(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000));
  return date.toISOString().slice(0, 10);
}
