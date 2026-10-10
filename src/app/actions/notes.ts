'use server';

import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { notes } from '@/db/schema';
import { assertOwnsSessionTemplate } from '@/lib/auth/ownership';
import { requireUserId } from '@/lib/auth/session';
import type { Note, NoteType } from '@/types';

export type NoteInput = Pick<Note, 'title' | 'content'> &
  Partial<Pick<Note, 'type' | 'tags' | 'workoutSessionId' | 'isPinned'>>;

const toNote = (row: typeof notes.$inferSelect): Note => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  content: row.content,
  type: row.type as NoteType,
  tags: row.tags,
  workoutSessionId: row.workoutSessionId ?? undefined,
  isPinned: row.isPinned,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export async function getNotes(): Promise<Note[]> {
  const userId = await requireUserId();
  const rows = await db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.isPinned), desc(notes.createdAt));
  return rows.map(toNote);
}

export async function createNote(input: NoteInput): Promise<Note> {
  const userId = await requireUserId();
  if (input.workoutSessionId) await assertOwnsSessionTemplate(input.workoutSessionId, userId);
  const [row] = await db.insert(notes).values({ ...input, userId }).returning();
  return toNote(row);
}

export async function updateNote(noteId: string, updates: Partial<NoteInput>): Promise<void> {
  const userId = await requireUserId();
  if (updates.workoutSessionId) await assertOwnsSessionTemplate(updates.workoutSessionId, userId);
  const defined = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
  await db
    .update(notes)
    .set({ ...defined, updatedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}

export async function deleteNote(noteId: string): Promise<void> {
  const userId = await requireUserId();
  await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}
