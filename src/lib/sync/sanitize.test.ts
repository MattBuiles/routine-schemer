import { describe, expect, it } from 'vitest';

import { MAX_FUTURE_MS, MAX_PUSH_ROWS, sanitizePush } from './sanitize';

const NOW = Date.UTC(2026, 9, 25, 18, 0, 0);
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const workout = (over: Record<string, unknown> = {}) => ({ id: id(1), updatedAt: NOW, startedAt: '2026-10-25T17:00:00Z', ...over });
const exercise = (over: Record<string, unknown> = {}) => ({ id: id(2), updatedAt: NOW, workoutId: id(1), name: 'Press de Banca', position: 0, ...over });
const set = (over: Record<string, unknown> = {}) => ({ id: id(3), updatedAt: NOW, workoutExerciseId: id(2), position: 0, kind: 'work', weightKg: 80, reps: 8, rir: 2, ...over });
const run = (input: unknown) => sanitizePush(input, NOW);

describe('sanitizePush · lo válido', () => {
  it('acepta un entreno completo y normaliza los valores opcionales', () => {
    const { rows, invalid, tooMany } = run({ workouts: [workout()], workoutExercises: [exercise()], sets: [set()] });
    expect(invalid).toEqual([]);
    expect(tooMany).toBe(false);
    expect(rows.workouts[0]).toEqual({ id: id(1), updatedAt: NOW, deleted: false, startedAt: '2026-10-25T17:00:00.000Z', endedAt: null, note: '', cycleId: null, planWeek: null, planDay: null });
    expect(rows.workoutExercises[0]).toMatchObject({ exerciseId: null, supersetGroup: null, targetSets: null, targetReps: null, note: null, restS: null, deleted: false });
    expect(rows.sets[0]).toMatchObject({ weightKg: 80, reps: 8, rir: 2, restS: null, inclinePct: null, perSide: false, doneAt: null });
  });

  it('pasa los ids a minúsculas, recorta textos y redondea el peso a 2 decimales', () => {
    const { rows } = run({ workouts: [workout({ id: id(1).toUpperCase().replace('X', 'x'), note: '  buen día  ' })], workoutExercises: [exercise({ name: '  Sentadilla ' })], sets: [set({ weightKg: 82.504, inclinePct: 7.5, perSide: true })] });
    expect(rows.workouts[0].id).toBe(id(1));
    expect(rows.workouts[0].note).toBe('buen día');
    expect(rows.workoutExercises[0].name).toBe('Sentadilla');
    expect(rows.sets[0]).toMatchObject({ weightKg: 82.5, inclinePct: 7.5, perSide: true });
  });

  it('las claves ajenas (userId, seq, deleted raro en otra tabla) no pasan a la fila', () => {
    const { rows } = run({ sets: [{ ...set(), userId: 'atacante', seq: 1, user_id: 'x' }] });
    expect(Object.keys(rows.sets[0]).sort()).toEqual(['deleted', 'doneAt', 'id', 'inclinePct', 'kind', 'perSide', 'position', 'reps', 'restS', 'rir', 'updatedAt', 'weightKg', 'workoutExerciseId']);
  });

  it('una entrada que no es un objeto o con tablas que no son listas da cero filas sin romper', () => {
    for (const bad of [null, undefined, 'x', 5, [], { workouts: 'no', sets: 7 }]) {
      const r = run(bad);
      expect(r.rows).toEqual({ workouts: [], workoutExercises: [], sets: [] });
      expect(r.tooMany).toBe(false);
    }
  });
});

