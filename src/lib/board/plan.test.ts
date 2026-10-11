import { describe, expect, it } from 'vitest';

import { blockFromType, DEFAULT_BLOCK_TYPES } from './cycle';
import { addDays, blocksOnCycleDay, daysBetween, formatShort, isIsoDate, locateDate, planWeekOf, weekRange, type PlanAnchor } from './plan';
import { PHASE_TYPES, phaseFromType } from './phases';

const phase = (kind: string, id: string, start: number, weeks: number) => ({ ...phaseFromType(PHASE_TYPES.find((t) => t.kind === kind)!, id, start), weeks });
const plan: PlanAnchor = { planStart: '2026-10-12', cycleDays: 7, phases: [phase('volume', 'a', 0, 4), phase('deload', 'b', 5, 1)] };

describe('fechas', () => {
  it('isIsoDate acepta fechas reales y rechaza el resto', () => {
    expect(isIsoDate('2026-10-12')).toBe(true);
    expect(isIsoDate('2028-02-29')).toBe(true);
    for (const bad of ['2026-02-30', '2026-13-01', '12/10/2026', '2026-1-1', '', null, 20261012, undefined]) expect(isIsoDate(bad)).toBe(false);
  });

  it('daysBetween y addDays son consistentes, también al cruzar mes, año y cambio de hora', () => {
    expect(daysBetween('2026-10-12', '2026-10-19')).toBe(7);
    expect(daysBetween('2026-10-12', '2026-10-05')).toBe(-7);
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(daysBetween('2026-03-25', '2026-03-30')).toBe(5); // cambio de hora de primavera en Europa
    expect(addDays('2026-10-12', daysBetween('2026-10-12', '2027-04-01'))).toBe('2027-04-01');
  });

  it('weekRange da el primer y el último día de un tramo', () => {
    expect(weekRange('2026-10-12', 0, 4)).toEqual({ start: '2026-10-12', end: '2026-11-08' });
    expect(weekRange('2026-10-12', 5, 1)).toEqual({ start: '2026-11-16', end: '2026-11-22' });
  });
});

describe('locateDate', () => {
  it('el día de inicio es la semana 0, día 0 del ciclo y primera semana de la primera fase', () => {
    expect(locateDate(plan, '2026-10-12')).toMatchObject({ offset: 0, planWeek: 0, cycleDay: 0, weekInPhase: 0, phase: { id: 'a' } });
  });

  it('avanza por semanas, fases y día del ciclo', () => {
    expect(locateDate(plan, '2026-10-27')).toMatchObject({ planWeek: 2, cycleDay: 1, weekInPhase: 2, phase: { id: 'a' } });
  });

  it('una semana sin fase (hueco) no tiene fase ni semana de fase', () => {
    expect(locateDate(plan, '2026-11-09')).toMatchObject({ planWeek: 4, phase: null, weekInPhase: null });
  });

  it('fuera del plan devuelve null: antes del inicio o pasadas 52 semanas', () => {
    expect(locateDate(plan, '2026-10-11')).toBeNull();
    expect(locateDate(plan, addDays('2026-10-12', 52 * 7 - 1))).not.toBeNull();
    expect(locateDate(plan, addDays('2026-10-12', 52 * 7))).toBeNull();
  });

  it('el ciclo se repite sin parar: con un ciclo de 10 días no se alinea con la semana', () => {
    const p = { ...plan, cycleDays: 10 };
    expect(locateDate(p, '2026-10-22')).toMatchObject({ cycleDay: 0, planWeek: 1 });
    expect(locateDate(p, '2026-10-25')).toMatchObject({ cycleDay: 3 });
  });
});

describe('blocksOnCycleDay', () => {
  const strength = DEFAULT_BLOCK_TYPES.find((t) => t.key === 'strength')!;
  const b = (id: string, dayStart: number, span: number, lane: number) => ({ ...blockFromType(strength, id, dayStart, lane), daySpan: span });
  const blocks = [b('c', 2, 1, 1), b('a', 0, 3, 0), b('d', 3, 1, 0)];

  it('devuelve los bloques que cubren el día, ordenados por carril', () => {
    expect(blocksOnCycleDay(blocks, 2).map((x) => x.id)).toEqual(['a', 'c']);
    expect(blocksOnCycleDay(blocks, 3).map((x) => x.id)).toEqual(['d']);
    expect(blocksOnCycleDay(blocks, 6)).toEqual([]);
  });
});

describe('formatShort y planWeekOf', () => {
  it('formatShort da día y mes abreviado en español sin puntos', () => {
    expect(formatShort('2026-10-12')).toBe('12 oct');
    expect(formatShort('2026-01-05')).toBe('5 ene');
    expect(formatShort('2026-09-01')).toBe('1 sept');
  });

  it('planWeekOf da la semana de hoy dentro del plan o null fuera', () => {
    expect(planWeekOf('2026-10-12', '2026-10-12')).toBe(0);
    expect(planWeekOf('2026-10-12', '2026-10-25')).toBe(1);
    expect(planWeekOf('2026-10-12', '2026-10-11')).toBeNull();
    expect(planWeekOf('2026-10-12', addDays('2026-10-12', 52 * 7))).toBeNull();
  });
});
