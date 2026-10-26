import { describe, expect, it } from 'vitest';

import type { CycleBlock } from './cycle';
import type { Phase } from './phases';
import { planToday, type PlanInput } from './today';

const block = (over: Partial<CycleBlock>): CycleBlock => ({
  id: 'b1', cycleId: 'gym', label: 'Empuje', color: '#fff', blockType: 'strength', subtype: '', dayStart: 0, daySpan: 1, lane: 0,
  zones: ['pecho'], notes: '', icon: 'dumbbell', exercises: [{ exerciseId: 'e1', name: 'Press banca', sets: 3, reps: '8-10', notes: '' }], ...over,
});
const phase: Phase = { id: 'p', name: 'Volumen', kind: 'volume', startWeek: 0, weeks: 4, color: '#0f0', volumePct: 0, intensityPct: 0, rampSets: 1, rampLoad: 2.5, deloadLast: true };
const plan: PlanInput = {
  planStart: '2026-10-05', // lunes
  planWeeks: 6,
  phases: [phase],
  cycles: [{ id: 'gym', name: 'Gimnasio', days: 7 }, { id: 'cardio', name: 'Cardio', days: 3 }],
  blocks: [block({}), block({ id: 'b2', cycleId: 'cardio', label: 'Bici', dayStart: 1, exercises: [] }), block({ id: 'b3', dayStart: 2, label: 'Pierna' })],
};

describe('planToday', () => {
  it('sin plan anclado o antes del inicio no hay nada que enseñar', () => {
    expect(planToday({ ...plan, planStart: null }, '2026-10-06').status).toBe('no-plan');
    expect(planToday(plan, '2026-10-04')).toMatchObject({ status: 'before-start', cycles: [] });
  });

  it('cada ciclo cuenta su propio día y trae los bloques de ese día', () => {
    const r = planToday(plan, '2026-10-06'); // día 1 del plan
    expect(r.cycles.map((c) => [c.name, c.cycleDay, c.blocks.map((b) => b.label)])).toEqual([['Gimnasio', 1, []], ['Cardio', 1, ['Bici']]]);
    expect(planToday(plan, '2026-10-05').cycles[0].blocks.map((b) => b.label)).toEqual(['Empuje']);
  });

  it('las series siguen la rampa de la fase; la última semana es de descarga', () => {
    const w2 = planToday(plan, '2026-10-12'); // semana 1 de la fase
    expect(w2.phase).toMatchObject({ weekInPhase: 1, loadPct: 102.5, deload: false });
    expect(w2.cycles[0].blocks[0].exercises[0].sets).toBe(4);
    const last = planToday(plan, '2026-10-26'); // semana 3: descarga
    expect(last.phase?.deload).toBe(true);
    expect(last.cycles[0].blocks[0].exercises[0].sets).toBe(Math.round(6 * 0.6));
  });

  it('el plan se repite al terminar y sin fase solo sale el plan base', () => {
    const r = planToday(plan, '2026-11-16'); // semana 6 = vuelta: semana 0
    expect(r.planWeek).toBe(0);
    expect(r.phase?.weekInPhase).toBe(0);
    const bare = planToday({ ...plan, phases: [] }, '2026-10-05');
    expect(bare.phase).toBeNull();
    expect(bare.cycles[0].blocks[0].exercises[0].sets).toBe(3);
  });
});

import { mondayOf, planWeek } from './today';

describe('planWeek', () => {
  it('mondayOf da el lunes de cualquier día de la semana', () => {
    expect(mondayOf('2026-10-25')).toBe('2026-10-19'); // domingo
    expect(mondayOf('2026-10-19')).toBe('2026-10-19'); // lunes
    expect(mondayOf('2026-10-22')).toBe('2026-10-19'); // jueves
    expect(mondayOf('2026-11-01')).toBe('2026-10-26'); // cambio de mes
  });

  it('suma las series de los siete días por ejercicio, con la fase de cada semana', () => {
    // Plan desde el lunes 5 oct, ciclo gym de 7 días: el bloque 'Empuje' (día 0) y 'Pierna' (día 2) caen lunes y miércoles.
    const r = planWeek(plan, '2026-10-12'); // semana 1 de la fase: rampa +1 serie
    expect(r.status).toBe('ok');
    expect(r.weekStart).toBe('2026-10-12');
    expect(r.exercises).toEqual([{ exerciseId: 'e1', name: 'Press banca', sets: 8 }]); // 4 + 4 (3 + rampa 1) en los dos días
  });

  it('sin plan anclado o con la semana entera antes del inicio no hay nada', () => {
    expect(planWeek({ ...plan, planStart: null }, '2026-10-12')).toMatchObject({ status: 'no-plan', exercises: [] });
    expect(planWeek(plan, '2026-09-21')).toMatchObject({ status: 'before-start', exercises: [] });
  });

  it('una semana que empieza antes del inicio solo cuenta los días ya dentro del plan', () => {
    const r = planWeek({ ...plan, planStart: '2026-10-07' }, '2026-10-05'); // el plan empieza un miércoles
    expect(r.status).toBe('ok');
    expect(r.exercises[0].sets).toBeLessThan(8);
  });
});
