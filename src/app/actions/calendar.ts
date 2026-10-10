'use server';

import { and, asc, eq, gte, lte } from 'drizzle-orm';

import { db } from '@/db/client';
import { calendarEvents } from '@/db/schema';
import { assertOwnsSessionTemplate } from '@/lib/auth/ownership';
import { requireUserId } from '@/lib/auth/session';
import type { CalendarEvent } from '@/types';

export type CalendarEventInput = Pick<CalendarEvent, 'date' | 'title'> &
  Partial<Pick<CalendarEvent, 'time' | 'type' | 'duration' | 'description' | 'sessionId' | 'completed' | 'actualDuration' | 'notes' | 'category'>>;

// `sessionId` del tipo de la app es el id de la plantilla de sesión (session_templates).
const toColumns = ({ sessionId, ...rest }: Partial<CalendarEventInput>) => ({
  ...rest,
  ...(sessionId !== undefined && { sessionTemplateId: sessionId }),
});

const toEvent = (row: typeof calendarEvents.$inferSelect): CalendarEvent => ({
  id: row.id,
  userId: row.userId,
  date: row.date,
  time: row.time?.slice(0, 5),
  title: row.title,
  type: row.type as CalendarEvent['type'],
  duration: row.duration ?? undefined,
  description: row.description ?? undefined,
  sessionId: row.sessionTemplateId ?? undefined,
  completed: row.completed,
  actualDuration: row.actualDuration ?? undefined,
  notes: row.notes ?? undefined,
  category: (row.category ?? undefined) as CalendarEvent['category'],
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

/** Eventos del usuario; `from`/`to` en formato YYYY-MM-DD, ambos inclusivos. */
export async function getCalendarEvents(range: { from?: string; to?: string } = {}): Promise<CalendarEvent[]> {
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(calendarEvents)
    .where(and(
      eq(calendarEvents.userId, userId),
      range.from ? gte(calendarEvents.date, range.from) : undefined,
      range.to ? lte(calendarEvents.date, range.to) : undefined,
    ))
    .orderBy(asc(calendarEvents.date), asc(calendarEvents.time));
  return rows.map(toEvent);
}

export async function createCalendarEvent(input: CalendarEventInput): Promise<CalendarEvent> {
  const userId = await requireUserId();
  if (input.sessionId) await assertOwnsSessionTemplate(input.sessionId, userId);
  const [row] = await db.insert(calendarEvents).values({ ...toColumns(input), date: input.date, title: input.title, userId }).returning();
  return toEvent(row);
}

export async function updateCalendarEvent(eventId: string, updates: Partial<CalendarEventInput>): Promise<void> {
  const userId = await requireUserId();
  if (updates.sessionId) await assertOwnsSessionTemplate(updates.sessionId, userId);
  const defined = Object.fromEntries(Object.entries(toColumns(updates)).filter(([, v]) => v !== undefined));
  await db
    .update(calendarEvents)
    .set({ ...defined, updatedAt: new Date() })
    .where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, userId)));
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const userId = await requireUserId();
  await db.delete(calendarEvents).where(and(eq(calendarEvents.id, eventId), eq(calendarEvents.userId, userId)));
}
