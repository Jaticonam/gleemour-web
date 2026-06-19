/**
 * Genera viewers simulados para crear sensación de actividad.
 * Más adelante puede conectarse a analytics reales o eventos live.
 */
export function getLiveViewers(
  min = 3,
  max = 14
): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



