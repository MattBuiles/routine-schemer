'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { userGoals, userProfiles } from '@/db/schema';
import { requireUserId } from '@/lib/auth/session';
import type { UserProfile } from '@/types';

const toNumber = (value: string | null) => (value === null ? undefined : Number(value));
const toColumn = (value: number | undefined) => (value === undefined ? undefined : String(value));

export async function getUserProfile(): Promise<UserProfile | null> {
  const userId = await requireUserId();

  const [row] = await db.select().from(userProfiles).where(eq(userProfiles.id, userId));
  if (!row) return null;

  const goals = await db.select({ goal: userGoals.goal }).from(userGoals).where(eq(userGoals.userId, userId));

  return {
    id: row.id,
    userId: row.id,
    age: row.age ?? undefined,
    weight: toNumber(row.weight),
    height: toNumber(row.height),
    bodyFat: toNumber(row.bodyFat),
    activityLevel: (row.activityLevel ?? 'moderately_active') as UserProfile['activityLevel'],
    goals: goals.map(g => g.goal) as UserProfile['goals'],
    experience: (row.experience ?? 'beginner') as UserProfile['experience'],
    preferences: row.preferences as UserProfile['preferences'],
    weeklyGoal: row.weeklyGoal ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  const userId = await requireUserId();

  const values = {
    age: updates.age,
    weight: toColumn(updates.weight),
    height: toColumn(updates.height),
    bodyFat: toColumn(updates.bodyFat),
    activityLevel: updates.activityLevel,
    experience: updates.experience,
    weeklyGoal: updates.weeklyGoal,
    preferences: updates.preferences,
  };
  // Las claves undefined se omiten, así una actualización parcial no borra el resto.
  const defined = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined));

  await db
    .insert(userProfiles)
    .values({ id: userId, ...defined })
    .onConflictDoUpdate({ target: userProfiles.id, set: { ...defined, updatedAt: new Date() } });

  if (updates.goals) {
    await db.delete(userGoals).where(eq(userGoals.userId, userId));
    if (updates.goals.length > 0) {
      await db.insert(userGoals).values(updates.goals.map(goal => ({ userId, goal })));
    }
  }
}
