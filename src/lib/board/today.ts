import type { BlockExercise, CycleBlock, CycleDef } from './cycle';
import { exerciseSetsInWeek, type Phase } from './phases';
import { addDays, blocksOnCycleDay, cycleDayOf, locateDate } from './plan';

export interface PlanInput {
  planStart: string | null;
  planWeeks: number;
  phases: Phase[];
  cycles: CycleDef[];
  blocks: CycleBlock[];
}

export interface TodayExercise extends Pick<BlockExercise, 'exerciseId' | 'name' | 'reps' | 'notes'> {
  /** Series ya ajustadas por la fase (rampa, volumen y descarga). */
  sets: number;
}

export interface TodayBlock extends Pick<CycleBlock, 'id' | 'label' | 'color' | 'blockType' | 'subtype' | 'icon' | 'zones' | 'notes'> {
  exercises: TodayExercise[];
}

export interface PlanToday {
  /** `ok` si hay plan activo ese día; si no, la razón por la que no hay nada que enseñar. */
  status: 'ok' | 'no-plan' | 'before-start';
  date: string;
  planStart: string | null;
  planWeek: number | null;
  planWeeks: number;
  phase: { name: string; kind: string; weekInPhase: number; loadPct: number; deload: boolean } | null;
  cycles: { id: string; name: string; days: number; cycleDay: number; blocks: TodayBlock[] }[];
}

/** Qué toca en `date` (AAAA-MM-DD, la fecha local de quien pregunta): día de cada ciclo, bloques y ejercicios con las series de la fase. */
export function planToday(plan: PlanInput, date: string): PlanToday {
  const base = { date, planStart: plan.planStart, planWeeks: plan.planWeeks, planWeek: null, phase: null, cycles: [] };
  if (!plan.planStart) return { status: 'no-plan', ...base };
  const pos = locateDate({ planStart: plan.planStart, cycles: plan.cycles, planWeeks: plan.planWeeks, phases: plan.phases }, date);
  if (!pos) return { status: 'before-start', ...base };

  const { phase, weekInPhase } = pos;
  const week = phase && weekInPhase !== null ? exerciseSetsInWeek(phase, weekInPhase, 3) : null;
  return {
    status: 'ok',
    date,
    planStart: plan.planStart,
    planWeek: pos.planWeek,
    planWeeks: plan.planWeeks,
    phase: phase && weekInPhase !== null && week ? { name: phase.name, kind: phase.kind, weekInPhase, loadPct: week.loadPct, deload: week.deload } : null,
    cycles: plan.cycles.map((c) => {
      const cycleDay = cycleDayOf(pos.offset, c.days);
      const blocks = blocksOnCycleDay(plan.blocks.filter((b) => b.cycleId === c.id), cycleDay).map((b) => ({
        id: b.id,
        label: b.label,
        color: b.color,
        blockType: b.blockType,
        subtype: b.subtype,
        icon: b.icon,
        zones: b.zones,
        notes: b.notes,
        exercises: b.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          name: e.name,
          reps: e.reps,
          notes: e.notes,
          sets: phase && weekInPhase !== null ? exerciseSetsInWeek(phase, weekInPhase, e.sets).sets : e.sets,
        })),
      }));
      return { id: c.id, name: c.name, days: c.days, cycleDay, blocks };
    }),
  };
}

export interface PlanWeek {
  status: 'ok' | 'no-plan' | 'before-start';
  /** Lunes de la semana consultada (AAAA-MM-DD). */
  weekStart: string;
  /** Series planeadas por ejercicio durante los siete días (lunes a domingo), ya ajustadas por la fase de cada día. */
  exercises: { exerciseId: string; name: string; sets: number }[];
}

/** Lunes (AAAA-MM-DD) de la semana de `date`. */
export function mondayOf(date: string): string {
  const dow = (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7; // lunes = 0
  return addDays(date, -dow);
}

/**
 * Lo que el plan pide en la semana (lunes a domingo) de `date`: suma, ejercicio a ejercicio, los siete días de todos los ciclos.
 * Un día anterior al inicio del plan no aporta nada; si ninguno de los siete días está dentro del plan, el estado lo dice.
 */
export function planWeek(plan: PlanInput, date: string): PlanWeek {
  const weekStart = mondayOf(date);
  if (!plan.planStart) return { status: 'no-plan', weekStart, exercises: [] };
  const byId = new Map<string, { exerciseId: string; name: string; sets: number }>();
  let inside = false;
  for (let i = 0; i < 7; i++) {
    const day = planToday(plan, addDays(weekStart, i));
    if (day.status !== 'ok') continue;
    inside = true;
    for (const c of day.cycles) for (const b of c.blocks) for (const e of b.exercises) {
      const cur = byId.get(e.exerciseId) ?? { exerciseId: e.exerciseId, name: e.name, sets: 0 };
      cur.sets += e.sets;
      byId.set(e.exerciseId, cur);
    }
  }
  return { status: inside ? 'ok' : 'before-start', weekStart, exercises: [...byId.values()] };
}
