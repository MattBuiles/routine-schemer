import { getMobileUserId } from '@/lib/auth/mobile';
import { runSearch } from '@/lib/exercises/query';

const headers = { 'cache-control': 'no-store' };

/** `?q=texto&muscle&equipment&limit&offset`: la misma búsqueda que la web (biblioteca común más ejercicios propios). El filtrado de valores lo hace `sanitizeSearch`. */
export async function GET(request: Request) {
  const userId = await getMobileUserId(request);
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401, headers });
  const p = new URL(request.url).searchParams;
  const num = (k: string) => (p.has(k) ? Number(p.get(k)) : undefined);
  const result = await runSearch(userId, { query: p.get('q'), muscle: p.get('muscle'), equipment: p.get('equipment'), limit: num('limit'), offset: num('offset') });
  return Response.json(result, { headers });
}
