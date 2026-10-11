import { clamp } from './geometry';
import { isHexColor, isUuid } from './sanitize';

export const WEEK_W = 40;
export const PHASE_H = 64;
export const MAX_PLAN_WEEKS = 52;
export const MAX_PHASES = 30;

export type PhaseKind = 'volume' | 'intensity' | 'peaking' | 'deload' | 'transition';
export const PHASE_KINDS: readonly PhaseKind[] = ['volume', 'intensity', 'peaking', 'deload', 'transition'];

export interface Phase {
  id: string;
  name: string;
  kind: PhaseKind;
  /** Semana (desde 0) en la que empieza dentro del plan. */
  startWeek: number;
  weeks: number;
  color: string;
  /** Ajuste global de volumen de la fase, en %. */
  volumePct: number;
  /** Ajuste global de intensidad (carga) de la fase, en %. */
  intensityPct: number;
  /** Series que se añaden a cada ejercicio por cada semana que pasa. */
  rampSets: number;
  /** Cambio de carga en % por cada semana que pasa. */
  rampLoad: number;
  /** La última semana de la fase es de descarga. */
  deloadLast: boolean;
}

export interface PhaseTypeDef {
  kind: PhaseKind;
  label: string;
  color: string;
  hint: string;
  weeks: number;
  volumePct: number;
  intensityPct: number;
  rampSets: number;
  rampLoad: number;
  deloadLast: boolean;
}

export const PHASE_TYPES: readonly PhaseTypeDef[] = [
  { kind: 'volume', label: 'Volumen', color: '#3b82f6', hint: 'Más series, carga moderada', weeks: 4, volumePct: 10, intensityPct: -5, rampSets: 1, rampLoad: 0, deloadLast: true },
  { kind: 'intensity', label: 'Intensidad', color: '#ef4444', hint: 'Menos volumen, cargas en aumento', weeks: 4, volumePct: -10, intensityPct: 5, rampSets: 0, rampLoad: 2, deloadLast: true },
  { kind: 'peaking', label: 'Peaking', color: '#f59e0b', hint: 'Afinar para el pico de rendimiento', weeks: 3, volumePct: -25, intensityPct: 10, rampSets: 0, rampLoad: 2, deloadLast: false },
  { kind: 'deload', label: 'Descarga', color: '#10b981', hint: 'Recuperar: poco volumen y carga', weeks: 1, volumePct: -40, intensityPct: -10, rampSets: 0, rampLoad: 0, deloadLast: false },
  { kind: 'transition', label: 'Transición', color: '#8b5cf6', hint: 'Cambio de enfoque o descanso activo', weeks: 2, volumePct: -30, intensityPct: -10, rampSets: 0, rampLoad: 0, deloadLast: false },
];

export const phaseType = (kind: PhaseKind) => PHASE_TYPES.find((t) => t.kind === kind)!;

export const phaseEnd = (p: Pick<Phase, 'startWeek' | 'weeks'>) => p.startWeek + p.weeks;

/** Fase nueva a partir de un tipo (con sus valores por defecto) en la semana indicada. */
export function phaseFromType(type: PhaseTypeDef, id: string, startWeek: number): Phase {
  return {
    id,
    name: type.label,
    kind: type.kind,
    startWeek,
    weeks: Math.min(type.weeks, MAX_PLAN_WEEKS - startWeek),
    color: type.color,
    volumePct: type.volumePct,
    intensityPct: type.intensityPct,
    rampSets: type.rampSets,
    rampLoad: type.rampLoad,
    deloadLast: type.deloadLast,
  };
}

const overlaps = (a: Phase, b: Phase) => a.startWeek < phaseEnd(b) && b.startWeek < phaseEnd(a);

/** Semana libre tras la última fase, o null si el plan ya no admite otra de `weeks` semanas. */
export function nextFreeStart(phases: Phase[], weeks = 1): number | null {
  const start = phases.reduce((end, p) => Math.max(end, phaseEnd(p)), 0);
  return start + weeks <= MAX_PLAN_WEEKS ? start : null;
}

/** Mueve una fase a otra semana; null si se saldría del plan o pisaría a otra. */
export function movePhase(phases: Phase[], id: string, startWeek: number): Phase[] | null {
  const phase = phases.find((p) => p.id === id);
  if (!phase) return null;
  const moved = { ...phase, startWeek: clamp(Math.round(startWeek), 0, MAX_PLAN_WEEKS - phase.weeks) };
  if (phases.some((p) => p.id !== id && overlaps(moved, p))) return null;
  return phases.map((p) => (p.id === id ? moved : p)).sort((a, b) => a.startWeek - b.startWeek);
}

/**
 * Empuja hacia la derecha las fases posteriores que `phase` pisaría tras cambiar de tamaño, conservando los
 * huecos que ya había entre ellas. Devuelve null si alguna se saldría del plan de 52 semanas.
 */
function pushRight(phases: Phase[], phase: Phase): Phase[] | null {
  const others = phases.filter((p) => p.id !== phase.id).sort((a, b) => a.startWeek - b.startWeek);
  const result: Phase[] = [];
  let cursor = phaseEnd(phase);
  for (const p of others) {
    if (phaseEnd(p) <= phase.startWeek) {
      result.push(p); // anterior: no se toca
      continue;
    }
    const startWeek = Math.max(p.startWeek, cursor);
    if (startWeek + p.weeks > MAX_PLAN_WEEKS) return null;
    result.push(startWeek === p.startWeek ? p : { ...p, startWeek });
    cursor = startWeek + p.weeks;
  }
  return [...result, phase].sort((a, b) => a.startWeek - b.startWeek);
}

