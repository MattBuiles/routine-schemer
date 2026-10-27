import { isUuid } from '@/lib/board/sanitize';

export const MAX_PUSH_ROWS = 500;
export const MAX_FUTURE_MS = 24 * 3_600_000;
export const SET_KINDS = ['warmup', 'work', 'backoff', 'failure'] as const;
export type SetKind = (typeof SET_KINDS)[number];

/** Lo que tiene toda fila sincronizable: su id, la hora del teléfono (ms) de su última edición y si está borrada. */
export interface SyncMeta {
  id: string;
  updatedAt: number;
  deleted: boolean;
}

export interface WorkoutRow extends SyncMeta {
  startedAt: string;
  endedAt: string | null;
  note: string;
  cycleId: string | null;
  planWeek: number | null;
  planDay: number | null;
}

export interface WorkoutExerciseRow extends SyncMeta {
  workoutId: string;
  exerciseId: string | null;
  name: string;
  position: number;
  supersetGroup: number | null;
  targetSets: number | null;
  targetReps: string | null;
  note: string | null;
  restS: number | null;
}

export interface SetRow extends SyncMeta {
  workoutExerciseId: string;
  position: number;
  kind: SetKind;
  weightKg: number | null;
  reps: number | null;
  rir: number | null;
  restS: number | null;
  inclinePct: number | null;
  perSide: boolean;
  doneAt: string | null;
}

export interface Changes {
  workouts: WorkoutRow[];
  workoutExercises: WorkoutExerciseRow[];
  sets: SetRow[];
}

export interface Rejection {
  table: keyof Changes;
  index: number;
  reason: string;
}

class Bad extends Error {}
const bad = (reason: string): never => {
  throw new Bad(reason);
};

