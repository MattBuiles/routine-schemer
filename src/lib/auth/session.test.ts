import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSession = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/server', () => ({ auth: { getSession } }));

import { requireUserId } from './session';

beforeEach(() => getSession.mockReset());

describe('requireUserId', () => {
  it('devuelve el id del usuario de la sesión', async () => {
    getSession.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    await expect(requireUserId()).resolves.toBe('user-1');
  });

  it('falla sin sesión', async () => {
    getSession.mockResolvedValue({ data: null });
    await expect(requireUserId()).rejects.toThrow('No autenticado');
  });

  it('falla si la sesión no trae usuario', async () => {
    getSession.mockResolvedValue({ data: { user: null } });
    await expect(requireUserId()).rejects.toThrow('No autenticado');
  });
});
