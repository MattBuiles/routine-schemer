import { describe, expect, it } from 'vitest';

import {
  DAY_W,
  HEADER_H,
  LANE_H,
  MAX_LANES,
  blockHeight,
  blocksBeyond,
  findFreeSlot,
  fromRect,
  placeBlock,
  blockFromType,
  cellAt,
  resolveTypes,
  DEFAULT_BLOCK_TYPES,
  resizeCycle,
  toRect,
  type CycleBlock,
} from './cycle';

const block = (over: Partial<CycleBlock> = {}): CycleBlock => ({
  focus: [],
  notes: '',
  durationMinutes: 60,
  icon: 'dumbbell',
  id: 'a',
  label: 'Push',
  color: '#000',
  blockType: 'strength',
  dayStart: 0,
  daySpan: 1,
  lane: 0,
  load: 3,
  ...over,
});

describe('geometría del ciclo', () => {
  it('toRect y fromRect son inversas', () => {
    const b = block({ dayStart: 2, daySpan: 3, lane: 1, load: 4 });
    expect(fromRect(toRect(b), 7)).toEqual({ dayStart: 2, daySpan: 3, lane: 1, load: 4 });
  });

  it('el alto crece con la carga y respeta 1–5', () => {
    expect(blockHeight(1)).toBeLessThan(blockHeight(5));
    expect(blockHeight(0)).toBe(blockHeight(1));
    expect(blockHeight(99)).toBe(blockHeight(5));
  });

  it('fromRect ajusta a columnas y limita al ciclo', () => {
    expect(fromRect({ x: DAY_W * 0.6, y: HEADER_H, w: DAY_W * 1.4, h: 60 }, 7)).toMatchObject({ dayStart: 1, daySpan: 1 });
    expect(fromRect({ x: DAY_W * 9, y: HEADER_H, w: DAY_W * 3, h: 60 }, 7)).toMatchObject({ dayStart: 4, daySpan: 3 });
    expect(fromRect({ x: 0, y: HEADER_H + LANE_H * 99, w: DAY_W, h: 9999 }, 7)).toMatchObject({ lane: MAX_LANES - 1, load: 5 });
    expect(fromRect({ x: -500, y: -500, w: 1, h: 1 }, 7)).toMatchObject({ dayStart: 0, daySpan: 1, lane: 0, load: 1 });
  });
});

describe('placeBlock', () => {
  it('conserva el carril si no hay solape', () => {
    expect(placeBlock([block({ id: 'x', dayStart: 3 })], block({ dayStart: 0, daySpan: 3 }))?.lane).toBe(0);
  });

  it('un bloque contiguo no es un solape', () => {
    expect(placeBlock([block({ id: 'x', dayStart: 1 })], block({ daySpan: 1 }))?.lane).toBe(0);
  });

  it('mueve a otro carril si solapa', () => {
    const placed = placeBlock([block({ id: 'x', dayStart: 1, daySpan: 2 })], block({ dayStart: 2 }));
    expect(placed?.lane).not.toBe(0);
  });

  it('devuelve null si todos los carriles están ocupados', () => {
    const full = Array.from({ length: MAX_LANES }, (_, i) => block({ id: `x${i}`, lane: i }));
    expect(placeBlock(full, block({ id: 'nuevo' }))).toBeNull();
  });

  it('ignora el propio bloque al recolocarse', () => {
    const self = block();
    expect(placeBlock([self], self)?.lane).toBe(0);
  });
});

describe('findFreeSlot', () => {
  it('encuentra el primer día libre y respeta los bloques existentes', () => {
    expect(findFreeSlot([], 7)).toEqual({ dayStart: 0, lane: 0 });
    expect(findFreeSlot([block({ dayStart: 0 })], 7)).toEqual({ dayStart: 1, lane: 0 });
  });

  it('usa otro carril cuando la fila está llena', () => {
    const row = Array.from({ length: 3 }, (_, i) => block({ id: `x${i}`, dayStart: i }));
    expect(findFreeSlot(row, 3)).toEqual({ dayStart: 0, lane: 1 });
  });

  it('devuelve null si no cabe', () => {
    const all = Array.from({ length: MAX_LANES }, (_, i) => block({ id: `x${i}`, lane: i }));
    expect(findFreeSlot(all, 1)).toBeNull();
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
  it('devuelve día y carril bajo el punto y null fuera', () => {
    expect(cellAt(DAY_W * 2 + 5, HEADER_H + LANE_H + 5, 7)).toEqual({ dayStart: 2, lane: 1 });
    expect(cellAt(-1, HEADER_H, 7)).toBeNull();
    expect(cellAt(5, HEADER_H - 1, 7)).toBeNull();
    expect(cellAt(DAY_W * 7, HEADER_H, 7)).toBeNull();
    expect(cellAt(5, HEADER_H + LANE_H * MAX_LANES, 7)).toBeNull();
  });
});

describe('tipos', () => {
  it('resolveTypes añade los propios con clave custom: y icono válido', () => {
    const all = resolveTypes([{ id: 'x', name: 'Mi tipo', color: '#112233', icon: 'no-existe' }]);
    expect(all).toHaveLength(DEFAULT_BLOCK_TYPES.length + 1);
    expect(all.at(-1)).toMatchObject({ key: 'custom:x', label: 'Mi tipo', icon: 'sparkles' });
  });

  it('blockFromType usa los valores por defecto del tipo', () => {
    const rest = DEFAULT_BLOCK_TYPES.find((t) => t.key === 'rest')!;
    expect(blockFromType(rest, 'id', 2, 1)).toMatchObject({ blockType: 'rest', dayStart: 2, lane: 1, load: 1, durationMinutes: 0, focus: [] });
  });
});
