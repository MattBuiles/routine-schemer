import { getMobileUserId } from '@/lib/auth/mobile';
import { sanitizeLog } from '@/lib/board/lastLog';
import { saveLastLog } from '@/lib/board/lastLog-store';

const headers = { 'cache-control': 'no-store' };

/** Cuerpo `{ exercises: [{ exerciseId, summary }] }`: apunta lo que hiciste (p. ej. «82.5 kg × 8») en las notas de esos ejercicios del plan. */
export async function POST(request: Request) {
  const userId = await getMobileUserId(request);
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401, headers });
  const entries = sanitizeLog(await request.json().catch(() => null));
  if (entries.length === 0) return Response.json({ error: 'sin ejercicios válidos' }, { status: 400, headers });
  return Response.json({ updatedBlocks: await saveLastLog(userId, entries) }, { headers });
}
