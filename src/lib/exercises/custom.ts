import { EQUIPMENT, MUSCLES } from './search';

export const MAX_CUSTOM_PER_USER = 300;

export interface CustomExerciseInput {
  name: string;
  primaryMuscles: string[];
  equipment: string[];
  notes: string;
}

const list = (v: unknown, allowed: readonly string[], max: number): string[] =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && allowed.includes(x)))].slice(0, max) : [];

/** Normaliza un ejercicio propio recibido del cliente (JSON no confiable): nombre obligatorio y listas cerradas de músculos y equipamiento. */
export function sanitizeCustom(input: unknown): { ok: true; value: CustomExerciseInput } | { ok: false; error: string } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (name.length < 1 || name.length > 80) return { ok: false, error: 'name debe tener entre 1 y 80 caracteres' };
  const notes = typeof raw.notes === 'string' ? raw.notes.trim() : '';
  if (notes.length > 2000) return { ok: false, error: 'notes admite hasta 2000 caracteres' };
  return { ok: true, value: { name, primaryMuscles: list(raw.primaryMuscles, MUSCLES, 3), equipment: list(raw.equipment, EQUIPMENT, 3), notes } };
}
