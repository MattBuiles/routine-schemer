import type { CycleBlock } from './cycle';
import { MAX_PLAN_WEEKS, phaseEnd, type Phase } from './phases';

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86_400_000;

/** Fecha AAAA-MM-DD real (rechaza 2026-02-30 y textos que no son fechas). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const m = ISO.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

const toDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / DAY_MS;
};

/** Días de `from` a `to` (negativo si `to` es anterior). Se calcula en UTC para que el horario de verano no cuente. */
export const daysBetween = (from: string, to: string) => toDay(to) - toDay(from);

export function addDays(iso: string, days: number): string {
  const date = new Date((toDay(iso) + days) * DAY_MS);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export interface PlanAnchor {
  planStart: string;
  cycleDays: number;
  phases: Phase[];
}

export interface PlanPosition {
  /** Días desde el inicio del plan. */
  offset: number;
  /** Semana del plan (desde 0). */
  planWeek: number;
  /** Día del ciclo (desde 0): el ciclo se repite sin parar desde el inicio del plan. */
  cycleDay: number;
  phase: Phase | null;
  /** Semana dentro de la fase (desde 0), o null si no hay fase. */
  weekInPhase: number | null;
}

/** Dónde cae una fecha en el plan; null si es anterior al inicio o posterior a la semana 52. */
export function locateDate(plan: PlanAnchor, date: string): PlanPosition | null {
  const offset = daysBetween(plan.planStart, date);
  if (offset < 0 || offset >= MAX_PLAN_WEEKS * 7) return null;
  const planWeek = Math.floor(offset / 7);
  const phase = plan.phases.find((p) => p.startWeek <= planWeek && planWeek < phaseEnd(p)) ?? null;
  return { offset, planWeek, cycleDay: offset % plan.cycleDays, phase, weekInPhase: phase ? planWeek - phase.startWeek : null };
}

/** Bloques que ocupan un día del ciclo, de arriba abajo por carril. */
export const blocksOnCycleDay = (blocks: CycleBlock[], cycleDay: number) =>
  blocks.filter((b) => b.dayStart <= cycleDay && cycleDay < b.dayStart + b.daySpan).sort((a, b) => a.lane - b.lane);

/** Primer y último día de un tramo de semanas del plan. */
export const weekRange = (planStart: string, startWeek: number, weeks: number) => ({
  start: addDays(planStart, startWeek * 7),
  end: addDays(planStart, (startWeek + weeks) * 7 - 1),
});

/** «12 oct» a partir de AAAA-MM-DD, en español y sin depender de la zona horaria del navegador. */
export function formatShort(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('es', { day: 'numeric', month: 'short', timeZone: 'UTC' }).replace('.', '');
}

/** Semana del plan (desde 0) a la que pertenece `today`, o null si queda fuera del plan. */
export function planWeekOf(planStart: string, today: string): number | null {
  const offset = daysBetween(planStart, today);
  return offset >= 0 && offset < MAX_PLAN_WEEKS * 7 ? Math.floor(offset / 7) : null;
}
