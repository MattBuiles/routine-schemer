import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ calls: 0, orderBy: [] as unknown[][], rows: [] as Record<string, unknown>[] }));

vi.mock('@/db/client', () => ({
  db: {
    select: vi.fn(() => {
      state.calls += 1;
      // Cada consulta es una cadena simulada: la de listado pasa por limit() y la de recuento no.
      let listing = false;
      const chain: Record<string, unknown> = {};
      for (const method of ['from', 'where', 'offset']) chain[method] = () => chain;
      chain.orderBy = (...args: unknown[]) => {
        state.orderBy.push(args);
        return chain;
      };
      chain.limit = () => {
        listing = true;
        return chain;
      };
      chain.then = (resolve: (rows: unknown[]) => void) => resolve(listing ? state.rows : [{ total: state.rows.length }]);
      return chain;
    }),
  },
}));

const requireUserId = vi.hoisted(() => vi.fn(async () => 'user-1'));
vi.mock('@/lib/auth/session', () => ({ requireUserId }));

import { getExercise, searchExercises } from './exercises';

const row = { id: 'e1', userId: null, nameEn: 'Barbell Curl', nameEs: 'Curl con barra', category: 'strength', level: 'beginner', equipment: ['barbell'], primaryMuscles: ['biceps'], images: ['a.jpg', 'b.jpg'] };

beforeEach(() => {
  state.calls = 0;
  state.orderBy = [];
  state.rows = [];
  requireUserId.mockClear();
});

describe('searchExercises', () => {
  it('exige sesión y devuelve resúmenes con la primera imagen', async () => {
    state.rows = [row];
    const { items } = await searchExercises({ query: 'curl' });
    expect(requireUserId).toHaveBeenCalled();
    expect(items[0]).toEqual({ id: 'e1', nameEn: 'Barbell Curl', nameEs: 'Curl con barra', category: 'strength', level: 'beginner', equipment: ['barbell'], primaryMuscles: ['biceps'], image: 'a.jpg' });
  });

  it('con entrada basura no falla: usa la búsqueda por defecto', async () => {
    await expect(searchExercises({ query: 5, muscle: '; drop', limit: 'x' })).resolves.toEqual({ items: [], total: 0 });
  });

  it('sin texto solo ordena por nombre: un ORDER BY con constante lo rechaza Postgres', async () => {
    await searchExercises({ muscle: 'abductors' });
    expect(state.orderBy).toHaveLength(1);
    expect(state.orderBy[0]).toHaveLength(1);
  });

  it('con texto prioriza los que empiezan por él y luego ordena por nombre', async () => {
    await searchExercises({ query: 'curl' });
    expect(state.orderBy[0]).toHaveLength(2);
  });

  it('sin sesión no consulta', async () => {
    requireUserId.mockRejectedValueOnce(new Error('No autenticado'));
    await expect(searchExercises({})).rejects.toThrow('No autenticado');
    expect(state.calls).toBe(0);
  });
});

describe('getExercise', () => {
  it('un id que no es uuid devuelve null sin consultar la base', async () => {
    await expect(getExercise('no-uuid')).resolves.toBeNull();
    expect(state.calls).toBe(0);
  });
});
