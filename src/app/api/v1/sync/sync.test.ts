import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMobileUserId = vi.hoisted(() => vi.fn());
const pushChanges = vi.hoisted(() => vi.fn());
const pullChanges = vi.hoisted(() => vi.fn());
vi.mock('@/lib/auth/mobile', () => ({ getMobileUserId }));
vi.mock('@/lib/sync/store', () => ({ pushChanges, pullChanges }));

import { GET as pull } from './pull/route';
import { POST as push } from './push/route';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const set = (over: Record<string, unknown> = {}) => ({ id: id(3), updatedAt: Date.now(), workoutExerciseId: id(2), position: 0, kind: 'work', weightKg: 80, reps: 8, ...over });
const post = (body: unknown, headers: Record<string, string> = {}) =>
  push(new Request('https://x.test/api/v1/sync/push', { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body), headers }));
const get = (query = '') => pull(new Request(`https://x.test/api/v1/sync/pull${query}`));
const emptyChanges = { workouts: [], workoutExercises: [], sets: [] };

beforeEach(() => {
  getMobileUserId.mockReset().mockResolvedValue('user-1');
  pushChanges.mockReset().mockResolvedValue({ rejected: [], winners: emptyChanges });
  pullChanges.mockReset().mockResolvedValue({ cursor: 7, hasMore: false, changes: emptyChanges });
});

describe('POST /api/v1/sync/push', () => {
  it('sin sesión válida da 401 y no toca la base', async () => {
    getMobileUserId.mockResolvedValue(null);
    expect((await post({ sets: [set()] })).status).toBe(401);
    expect(pushChanges).not.toHaveBeenCalled();
  });

  it('guarda con el dueño del token aunque el cuerpo diga otro', async () => {
    const res = await post({ userId: 'atacante', sets: [{ ...set(), userId: 'atacante' }] });
    expect(res.status).toBe(200);
    expect(pushChanges).toHaveBeenCalledTimes(1);
    const [owner, rows] = pushChanges.mock.calls[0];
    expect(owner).toBe('user-1');
    expect(JSON.stringify(rows)).not.toContain('atacante');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('devuelve lo rechazado, lo inválido y las filas del servidor que eran más nuevas', async () => {
    pushChanges.mockResolvedValue({ rejected: [id(9)], winners: { ...emptyChanges, sets: [{ id: id(3) }] } });
    const res = await post({ sets: [set(), set({ id: 'mal' })] });
    expect(await res.json()).toMatchObject({ rejected: [id(9)], invalid: [{ table: 'sets', index: 1 }], winners: { sets: [{ id: id(3) }] } });
  });

  it('un JSON roto da 400 y un cuerpo demasiado grande 413, sin llegar a la base', async () => {
    expect((await post('{no es json')).status).toBe(400);
    expect((await post({ sets: [set()] }, { 'content-length': '5000000' })).status).toBe(413);
    expect((await post(`{"x":"${'a'.repeat(1_000_001)}"}`)).status).toBe(413);
    expect(pushChanges).not.toHaveBeenCalled();
  });

  it('más de 500 filas da 413 y no escribe nada', async () => {
    const res = await post({ sets: Array.from({ length: 501 }, (_, i) => set({ id: id(1000 + i) })) });
    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'too_many_rows', max: 500 });
    expect(pushChanges).not.toHaveBeenCalled();
  });

  it('con todas las filas inválidas responde bien y sin escribir filas', async () => {
    const res = await post({ sets: [set({ id: 'mal' })] });
    expect(res.status).toBe(200);
    expect(pushChanges.mock.calls[0][1]).toEqual(emptyChanges);
  });
});

describe('GET /api/v1/sync/pull', () => {
  it('sin sesión válida da 401', async () => {
    getMobileUserId.mockResolvedValue(null);
    expect((await get('?cursor=0')).status).toBe(401);
    expect(pullChanges).not.toHaveBeenCalled();
  });

  it('usa el cursor y el límite pedidos con el dueño del token, y por defecto 0 y 200', async () => {
    const res = await get('?cursor=12&limit=50');
    expect(await res.json()).toEqual({ cursor: 7, hasMore: false, changes: emptyChanges });
    expect(pullChanges).toHaveBeenLastCalledWith('user-1', 12, 50);
    await get();
    expect(pullChanges).toHaveBeenLastCalledWith('user-1', 0, 200);
  });

  it('rechaza cursores y límites mal formados o fuera de rango', async () => {
    for (const q of ['?cursor=-1', '?cursor=abc', '?cursor=1.5', '?cursor=9007199254740993', '?limit=0', '?limit=501', '?limit=x', '?limit=2.5']) {
      expect((await get(q)).status).toBe(400);
    }
    expect(pullChanges).not.toHaveBeenCalled();
  });
});
