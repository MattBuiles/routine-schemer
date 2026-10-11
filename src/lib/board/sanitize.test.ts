import { describe, expect, it } from 'vitest';

import { MAX_BLOCKS, sanitizeCycle, sanitizeExercises } from './sanitize';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const raw = (over: Record<string, unknown> = {}) => ({ id: id(1), label: 'Push', color: '#112233', blockType: 'strength', dayStart: 0, daySpan: 1, lane: 0, load: 3, ...over });

describe('sanitizeCycle', () => {
  it('normaliza zonas, notas e icono', () => {
    const [b] = sanitizeCycle({
      cycleDays: 7,
      blocks: [raw({ zones: ['Pecho', ' pecho ', 'Pecho', '', 5, 'x'.repeat(99), 'a', 'b', 'c', 'd', 'e'], notes: 'n'.repeat(900), icon: '<script>' })],
    }).blocks;
    expect(b.zones).toHaveLength(6);
    expect(b.zones[0]).toBe('Pecho');
    expect(b.zones.every((t) => t.length <= 24)).toBe(true);
    expect(b.notes).toHaveLength(500);
    expect(b.icon).toBe('dumbbell'); // icono inválido → el del enfoque (strength)
  });

  it('conserva un icono válido y usa el del enfoque cuando falta', () => {
    const [b] = sanitizeCycle({ cycleDays: 7, blocks: [raw({ icon: 'dumbbell' })] }).blocks;
    expect(b).toMatchObject({ icon: 'dumbbell', zones: [], notes: '' });
  });

  it('tolera entradas que no son un ciclo', () => {
    for (const bad of [null, undefined, 5, 'x', [], { blocks: 'no' }]) {
      expect(sanitizeCycle(bad)).toEqual({ cycleDays: 7, blocks: [] });
    }
  });

  it('descarta ids que no son uuid y duplicados', () => {
    const out = sanitizeCycle({ cycleDays: 7, blocks: [raw({ id: 'no-uuid' }), raw(), raw({ dayStart: 3 })] });
    expect(out.blocks.map((b) => b.id)).toEqual([id(1)]);
  });

  it('limita rangos, color y texto', () => {
    const [b] = sanitizeCycle({
      cycleDays: 100,
      blocks: [raw({ color: 'rojo', label: 'x'.repeat(500), load: 99, lane: -4, dayStart: -3, daySpan: 0 })],
    }).blocks;
    expect(b).toMatchObject({ color: '#3b82f6', load: 5, lane: 0, dayStart: 0, daySpan: 1 });
    expect(b.label).toHaveLength(60);
  });

  it('limita el ciclo a 28 días y recorta bloques que lo cruzan', () => {
    const out = sanitizeCycle({ cycleDays: 3, blocks: [raw({ dayStart: 2, daySpan: 9 })] });
    expect(out.cycleDays).toBe(3);
    expect(out.blocks[0]).toMatchObject({ dayStart: 0, daySpan: 3 });
  });

  it('resuelve solapes moviendo a otro carril y descarta lo que no cabe', () => {
    const blocks = Array.from({ length: 6 }, (_, i) => raw({ id: id(i + 1) }));
    const out = sanitizeCycle({ cycleDays: 1, blocks });
    expect(out.blocks).toHaveLength(4);
    expect(new Set(out.blocks.map((b) => b.lane)).size).toBe(4);
  });

  it('ignora claves ajenas y limita la cantidad de bloques', () => {
    const [b] = sanitizeCycle({ cycleDays: 7, blocks: [{ ...raw(), userId: 'atacante', boardId: 'x' }] }).blocks;
    expect(Object.keys(b).sort()).toEqual(['blockType', 'color', 'daySpan', 'dayStart', 'exercises', 'icon', 'id', 'label', 'lane', 'load', 'notes', 'zones']);
    const many = Array.from({ length: MAX_BLOCKS + 50 }, (_, i) => raw({ id: id(i + 1), dayStart: i % 28 }));
    expect(sanitizeCycle({ cycleDays: 28, blocks: many }).blocks.length).toBeLessThanOrEqual(MAX_BLOCKS);
  });
});

describe('sanitizeExercises', () => {
  const ex = (over: Record<string, unknown> = {}) => ({ exerciseId: id(9), name: 'Press de Banca', sets: 4, reps: '6-8', notes: 'Pausa', ...over });

  it('tolera entradas que no son una lista', () => {
    for (const bad of [null, undefined, 5, 'x', {}]) expect(sanitizeExercises(bad)).toEqual([]);
  });

  it('descarta ids inválidos y nombres vacíos, y permite repetir un ejercicio', () => {
    const out = sanitizeExercises([ex({ exerciseId: 'no-uuid' }), ex({ name: '   ' }), ex(), ex()]);
    expect(out).toHaveLength(2);
  });

  it('acota series, repeticiones y textos, y usa valores por defecto', () => {
    const [a] = sanitizeExercises([ex({ sets: 999, reps: 'x'.repeat(50), notes: 'n'.repeat(900), name: 'N'.repeat(300) })]);
    expect(a.sets).toBe(20);
    expect(a.reps).toHaveLength(12);
    expect(a.notes).toHaveLength(200);
    expect(a.name).toHaveLength(120);
    expect(sanitizeExercises([ex({ sets: 'tres', reps: '' })])[0]).toMatchObject({ sets: 3, reps: '8-12' });
  });

  it('ignora claves ajenas y limita la cantidad', () => {
    const [a] = sanitizeExercises([{ ...ex(), userId: 'atacante' }]);
    expect(Object.keys(a).sort()).toEqual(['exerciseId', 'name', 'notes', 'reps', 'sets']);
    expect(sanitizeExercises(Array.from({ length: 80 }, () => ex()))).toHaveLength(30);
  });

  it('se aplica dentro de sanitizeCycle', () => {
    const [b] = sanitizeCycle({ cycleDays: 7, blocks: [{ ...raw(), exercises: [ex(), { exerciseId: 'x' }] }] }).blocks;
    expect(b.exercises).toHaveLength(1);
  });
});
