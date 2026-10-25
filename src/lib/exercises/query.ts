import 'server-only';

import { and, asc, desc, eq, ilike, inArray, isNull, or, sql } from 'drizzle-orm';

import { isUuid } from '@/lib/board/sanitize';
import type { ExerciseSummary } from '@/app/actions/exercises';
import { db } from '@/db/client';
import { exercises } from '@/db/schema';
import { escapeLike, sanitizeSearch } from './search';

export const toSummary = (row: typeof exercises.$inferSelect): ExerciseSummary => ({
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
export const visibleTo = (userId: string) => or(isNull(exercises.userId), eq(exercises.userId, userId));

/** Busca por nombre (inglés o español) con filtros opcionales de músculo y equipamiento, entre la biblioteca común y los ejercicios de `userId`. */
export async function runSearch(userId: string, input: unknown): Promise<{ items: ExerciseSummary[]; total: number }> {
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
      // Con texto, primero los que empiezan por él; sin texto no hay nada que priorizar (Postgres no admite `ORDER BY true`).
      .orderBy(...(query ? [desc(sql`lower(${exercises.nameEn}) like ${escapeLike(query.toLowerCase()) + '%'}`)] : []), asc(exercises.nameEn))
      .limit(limit)
      .offset(offset),
    db.select({ total: sql<number>`count(*)::int` }).from(exercises).where(where),
  ]);
  return { items: rows.map(toSummary), total };
}

export const MAX_BY_IDS = 50;

/** Ejercicios por id (biblioteca común y propios del usuario); ignora ids que no son uuid y no pasa de MAX_BY_IDS. */
export async function runByIds(userId: string, ids: unknown[]): Promise<ExerciseSummary[]> {
  const valid = [...new Set(ids.filter(isUuid).map((i) => i.toLowerCase()))].slice(0, MAX_BY_IDS);
  if (valid.length === 0) return [];
  const rows = await db.select().from(exercises).where(and(visibleTo(userId), inArray(exercises.id, valid)));
  return rows.map(toSummary);
}
