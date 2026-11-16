/** Minúsculas y sin tildes, para comparar texto escrito por el usuario. */
export function normalizeText(text: string): string {
  return (
    text
      .normalize('NFD')
      // Marcas diacríticas combinables (tildes, diéresis). Se evita \p{Diacritic} por compatibilidad con Hermes.
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
  );
}

/** Iniciales de un nombre (máximo dos), para avatares. */
export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
