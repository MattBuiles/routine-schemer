import { describe, expect, it } from 'vitest';

import {
  DAY_W,
  HEADER_H,
  LANE_H,
  MAX_LANES,
  CYCLE_FOOT_H,
  CYCLE_GAP,
  blocksBeyond,
  compactLanes,
  cycleHeight,
  cycleRows,
  cycleTops,
  findFreeSlot,
  fromRect,
  stackBlocks,
  blockFromType,
  cellAt,
  resolveTypes,
  defaultIconFor,
  DEFAULT_BLOCK_TYPES,
  resizeCycle,
  toRect,
  type CycleBlock,
} from './cycle';

const block = (over: Partial<CycleBlock> = {}): CycleBlock => ({
  zones: [],
  notes: '',
  icon: 'dumbbell',
  exercises: [],
  id: 'a',
  cycleId: 'c1',
  label: 'Push',
  color: '#000',
  blockType: 'strength',
  dayStart: 0,
  daySpan: 1,
  lane: 0,
  ...over,
});

describe('geometría del ciclo', () => {
  it('toRect y fromRect son inversas', () => {
    const b = block({ dayStart: 2, daySpan: 3, lane: 1 });
    expect(fromRect(toRect(b), 7)).toEqual({ dayStart: 2, daySpan: 3, lane: 1 });
  });

  it('todos los bloques miden lo mismo de alto', () => {
    expect(toRect(block({ lane: 0 })).h).toBe(LANE_H);
    expect(toRect(block({ lane: 3, daySpan: 2 })).h).toBe(LANE_H);
  });

  it('fromRect ajusta a columnas, limita al ciclo y deja la fila fraccionaria', () => {
    expect(fromRect({ x: DAY_W * 0.6, y: HEADER_H, w: DAY_W * 1.4, h: 60 }, 7)).toMatchObject({ dayStart: 1, daySpan: 1 });
    expect(fromRect({ x: DAY_W * 9, y: HEADER_H, w: DAY_W * 3, h: 60 }, 7)).toMatchObject({ dayStart: 4, daySpan: 3 });
    expect(fromRect({ x: 0, y: HEADER_H + LANE_H * 99, w: DAY_W, h: 60 }, 7)).toMatchObject({ lane: MAX_LANES });
    expect(fromRect({ x: -500, y: -500, w: 1, h: 1 }, 7)).toMatchObject({ dayStart: 0, daySpan: 1, lane: 0 });
    expect(fromRect({ x: 0, y: HEADER_H + LANE_H * 1.5, w: DAY_W, h: LANE_H }, 7).lane).toBe(1.5);
  });
});

describe('compactLanes', () => {
  it('quita los huecos: un bloque suelto sube a la fila 0', () => {
    expect(compactLanes([block({ lane: 3 })])[0].lane).toBe(0);
  });

  it('apila como una cola los bloques que comparten día', () => {
    const r = compactLanes([block({ id: 'a', lane: 0 }), block({ id: 'b', lane: 2 }), block({ id: 'c', lane: 5 })]);
    expect(r.map((b) => b.lane)).toEqual([0, 1, 2]);
  });

  it('los días distintos no se apilan entre sí', () => {
    const r = compactLanes([block({ id: 'a', dayStart: 0, lane: 4 }), block({ id: 'b', dayStart: 1, lane: 2 })]);
    expect(r.map((b) => b.lane)).toEqual([0, 0]);
  });

  it('un bloque ancho empuja a los de los días que cruza', () => {
    const r = compactLanes([block({ id: 'wide', daySpan: 2, lane: 0 }), block({ id: 'b', dayStart: 1, lane: 0 })]);
    expect(r.find((b) => b.id === 'b')?.lane).toBe(1);
  });

  it('conserva el orden de la lista y no modifica la entrada', () => {
    const input = [block({ id: 'a', lane: 5 }), block({ id: 'b', lane: 1 })];
    const r = compactLanes(input);
    expect(r.map((b) => b.id)).toEqual(['a', 'b']);
    expect(input[0].lane).toBe(5);
  });
});

