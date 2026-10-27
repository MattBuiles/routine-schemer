import 'server-only';

import { and, asc, eq, gt, inArray, sql } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

import { db } from '@/db/client';
import { wkSets, wkWorkoutExercises, wkWorkouts } from '@/db/schema';
import { classify, fromSetDb, fromWorkoutDb, fromWorkoutExerciseDb, pageBySeq, toSetDb, toWorkoutDb, toWorkoutExerciseDb } from './logic';
import type { Changes } from './sanitize';

// El valor que se intentó insertar, para el UPDATE de ON CONFLICT.
const ex = (c: PgColumn) => sql.raw(`excluded."${c.name}"`);
const nextSeq = sql`nextval('wk_sync_seq')`;
// Solo se pisa una fila propia y más antigua: otra persona nunca, y una edición vieja tampoco.
const onlyIfNewer = (t: typeof wkWorkouts | typeof wkWorkoutExercises | typeof wkSets) =>
  sql`${t.userId} = excluded.user_id and ${t.clientUpdatedAt} < excluded.client_updated_at`;

/** Guarda lo que mandó el teléfono (último gana por su hora) y devuelve lo rechazado y las filas que ya eran más nuevas. */
export async function pushChanges(userId: string, rows: Changes) {
  const writes = [];
  if (rows.workouts.length) {
    const t = wkWorkouts;
    writes.push(
      db.insert(t).values(rows.workouts.map((r) => toWorkoutDb(userId, r))).onConflictDoUpdate({
        target: t.id,
        set: { startedAt: ex(t.startedAt), endedAt: ex(t.endedAt), note: ex(t.note), cycleId: ex(t.cycleId), planWeek: ex(t.planWeek), planDay: ex(t.planDay), clientUpdatedAt: ex(t.clientUpdatedAt), deleted: ex(t.deleted), seq: nextSeq },
        setWhere: onlyIfNewer(t),
      }),
    );
  }
  if (rows.workoutExercises.length) {
    const t = wkWorkoutExercises;
    writes.push(
      db.insert(t).values(rows.workoutExercises.map((r) => toWorkoutExerciseDb(userId, r))).onConflictDoUpdate({
        target: t.id,
        set: { workoutId: ex(t.workoutId), exerciseId: ex(t.exerciseId), name: ex(t.name), position: ex(t.position), supersetGroup: ex(t.supersetGroup), targetSets: ex(t.targetSets), targetReps: ex(t.targetReps), note: ex(t.note), restS: ex(t.restS), clientUpdatedAt: ex(t.clientUpdatedAt), deleted: ex(t.deleted), seq: nextSeq },
        setWhere: onlyIfNewer(t),
      }),
    );
  }
  if (rows.sets.length) {
    const t = wkSets;
    writes.push(
      db.insert(t).values(rows.sets.map((r) => toSetDb(userId, r))).onConflictDoUpdate({
        target: t.id,
        set: { workoutExerciseId: ex(t.workoutExerciseId), position: ex(t.position), kind: ex(t.kind), weightKg: ex(t.weightKg), reps: ex(t.reps), rir: ex(t.rir), restS: ex(t.restS), inclinePct: ex(t.inclinePct), perSide: ex(t.perSide), doneAt: ex(t.doneAt), clientUpdatedAt: ex(t.clientUpdatedAt), deleted: ex(t.deleted), seq: nextSeq },
        setWhere: onlyIfNewer(t),
      }),
    );
  }
  if (writes.length === 0) return { rejected: [], winners: { workouts: [], workoutExercises: [], sets: [] } satisfies Changes };
  await db.batch(writes as [(typeof writes)[number], ...(typeof writes)[number][]]);

  const ids = (list: { id: string }[]) => list.map((r) => r.id);
  const [workouts, workoutExercises, sets] = await Promise.all([
    rows.workouts.length ? db.select().from(wkWorkouts).where(inArray(wkWorkouts.id, ids(rows.workouts))) : [],
    rows.workoutExercises.length ? db.select().from(wkWorkoutExercises).where(inArray(wkWorkoutExercises.id, ids(rows.workoutExercises))) : [],
    rows.sets.length ? db.select().from(wkSets).where(inArray(wkSets.id, ids(rows.sets))) : [],
  ]);
  return classify(userId, rows, { workouts, workoutExercises, sets });
}

/** Cambios (incluidos los borrados) de esta persona con seq mayor que el cursor, hasta `limit` filas en conjunto. */
export async function pullChanges(userId: string, cursor: number, limit: number) {
  const page = <T extends typeof wkWorkouts | typeof wkWorkoutExercises | typeof wkSets>(t: T) => and(eq(t.userId, userId), gt(t.seq, cursor));
  const [w, e, s] = await db.batch([
    db.select().from(wkWorkouts).where(page(wkWorkouts)).orderBy(asc(wkWorkouts.seq)).limit(limit),
    db.select().from(wkWorkoutExercises).where(page(wkWorkoutExercises)).orderBy(asc(wkWorkoutExercises.seq)).limit(limit),
    db.select().from(wkSets).where(page(wkSets)).orderBy(asc(wkSets.seq)).limit(limit),
  ]);
  type Tagged = { seq: number } & ({ table: 'workouts'; row: ReturnType<typeof fromWorkoutDb> } | { table: 'workoutExercises'; row: ReturnType<typeof fromWorkoutExerciseDb> } | { table: 'sets'; row: ReturnType<typeof fromSetDb> });
  const { taken, hasMore } = pageBySeq<Tagged>(
    [
      w.map((r) => ({ seq: r.seq, table: 'workouts' as const, row: fromWorkoutDb(r) })),
      e.map((r) => ({ seq: r.seq, table: 'workoutExercises' as const, row: fromWorkoutExerciseDb(r) })),
      s.map((r) => ({ seq: r.seq, table: 'sets' as const, row: fromSetDb(r) })),
    ],
    limit,
  );
  const changes: Changes = { workouts: [], workoutExercises: [], sets: [] };
  for (const t of taken) (changes[t.table] as (typeof t.row)[]).push(t.row);
  return { cursor: taken.length ? taken[taken.length - 1].seq : cursor, hasMore, changes };
}
