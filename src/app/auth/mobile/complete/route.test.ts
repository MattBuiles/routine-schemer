import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSession = vi.hoisted(() => vi.fn());
const createAuthCode = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/server', () => ({ auth: { getSession } }));
vi.mock('@/lib/auth/mobile', () => ({ MOBILE_REDIRECT: 'gymapp://auth', createAuthCode }));

import { GET } from './route';

const STATE = 'estado-aleatorio-123';
const CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
const call = (query: string) => GET(new Request(`https://routine-schemer.vercel.app/auth/mobile/complete?${query}`));

beforeEach(() => {
  getSession.mockReset().mockResolvedValue({ data: { user: { id: 'user-1' } } });
  createAuthCode.mockReset().mockResolvedValue('CODIGO');
});

describe('GET /auth/mobile/complete', () => {
  it('con sesión crea el código y devuelve a la app con el código y el state', async () => {
    const res = await call(`state=${STATE}&challenge=${CHALLENGE}`);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(`gymapp://auth?code=CODIGO&state=${STATE}`);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(createAuthCode).toHaveBeenCalledWith('user-1', CHALLENGE);
  });

  it('sin sesión vuelve al inicio del flujo conservando state y challenge, sin crear código', async () => {
    getSession.mockResolvedValue({ data: null });
    const res = await call(`state=${STATE}&challenge=${CHALLENGE}`);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(`https://routine-schemer.vercel.app/auth/mobile?state=${STATE}&challenge=${CHALLENGE}`);
    expect(createAuthCode).not.toHaveBeenCalled();
  });

  it('rechaza state o challenge ausentes o con mala forma sin consultar la sesión', async () => {
    for (const q of ['', `state=${STATE}`, `challenge=${CHALLENGE}`, `state=corto&challenge=${CHALLENGE}`, `state=${STATE}&challenge=${CHALLENGE}x`, `state=${STATE}%0d%0a&challenge=${CHALLENGE}`]) {
      expect((await call(q)).status).toBe(400);
    }
    expect(getSession).not.toHaveBeenCalled();
    expect(createAuthCode).not.toHaveBeenCalled();
  });

  it('ningún parámetro puede cambiar el destino: el redirect del cliente se ignora', async () => {
    for (const evil of ['https://evil.example/', 'gymapp://auth.evil', '//evil.example', 'javascript:alert(1)']) {
      const res = await call(`state=${STATE}&challenge=${CHALLENGE}&redirect=${encodeURIComponent(evil)}&redirect_uri=${encodeURIComponent(evil)}&callbackURL=${encodeURIComponent(evil)}`);
      expect(res.headers.get('location')).toMatch(/^gymapp:\/\/auth\?code=CODIGO&state=/);
    }
  });
});