const uuid = (v: unknown, field: string) => (isUuid(v) ? v.toLowerCase() : bad(`${field} no es un uuid`));
const optUuid = (v: unknown, field: string) => (v == null ? null : uuid(v, field));
const int = (v: unknown, field: string, min: number, max: number) =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : bad(`${field} debe ser un entero entre ${min} y ${max}`);
const optInt = (v: unknown, field: string, min: number, max: number) => (v == null ? null : int(v, field, min, max));
const decimal = (v: unknown, field: string, min: number, max: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? Math.round(v * 100) / 100 : bad(`${field} debe estar entre ${min} y ${max}`);
const optDecimal = (v: unknown, field: string, min: number, max: number) => (v == null ? null : decimal(v, field, min, max));
const text = (v: unknown, field: string, min: number, max: number) => {
  const s = typeof v === 'string' ? v.trim() : bad(`${field} debe ser texto`);
  return s.length >= min && s.length <= max ? s : bad(`${field} debe tener entre ${min} y ${max} caracteres`);
};
const optText = (v: unknown, field: string, max: number) => (v == null ? null : text(v, field, 1, max));
const iso = (v: unknown, field: string) => {
  const ms = typeof v === 'string' ? Date.parse(v) : NaN;
  const year = new Date(ms).getUTCFullYear();
  return Number.isFinite(ms) && year >= 2000 && year <= 2100 ? new Date(ms).toISOString() : bad(`${field} no es una fecha válida`);
};
const optIso = (v: unknown, field: string) => (v == null ? null : iso(v, field));

const meta = (r: Record<string, unknown>, now: number): SyncMeta => ({
  id: uuid(r.id, 'id'),
  updatedAt: int(r.updatedAt, 'updatedAt', 1, now + MAX_FUTURE_MS),
  deleted: r.deleted === undefined ? false : r.deleted === true ? true : r.deleted === false ? false : bad('deleted debe ser booleano'),
});

const parsers = {
  workouts: (r: Record<string, unknown>, now: number): WorkoutRow => ({
    ...meta(r, now),
    startedAt: iso(r.startedAt, 'startedAt'),
    endedAt: optIso(r.endedAt, 'endedAt'),
    note: r.note == null ? '' : text(r.note, 'note', 0, 2000),
    cycleId: optUuid(r.cycleId, 'cycleId'),
    planWeek: optInt(r.planWeek, 'planWeek', 0, 51),
    planDay: optInt(r.planDay, 'planDay', 0, 27),
  }),
  workoutExercises: (r: Record<string, unknown>, now: number): WorkoutExerciseRow => ({
    ...meta(r, now),
    workoutId: uuid(r.workoutId, 'workoutId'),
    exerciseId: optUuid(r.exerciseId, 'exerciseId'),
    name: text(r.name, 'name', 1, 120),
    position: int(r.position, 'position', 0, 200),
    supersetGroup: optInt(r.supersetGroup, 'supersetGroup', 0, 50),
    targetSets: optInt(r.targetSets, 'targetSets', 1, 50),
    targetReps: optText(r.targetReps, 'targetReps', 12),
    note: optText(r.note, 'note', 300),
    restS: optInt(r.restS, 'restS', 15, 600),
  }),
  sets: (r: Record<string, unknown>, now: number): SetRow => ({
    ...meta(r, now),
    workoutExerciseId: uuid(r.workoutExerciseId, 'workoutExerciseId'),
    position: int(r.position, 'position', 0, 200),
    kind: (SET_KINDS as readonly unknown[]).includes(r.kind) ? (r.kind as SetKind) : bad('kind no es un tipo de serie válido'),
    weightKg: optDecimal(r.weightKg, 'weightKg', 0, 1000),
    reps: optInt(r.reps, 'reps', 0, 1000),
    rir: optInt(r.rir, 'rir', 0, 10),
    restS: optInt(r.restS, 'restS', 0, 7200),
    inclinePct: optDecimal(r.inclinePct, 'inclinePct', 0, 40),
    perSide: r.perSide === undefined ? false : r.perSide === true ? true : r.perSide === false ? false : bad('perSide debe ser booleano'),
    doneAt: optIso(r.doneAt, 'doneAt'),
  }),
};

/** Si un id se repite en la misma petición, se queda la edición más reciente (un INSERT con ids repetidos falla entero). */
const latestById = <T extends SyncMeta>(rows: T[]): T[] => {
  const byId = new Map<string, T>();
  for (const r of rows) {
    const prev = byId.get(r.id);
    if (!prev || r.updatedAt >= prev.updatedAt) byId.set(r.id, r);
  }
  return [...byId.values()];
};

/**
 * Normaliza lo que manda el teléfono (JSON no confiable): cada fila inválida se descarta con su motivo y el resto se acepta.
 * `tooMany` es true si trae más de MAX_PUSH_ROWS filas: entonces no se procesa nada.
 */
export function sanitizePush(input: unknown, now = Date.now()): { rows: Changes; invalid: Rejection[]; tooMany: boolean } {
  const raw = (input ?? {}) as Record<string, unknown>;
  const rows: Changes = { workouts: [], workoutExercises: [], sets: [] };
  const invalid: Rejection[] = [];
  const lists = (Object.keys(parsers) as (keyof Changes)[]).map((table) => [table, Array.isArray(raw[table]) ? (raw[table] as unknown[]) : []] as const);
  if (lists.reduce((n, [, l]) => n + l.length, 0) > MAX_PUSH_ROWS) return { rows, invalid, tooMany: true };

  for (const [table, list] of lists) {
    const parsed: SyncMeta[] = [];
    list.forEach((item, index) => {
      try {
        if (!item || typeof item !== 'object' || Array.isArray(item)) bad('la fila debe ser un objeto');
        parsed.push(parsers[table](item as Record<string, unknown>, now));
      } catch (e) {
        if (!(e instanceof Bad)) throw e;
        invalid.push({ table, index, reason: e.message });
      }
    });
    (rows as Record<keyof Changes, SyncMeta[]>)[table] = latestById(parsed);
  }
  return { rows, invalid, tooMany: false };
}
