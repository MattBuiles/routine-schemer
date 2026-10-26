import type { BlockExercise } from './cycle';
import { isUuid } from './sanitize';

const MARKER = ' · Último: ';
const BARE_MARKER = 'Último: ';
const MAX_NOTES = 200; // límite de `notes` en sanitizeExercises
const MAX_SUMMARY = 60;
const MAX_ENTRIES = 50;

export interface LogEntry {
  exerciseId: string;
  summary: string;
}

/** Normaliza lo que manda la app (JSON no confiable): ids uuid únicos y un resumen de texto corto por ejercicio. */
export function sanitizeLog(input: unknown): LogEntry[] {
  const raw = (input as { exercises?: unknown } | null)?.exercises;
  if (!Array.isArray(raw)) return [];
  const byId = new Map<string, string>();
  for (const item of raw.slice(0, MAX_ENTRIES) as Record<string, unknown>[]) {
    if (!item || !isUuid(item.exerciseId) || typeof item.summary !== 'string') continue;
    const summary = item.summary.replace(/\s+/g, ' ').trim().slice(0, MAX_SUMMARY);
    if (summary) byId.set(item.exerciseId.toLowerCase(), summary);
  }
  return [...byId].map(([exerciseId, summary]) => ({ exerciseId, summary }));
}

/** Notas con el «Último: …» nuevo: conserva lo que escribiste tú, reemplaza el resumen anterior y respeta el límite de 200 caracteres. */
export function withLastLog(notes: string, summary: string): string {
  const cut = notes.indexOf(MARKER);
  const base = (cut >= 0 ? notes.slice(0, cut) : notes.startsWith(BARE_MARKER) ? '' : notes).trim();
  const tail = `${base ? MARKER : BARE_MARKER}${summary}`;
  return base ? `${base.slice(0, Math.max(0, MAX_NOTES - tail.length))}${tail}` : tail.slice(0, MAX_NOTES);
}

/** Aplica el registro a los ejercicios de un bloque; `changed` dice si hay algo que guardar. */
export function applyLog(exercises: BlockExercise[], log: Map<string, string>): { exercises: BlockExercise[]; changed: boolean } {
  let changed = false;
  const next = exercises.map((e) => {
    const summary = log.get(e.exerciseId.toLowerCase());
    if (!summary) return e;
    const notes = withLastLog(e.notes, summary);
    if (notes === e.notes) return e;
    changed = true;
    return { ...e, notes };
  });
  return { exercises: next, changed };
}
