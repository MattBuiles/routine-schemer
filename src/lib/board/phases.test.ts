import { describe, expect, it } from 'vitest';

import {
  MAX_PHASES,
  DEFAULT_PLAN_WEEKS,
  MAX_PLAN_WEEKS,
  PHASE_TYPES,
  movePhase,
  nextFreeStart,
  phaseFromType,
  phasesBeyond,
  exerciseSetsInWeek,
  projectPhase,
  resizePhase,
  resizePhaseStart,
  resizePlan,
  sanitizePhases,
  sanitizePlanWeeks,
  type Phase,
} from './phases';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const type = (kind: string) => PHASE_TYPES.find((t) => t.kind === kind)!;
const phaseEndMax = (ps: Phase[]) => Math.max(...ps.map((p) => p.startWeek + p.weeks));
const phase = (n: number, start: number, weeks: number, over: Partial<Phase> = {}): Phase => ({ ...phaseFromType(type('volume'), id(n), start), weeks, ...over });

describe('plan de fases', () => {
  it('nextFreeStart va tras la última fase y es null si no cabe', () => {
    expect(nextFreeStart([])).toBe(0);
    expect(nextFreeStart([phase(1, 0, 4), phase(2, 6, 2)])).toBe(8);
    expect(nextFreeStart([phase(1, 0, MAX_PLAN_WEEKS)])).toBeNull();
    expect(nextFreeStart([phase(1, 0, 50)], 4)).toBeNull();
  });

  it('phaseFromType recorta las semanas para no salirse del plan', () => {
    expect(phaseFromType(type('volume'), id(1), 50).weeks).toBe(2);
  });

  it('movePhase mueve, ordena y rechaza solapes y salidas del plan', () => {
    const phases = [phase(1, 0, 4), phase(2, 6, 2)];
    expect(movePhase(phases, id(2), 4)?.map((p) => [p.id, p.startWeek])).toEqual([[id(1), 0], [id(2), 4]]);
    expect(movePhase(phases, id(2), 3)).toBeNull();
    expect(movePhase(phases, id(1), 99)?.find((p) => p.id === id(1))?.startWeek).toBe(MAX_PLAN_WEEKS - 4);
    expect(movePhase(phases, 'no-existe', 0)).toBeNull();
  });

  it('resizePhase alarga empujando a las contiguas y conserva los huecos posteriores', () => {
    const phases = [phase(1, 0, 4), phase(2, 4, 2), phase(3, 10, 2)];
    const out = resizePhase(phases, id(1), 6);
    expect(out.map((p) => [p.id, p.startWeek, p.weeks])).toEqual([[id(1), 0, 6], [id(2), 6, 2], [id(3), 10, 2]]);
    const more = resizePhase(phases, id(1), 9);
    expect(more.map((p) => [p.startWeek, p.weeks])).toEqual([[0, 9], [9, 2], [11, 2]]);
  });

  it('resizePhase acortar no mueve a nadie y mantiene al menos una semana', () => {
    const phases = [phase(1, 0, 4), phase(2, 4, 2)];
    expect(resizePhase(phases, id(1), 2).map((p) => [p.startWeek, p.weeks])).toEqual([[0, 2], [4, 2]]);
    expect(resizePhase(phases, id(1), 0).find((p) => p.id === id(1))!.weeks).toBe(1);
  });

  it('resizePhase se queda en el máximo que cabe cuando empujar sacaría fases del plan', () => {
    const phases = [phase(1, 0, 4), phase(2, 4, 24), phase(3, 28, 24)];
    const out = resizePhase(phases, id(1), 30);
    expect(out.find((p) => p.id === id(1))!.weeks).toBe(4); // no hay un solo hueco libre
    const roomy = [phase(1, 0, 4), phase(2, 4, 40)];
    const grown = resizePhase(roomy, id(1), 30);
    expect(grown.find((p) => p.id === id(1))!.weeks).toBe(12);
    expect(phaseEndMax(grown)).toBe(MAX_PLAN_WEEKS);
  });

  it('resizePhase de una fase sola llega hasta el final del plan', () => {
    expect(resizePhase([phase(1, 10, 2)], id(1), 99).find((p) => p.id === id(1))!.weeks).toBe(MAX_PLAN_WEEKS - 10);
    expect(resizePhase([phase(1, 0, 4)], 'no-existe', 3)).toEqual([phase(1, 0, 4)]);
  });

  it('resizePhaseStart mueve el comienzo y deja fijo el final, sin pisar a la anterior', () => {
    const phases = [phase(1, 0, 4), phase(2, 6, 4)];
    expect(resizePhaseStart(phases, id(2), 4).find((p) => p.id === id(2))).toMatchObject({ startWeek: 4, weeks: 6 });
    expect(resizePhaseStart(phases, id(2), 1).find((p) => p.id === id(2))).toMatchObject({ startWeek: 4, weeks: 6 });
    expect(resizePhaseStart(phases, id(2), 8).find((p) => p.id === id(2))).toMatchObject({ startWeek: 8, weeks: 2 });
    expect(resizePhaseStart(phases, id(2), 99).find((p) => p.id === id(2))).toMatchObject({ startWeek: 9, weeks: 1 });
    expect(resizePhaseStart(phases, id(1), -5).find((p) => p.id === id(1))).toMatchObject({ startWeek: 0, weeks: 4 });
  });
});

