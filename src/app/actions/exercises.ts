'use server';

import { and, asc, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { exercises } from '@/db/schema';
import { requireUserId } from '@/lib/auth/session';
import { escapeLike, sanitizeSearch } from '@/lib/exercises/search';
import { isUuid } from '@/lib/board/sanitize';

export interface ExerciseSummary {
  id: string;
  nameEn: string;
  nameEs: string | null;
  category: string | null;
  level: string | null;
  equipment: string[];
  primaryMuscles: string[];
  image: string | null;
}

export interface ExerciseDetail extends ExerciseSummary {
  secondaryMuscles: string[];
  instructionsEn: string;
  instructionsEs: string | null;
  images: string[];
  license: string;
  attribution: string | null;
}

const toSummary = (row: typeof exercises.$inferSelect): ExerciseSummary => ({
  id: row.id,
  nameEn: row.nameEn,
  nameEs: row.nameEs,
  category: row.category,
  level: row.level,
  equipment: row.equipment,
  primaryMuscles: row.primaryMuscles,
  image: row.images[0] ?? null,
});

/** Biblioteca común (user_id nulo) más los ejercicios propios del usuario. */
const visibleTo = (userId: string) => or(isNull(exercises.userId), eq(exercises.userId, userId));

/** Busca por nombre (inglés o español) con filtros opcionales de músculo y equipamiento. */
export async function searchExercises(input: unknown): Promise<{ items: ExerciseSummary[]; total: number }> {
  const userId = await requireUserId();
  const { query, muscle, equipment, limit, offset } = sanitizeSearch(input);
  const pattern = `%${escapeLike(query)}%`;

  const where = and(
    visibleTo(userId),
    query ? or(ilike(exercises.nameEn, pattern), ilike(exercises.nameEs, pattern)) : undefined,
    muscle ? sql`${muscle} = any(${exercises.primaryMuscles})` : undefined,
    equipment ? sql`${equipment} = any(${exercises.equipment})` : undefined,
  );

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(exercises)
      .where(where)
      // Primero los que empiezan por el texto buscado, luego el resto por nombre.
      .orderBy(query ? desc(sql`lower(${exercises.nameEn}) like ${escapeLike(query.toLowerCase()) + '%'}`) : sql`true`, asc(exercises.nameEn))
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(exercises).where(where),
  ]);
  return { items: rows.map(toSummary), total };
}

export async function getExercise(id: string): Promise<ExerciseDetail | null> {
  const userId = await requireUserId();
  if (!isUuid(id)) return null;
  const [row] = await db.select().from(exercises).where(and(eq(exercises.id, id), visibleTo(userId)));
  if (!row) return null;
  return {
    ...toSummary(row),
    secondaryMuscles: row.secondaryMuscles,
    instructionsEn: row.instructionsEn,
    instructionsEs: row.instructionsEs,
    images: row.images,
    license: row.license,
    attribution: row.attribution,
  };
}
