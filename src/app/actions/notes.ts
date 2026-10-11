'use server';

import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { notes } from '@/db/schema';
import { requireUserId } from '@/lib/auth/session';
import { pick } from '@/lib/pick';
import type { Note, NoteType } from '@/types';

export type NoteInput = Pick<Note, 'title' | 'content'> &
  Partial<Pick<Note, 'type' | 'tags' | 'isPinned'>>;

const NOTE_FIELDS = ['title', 'content', 'type', 'tags', 'isPinned'] as const;

const toNote = (row: typeof notes.$inferSelect): Note => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  content: row.content,
  type: row.type as NoteType,
  tags: row.tags,
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
  const [row] = await db
    .insert(notes)
    .values({ ...(pick(input, NOTE_FIELDS) as NoteInput), userId })
    .returning();
  return toNote(row);
}

export async function updateNote(noteId: string, updates: Partial<NoteInput>): Promise<void> {
  const userId = await requireUserId();
  await db
    .update(notes)
    .set({ ...pick(updates, NOTE_FIELDS), updatedAt: new Date() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}

export async function deleteNote(noteId: string): Promise<void> {
  const userId = await requireUserId();
  await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.userId, userId)));
}
