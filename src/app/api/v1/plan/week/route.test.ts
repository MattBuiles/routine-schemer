import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMobileUserId = vi.hoisted(() => vi.fn());
const loadBoard = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/mobile', () => ({ getMobileUserId }));
vi.mock('@/lib/board/load', () => ({ loadBoard }));

import { GET } from './route';

const get = (q = '') => GET(new Request(`http://x/api/v1/plan/week${q}`));

beforeEach(() => {
  getMobileUserId.mockReset().mockResolvedValue('u1');
  loadBoard.mockReset().mockResolvedValue({ planStart: null, planWeeks: 12, phases: [], cycles: [], blocks: [] });
});

describe('GET /api/v1/plan/week', () => {
  it('sin sesión da 401 y no lee el tablero', async () => {
    getMobileUserId.mockResolvedValue(null);
    expect((await get('?date=2026-10-25')).status).toBe(401);
    expect(loadBoard).not.toHaveBeenCalled();
  });

  it('una fecha ausente o inválida da 400', async () => {
    expect((await get()).status).toBe(400);
    expect((await get('?date=2026-02-30')).status).toBe(400);
    expect(loadBoard).not.toHaveBeenCalled();
  });

  it('lee el tablero del dueño del token y devuelve la semana', async () => {
    const res = await get('?date=2026-10-25');
    expect(loadBoard).toHaveBeenCalledWith('u1');
    expect(await res.json()).toEqual({ status: 'no-plan', weekStart: '2026-10-19', exercises: [] });
  });
});