/**
 * Cambia la duración de una fase por su final. Al alargarla empuja a las siguientes (no se queda bloqueada contra
 * una fase contigua); si no cabe en las 52 semanas, se queda en el máximo posible. Al acortarla no mueve a nadie.
 */
export function resizePhase(phases: Phase[], id: string, weeks: number): Phase[] {
  const phase = phases.find((p) => p.id === id);
  if (!phase) return phases;
  for (let w = clamp(Math.round(weeks), 1, MAX_PLAN_WEEKS - phase.startWeek); w >= 1; w--) {
    const next = pushRight(phases, { ...phase, weeks: w });
    if (next) return next;
  }
  return phases;
}

/**
 * Cambia el comienzo de una fase manteniendo su final (tirar del borde izquierdo). No puede invadir a la fase
 * anterior ni pasar de la semana 0.
 */
export function resizePhaseStart(phases: Phase[], id: string, startWeek: number): Phase[] {
  const phase = phases.find((p) => p.id === id);
  if (!phase) return phases;
  const end = phaseEnd(phase);
  const previousEnd = Math.max(0, ...phases.filter((p) => p.id !== id && phaseEnd(p) <= phase.startWeek).map(phaseEnd));
  const start = clamp(Math.round(startWeek), previousEnd, end - 1);
  return phases.map((p) => (p.id === id ? { ...p, startWeek: start, weeks: end - start } : p));
}

export interface WeekProjection {
  /** Semana dentro de la fase (desde 1). */
  week: number;
  /** Semana dentro del plan (desde 1). */
  planWeek: number;
  /** Series totales del ciclo en esa semana. */
  sets: number;
  /** Carga relativa respecto a la base (100 = la del ciclo tal cual). */
  loadPct: number;
  deload: boolean;
}

/** En una semana de descarga el volumen se reduce un 40 % extra y la carga baja 10 puntos. */
export const DELOAD_VOLUME = 0.6;
export const DELOAD_LOAD = 10;

/**
 * Proyecta semana a semana lo que supone la fase sobre el ciclo base. `exerciseSets` son las series de
 * cada ejercicio del ciclo; cada semana se suma `rampSets` a cada uno y se aplica el ajuste de volumen.
 */
export function projectPhase(phase: Phase, exerciseSets: number[]): WeekProjection[] {
  return Array.from({ length: phase.weeks }, (_, i) => {
    const deload = phase.kind === 'deload' || (phase.deloadLast && phase.weeks > 1 && i === phase.weeks - 1);
    const base = exerciseSets.reduce((total, sets) => total + Math.max(1, sets + phase.rampSets * i), 0);
    const volume = (1 + phase.volumePct / 100) * (deload && phase.kind !== 'deload' ? DELOAD_VOLUME : 1);
    const load = 100 + phase.intensityPct + phase.rampLoad * i - (deload && phase.kind !== 'deload' ? DELOAD_LOAD : 0);
    return {
      week: i + 1,
      planWeek: phase.startWeek + i + 1,
      sets: Math.round(base * volume),
      loadPct: Math.round(load * 2) / 2,
      deload,
    };
  });
}

const int = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? clamp(Math.round(value), min, max) : fallback;

const half = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? clamp(Math.round(value * 2) / 2, min, max) : fallback;

/** Normaliza las fases recibidas del cliente (JSON no confiable): rangos, tipos y sin solapes ni salirse del plan. */
export function sanitizePhases(input: unknown): Phase[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const phases: Phase[] = [];
  for (const item of input.slice(0, MAX_PHASES) as Record<string, unknown>[]) {
    if (!item || !isUuid(item.id) || seen.has(item.id.toLowerCase())) continue;
    seen.add(item.id.toLowerCase());
    const kind = PHASE_KINDS.includes(item.kind as PhaseKind) ? (item.kind as PhaseKind) : 'volume';
    const type = phaseType(kind);
    const startWeek = int(item.startWeek, 0, MAX_PLAN_WEEKS - 1, 0);
    phases.push({
      id: item.id.toLowerCase(),
      name: (typeof item.name === 'string' ? item.name.trim().slice(0, 40) : '') || type.label,
      kind,
      startWeek,
      weeks: int(item.weeks, 1, MAX_PLAN_WEEKS - startWeek, 1),
      color: isHexColor(item.color) ? item.color : type.color,
      volumePct: int(item.volumePct, -80, 100, 0),
      intensityPct: int(item.intensityPct, -50, 50, 0),
      rampSets: int(item.rampSets, 0, 3, 0),
      rampLoad: half(item.rampLoad, -10, 10, 0),
      deloadLast: item.deloadLast === true,
    });
  }
  // Sin solapes: cada fase empieza como pronto donde acaba la anterior; las que no caben en el plan se descartan.
  const result: Phase[] = [];
  let cursor = 0;
  for (const phase of phases.sort((a, b) => a.startWeek - b.startWeek)) {
    const startWeek = Math.max(phase.startWeek, cursor);
    const weeks = Math.min(phase.weeks, MAX_PLAN_WEEKS - startWeek);
    if (weeks < 1) continue;
    result.push({ ...phase, startWeek, weeks });
    cursor = startWeek + weeks;
  }
  return result;
}
