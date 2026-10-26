import 'server-only';

import { and, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { boardBlocks } from '@/db/schema';
import { applyLog, type LogEntry } from './lastLog';
import { sanitizeExercises } from './sanitize';

/** Escribe el «Último: …» en las notas de cada ejercicio del plan que coincida; devuelve cuántos bloques cambiaron. Solo toca bloques del usuario. */
export async function saveLastLog(userId: string, entries: LogEntry[]): Promise<number> {
  if (entries.length === 0) return 0;
  const log = new Map(entries.map((e) => [e.exerciseId, e.summary]));
  const rows = await db
    .select({ id: boardBlocks.id, exercises: boardBlocks.exercises })
    .from(boardBlocks)
    .where(and(eq(boardBlocks.userId, userId), eq(boardBlocks.kind, 'cycle')));
  const updates = rows.flatMap((r) => {
    const { exercises, changed } = applyLog(sanitizeExercises(r.exercises), log);
    return changed ? [db.update(boardBlocks).set({ exercises }).where(and(eq(boardBlocks.id, r.id), eq(boardBlocks.userId, userId)))] : [];
  });
  if (updates.length) await db.batch(updates as [(typeof updates)[number], ...(typeof updates)[number][]]);
  return updates.length;
}
