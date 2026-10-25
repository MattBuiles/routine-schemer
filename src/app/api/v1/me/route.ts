import { getMobileUser } from '@/lib/auth/mobile';

export async function GET(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401, headers: { 'cache-control': 'no-store' } });
  return Response.json(user, { headers: { 'cache-control': 'no-store' } });
}
