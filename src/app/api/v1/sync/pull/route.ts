import { getMobileUserId } from '@/lib/auth/mobile';
import { pullChanges } from '@/lib/sync/store';

const headers = { 'cache-control': 'no-store' };

/** El teléfono pide lo que cambió desde su cursor (0 la primera vez). Si `hasMore` es true, vuelve a pedir con el cursor nuevo. */
export async function GET(request: Request) {
  const userId = await getMobileUserId(request);
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401, headers });

  const { searchParams } = new URL(request.url);
  const cursor = Number(searchParams.get('cursor') ?? 0);
  const limit = Number(searchParams.get('limit') ?? 200);
  if (!Number.isSafeInteger(cursor) || cursor < 0 || !Number.isInteger(limit) || limit < 1 || limit > 500) {
    return Response.json({ error: 'invalid_request' }, { status: 400, headers });
  }
  return Response.json(await pullChanges(userId, cursor, limit), { headers });
}