describe('sanitizePush · lo inválido se descarta con su motivo y el resto sigue', () => {
  it('descarta solo la fila mala y dice cuál y por qué', () => {
    const { rows, invalid } = run({ sets: [set({ id: id(10) }), set({ id: 'no-uuid' }), set({ id: id(11), reps: -1 }), set({ id: id(12) })] });
    expect(rows.sets.map((s) => s.id)).toEqual([id(10), id(12)]);
    expect(invalid.map((i) => [i.table, i.index])).toEqual([['sets', 1], ['sets', 2]]);
    expect(invalid[0].reason).toMatch(/id/);
    expect(invalid[1].reason).toMatch(/reps/);
  });

  it('rechaza valores fuera de rango o de tipo equivocado en cada campo', () => {
    const cases: [string, Record<string, unknown>][] = [
      ['sets', { kind: 'otro' }], ['sets', { kind: 5 }], ['sets', { weightKg: 1001 }], ['sets', { weightKg: -1 }], ['sets', { weightKg: '80' }], ['sets', { weightKg: NaN }],
      ['sets', { weightKg: Infinity }], ['sets', { reps: 1.5 }], ['sets', { reps: 1001 }], ['sets', { rir: 11 }], ['sets', { restS: 7201 }], ['sets', { inclinePct: 41 }],
      ['sets', { position: 201 }], ['sets', { perSide: 'si' }], ['sets', { deleted: 1 }], ['sets', { doneAt: 'ayer' }], ['sets', { workoutExerciseId: 'x' }],
      ['workoutExercises', { name: '' }], ['workoutExercises', { name: '   ' }], ['workoutExercises', { name: 'x'.repeat(121) }], ['workoutExercises', { position: -1 }],
      ['workoutExercises', { targetSets: 0 }], ['workoutExercises', { note: 'x'.repeat(301) }], ['workoutExercises', { restS: 14 }], ['workoutExercises', { restS: 601 }], ['workoutExercises', { targetReps: 'x'.repeat(13) }], ['workoutExercises', { workoutId: null }], ['workoutExercises', { exerciseId: 5 }],
      ['workouts', { startedAt: undefined }], ['workouts', { startedAt: '1999-01-01' }], ['workouts', { startedAt: '2101-01-01' }], ['workouts', { note: 'x'.repeat(2001) }],
      ['workouts', { planWeek: 52 }], ['workouts', { planDay: 28 }], ['workouts', { cycleId: 'x' }], ['workouts', { endedAt: 'no' }],
    ];
    const makers = { sets: set, workoutExercises: exercise, workouts: workout } as Record<string, (o: Record<string, unknown>) => Record<string, unknown>>;
    for (const [table, over] of cases) {
      const r = run({ [table]: [makers[table](over)] });
      expect({ case: JSON.stringify(over), rows: (r.rows as unknown as Record<string, unknown[]>)[table].length, invalid: r.invalid.length }).toEqual({ case: JSON.stringify(over), rows: 0, invalid: 1 });
    }
  });

  it('las filas que no son objetos se descartan', () => {
    const r = run({ sets: [null, 5, 'x', [], set()] });
    expect(r.rows.sets).toHaveLength(1);
    expect(r.invalid).toHaveLength(4);
  });

  it('la hora del teléfono no puede estar más de 24 horas en el futuro ni ser cero o negativa', () => {
    expect(run({ sets: [set({ updatedAt: NOW + MAX_FUTURE_MS })] }).rows.sets).toHaveLength(1);
    for (const updatedAt of [NOW + MAX_FUTURE_MS + 1, 9e15, 0, -5, 1.5, '1', null]) {
      expect(run({ sets: [set({ updatedAt })] }).invalid).toHaveLength(1);
    }
  });
});

describe('sanitizePush · repetidos y tamaño', () => {
  it('con el mismo id repetido se queda la edición más reciente y el orden no importa', () => {
    const a = set({ weightKg: 70, updatedAt: NOW - 10 });
    const b = set({ weightKg: 75, updatedAt: NOW });
    expect(run({ sets: [a, b] }).rows.sets).toMatchObject([{ weightKg: 75 }]);
    expect(run({ sets: [b, a] }).rows.sets).toMatchObject([{ weightKg: 75 }]);
  });

  it('más de MAX_PUSH_ROWS filas en total se rechaza entero, sin procesar nada', () => {
    const many = Array.from({ length: MAX_PUSH_ROWS }, (_, i) => set({ id: id(1000 + i) }));
    expect(run({ sets: many }).tooMany).toBe(false);
    const r = run({ sets: many, workouts: [workout()] });
    expect(r.tooMany).toBe(true);
    expect(r.rows.sets).toEqual([]);
  });

  it('una fila con el mismo id en tablas distintas no se mezcla', () => {
    const r = run({ workouts: [workout({ id: id(5) })], workoutExercises: [exercise({ id: id(5) })] });
    expect(r.rows.workouts).toHaveLength(1);
    expect(r.rows.workoutExercises).toHaveLength(1);
  });
});
