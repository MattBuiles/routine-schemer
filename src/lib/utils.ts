/** Fecha local en formato YYYY-MM-DD (no UTC: cerca de medianoche toISOString cae en otro día). */
export function getDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