describe('stackBlocks', () => {
  it('añade un bloque nuevo al final de la pila de su día', () => {
    const r = stackBlocks([block({ id: 'x' })], block({ id: 'y', lane: 4 }));
    expect(r?.map((b) => [b.id, b.lane])).toEqual([['x', 0], ['y', 1]]);
  });

  it('una fila fraccionaria inserta el bloque antes del que ocupa esa fila', () => {
    const base = [block({ id: 'a', lane: 0 }), block({ id: 'b', lane: 1 })];
    const r = stackBlocks(base, block({ id: 'n', lane: 0.5 }));
    expect(r?.map((b) => [b.id, b.lane])).toEqual([['a', 0], ['b', 2], ['n', 1]]);
  });

  it('mover un bloque hacia abajo lo coloca tras el siguiente', () => {
    const base = [block({ id: 'a', lane: 0 }), block({ id: 'b', lane: 1 })];
    const r = stackBlocks(base, { ...base[0], lane: 1.01 });
    expect(r?.map((b) => [b.id, b.lane])).toEqual([['a', 1], ['b', 0]]);
  });

  it('devuelve null si algún día supera MAX_LANES bloques', () => {
    const full = Array.from({ length: MAX_LANES }, (_, i) => block({ id: `x${i}`, lane: i }));
    expect(stackBlocks(full, block({ id: 'nuevo' }))).toBeNull();
    expect(stackBlocks(full.slice(1), block({ id: 'nuevo' }))).not.toBeNull();
  });

  it('recolocar el propio bloque lo reemplaza sin duplicarlo', () => {
    const self = block();
    expect(stackBlocks([self], self)).toEqual([self]);
  });
});

describe('findFreeSlot', () => {
  it('encuentra el primer día libre y respeta los bloques existentes', () => {
    expect(findFreeSlot([], 7, 1, 'c1')).toEqual({ dayStart: 0, lane: 0 });
    expect(findFreeSlot([block({ dayStart: 0 })], 7, 1, 'c1')).toEqual({ dayStart: 1, lane: 0 });
  });

  it('usa otro carril cuando la fila está llena', () => {
    const row = Array.from({ length: 3 }, (_, i) => block({ id: `x${i}`, dayStart: i }));
    expect(findFreeSlot(row, 3, 1, 'c1')).toEqual({ dayStart: 0, lane: 1 });
  });

  it('devuelve null si no cabe', () => {
    const all = Array.from({ length: MAX_LANES }, (_, i) => block({ id: `x${i}`, lane: i }));
    expect(findFreeSlot(all, 1, 1, 'c1')).toBeNull();
  });
});

describe('resizeCycle', () => {
  const blocks = [
    block({ id: 'in', dayStart: 0, daySpan: 2 }),
    block({ id: 'cross', dayStart: 3, daySpan: 3 }),
    block({ id: 'out', dayStart: 6 }),
  ];

  it('elimina los que empiezan fuera y recorta los que cruzan', () => {
    const r = resizeCycle(blocks, 5);
    expect(r.blocks.map((b) => b.id)).toEqual(['in', 'cross']);
    expect(r.blocks[1].daySpan).toBe(2);
  });

  it('blocksBeyond avisa de lo afectado', () => {
    expect(blocksBeyond(blocks, 5).map((b) => b.id)).toEqual(['cross', 'out']);
    expect(blocksBeyond(blocks, 9)).toEqual([]);
  });

  it('limita la duración a 1–28 días y crecer no toca nada', () => {
    expect(resizeCycle(blocks, 0).cycleDays).toBe(1);
    expect(resizeCycle(blocks, 99).cycleDays).toBe(28);
    expect(resizeCycle(blocks, 10).blocks).toEqual(blocks);
  });
});

describe('cellAt', () => {
  it('devuelve día, fila y orden de inserción bajo el punto y null fuera', () => {
    expect(cellAt(DAY_W * 2 + 5, HEADER_H + LANE_H + 5, 7)).toMatchObject({ dayStart: 2, lane: 1 });
    expect(cellAt(5, HEADER_H + LANE_H * 1.25, 7)?.order).toBeCloseTo(0.75);
    expect(cellAt(5, HEADER_H + LANE_H * 1.75, 7)?.order).toBeCloseTo(1.25);
    expect(cellAt(-1, HEADER_H, 7)).toBeNull();
    expect(cellAt(5, HEADER_H - 1, 7)).toBeNull();
    expect(cellAt(DAY_W * 7, HEADER_H, 7)).toBeNull();
    expect(cellAt(5, HEADER_H + LANE_H * MAX_LANES, 7)).toBeNull();
  });
});

