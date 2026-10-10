import { getTableName } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Base de datos y sesión simuladas: se comprueba QUÉ se escribe, no cómo responde Postgres.
const state = vi.hoisted(() => ({
  boardValues: [] as Record<string, unknown>[],
  blockValues: [] as Record<string, unknown>[][],
  typeValues: [] as Record<string, unknown>[],
  batches: 0,
}));

vi.mock('@/db/client', () => {
  const insert = vi.fn((table: Parameters<typeof getTableName>[0]) => ({
    values: vi.fn((values: Record<string, unknown> | Record<string, unknown>[]) => {
      const name = getTableName(table);
      if (name === 'boards') state.boardValues.push(values as Record<string, unknown>);
      if (name === 'block_types') state.typeValues.push(values as Record<string, unknown>);
      if (name === 'board_blocks') state.blockValues.push(values as Record<string, unknown>[]);
      const rows = name === 'boards' ? [{ id: 'board-1' }] : [{ id: 't1', name: (values as { name?: string }).name, color: (values as { color?: string }).color }];
      return {
        onConflictDoUpdate: () => ({ returning: async () => rows }),
        returning: async () => rows,
      };
    }),
  }));
  return {
    db: {
      insert,
      delete: vi.fn(() => ({ where: vi.fn(() => ({ __delete: true })) })),
      batch: vi.fn(async () => {
        state.batches += 1;
      }),
    },
  };
});

vi.mock('@/lib/auth/session', () => ({ requireUserId: vi.fn(async () => 'user-1') }));

import { createBlockType, saveCycle } from './board';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const block = (n: number, over: Record<string, unknown> = {}) => ({
  id: id(n), label: 'Push', color: '#112233', blockType: 'strength', dayStart: n - 1, daySpan: 1, lane: 0, load: 3, focus: ['Pecho'], notes: '', durationMinutes: 60, icon: 'dumbbell', ...over,
});
const as = <T>(value: object) => value as unknown as T;

beforeEach(() => {
  state.boardValues = [];
  state.blockValues = [];
  state.typeValues = [];
  state.batches = 0;
});

describe('saveCycle', () => {
  it('toma el userId de la sesión y descarta userId/boardId del cliente', async () => {
    await saveCycle(as({ cycleDays: 7, blocks: [{ ...block(1), userId: 'atacante', boardId: 'ajeno', kind: 'widget' }] }));
    expect(state.boardValues[0]).toEqual({ userId: 'user-1', cycleDays: 7 });
    const [row] = state.blockValues[0];
    expect(row).toMatchObject({ userId: 'user-1', boardId: 'board-1', kind: 'cycle' });
  });

  it('normaliza la entrada: rangos, ids inválidos y solapes', async () => {
    await saveCycle(as({ cycleDays: 500, blocks: [block(1, { load: 99 }), block(2, { id: 'no-uuid' }), block(3, { dayStart: 0 })] }));
    expect(state.boardValues[0]).toMatchObject({ cycleDays: 28 });
    const rows = state.blockValues[0];
    expect(rows.map((r) => r.id)).toEqual([id(1), id(3)]);
    expect(rows[0].load).toBe(5);
    expect(rows[0].lane).not.toBe(rows[1].lane);
  });

  it('sin bloques solo borra y no inserta filas vacías', async () => {
    await saveCycle({ cycleDays: 7, blocks: [] });
    expect(state.blockValues).toEqual([]);
    expect(state.batches).toBe(0);
  });

  it('borra y reinserta en un único batch atómico', async () => {
    await saveCycle({ cycleDays: 7, blocks: [block(1)] });
    expect(state.batches).toBe(1);
  });
});

describe('createBlockType', () => {
  it('fuerza el userId, recorta el nombre y sustituye colores inválidos', async () => {
    await createBlockType(as({ name: ` ${'x'.repeat(100)} `, color: 'javascript:alert(1)', userId: 'atacante' }));
    expect(state.typeValues[0]).toMatchObject({ userId: 'user-1', color: '#3b82f6' });
    expect(String(state.typeValues[0].name)).toHaveLength(40);
  });

  it('rechaza nombres vacíos', async () => {
    await expect(createBlockType({ name: '   ', color: '#112233' })).rejects.toThrow();
  });
});
