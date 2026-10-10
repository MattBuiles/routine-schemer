import 'server-only';

import { and, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { sessionTemplates, trainingPrograms } from '@/db/schema';

/** Falla si la plantilla de sesión no pertenece a un programa del usuario. */
export async function assertOwnsSessionTemplate(templateId: string, userId: string): Promise<void> {
  const [row] = await db
    .select({ id: sessionTemplates.id })
    .from(sessionTemplates)
    .innerJoin(trainingPrograms, eq(trainingPrograms.id, sessionTemplates.programId))
    .where(and(eq(sessionTemplates.id, templateId), eq(trainingPrograms.userId, userId)));
  if (!row) throw new Error('Sesión no encontrada');
}
