import type { wkSets, wkWorkoutExercises, wkWorkouts } from '@/db/schema';
import type { Changes, SetKind, SetRow, WorkoutExerciseRow, WorkoutRow } from './sanitize';

type DbWorkout = typeof wkWorkouts.$inferSelect;
type DbWorkoutExercise = typeof wkWorkoutExercises.$inferSelect;
type DbSet = typeof wkSets.$inferSelect;

const date = (iso: string | null) => (iso ? new Date(iso) : null);

// Filas de la API a filas de la base (el userId siempre viene de la sesión, nunca del teléfono).
export const toWorkoutDb = (userId: string, r: WorkoutRow) => ({
  id: r.id, userId, startedAt: new Date(r.startedAt), endedAt: date(r.endedAt), note: r.note, cycleId: r.cycleId, planWeek: r.planWeek, planDay: r.planDay,
  clientUpdatedAt: r.updatedAt, deleted: r.deleted,
});
export const toWorkoutExerciseDb = (userId: string, r: WorkoutExerciseRow) => ({
  id: r.id, userId, workoutId: r.workoutId, exerciseId: r.exerciseId, name: r.name, position: r.position, supersetGroup: r.supersetGroup,
  targetSets: r.targetSets, targetReps: r.targetReps, note: r.note, restS: r.restS, clientUpdatedAt: r.updatedAt, deleted: r.deleted,
});
export const toSetDb = (userId: string, r: SetRow) => ({
  id: r.id, userId, workoutExerciseId: r.workoutExerciseId, position: r.position, kind: r.kind, weightKg: r.weightKg, reps: r.reps, rir: r.rir,
  restS: r.restS, inclinePct: r.inclinePct, perSide: r.perSide, doneAt: date(r.doneAt), clientUpdatedAt: r.updatedAt, deleted: r.deleted,
});

// Filas de la base a filas de la API.
export const fromWorkoutDb = (r: DbWorkout): WorkoutRow => ({
  id: r.id, updatedAt: r.clientUpdatedAt, deleted: r.deleted, startedAt: r.startedAt.toISOString(), endedAt: r.endedAt?.toISOString() ?? null,
  note: r.note, cycleId: r.cycleId, planWeek: r.planWeek, planDay: r.planDay,
});
export const fromWorkoutExerciseDb = (r: DbWorkoutExercise): WorkoutExerciseRow => ({
  id: r.id, updatedAt: r.clientUpdatedAt, deleted: r.deleted, workoutId: r.workoutId, exerciseId: r.exerciseId, name: r.name, position: r.position,
  supersetGroup: r.supersetGroup, targetSets: r.targetSets, targetReps: r.targetReps, note: r.note, restS: r.restS,
});
export const fromSetDb = (r: DbSet): SetRow => ({
  id: r.id, updatedAt: r.clientUpdatedAt, deleted: r.deleted, workoutExerciseId: r.workoutExerciseId, position: r.position, kind: r.kind as SetKind,
  weightKg: r.weightKg, reps: r.reps, rir: r.rir, restS: r.restS, inclinePct: r.inclinePct, perSide: r.perSide, doneAt: r.doneAt?.toISOString() ?? null,
});

interface Existing {
  id: string;
  userId: string;
  clientUpdatedAt: number;
}

/**
 * Tras escribir, compara lo que mandó el teléfono con lo que hay en la base. Un id que existe pero es de otra persona se
 * rechaza (sin devolver nada suyo). Si la fila propia es más nueva que la enviada, se devuelve para que el teléfono la adopte.
 */
export function classify(
  userId: string,
  incoming: Changes,
  existing: { workouts: DbWorkout[]; workoutExercises: DbWorkoutExercise[]; sets: DbSet[] },
): { rejected: string[]; winners: Changes } {
  const rejected: string[] = [];
  const winners: Changes = { workouts: [], workoutExercises: [], sets: [] };
  const check = <A extends { id: string; updatedAt: number }, D extends Existing>(sent: A[], found: D[], keep: (d: D) => void) => {
    const byId = new Map(found.map((d) => [d.id, d]));
    for (const s of sent) {
      const d = byId.get(s.id);
      if (!d) continue;
      if (d.userId !== userId) rejected.push(s.id);
      else if (d.clientUpdatedAt > s.updatedAt) keep(d);
    }
  };
  check(incoming.workouts, existing.workouts, (d) => winners.workouts.push(fromWorkoutDb(d)));
  check(incoming.workoutExercises, existing.workoutExercises, (d) => winners.workoutExercises.push(fromWorkoutExerciseDb(d)));
  check(incoming.sets, existing.sets, (d) => winners.sets.push(fromSetDb(d)));
  return { rejected, winners };
}

/**
 * Pagina por el cursor común: de varias listas ya ordenadas por seq toma las `limit` filas más antiguas en conjunto.
 * Cada lista debe haberse pedido con el mismo límite; así ninguna fila con seq menor que el nuevo cursor se queda fuera.
 */
export function pageBySeq<T extends { seq: number }>(lists: T[][], limit: number): { taken: T[]; hasMore: boolean } {
  const all = lists.flat().sort((a, b) => a.seq - b.seq);
  return { taken: all.slice(0, limit), hasMore: all.length > limit || lists.some((l) => l.length >= limit) };
}
