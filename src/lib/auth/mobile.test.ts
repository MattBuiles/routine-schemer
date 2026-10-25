import { getTableName } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Base de datos simulada: se comprueba QUÉ se lee y escribe, no cómo responde Postgres.
const st = vi.hoisted(() => ({
  selectRows: [] as Record<string, unknown>[],
  updateRows: [] as Record<string, unknown>[],
  executeRows: [] as Record<string, unknown>[],
  inserts: [] as { table: string; values: Record<string, unknown> }[],
  updates: [] as Record<string, unknown>[],
  deletes: [] as string[],
  executed: [] as unknown[],
}));

vi.mock('@/db/client', () => ({
  db: {
    select: () => ({ from: () => ({ where: async () => st.selectRows }) }),
    update: () => ({ set: (v: Record<string, unknown>) => (st.updates.push(v), { where: () => ({ returning: async () => st.updateRows }) }) }),
    insert: (t: Parameters<typeof getTableName>[0]) => ({ values: async (v: Record<string, unknown>) => void st.inserts.push({ table: getTableName(t), values: v }) }),
    delete: (t: Parameters<typeof getTableName>[0]) => ({ where: async () => void st.deletes.push(getTableName(t)) }),
    execute: async (q: unknown) => (st.executed.push(q), { rows: st.executeRows }),
  },
}));

import { CODE_TTL_MS, SESSION_TTL_MS, createAuthCode, exchangeCode, getMobileUser, getMobileUserId, revokeMobileSession } from './mobile';
import { challengeOf, hashToken, newCode, newToken } from './pkce';

const VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

beforeEach(() => {
  st.selectRows = []; st.updateRows = []; st.executeRows = [];
  st.inserts = []; st.updates = []; st.deletes = []; st.executed = [];
});

describe('createAuthCode', () => {
  it('guarda solo el hash del código, atado al challenge y al usuario, con caducidad corta', async () => {
    const before = Date.now();
    const code = await createAuthCode('user-1', challengeOf(VERIFIER));
    const [row] = st.inserts;
    expect(row.table).toBe('mobile_auth_codes');
    expect(row.values).toMatchObject({ codeHash: hashToken(code), codeChallenge: challengeOf(VERIFIER), userId: 'user-1' });
    expect(JSON.stringify(row.values)).not.toContain(code);
    const ttl = (row.values.expiresAt as Date).getTime() - before;
    expect(ttl).toBeGreaterThanOrEqual(CODE_TTL_MS - 1000);
    expect(ttl).toBeLessThanOrEqual(CODE_TTL_MS + 1000);
  });

  it('cada llamada da un código distinto', async () => {
    expect(await createAuthCode('u', challengeOf(VERIFIER))).not.toBe(await createAuthCode('u', challengeOf(VERIFIER)));
  });
});

describe('exchangeCode', () => {
  const row = { id: 'r1', userId: 'user-1', codeChallenge: challengeOf(VERIFIER) };

  it('con el código y el verifier correctos crea una sesión de 60 días y guarda solo su hash', async () => {
    st.selectRows = [row]; st.updateRows = [{ id: 'r1' }];
    const before = Date.now();
    const grant = await exchangeCode(newCode(), VERIFIER);
    expect(grant?.token).toMatch(/^gym_[A-Za-z0-9_-]{43}$/);
    const session = st.inserts.find((i) => i.table === 'mobile_sessions')!;
    expect(session.values).toMatchObject({ tokenHash: hashToken(grant!.token), userId: 'user-1' });
    expect(JSON.stringify(session.values)).not.toContain(grant!.token);
    const ttl = (session.values.expiresAt as Date).getTime() - before;
    expect(Math.abs(ttl - SESSION_TTL_MS)).toBeLessThan(1000);
    expect(grant!.expiresAt).toBe((session.values.expiresAt as Date).toISOString());
    expect(st.updates[0]).toHaveProperty('usedAt');
  });

  it('limpia códigos y sesiones caducados al canjear', async () => {
    st.selectRows = [row]; st.updateRows = [{ id: 'r1' }];
    await exchangeCode(newCode(), VERIFIER);
    expect(st.deletes.sort()).toEqual(['mobile_auth_codes', 'mobile_sessions']);
  });

  it('un verifier distinto no gasta el código ni crea sesión', async () => {
    st.selectRows = [row];
    expect(await exchangeCode(newCode(), `${VERIFIER.slice(1)}A`)).toBeNull();
    expect(st.updates).toEqual([]);
    expect(st.inserts).toEqual([]);
  });

  it('un código que no existe, caducó o ya se usó devuelve null', async () => {
    st.selectRows = [];
    expect(await exchangeCode(newCode(), VERIFIER)).toBeNull();
    expect(st.inserts).toEqual([]);
  });

  it('si otra petición lo gastó entre la lectura y la escritura, no se crea sesión', async () => {
    st.selectRows = [row]; st.updateRows = [];
    expect(await exchangeCode(newCode(), VERIFIER)).toBeNull();
    expect(st.inserts).toEqual([]);
    expect(st.deletes).toEqual([]);
  });
});

describe('getMobileUser', () => {
  const req = (authorization?: string) => new Request('https://x.test/api/v1/me', { headers: authorization ? { authorization } : {} });

  it('sin cabecera, con otro esquema o con un token mal formado no consulta la base de datos', async () => {
    const t = newToken();
    for (const h of [undefined, '', `Basic ${t}`, `bearer ${t}`, `Bearer ${t}x`, 'Bearer abc', `Bearer ${t} extra`, `Bearer`]) {
      expect(await getMobileUser(req(h))).toBeNull();
    }
    expect(st.executed).toEqual([]);
  });

  it('busca por el hash del token, nunca por el token', async () => {
    const t = newToken();
    st.executeRows = [{ id: 'user-1', email: 'a@b.c', name: 'A' }];
    expect(await getMobileUser(req(`Bearer ${t}`))).toEqual({ id: 'user-1', email: 'a@b.c', name: 'A' });
    const sent = JSON.stringify(st.executed[0]);
    expect(sent).toContain(hashToken(t));
    expect(sent).not.toContain(t);
  });

  it('un token caducado, revocado o de un usuario borrado no devuelve nada', async () => {
    st.executeRows = [];
    expect(await getMobileUser(req(`Bearer ${newToken()}`))).toBeNull();
    expect(await getMobileUserId(req(`Bearer ${newToken()}`))).toBeNull();
  });

  it('getMobileUserId devuelve solo el id', async () => {
    st.executeRows = [{ id: 'user-9', email: 'a@b.c', name: 'A' }];
    expect(await getMobileUserId(req(`Bearer ${newToken()}`))).toBe('user-9');
  });
});

describe('revokeMobileSession', () => {
  it('borra la sesión del token recibido y no hace nada sin token válido', async () => {
    await revokeMobileSession(new Request('https://x.test', { headers: { authorization: `Bearer ${newToken()}` } }));
    expect(st.deletes).toEqual(['mobile_sessions']);
    st.deletes = [];
    await revokeMobileSession(new Request('https://x.test', { headers: { authorization: 'Bearer nope' } }));
    await revokeMobileSession(new Request('https://x.test'));
    expect(st.deletes).toEqual([]);
  });
});
