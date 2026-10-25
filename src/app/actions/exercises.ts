'use server';

import { and, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { exercises } from '@/db/schema';
import { requireUserId } from '@/lib/auth/session';
import { runSearch, toSummary, visibleTo } from '@/lib/exercises/query';
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

/** Busca por nombre (inglés o español) con filtros opcionales de músculo y equipamiento. */
export async function searchExercises(input: unknown): Promise<{ items: ExerciseSummary[]; total: number }> {
  return runSearch(await requireUserId(), input);
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
