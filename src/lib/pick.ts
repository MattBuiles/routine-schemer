/**
 * Copia solo las claves permitidas y descarta las `undefined`.
 * Las server actions reciben JSON arbitrario del cliente: nunca se debe volcar un objeto de entrada
 * directamente a un INSERT/UPDATE, o un cliente podría fijar `userId`, `id` o cualquier otra columna.
 */
export function pick<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Partial<Pick<T, K>> {
  const result: Partial<Pick<T, K>> = {};
  for (const key of keys) {
    if (source[key] !== undefined) result[key] = source[key];
  }
  return result;
}