describe('projectPhase', () => {
  it('suma las series de rampa por semana y aplica el ajuste de volumen', () => {
    const p = phase(1, 0, 3, { volumePct: 0, intensityPct: 0, rampSets: 1, rampLoad: 2.5, deloadLast: false });
    expect(projectPhase(p, [3, 3]).map((w) => [w.sets, w.loadPct])).toEqual([[6, 100], [8, 102.5], [10, 105]]);
  });

  it('la última semana de descarga reduce volumen y carga', () => {
    const p = phase(1, 4, 4, { volumePct: 0, intensityPct: 0, rampSets: 0, rampLoad: 0, deloadLast: true });
    const weeks = projectPhase(p, [5]);
    expect(weeks.map((w) => w.deload)).toEqual([false, false, false, true]);
    expect(weeks[3]).toMatchObject({ sets: 3, loadPct: 90, planWeek: 8 });
  });

  it('una fase de descarga ya lleva el recorte en sus modificadores y no se aplica dos veces', () => {
    const p = phaseFromType(type('deload'), id(1), 0);
    expect(projectPhase(p, [5])[0]).toMatchObject({ deload: true, sets: 3, loadPct: 90 });
  });

  it('una fase de una sola semana no es de descarga por deloadLast', () => {
    expect(projectPhase(phase(1, 0, 1, { deloadLast: true }), [3])[0].deload).toBe(false);
  });

  it('nunca baja de una serie por ejercicio y sin ejercicios no proyecta series', () => {
    const p = phase(1, 0, 2, { volumePct: 0, rampSets: 0 });
    expect(projectPhase(p, [0])[0].sets).toBe(1);
    expect(projectPhase(p, [])[0].sets).toBe(0);
  });
});

describe('sanitizePhases', () => {
  const raw = (n: number, over: Record<string, unknown> = {}) => ({ id: id(n), name: 'Bloque A', kind: 'intensity', startWeek: 0, weeks: 4, color: '#112233', volumePct: 10, intensityPct: 5, rampSets: 1, rampLoad: 2.5, deloadLast: true, ...over });

  it('tolera entradas que no son una lista', () => {
    for (const bad of [null, undefined, 4, 'x', {}]) expect(sanitizePhases(bad)).toEqual([]);
  });

  it('descarta ids inválidos y repetidos, y usa valores por defecto del tipo', () => {
    const out = sanitizePhases([raw(1), raw(1), raw(2, { id: 'no-uuid' }), raw(3, { name: '  ', kind: 'raro', color: 'rojo', startWeek: 4 })]);
    expect(out.map((p) => p.id)).toEqual([id(1), id(3)]);
    expect(out[1]).toMatchObject({ name: 'Volumen', kind: 'volume', color: '#3b82f6' });
  });

  it('acota los rangos', () => {
    const [p] = sanitizePhases([raw(1, { volumePct: 999, intensityPct: -999, rampSets: 99, rampLoad: 99, weeks: 999, name: 'x'.repeat(99) })]);
    expect(p).toMatchObject({ volumePct: 100, intensityPct: -50, rampSets: 3, rampLoad: 10, weeks: MAX_PLAN_WEEKS });
    expect(p.name).toHaveLength(40);
  });

  it('resuelve solapes empujando hacia delante y descarta lo que no cabe en el plan', () => {
    const out = sanitizePhases([raw(1, { startWeek: 0, weeks: 4 }), raw(2, { startWeek: 2, weeks: 4 }), raw(3, { startWeek: 51, weeks: 5 })]);
    expect(out.map((p) => [p.startWeek, p.weeks])).toEqual([[0, 4], [4, 4], [51, 1]]);
    expect(sanitizePhases([raw(1, { startWeek: 0, weeks: 52 }), raw(2, { startWeek: 10 })])).toHaveLength(1);
  });

  it('ignora claves ajenas y limita la cantidad', () => {
    const [p] = sanitizePhases([{ ...raw(1), userId: 'atacante', boardId: 'x' }]);
    expect(Object.keys(p).sort()).toEqual(['color', 'deloadLast', 'id', 'intensityPct', 'kind', 'name', 'rampLoad', 'rampSets', 'startWeek', 'volumePct', 'weeks']);
    expect(sanitizePhases(Array.from({ length: MAX_PHASES + 20 }, (_, i) => raw(i + 1, { startWeek: i, weeks: 1 })))).toHaveLength(MAX_PHASES);
  });
});

