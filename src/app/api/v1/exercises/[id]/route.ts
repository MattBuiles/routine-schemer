import { getMobileUserId } from '@/lib/auth/mobile';
import { isUuid } from '@/lib/board/sanitize';
import { sanitizeCustom } from '@/lib/exercises/custom';
import { deleteCustom, updateCustom } from '@/lib/exercises/custom-store';

const headers = { 'cache-control': 'no-store' };
type Ctx = { params: Promise<{ id: string }> };

/** Solo ejercicios propios: los de la biblioteca común dan 404. */
export async function PATCH(request: Request, { params }: Ctx) {
  const userId = await getMobileUserId(request);
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401, headers });
  const { id } = await params;
  const parsed = sanitizeCustom(await request.json().catch(() => null));
  if (!isUuid(id)) return Response.json({ error: 'not_found' }, { status: 404, headers });
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400, headers });
  const updated = await updateCustom(userId, id, parsed.value);
  return updated ? Response.json(updated, { headers }) : Response.json({ error: 'not_found' }, { status: 404, headers });
}

export async function DELETE(request: Request, { params }: Ctx) {
  const userId = await getMobileUserId(request);
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401, headers });
  const { id } = await params;
  if (!isUuid(id) || !(await deleteCustom(userId, id))) return Response.json({ error: 'not_found' }, { status: 404, headers });
  return new Response(null, { status: 204, headers });
}
