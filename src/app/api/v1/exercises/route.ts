import { getMobileUserId } from '@/lib/auth/mobile';
import { sanitizeCustom } from '@/lib/exercises/custom';
import { createCustom } from '@/lib/exercises/custom-store';
import { runByIds, runSearch } from '@/lib/exercises/query';

const headers = { 'cache-control': 'no-store' };

/** `?q=texto&muscle&equipment&limit&offset`: la misma búsqueda que la web (biblioteca común más ejercicios propios). El filtrado de valores lo hace `sanitizeSearch`. */
export async function GET(request: Request) {
  const userId = await getMobileUserId(request);
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401, headers });
  const p = new URL(request.url).searchParams;
  // `?ids=a,b,c`: ejercicios concretos (la app lo usa para saber qué músculos trabaja cada uno).
  if (p.has('ids')) return Response.json({ items: await runByIds(userId, (p.get('ids') ?? '').split(',')) }, { headers });
  const num = (k: string) => (p.has(k) ? Number(p.get(k)) : undefined);
  const result = await runSearch(userId, { query: p.get('q'), muscle: p.get('muscle'), equipment: p.get('equipment'), limit: num('limit'), offset: num('offset') });
  return Response.json(result, { headers });
}

/** Crea un ejercicio propio: `{ name, primaryMuscles?, equipment?, notes? }`. */
export async function POST(request: Request) {
  const userId = await getMobileUserId(request);
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401, headers });
  const body = await request.json().catch(() => null);
  const parsed = sanitizeCustom(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400, headers });
  const created = await createCustom(userId, parsed.value);
  if (!created) return Response.json({ error: 'demasiados ejercicios propios' }, { status: 409, headers });
  return Response.json(created, { status: 201, headers });
}
