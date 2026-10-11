export const MUSCLES = [
  'abdominals', 'abductors', 'adductors', 'biceps', 'calves', 'chest', 'forearms', 'glutes', 'hamstrings',
  'lats', 'lower back', 'middle back', 'neck', 'quadriceps', 'shoulders', 'traps', 'triceps',
] as const;

export const EQUIPMENT = [
  'barbell', 'dumbbell', 'cable', 'machine', 'kettlebells', 'bands', 'e-z curl bar', 'exercise ball',
  'medicine ball', 'foam roll', 'body only', 'other',
] as const;

/** Etiquetas en español para los filtros (la biblioteca guarda los valores en inglés). */
export const MUSCLE_LABELS: Record<string, string> = {
  abdominals: 'Abdominales', abductors: 'Abductores', adductors: 'Aductores', biceps: 'Bíceps', calves: 'Gemelos',
  chest: 'Pecho', forearms: 'Antebrazos', glutes: 'Glúteos', hamstrings: 'Isquiotibiales', lats: 'Dorsales',
  'lower back': 'Lumbar', 'middle back': 'Espalda media', neck: 'Cuello', quadriceps: 'Cuádriceps',
  shoulders: 'Hombros', traps: 'Trapecios', triceps: 'Tríceps',
};

export const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barra', dumbbell: 'Mancuernas', cable: 'Polea', machine: 'Máquina', kettlebells: 'Kettlebell', bands: 'Bandas',
  'e-z curl bar': 'Barra Z', 'exercise ball': 'Fitball', 'medicine ball': 'Balón medicinal', 'foam roll': 'Rodillo',
  'body only': 'Peso corporal', other: 'Otro',
};

export const MAX_SEARCH_LIMIT = 50;
export const DEFAULT_SEARCH_LIMIT = 30;

export interface ExerciseSearch {
  query: string;
  muscle: string | null;
  equipment: string | null;
  limit: number;
  offset: number;
}

const oneOf = <T extends string>(value: unknown, allowed: readonly T[]): T | null =>
  allowed.includes(value as T) ? (value as T) : null;

const integer = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.floor(value))) : fallback;

/** Normaliza la búsqueda recibida del cliente: filtros de lista cerrada, texto acotado y paginación limitada. */
export function sanitizeSearch(input: unknown): ExerciseSearch {
  const raw = (input ?? {}) as Record<string, unknown>;
  return {
    query: typeof raw.query === 'string' ? raw.query.trim().slice(0, 80) : '',
    muscle: oneOf(raw.muscle, MUSCLES),
    equipment: oneOf(raw.equipment, EQUIPMENT),
    limit: integer(raw.limit, 1, MAX_SEARCH_LIMIT, DEFAULT_SEARCH_LIMIT),
    offset: integer(raw.offset, 0, 100_000, 0),
  };
}

/** Escapa los comodines de LIKE para que el texto del usuario se busque literalmente. */
export const escapeLike = (text: string) => text.replace(/[\\%_]/g, (c) => `\\${c}`);
