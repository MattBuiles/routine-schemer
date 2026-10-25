import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMobileUser = vi.hoisted(() => vi.fn());
const revokeMobileSession = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/mobile', () => ({ getMobileUser, revokeMobileSession }));

import { POST as logout } from '../auth/logout/route';
import { GET as me } from './route';

const req = () => new Request('https://x.test/api/v1/me', { headers: { authorization: 'Bearer gym_x' } });

beforeEach(() => {
  getMobileUser.mockReset();
  revokeMobileSession.mockReset();
});

describe('GET /api/v1/me', () => {
  it('devuelve el usuario del token', async () => {
    getMobileUser.mockResolvedValue({ id: 'user-1', email: 'a@b.c', name: 'A' });
    const res = await me(req());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 'user-1', email: 'a@b.c', name: 'A' });
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('sin sesión válida da 401 sin datos', async () => {
    getMobileUser.mockResolvedValue(null);
    const res = await me(req());
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('revoca la sesión de este dispositivo y responde 204', async () => {
    const res = await logout(req());
    expect(res.status).toBe(204);
    expect(revokeMobileSession).toHaveBeenCalledTimes(1);
  });
});
