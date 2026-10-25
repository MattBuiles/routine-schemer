import { getMobileUserId } from '@/lib/auth/mobile';
import { loadBoard } from '@/lib/board/load';
import { isIsoDate } from '@/lib/board/plan';
import { planToday } from '@/lib/board/today';

const headers = { 'cache-control': 'no-store' };

/** `?date=AAAA-MM-DD`: la fecha local del teléfono (el servidor no sabe en qué zona horaria está quien entrena). */
export async function GET(request: Request) {
  const userId = await getMobileUserId(request);
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401, headers });
  const date = new URL(request.url).searchParams.get('date');
  if (!isIsoDate(date)) return Response.json({ error: 'date debe ser AAAA-MM-DD' }, { status: 400, headers });
  return Response.json(planToday(await loadBoard(userId), date), { headers });
}
