import { getMobileUserId } from '@/lib/auth/mobile';
import { MAX_PUSH_ROWS, sanitizePush } from '@/lib/sync/sanitize';
import { pushChanges } from '@/lib/sync/store';

const headers = { 'cache-control': 'no-store' };
const MAX_BODY_BYTES = 1_000_000;

/**
 * El teléfono envía sus cambios nuevos. El dueño sale siempre del token, nunca del cuerpo. Responde con los ids
 * rechazados, las filas descartadas por inválidas y las filas del servidor que eran más nuevas (para que las adopte).
 */
export async function POST(request: Request) {
  const userId = await getMobileUserId(request);
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401, headers });

  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return Response.json({ error: 'payload_too_large' }, { status: 413, headers });
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return Response.json({ error: 'payload_too_large' }, { status: 413, headers });
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: 'invalid_request' }, { status: 400, headers });
  }

  const { rows, invalid, tooMany } = sanitizePush(body);
  if (tooMany) return Response.json({ error: 'too_many_rows', max: MAX_PUSH_ROWS }, { status: 413, headers });

  const { rejected, winners } = await pushChanges(userId, rows);
  return Response.json({ rejected, invalid, winners }, { headers });
}
