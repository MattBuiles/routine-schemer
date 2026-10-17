import { describe, expect, it } from 'vitest';

import { MAX_LANES } from './cycle';
import { MAX_BLOCKS, sanitizeCycle, sanitizeCycles, sanitizeExercises } from './sanitize';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const raw = (over: Record<string, unknown> = {}) => ({ id: id(1), label: 'Push', color: '#112233', blockType: 'strength', dayStart: 0, daySpan: 1, lane: 0, ...over });

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
    expect(b).toMatchObject({ color: '#3b82f6', lane: 0, dayStart: 0, daySpan: 1 });
    expect(b).not.toHaveProperty('load');
    expect(b.label).toHaveLength(60);
  });

  it('el subenfoque se recorta, se limita a 40 caracteres y solo admite texto', () => {
    const sub = (subtype: unknown) => sanitizeCycle({ cycleDays: 7, blocks: [raw({ subtype })] }).blocks[0].subtype;
    expect(sub('  Bici  ')).toBe('Bici');
    expect(sub('x'.repeat(100))).toHaveLength(40);
    for (const bad of [undefined, null, 5, {}, ['Bici']]) expect(sub(bad)).toBe('');
  });

  it('limita el ciclo a 28 días y recorta bloques que lo cruzan', () => {
    const out = sanitizeCycle({ cycleDays: 3, blocks: [raw({ dayStart: 2, daySpan: 9 })] });
    expect(out.cycleDays).toBe(3);
    expect(out.blocks[0]).toMatchObject({ dayStart: 0, daySpan: 3 });
  });

  it('apila los bloques de un día como una cola y descarta lo que no cabe', () => {
    const blocks = Array.from({ length: 8 }, (_, i) => raw({ id: id(i + 1), lane: 0 }));
    const out = sanitizeCycle({ cycleDays: 1, blocks });
    expect(out.blocks).toHaveLength(MAX_LANES);
    expect(out.blocks.map((b) => b.lane)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('quita los huecos que mande el cliente entre bloques del mismo día', () => {
    const out = sanitizeCycle({ cycleDays: 3, blocks: [raw({ id: id(1), lane: 4 }), raw({ id: id(2), lane: 1 }), raw({ id: id(3), dayStart: 2, lane: 3 })] });
    expect(out.blocks.map((b) => [b.id, b.lane])).toEqual([[id(1), 1], [id(2), 0], [id(3), 0]]);
  });

  it('ignora claves ajenas y limita la cantidad de bloques', () => {
    const [b] = sanitizeCycle({ cycleDays: 7, blocks: [{ ...raw(), userId: 'atacante', boardId: 'x' }] }).blocks;
    expect(Object.keys(b).sort()).toEqual(['blockType', 'color', 'cycleId', 'daySpan', 'dayStart', 'exercises', 'icon', 'id', 'label', 'lane', 'notes', 'subtype', 'zones']);
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

describe('sanitizeCycles', () => {
  const cyc = (n: number, over: Record<string, unknown> = {}) => ({ id: id(900 + n), name: `Ciclo ${n}`, days: 7, ...over });
  const inCycle = (n: number, over: Record<string, unknown> = {}) => raw({ cycleId: id(900 + n), ...over });

  it('cada bloque va a su ciclo y se apila solo con los de ese ciclo', () => {
    const out = sanitizeCycles({
      cycles: [cyc(1), cyc(2, { days: 5 })],
      blocks: [inCycle(1, { id: id(1) }), inCycle(1, { id: id(2) }), inCycle(2, { id: id(3) })],
    });
    expect(out.cycles.map((c) => [c.name, c.days])).toEqual([['Ciclo 1', 7], ['Ciclo 2', 5]]);
    expect(out.blocks.map((b) => [b.id, b.cycleId, b.lane])).toEqual([[id(1), id(901), 0], [id(2), id(901), 1], [id(3), id(902), 0]]);
  });

  it('recorta los bloques a la duración de su propio ciclo', () => {
    const out = sanitizeCycles({ cycles: [cyc(1), cyc(2, { days: 3 })], blocks: [inCycle(1, { id: id(1), dayStart: 5 }), inCycle(2, { id: id(2), dayStart: 5 })] });
    // Cada bloque se ajusta a la duración de su ciclo: en el de 3 días no puede empezar más allá del día 3.
    expect(out.blocks.map((b) => [b.id, b.dayStart])).toEqual([[id(1), 5], [id(2), 2]]);
  });

  it('acota nombre y duración, descarta ids inválidos o repetidos y limita a 5 ciclos', () => {
    const out = sanitizeCycles({
      cycles: [cyc(1, { name: '  x'.repeat(50), days: 99 }), cyc(1), cyc(2, { id: 'no-uuid' }), cyc(3, { days: 'x', name: '   ' })],
      blocks: [],
    });
    expect(out.cycles).toHaveLength(2);
    expect(out.cycles[0]).toMatchObject({ days: 28 });
    expect(out.cycles[0].name.length).toBeLessThanOrEqual(40);
    expect(out.cycles[1]).toMatchObject({ id: id(903), name: 'Ciclo', days: 7 });
  });

  it('no admite más de 5 ciclos', () => {
    const out = sanitizeCycles({ cycles: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => cyc(n)), blocks: [] });
    expect(out.cycles.map((c) => c.id)).toEqual([1, 2, 3, 4, 5].map((n) => id(900 + n)));
  });

  it('un id de bloque solo vale una vez en todo el tablero y no se aceptan bloques sin ciclo válido', () => {
    const out = sanitizeCycles({
      cycles: [cyc(1), cyc(2)],
      blocks: [inCycle(1, { id: id(1) }), inCycle(2, { id: id(1) }), raw({ id: id(2) }), inCycle(9, { id: id(3) }), { ...inCycle(1, { id: id(4) }), cycleId: 7 }],
    });
    expect(out.blocks.map((b) => [b.id, b.cycleId])).toEqual([[id(1), id(901)]]);
  });

  it('sin ciclos válidos devuelve uno por defecto vacío', () => {
    for (const bad of [null, undefined, {}, { cycles: 'x' }, { cycles: [{ id: 'no' }] }]) {
      const out = sanitizeCycles(bad);
      expect(out.cycles).toHaveLength(1);
      expect(out.cycles[0]).toMatchObject({ name: 'Gimnasio', days: 7 });
      expect(out.blocks).toEqual([]);
    }
  });

  it('el id del ciclo se compara sin importar mayúsculas y los bloques heredan el id en minúsculas', () => {
    const upper = id(901).toUpperCase().replace('X', 'x');
    const out = sanitizeCycles({ cycles: [{ id: upper, name: 'A', days: 7 }], blocks: [raw({ id: id(1), cycleId: upper })] });
    expect(out.blocks[0].cycleId).toBe(id(901));
  });
});

describe('sanitizeCycle con ciclo', () => {
  it('pone el cycleId recibido en todos los bloques, ignorando el del cliente', () => {
    const out = sanitizeCycle({ cycleDays: 7, blocks: [raw({ id: id(1), cycleId: 'otro' })] }, 'c9');
    expect(out.blocks[0].cycleId).toBe('c9');
  });
});
