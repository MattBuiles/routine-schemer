import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMobileUserId = vi.hoisted(() => vi.fn());
const saveLastLog = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/mobile', () => ({ getMobileUserId }));
vi.mock('@/lib/board/lastLog-store', () => ({ saveLastLog }));

import { POST } from './route';

const ID = '00000000-0000-4000-8000-000000000001';
const post = (body: unknown) => POST(new Request('http://x/api/v1/plan/log', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) }));

beforeEach(() => {
  getMobileUserId.mockReset().mockResolvedValue('u1');
  saveLastLog.mockReset().mockResolvedValue(2);
});

describe('POST /api/v1/plan/log', () => {
  it('sin sesión da 401 y no escribe', async () => {
    getMobileUserId.mockResolvedValue(null);
    expect((await post({ exercises: [{ exerciseId: ID, summary: 'x' }] })).status).toBe(401);
    expect(saveLastLog).not.toHaveBeenCalled();
  });

  it('un cuerpo roto o sin ejercicios válidos da 400', async () => {
    expect((await post('{no')).status).toBe(400);
    expect((await post({ exercises: [{ exerciseId: 'x', summary: 'y' }] })).status).toBe(400);
    expect(saveLastLog).not.toHaveBeenCalled();
  });

  it('guarda con el dueño del token y datos normalizados', async () => {
    const res = await post({ userId: 'atacante', exercises: [{ exerciseId: ID, summary: '  82.5 kg × 8 ' }] });
    expect(await res.json()).toEqual({ updatedBlocks: 2 });
    expect(saveLastLog).toHaveBeenCalledWith('u1', [{ exerciseId: ID, summary: '82.5 kg × 8' }]);
  });
});
