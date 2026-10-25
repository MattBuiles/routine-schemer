import 'server-only';

import { and, eq, sql } from 'drizzle-orm';

import type { ExerciseSummary } from '@/app/actions/exercises';
import { db } from '@/db/client';
import { exercises } from '@/db/schema';
import { MAX_CUSTOM_PER_USER, type CustomExerciseInput } from './custom';
import { toSummary } from './query';

const own = (userId: string, id: string) => and(eq(exercises.id, id), eq(exercises.userId, userId));

/** Crea un ejercicio propio; null si el usuario ya llegó al máximo. */
export async function createCustom(userId: string, input: CustomExerciseInput): Promise<ExerciseSummary | null> {
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(exercises).where(eq(exercises.userId, userId));
  if (n >= MAX_CUSTOM_PER_USER) return null;
  const id = crypto.randomUUID();
  const [row] = await db
    .insert(exercises)
    .values({ id, userId, source: 'custom', sourceId: id, nameEn: input.name, category: 'strength', equipment: input.equipment, primaryMuscles: input.primaryMuscles, instructionsEn: input.notes, license: 'user' })
    .returning();
  return toSummary(row);
}

/** Edita un ejercicio propio; null si no existe o no es del usuario (los de la biblioteca común no se pueden tocar). */
export async function updateCustom(userId: string, id: string, input: CustomExerciseInput): Promise<ExerciseSummary | null> {
  const [row] = await db
    .update(exercises)
    .set({ nameEn: input.name, nameEs: null, equipment: input.equipment, primaryMuscles: input.primaryMuscles, instructionsEn: input.notes })
    .where(own(userId, id))
    .returning();
  return row ? toSummary(row) : null;
}

export async function deleteCustom(userId: string, id: string): Promise<boolean> {
  const rows = await db.delete(exercises).where(own(userId, id)).returning({ id: exercises.id });
  return rows.length > 0;
}