describe('enfoques', () => {
  it('resolveTypes añade los propios con clave custom: y icono válido', () => {
    const all = resolveTypes([{ id: 'x', name: 'Mi tipo', color: '#112233', icon: 'no-existe' }]);
    expect(all).toHaveLength(DEFAULT_BLOCK_TYPES.length + 1);
    expect(all.at(-1)).toMatchObject({ key: 'custom:x', label: 'Mi tipo', icon: 'sparkles' });
  });

  it('blockFromType usa los valores por defecto del tipo', () => {
    const rest = DEFAULT_BLOCK_TYPES.find((t) => t.key === 'rest')!;
    expect(blockFromType(rest, 'id', 2, 1)).toMatchObject({ blockType: 'rest', dayStart: 2, lane: 1, zones: [] });
  });

  it('incluye movilidad, estiramiento y rehabilitación con icono propio y sin carga', () => {
    for (const [key, label] of [['mobility', 'Movilidad'], ['stretching', 'Estiramiento'], ['rehab', 'Rehabilitación']]) {
      const type = DEFAULT_BLOCK_TYPES.find((t) => t.key === key)!;
      expect(type.label).toBe(label);
      expect(defaultIconFor(key)).toBe(type.icon);
      expect(blockFromType(type, 'id', 0, 0)).not.toHaveProperty('load');
    }
    expect(new Set(DEFAULT_BLOCK_TYPES.map((t) => t.key)).size).toBe(DEFAULT_BLOCK_TYPES.length);
  });
});

describe('defaultIconFor', () => {
  it('devuelve el icono del enfoque y sparkles para claves desconocidas', () => {
    expect(defaultIconFor('strength')).toBe('dumbbell');
    expect(defaultIconFor('rest')).toBe('moon');
    expect(defaultIconFor('custom:x')).toBe('sparkles');
  });
});

describe('varios ciclos', () => {
  it('los bloques de ciclos distintos no se apilan entre sí', () => {
    const r = compactLanes([block({ id: 'a', cycleId: 'c1', lane: 3 }), block({ id: 'b', cycleId: 'c2', lane: 5 })]);
    expect(r.map((b) => b.lane)).toEqual([0, 0]);
  });

  it('stackBlocks y findFreeSlot solo ven los bloques del ciclo del bloque', () => {
    const other = block({ id: 'x', cycleId: 'c2' });
    expect(stackBlocks([other], block({ id: 'y', cycleId: 'c1' }))?.map((b) => b.lane)).toEqual([0, 0]);
    expect(findFreeSlot([other], 7, 1, 'c1')).toEqual({ dayStart: 0, lane: 0 });
    expect(findFreeSlot([other], 7, 1, 'c2')).toEqual({ dayStart: 1, lane: 0 });
  });

  it('blockFromType asigna el ciclo', () => {
    expect(blockFromType(DEFAULT_BLOCK_TYPES[0], 'id', 0, 0, 'cardio').cycleId).toBe('cardio');
  });

  it('el alto del ciclo crece con su pila: filas usadas más una libre, entre 3 y MAX_LANES', () => {
    expect(cycleRows([])).toBe(3);
    expect(cycleRows([block({ lane: 3 })])).toBe(5);
    expect(cycleRows([block({ lane: MAX_LANES - 1 })])).toBe(MAX_LANES);
    expect(cycleHeight([])).toBe(HEADER_H + 3 * LANE_H);
  });

  it('cycleTops apila los ciclos en vertical según lo que ocupa cada uno', () => {
    const cycles = [{ id: 'c1', name: 'Gimnasio', days: 7 }, { id: 'c2', name: 'Cardio', days: 5 }, { id: 'c3', name: 'Otro', days: 3 }];
    const blocks = [block({ id: 'a', cycleId: 'c1', lane: 3 }), block({ id: 'b', cycleId: 'c2' })];
    const first = HEADER_H + 5 * LANE_H + CYCLE_FOOT_H + CYCLE_GAP;
    const second = HEADER_H + 3 * LANE_H + CYCLE_FOOT_H + CYCLE_GAP;
    expect(cycleTops(cycles, blocks)).toEqual([0, first, first + second]);
    expect(cycleTops([], blocks)).toEqual([]);
  });
});
