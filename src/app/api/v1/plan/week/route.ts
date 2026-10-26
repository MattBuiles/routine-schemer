import { getMobileUserId } from '@/lib/auth/mobile';
import { loadBoard } from '@/lib/board/load';
import { isIsoDate } from '@/lib/board/plan';
import { planWeek } from '@/lib/board/today';

const headers = { 'cache-control': 'no-store' };

/** `?date=AAAA-MM-DD` (fecha local del teléfono): lo que el plan pide en esa semana, de lunes a domingo. */
export async function GET(request: Request) {
  const userId = await getMobileUserId(request);
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401, headers });
  const date = new URL(request.url).searchParams.get('date');
  if (!isIsoDate(date)) return Response.json({ error: 'date debe ser AAAA-MM-DD' }, { status: 400, headers });
  return Response.json(planWeek(await loadBoard(userId), date), { headers });
}
