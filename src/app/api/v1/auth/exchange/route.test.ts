import { beforeEach, describe, expect, it, vi } from 'vitest';

const exchangeCode = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/mobile', () => ({ exchangeCode }));

import { POST } from './route';

const CODE = 'A'.repeat(43);
const VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const post = (body: unknown, raw = false) =>
  POST(new Request('https://x.test/api/v1/auth/exchange', { method: 'POST', body: raw ? (body as string) : JSON.stringify(body), headers: { 'content-type': 'application/json' } }));

beforeEach(() => exchangeCode.mockReset());

describe('POST /api/v1/auth/exchange', () => {
  it('canjea el código y devuelve el token sin permitir la caché', async () => {
    exchangeCode.mockResolvedValue({ token: 'gym_x', expiresAt: '2026-12-24T00:00:00.000Z' });
    const res = await post({ code: CODE, verifier: VERIFIER });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ token: 'gym_x', expiresAt: '2026-12-24T00:00:00.000Z' });
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(exchangeCode).toHaveBeenCalledWith(CODE, VERIFIER);
  });

  it('un código inválido, caducado o ya usado da invalid_grant sin detalles', async () => {
    exchangeCode.mockResolvedValue(null);
    const res = await post({ code: CODE, verifier: VERIFIER });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_grant' });
  });

  it('una petición mal formada da invalid_request y no llega a la base de datos', async () => {
    const bad: unknown[] = [null, [], 'texto', {}, { code: CODE }, { verifier: VERIFIER }, { code: 1, verifier: VERIFIER }, { code: CODE, verifier: {} },
      { code: 'corto', verifier: VERIFIER }, { code: CODE, verifier: 'corto' }, { code: `${CODE}'; drop table x;--`, verifier: VERIFIER }];
    for (const b of bad) {
      const res = await post(b);
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: 'invalid_request' });
    }
    expect((await post('{no es json', true)).status).toBe(400);
    expect(exchangeCode).not.toHaveBeenCalled();
  });
});
