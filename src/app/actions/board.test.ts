import { getTableName } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Base de datos y sesión simuladas: se comprueba QUÉ se escribe, no cómo responde Postgres.
const state = vi.hoisted(() => ({
  boardValues: [] as Record<string, unknown>[],
  blockValues: [] as Record<string, unknown>[][],
  typeValues: [] as Record<string, unknown>[],
  cycleValues: [] as Record<string, unknown>[][],
  batches: 0,
}));

vi.mock('@/db/client', () => {
  const insert = vi.fn((table: Parameters<typeof getTableName>[0]) => ({
    values: vi.fn((values: Record<string, unknown> | Record<string, unknown>[]) => {
      const name = getTableName(table);
      if (name === 'boards') state.boardValues.push(values as Record<string, unknown>);
      if (name === 'block_types') state.typeValues.push(values as Record<string, unknown>);
      if (name === 'board_cycles') state.cycleValues.push(values as Record<string, unknown>[]);
      if (name === 'board_blocks' || name === 'board_phases') state.blockValues.push(values as Record<string, unknown>[]);
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

import { createBlockType, savePhases, saveCycles, saveWidgets } from './board';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const cycle = (n: number, over: Record<string, unknown> = {}) => ({ id: id(900 + n), name: 'Gimnasio', days: 7, ...over });
const block = (n: number, over: Record<string, unknown> = {}) => ({
  id: id(n), cycleId: id(901), label: 'Push', color: '#112233', blockType: 'strength', dayStart: n - 1, daySpan: 1, lane: 0, zones: ['Pecho'], notes: '', icon: 'dumbbell', exercises: [], ...over,
});
const as = <T>(value: object) => value as unknown as T;

beforeEach(() => {
  state.boardValues = [];
  state.blockValues = [];
  state.typeValues = [];
  state.cycleValues = [];
  state.batches = 0;
});

describe('saveCycles', () => {
  it('toma el userId de la sesión y descarta userId/boardId/kind del cliente', async () => {
    await saveCycles(as({ cycles: [cycle(1)], blocks: [{ ...block(1), userId: 'atacante', boardId: 'ajeno', kind: 'widget' }] }));
    expect(state.boardValues[0]).toEqual({ userId: 'user-1', cycleDays: 7 });
    const [row] = state.blockValues[0];
    expect(row).toMatchObject({ userId: 'user-1', boardId: 'board-1', kind: 'cycle', cycleId: id(901) });
    expect(state.cycleValues[0][0]).toMatchObject({ userId: 'user-1', boardId: 'board-1', name: 'Gimnasio', days: 7, position: 0 });
  });

  it('guarda varios ciclos en orden, cada bloque en el suyo y cada ciclo con su duración', async () => {
    await saveCycles(as({
      cycles: [cycle(1), cycle(2, { name: ' Cardio ', days: 5 })],
      blocks: [block(1), block(2, { cycleId: id(902), dayStart: 4 })],
    }));
    expect(state.cycleValues[0].map((c) => [c.id, c.name, c.days, c.position])).toEqual([[id(901), 'Gimnasio', 7, 0], [id(902), 'Cardio', 5, 1]]);
    expect(state.blockValues[0].map((r) => [r.id, r.cycleId, r.dayStart])).toEqual([[id(1), id(901), 0], [id(2), id(902), 4]]);
  });

  it('normaliza la entrada: rangos, ids inválidos, solapes y bloques de un ciclo inexistente', async () => {
    await saveCycles(as({
      cycles: [cycle(1, { days: 500, name: 'x'.repeat(200) }), cycle(2, { id: 'no-uuid' })],
      blocks: [block(1, { load: 99 }), block(2, { id: 'no-uuid' }), block(3, { dayStart: 0 }), block(4, { cycleId: id(950) })],
    }));
    expect(state.boardValues[0]).toMatchObject({ cycleDays: 28 });
    expect(state.cycleValues[0]).toHaveLength(1);
    expect(state.cycleValues[0][0]).toMatchObject({ days: 28 });
    expect((state.cycleValues[0][0].name as string).length).toBe(40);
    const rows = state.blockValues[0];
    expect(rows.map((r) => r.id)).toEqual([id(1), id(3)]);
    expect(rows[0]).not.toHaveProperty('load');
    expect(rows[0].lane).not.toBe(rows[1].lane);
  });

  it('un id de bloque repetido en dos ciclos solo se guarda una vez y se limita a 5 ciclos', async () => {
    const cycles = Array.from({ length: 8 }, (_, i) => cycle(i + 1));
    await saveCycles(as({ cycles, blocks: [block(1), block(1, { cycleId: id(902) })] }));
    expect(state.cycleValues[0]).toHaveLength(5);
    expect(state.blockValues[0].map((r) => [r.id, r.cycleId])).toEqual([[id(1), id(901)]]);
  });

  it('sin ciclos válidos crea uno por defecto vacío en vez de borrar el tablero a ciegas', async () => {
    await saveCycles(as({ cycles: 'basura', blocks: [block(1)] }));
    expect(state.cycleValues[0]).toHaveLength(1);
    expect(state.cycleValues[0][0]).toMatchObject({ name: 'Gimnasio', days: 7, position: 0 });
    expect(state.blockValues).toEqual([]);
  });

  it('sin bloques borra los antiguos y guarda solo los ciclos, en un único batch atómico', async () => {
    await saveCycles({ cycles: [cycle(1)] as never, blocks: [] });
    expect(state.blockValues).toEqual([]);
    expect(state.cycleValues).toHaveLength(1);
    expect(state.batches).toBe(1);
  });

  it('con bloques borra y reinserta todo en un único batch atómico', async () => {
    await saveCycles(as({ cycles: [cycle(1)], blocks: [block(1)] }));
    expect(state.batches).toBe(1);
  });

  it('una entrada que no es un objeto no rompe', async () => {
    await saveCycles(null as never);
    expect(state.cycleValues[0]).toHaveLength(1);
  });
});

describe('saveWidgets', () => {
  const widget = (n: number, over: Record<string, unknown> = {}) => ({ id: id(n), type: 'habits', x: 0, y: 0, w: 320, h: 400, ...over });

  it('toma el userId de la sesión y descarta userId/boardId/kind del cliente', async () => {
    await saveWidgets(as([{ ...widget(1), userId: 'atacante', boardId: 'ajeno', kind: 'cycle' }]));
    expect(state.boardValues[0]).toMatchObject({ userId: 'user-1' });
    const [row] = state.blockValues[0];
    expect(row).toMatchObject({ userId: 'user-1', boardId: 'board-1', kind: 'widget', widgetType: 'habits' });
  });

  it('normaliza: un widget por tipo, tipos válidos y tamaños acotados', async () => {
    await saveWidgets(as([widget(1), widget(2), widget(3, { type: 'historial' }), widget(4, { type: 'notes', w: 99999 })]));
    const rows = state.blockValues[0];
    expect(rows.map((r) => r.widgetType)).toEqual(['habits', 'notes']);
    expect(rows[1].w).toBe(800);
  });

  it('sin widgets solo borra y no inserta filas vacías', async () => {
    await saveWidgets([]);
    expect(state.blockValues).toEqual([]);
    expect(state.batches).toBe(0);
  });
});

describe('savePhases', () => {
  const phase = (n: number, over: Record<string, unknown> = {}) => ({ id: id(n), name: 'Bloque A', kind: 'volume', startWeek: (n - 1) * 4, weeks: 4, color: '#112233', volumePct: 10, intensityPct: -5, rampSets: 1, rampLoad: 0, deloadLast: true, ...over });

  it('toma el userId de la sesión y descarta userId/boardId del cliente', async () => {
    await savePhases(as({ phases: [{ ...phase(1), userId: 'atacante', boardId: 'ajeno' }], planStart: null }));
    expect(state.boardValues[0]).toMatchObject({ userId: 'user-1' });
    const [row] = state.blockValues[0];
    expect(row).toMatchObject({ userId: 'user-1', boardId: 'board-1', kind: 'volume', weeks: 4 });
  });

  it('normaliza: rangos, ids inválidos y solapes', async () => {
    await savePhases(as({ phases: [phase(1, { weeks: 999 }), phase(2, { id: 'no-uuid' }), phase(3, { startWeek: 0, volumePct: 9999 })], planStart: null, planWeeks: 52 }));
    const rows = state.blockValues[0];
    expect(rows.map((r) => r.id)).toEqual([id(1)]);
    expect(rows[0].weeks).toBe(52);
  });

  it('guarda la fecha de inicio si es válida y la descarta si no lo es', async () => {
    await savePhases({ phases: [], planStart: '2026-10-12', planWeeks: 12 });
    expect(state.boardValues[0]).toMatchObject({ userId: 'user-1', planStart: '2026-10-12' });
    for (const bad of ['2026-02-30', '12/10/2026', 'mañana', 20261012, null, undefined]) {
      state.boardValues = [];
      await savePhases(as({ phases: [], planStart: bad, planWeeks: 12 }));
      expect(state.boardValues[0]).toMatchObject({ planStart: null });
    }
  });

  it('una entrada que no es un objeto no rompe ni guarda nada raro', async () => {
    await savePhases(null as never);
    expect(state.boardValues[0]).toMatchObject({ planStart: null });
    expect(state.blockValues).toEqual([]);
  });

  it('sin fases solo borra y no inserta filas vacías', async () => {
    await savePhases({ phases: [], planStart: null, planWeeks: 12 });
    expect(state.blockValues).toEqual([]);
    expect(state.batches).toBe(0);
  });

  it('guarda la duración del plan limitada a 1–52 y usa 12 si no es un número', async () => {
    for (const [sent, saved] of [[26, 26], [999, 52], [0, 1], [-5, 1], [7.6, 8], ['x', 12], [null, 12], [undefined, 12]] as const) {
      state.boardValues = [];
      await savePhases(as({ phases: [], planStart: null, planWeeks: sent }));
      expect(state.boardValues[0]).toMatchObject({ planWeeks: saved });
    }
  });

  it('recorta las fases a la duración del plan y descarta las que empiezan fuera', async () => {
    await savePhases(as({ phases: [phase(1, { startWeek: 0, weeks: 4 }), phase(2, { startWeek: 4, weeks: 4 }), phase(3, { startWeek: 8, weeks: 4 })], planStart: null, planWeeks: 6 }));
    const rows = state.blockValues[0];
    expect(rows.map((r) => [r.id, r.startWeek, r.weeks])).toEqual([[id(1), 0, 4], [id(2), 4, 2]]);
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