describe('exerciseSetsInWeek', () => {
  it('aplica la rampa y el volumen a un ejercicio y no baja de una serie', () => {
    const p = phase(1, 0, 4, { volumePct: 0, intensityPct: 0, rampSets: 1, rampLoad: 2.5, deloadLast: true });
    expect([0, 1, 2].map((i) => exerciseSetsInWeek(p, i, 3).sets)).toEqual([3, 4, 5]);
    expect(exerciseSetsInWeek(p, 1, 3).loadPct).toBe(102.5);
    expect(exerciseSetsInWeek(phase(2, 0, 2, { volumePct: -60, rampSets: 0 }), 0, 1).sets).toBe(1);
  });

  it('la última semana de descarga recorta series y carga', () => {
    const p = phase(1, 0, 4, { volumePct: 0, intensityPct: 0, rampSets: 0, rampLoad: 0, deloadLast: true });
    expect(exerciseSetsInWeek(p, 3, 5)).toEqual({ sets: 3, loadPct: 90, deload: true });
    expect(exerciseSetsInWeek(p, 2, 5)).toEqual({ sets: 5, loadPct: 100, deload: false });
  });
});

describe('duración total del plan', () => {
  it('sanitizePlanWeeks limita a 1–52 y usa el valor por defecto si no es un número', () => {
    expect([0, 1, 12, 52, 99, -3, 7.5].map(sanitizePlanWeeks)).toEqual([1, 1, 12, 52, 52, 1, 8]);
    for (const bad of ['12', null, undefined, NaN, Infinity, {}]) expect(sanitizePlanWeeks(bad)).toBe(DEFAULT_PLAN_WEEKS);
  });

  it('resizePlan elimina las fases que empiezan fuera y recorta las que cruzan el final', () => {
    const phases = [phase(1, 0, 4), phase(2, 4, 4), phase(3, 8, 2)];
    const r = resizePlan(phases, 6);
    expect(r.planWeeks).toBe(6);
    expect(r.phases.map((p) => [p.id, p.startWeek, p.weeks])).toEqual([[id(1), 0, 4], [id(2), 4, 2]]);
  });

  it('resizePlan al alargar no toca las fases y limita la duración a 1–52', () => {
    const phases = [phase(1, 0, 4)];
    expect(resizePlan(phases, 20).phases).toEqual(phases);
    expect(resizePlan(phases, 0).planWeeks).toBe(1);
    expect(resizePlan(phases, 99).planWeeks).toBe(MAX_PLAN_WEEKS);
    expect(resizePlan(phases, 1).phases.map((p) => [p.startWeek, p.weeks])).toEqual([[0, 1]]);
  });

  it('phasesBeyond avisa de las fases afectadas por acortar el plan', () => {
    const phases = [phase(1, 0, 4), phase(2, 4, 4)];
    expect(phasesBeyond(phases, 6).map((p) => p.id)).toEqual([id(2)]);
    expect(phasesBeyond(phases, 8)).toEqual([]);
  });

  it('mover, alargar y crear fases respetan el final del plan', () => {
    const phases = [phase(1, 0, 3), phase(2, 3, 2)];
    expect(movePhase(phases, id(2), 9, 6)?.find((p) => p.id === id(2))?.startWeek).toBe(4);
    expect(resizePhase(phases, id(2), 10, 6).find((p) => p.id === id(2))?.weeks).toBe(3);
    expect(nextFreeStart(phases, 1, 5)).toBeNull();
    expect(nextFreeStart(phases, 1, 6)).toBe(5);
    expect(phaseFromType(type('volume'), id(9), 4, 6).weeks).toBe(2);
  });

  it('empujar a las contiguas no las saca del plan: si no caben, la fase se queda en el máximo', () => {
    const phases = [phase(1, 0, 2), phase(2, 2, 2)];
    const r = resizePhase(phases, id(1), 9, 6);
    expect(phaseEndMax(r)).toBeLessThanOrEqual(6);
    expect(r.find((p) => p.id === id(1))?.weeks).toBe(4);
  });

  it('sanitizePhases recorta a la duración recibida', () => {
    const input = [phase(1, 0, 4), phase(2, 4, 4), phase(3, 9, 2)];
    expect(sanitizePhases(input, 6).map((p) => [p.startWeek, p.weeks])).toEqual([[0, 4], [4, 2]]);
    expect(sanitizePhases(input).map((p) => [p.startWeek, p.weeks])).toEqual([[0, 4], [4, 4], [9, 2]]);
  });
});
