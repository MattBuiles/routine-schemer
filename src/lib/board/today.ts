import type { BlockExercise, CycleBlock, CycleDef } from './cycle';
import { exerciseSetsInWeek, type Phase } from './phases';
import { blocksOnCycleDay, cycleDayOf, locateDate } from './plan';

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
