import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMobileUserId = vi.fn();
const runSearch = vi.fn();
vi.mock('@/lib/auth/mobile', () => ({ getMobileUserId: (r: Request) => getMobileUserId(r) }));
vi.mock('@/lib/exercises/query', () => ({ runSearch: (...a: unknown[]) => runSearch(...a) }));

import { GET } from './route';

beforeEach(() => {
  getMobileUserId.mockReset();
  runSearch.mockReset().mockResolvedValue({ items: [], total: 0 });
});

describe('GET /api/v1/exercises', () => {
  it('sin sesión de la app da 401 y no busca', async () => {
    getMobileUserId.mockResolvedValue(null);
    expect((await GET(new Request('http://x/api/v1/exercises?q=press'))).status).toBe(401);
    expect(runSearch).not.toHaveBeenCalled();
  });

  it('busca con el usuario del token y pasa los filtros tal cual para que los normalice sanitizeSearch', async () => {
    getMobileUserId.mockResolvedValue('u1');
    const res = await GET(new Request('http://x/api/v1/exercises?q=press&muscle=chest&limit=5'));
    expect(res.status).toBe(200);
    expect(runSearch).toHaveBeenCalledWith('u1', { query: 'press', muscle: 'chest', equipment: null, limit: 5, offset: undefined });
  });
});

const createCustom = vi.hoisted(() => vi.fn());
vi.mock('@/lib/exercises/custom-store', () => ({ createCustom: (...a: unknown[]) => createCustom(...a), updateCustom: vi.fn(), deleteCustom: vi.fn() }));

import { POST } from './route';

const post = (body: unknown) => POST(new Request('http://x/api/v1/exercises', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body) }));

describe('POST /api/v1/exercises', () => {
  beforeEach(() => createCustom.mockReset().mockResolvedValue({ id: 'e1' }));

  it('sin sesión da 401 y no crea', async () => {
    getMobileUserId.mockResolvedValue(null);
    expect((await post({ name: 'X' })).status).toBe(401);
    expect(createCustom).not.toHaveBeenCalled();
  });

  it('crea con el dueño del token y datos normalizados (201)', async () => {
    getMobileUserId.mockResolvedValue('u1');
    const res = await post({ name: ' Press landmine ', primaryMuscles: ['chest', 'jetpack'], userId: 'atacante' });
    expect(res.status).toBe(201);
    expect(createCustom).toHaveBeenCalledWith('u1', { name: 'Press landmine', primaryMuscles: ['chest'], equipment: [], notes: '' });
  });

  it('un cuerpo inválido o roto da 400 y el tope de ejercicios propios 409', async () => {
    getMobileUserId.mockResolvedValue('u1');
    expect((await post({})).status).toBe(400);
    expect((await post('{no')).status).toBe(400);
    createCustom.mockResolvedValue(null);
    expect((await post({ name: 'X' })).status).toBe(409);
  });
});
