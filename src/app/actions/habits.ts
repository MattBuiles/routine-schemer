'use server';

import { and, asc, eq, gte, lte } from 'drizzle-orm';

import { db } from '@/db/client';
import { habitRecords, habits } from '@/db/schema';
import { requireUserId } from '@/lib/auth/session';
import type { Habit, HabitRecord, HabitType } from '@/types';

export type HabitInput = Pick<Habit, 'name' | 'type' | 'target' | 'unit' | 'color' | 'icon'> &
  Partial<Pick<Habit, 'description' | 'isActive' | 'isFavorite'>>;

const toHabit = (row: typeof habits.$inferSelect): Habit => ({
  id: row.id,
  userId: row.userId,
  name: row.name,
  description: row.description ?? undefined,
  type: row.type as HabitType,
  target: row.target,
  unit: row.unit,
  color: row.color,
  icon: row.icon,
  isActive: row.isActive,
  isFavorite: row.isFavorite,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const toRecord = (row: typeof habitRecords.$inferSelect): HabitRecord => ({
  id: row.id,
  habitId: row.habitId,
  userId: row.userId,
  date: row.date,
  value: row.value,
  notes: row.notes ?? undefined,
  createdAt: row.createdAt,
});

export async function getHabits(): Promise<Habit[]> {
  const userId = await requireUserId();
  const rows = await db.select().from(habits).where(eq(habits.userId, userId)).orderBy(asc(habits.createdAt));
  return rows.map(toHabit);
}

export async function createHabit(input: HabitInput): Promise<Habit> {
  const userId = await requireUserId();
  const [row] = await db.insert(habits).values({ ...input, userId }).returning();
  return toHabit(row);
}

export async function updateHabit(habitId: string, updates: Partial<HabitInput>): Promise<void> {
  const userId = await requireUserId();
  const defined = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
  await db
    .update(habits)
    .set({ ...defined, updatedAt: new Date() })
    .where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
}

export async function deleteHabit(habitId: string): Promise<void> {
  const userId = await requireUserId();
  await db.delete(habits).where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
}

/** Registros del usuario; `from`/`to` en formato YYYY-MM-DD, ambos inclusivos. */
export async function getHabitRecords(range: { from?: string; to?: string } = {}): Promise<HabitRecord[]> {
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(habitRecords)
    .where(and(
      eq(habitRecords.userId, userId),
      range.from ? gte(habitRecords.date, range.from) : undefined,
      range.to ? lte(habitRecords.date, range.to) : undefined,
    ));
  return rows.map(toRecord);
}

/** Crea o reemplaza el registro de un hábito para un día (uno por hábito y fecha). */
export async function setHabitRecord(habitId: string, date: string, value: number, notes?: string): Promise<HabitRecord> {
  const userId = await requireUserId();

  const [habit] = await db.select({ id: habits.id }).from(habits).where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
  if (!habit) throw new Error('Hábito no encontrado');

  const [row] = await db
    .insert(habitRecords)
    .values({ habitId, userId, date, value, notes })
    .onConflictDoUpdate({ target: [habitRecords.habitId, habitRecords.date], set: { value, notes } })
    .returning();
  return toRecord(row);
}
