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
