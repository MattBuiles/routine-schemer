import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMobileUserId = vi.hoisted(() => vi.fn());
const updateCustom = vi.hoisted(() => vi.fn());
const deleteCustom = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/mobile', () => ({ getMobileUserId }));
vi.mock('@/lib/exercises/custom-store', () => ({ updateCustom, deleteCustom }));

import { DELETE, PATCH } from './route';

const ID = '00000000-0000-4000-8000-000000000001';
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const patch = (id: string, body: unknown) => PATCH(new Request('http://x', { method: 'PATCH', body: JSON.stringify(body) }), ctx(id));
const del = (id: string) => DELETE(new Request('http://x', { method: 'DELETE' }), ctx(id));

beforeEach(() => {
  getMobileUserId.mockReset().mockResolvedValue('u1');
  updateCustom.mockReset().mockResolvedValue({ id: ID });
  deleteCustom.mockReset().mockResolvedValue(true);
});

describe('/api/v1/exercises/[id]', () => {
  it('sin sesión da 401', async () => {
    getMobileUserId.mockResolvedValue(null);
    expect((await patch(ID, { name: 'X' })).status).toBe(401);
    expect((await del(ID)).status).toBe(401);
    expect(updateCustom).not.toHaveBeenCalled();
    expect(deleteCustom).not.toHaveBeenCalled();
  });

  it('un id que no es uuid da 404 sin tocar la base', async () => {
    expect((await patch('mal', { name: 'X' })).status).toBe(404);
    expect((await del('mal')).status).toBe(404);
    expect(updateCustom).not.toHaveBeenCalled();
    expect(deleteCustom).not.toHaveBeenCalled();
  });

  it('edita y borra con el dueño del token; lo que no es suyo da 404', async () => {
    expect((await patch(ID, { name: 'Nuevo' })).status).toBe(200);
    expect(updateCustom).toHaveBeenCalledWith('u1', ID, expect.objectContaining({ name: 'Nuevo' }));
    expect((await del(ID)).status).toBe(204);
    updateCustom.mockResolvedValue(null);
    deleteCustom.mockResolvedValue(false);
    expect((await patch(ID, { name: 'X' })).status).toBe(404);
    expect((await del(ID)).status).toBe(404);
    expect((await patch(ID, {})).status).toBe(400);
  });
});
