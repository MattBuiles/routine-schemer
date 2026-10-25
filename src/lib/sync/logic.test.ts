import { describe, expect, it } from 'vitest';

import { classify, fromSetDb, fromWorkoutDb, fromWorkoutExerciseDb, pageBySeq, toSetDb, toWorkoutDb, toWorkoutExerciseDb } from './logic';
import type { Changes, SetRow, WorkoutExerciseRow, WorkoutRow } from './sanitize';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const wk: WorkoutRow = { id: id(1), updatedAt: 1000, deleted: false, startedAt: '2026-10-25T17:00:00.000Z', endedAt: '2026-10-25T18:00:00.000Z', note: 'ok', cycleId: id(9), planWeek: 3, planDay: 2 };
const ex: WorkoutExerciseRow = { id: id(2), updatedAt: 1000, deleted: false, workoutId: id(1), exerciseId: id(8), name: 'Press', position: 1, supersetGroup: 2, targetSets: 3, targetReps: '8-12' };
const st: SetRow = { id: id(3), updatedAt: 1000, deleted: true, workoutExerciseId: id(2), position: 0, kind: 'failure', weightKg: 82.5, reps: 8, rir: 0, restS: 120, inclinePct: 5, perSide: true, doneAt: '2026-10-25T17:30:00.000Z' };
const empty = (): Changes => ({ workouts: [], workoutExercises: [], sets: [] });

describe('conversiones API ↔ base de datos', () => {
  it('ida y vuelta sin perder nada, y el dueño siempre es el de la sesión', () => {
    expect(fromWorkoutDb({ ...toWorkoutDb('user-1', wk), seq: 5 })).toEqual(wk);
    expect(fromWorkoutExerciseDb({ ...toWorkoutExerciseDb('user-1', ex), seq: 6 })).toEqual(ex);
    expect(fromSetDb({ ...toSetDb('user-1', st), seq: 7 })).toEqual(st);
    expect(toSetDb('user-1', st).userId).toBe('user-1');
  });

  it('las fechas pasan a Date y los nulos se conservan', () => {
    const db = toWorkoutDb('u', { ...wk, endedAt: null });
    expect(db.startedAt).toBeInstanceOf(Date);
    expect(db.endedAt).toBeNull();
  });
});

describe('classify', () => {
  const mine = (over = {}) => ({ ...toSetDb('user-1', st), seq: 1, ...over });
  const incoming = (updatedAt: number): Changes => ({ ...empty(), sets: [{ ...st, updatedAt }] });
  const found = (rows: ReturnType<typeof mine>[]) => ({ workouts: [], workoutExercises: [], sets: rows });

  it('un id que ya es de otra persona se rechaza y no se devuelve nada suyo', () => {
    const r = classify('user-1', incoming(2000), found([mine({ userId: 'otra-persona' })]));
    expect(r.rejected).toEqual([st.id]);
    expect(r.winners.sets).toEqual([]);
  });

  it('si la fila propia del servidor es más nueva, se devuelve para que el teléfono la adopte', () => {
    const r = classify('user-1', incoming(1000), found([mine({ clientUpdatedAt: 3000, weightKg: 90 })]));
    expect(r.rejected).toEqual([]);
    expect(r.winners.sets).toMatchObject([{ id: st.id, updatedAt: 3000, weightKg: 90 }]);
  });

  it('si la edición ganó (misma hora que la guardada), no hay nada que devolver', () => {
    expect(classify('user-1', incoming(2000), found([mine({ clientUpdatedAt: 2000 })]))).toEqual({ rejected: [], winners: empty() });
  });

  it('una fila que no aparece en la base no se rechaza ni se devuelve', () => {
    expect(classify('user-1', incoming(2000), found([]))).toEqual({ rejected: [], winners: empty() });
  });

  it('funciona igual en las tres tablas', () => {
    const all: Changes = { workouts: [wk], workoutExercises: [ex], sets: [st] };
    const r = classify('user-1', all, {
      workouts: [{ ...toWorkoutDb('user-1', wk), clientUpdatedAt: 9000, seq: 1 }],
      workoutExercises: [{ ...toWorkoutExerciseDb('otra', ex), seq: 2 }],
      sets: [{ ...toSetDb('user-1', st), seq: 3 }],
    });
    expect(r.winners.workouts).toHaveLength(1);
    expect(r.rejected).toEqual([ex.id]);
    expect(r.winners.sets).toEqual([]);
  });
});

describe('pageBySeq', () => {
  const row = (seq: number, t = 'a') => ({ seq, t });

  it('mezcla las listas por seq y toma las `limit` más antiguas', () => {
    const { taken, hasMore } = pageBySeq([[row(1), row(4), row(6)], [row(2, 'b'), row(3, 'b')], [row(5, 'c')]], 4);
    expect(taken.map((r) => r.seq)).toEqual([1, 2, 3, 4]);
    expect(hasMore).toBe(true);
  });

  it('sin filas de sobra y sin listas llenas no hay más páginas', () => {
    expect(pageBySeq([[row(1)], [row(2, 'b')], []], 5)).toMatchObject({ hasMore: false, taken: [row(1), row(2, 'b')] });
    expect(pageBySeq([[], [], []], 5)).toEqual({ taken: [], hasMore: false });
  });

  it('una lista que llegó justo al límite puede tener más detrás: hasMore es true', () => {
    expect(pageBySeq([[row(1), row(2)], []], 2).hasMore).toBe(true);
  });

  it('paginar con el cursor recorre todo exactamente una vez, sin saltarse ni repetir filas', () => {
    const table = (offset: number, n: number) => Array.from({ length: n }, (_, i) => row(offset + i * 3));
    const A = table(1, 7), B = table(2, 5), C = table(3, 9);
    const seen: number[] = [];
    let cursor = 0;
    for (let guard = 0; guard < 20; guard++) {
      const take = (l: { seq: number }[]) => l.filter((r) => r.seq > cursor).slice(0, 4);
      const { taken, hasMore } = pageBySeq([take(A), take(B), take(C)], 4);
      seen.push(...taken.map((r) => r.seq));
      if (taken.length) cursor = taken[taken.length - 1].seq;
      if (!hasMore) break;
    }
    expect(seen).toEqual([...A, ...B, ...C].map((r) => r.seq).sort((a, b) => a - b));
    expect(new Set(seen).size).toBe(seen.length);
  });
});
