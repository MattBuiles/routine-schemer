import { clamp, type Rect } from './geometry';

/** Geometría del ciclo: columnas de días y filas de alto fijo; los bloques se apilan como una cola bajo cada día. Todo múltiplo de GRID. */
export const DAY_W = 120;
export const HEADER_H = 40;
export const LANE_H = 80;
export const MAX_LANES = 6;
export const MAX_CYCLES = 5;
export const MAX_CYCLE_NAME = 40;
export const MIN_CYCLE_DAYS = 1;
export const MAX_CYCLE_DAYS = 28;
export const DEFAULT_CYCLE_DAYS = 7;

export const MAX_ZONES = 6;
export const MAX_EXERCISES = 30;
export const MAX_SETS = 20;

/** Iconos disponibles para un bloque (se resuelven a componentes en la UI). */
export const BLOCK_ICONS = ['dumbbell', 'flame', 'zap', 'heart-pulse', 'target', 'leaf', 'moon', 'sparkles', 'mountain', 'swords', 'timer', 'bike', 'activity', 'person-standing', 'stethoscope'] as const;
export type BlockIconKey = (typeof BLOCK_ICONS)[number];

/** Zonas sugeridas (el usuario también puede escribir las suyas). */
export const ZONE_SUGGESTIONS = ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Piernas', 'Glúteos', 'Core', 'Cardio', 'Movilidad', 'Técnica', 'Empuje', 'Tracción'] as const;

/** Ejercicio dentro de un bloque; guarda una copia del nombre para mostrarlo sin consultar la biblioteca. */
export interface BlockExercise {
  exerciseId: string;
  name: string;
  sets: number;
  /** Repeticiones como texto libre: "8-12", "5", "AMRAP". */
  reps: string;
  notes: string;
}

/** Un ciclo del tablero (gimnasio, cardio...): su propia duración en días y sus propios bloques. */
export interface CycleDef {
  id: string;
  name: string;
  days: number;
}

export interface CycleBlock {
  id: string;
  /** Ciclo al que pertenece. */
  cycleId: string;
  label: string;
  color: string;
  /** Clave del enfoque: predefinido (`strength`…) o propio (`custom:<id>`). */
  blockType: string;
  dayStart: number;
  daySpan: number;
  /** Fila de la pila (0 arriba). Los bloques se compactan: nunca queda un hueco libre encima de uno. */
  lane: number;
  /** Zonas: grupos musculares, patrones o ideas (etiquetas libres). */
  zones: string[];
  notes: string;
  icon: string;
  exercises: BlockExercise[];
}

export interface BlockTypeDef {
  key: string;
  label: string;
  color: string;
  icon: BlockIconKey;
  hint: string;
}

/** Enfoques de sesión predefinidos de la paleta (objetivo del bloque). */
export const DEFAULT_BLOCK_TYPES: readonly BlockTypeDef[] = [
  { key: 'strength', label: 'Fuerza', color: '#dc2626', icon: 'dumbbell', hint: 'Cargas altas, pocas repeticiones' },
  { key: 'hypertrophy', label: 'Hipertrofia', color: '#2563eb', icon: 'flame', hint: 'Volumen moderado, cerca del fallo' },
  { key: 'power', label: 'Potencia', color: '#f59e0b', icon: 'zap', hint: 'Velocidad y explosividad' },
  { key: 'endurance', label: 'Resistencia', color: '#10b981', icon: 'heart-pulse', hint: 'Capacidad aeróbica y trabajo continuo' },
  { key: 'skill', label: 'Técnica', color: '#8b5cf6', icon: 'target', hint: 'Práctica de movimiento, baja fatiga' },
  { key: 'mobility', label: 'Movilidad', color: '#14b8a6', icon: 'activity', hint: 'Rango de movimiento y control articular' },
  { key: 'stretching', label: 'Estiramiento', color: '#ec4899', icon: 'person-standing', hint: 'Flexibilidad y vuelta a la calma' },
  { key: 'rehab', label: 'Rehabilitación', color: '#ea580c', icon: 'stethoscope', hint: 'Recuperación de lesiones y trabajo preventivo' },
  { key: 'recovery', label: 'Recuperación', color: '#06b6d4', icon: 'leaf', hint: 'Trabajo suave para descargar' },
  { key: 'rest', label: 'Descanso', color: '#71717a', icon: 'moon', hint: 'Día libre de entrenamiento' },
  { key: 'free', label: 'Libre', color: '#a855f7', icon: 'sparkles', hint: 'Lo que tú definas' },
];

const overlaps = (a: CycleBlock, b: CycleBlock) =>
  a.cycleId === b.cycleId &&
  a.lane === b.lane && a.dayStart < b.dayStart + b.daySpan && b.dayStart < a.dayStart + a.daySpan;

/** Rectángulo (px, relativo a la zona del ciclo) de un bloque. */
export function toRect(b: CycleBlock): Rect {
  return { x: b.dayStart * DAY_W, y: HEADER_H + b.lane * LANE_H, w: b.daySpan * DAY_W, h: LANE_H };
}

/**
 * Convierte un rectángulo libre en día, ancho y orden en la pila. `lane` queda fraccionario
 * (posición de su borde superior en filas) para saber entre qué bloques se suelta.
 */
export function fromRect(rect: Rect, cycleDays: number): Pick<CycleBlock, 'dayStart' | 'daySpan' | 'lane'> {
  const daySpan = clamp(Math.round(rect.w / DAY_W), 1, cycleDays);
  const dayStart = clamp(Math.round(rect.x / DAY_W), 0, cycleDays - daySpan);
  const lane = clamp((rect.y - HEADER_H) / LANE_H, 0, MAX_LANES);
  return { dayStart, daySpan, lane };
}

/**
 * Apila los bloques como una cola: cada uno cae a la primera fila libre de sus días. `lane`
 * marca el orden previo y puede ser fraccionario para insertar entre dos bloques.
 */
export function compactLanes(blocks: CycleBlock[]): CycleBlock[] {
  const sorted = [...blocks].sort((a, b) => a.lane - b.lane || a.dayStart - b.dayStart);
  const placed: CycleBlock[] = [];
  const byId = new Map<string, CycleBlock>();
  for (const b of sorted) {
    let lane = 0;
    while (placed.some((o) => overlaps({ ...b, lane }, o))) lane++;
    const next = { ...b, lane };
    placed.push(next);
    byId.set(b.id, next);
  }
  return blocks.map((b) => byId.get(b.id)!);
}

/**
 * Añade o recoloca `block` y devuelve todos los bloques apilados; `null` si algún día se
 * quedaría sin filas (más de MAX_LANES apilados).
 */
export function stackBlocks(blocks: CycleBlock[], block: CycleBlock): CycleBlock[] | null {
  const list = blocks.some((o) => o.id === block.id) ? blocks.map((o) => (o.id === block.id ? block : o)) : [...blocks, block];
  const stacked = compactLanes(list);
  return stacked.some((b) => b.lane >= MAX_LANES) ? null : stacked;
}

/** Primer hueco libre de `span` días (fila por fila) para crear bloques sin posición explícita. */
export function findFreeSlot(blocks: CycleBlock[], cycleDays: number, span = 1, cycleId = ''): { dayStart: number; lane: number } | null {
  const daySpan = Math.min(span, cycleDays);
  const probe = { id: '', cycleId, label: '', color: '', blockType: '', daySpan, zones: [], notes: '', icon: '', exercises: [] };
  for (let lane = 0; lane < MAX_LANES; lane++) {
    for (let dayStart = 0; dayStart + daySpan <= cycleDays; dayStart++) {
      if (!blocks.some((o) => overlaps({ ...probe, dayStart, lane }, o))) return { dayStart, lane };
    }
  }
  return null;
}

/** Filas que ocupa el área de un ciclo: las usadas más una libre para soltar al final de la pila (mínimo 3). */
export const cycleRows = (blocks: CycleBlock[]) => Math.min(MAX_LANES, Math.max(3, Math.max(-1, ...blocks.map((b) => b.lane)) + 2));

/** Alto del área de un ciclo (cabecera de días y filas), sin el pie con su nombre. */
export const cycleHeight = (blocks: CycleBlock[]) => HEADER_H + cycleRows(blocks) * LANE_H;

/** Barra inferior de cada ciclo (nombre y duración), dentro de su recuadro, y separación hasta el ciclo siguiente. */
export const CYCLE_FOOT_H = 40;
export const CYCLE_GAP = 48;

/** Posición vertical (px, relativa al primer ciclo) de cada ciclo: apilados en vertical según lo que ocupa cada uno. */
export function cycleTops(cycles: CycleDef[], blocks: CycleBlock[]): number[] {
  const tops: number[] = [];
  let y = 0;
  for (const c of cycles) {
    tops.push(y);
    y += cycleHeight(blocks.filter((b) => b.cycleId === c.id)) + CYCLE_FOOT_H + CYCLE_GAP;
  }
  return tops;
}

/** Bloques que quedarían fuera (en parte o del todo) si el ciclo pasa a `days` días. */
export const blocksBeyond = (blocks: CycleBlock[], days: number) => blocks.filter((b) => b.dayStart + b.daySpan > days);

/**
 * Cambia la duración del ciclo: los bloques que empiezan fuera se eliminan y los que
 * lo cruzan se recortan al nuevo final; después se vuelven a apilar.
 */
export function resizeCycle(blocks: CycleBlock[], days: number): { cycleDays: number; blocks: CycleBlock[] } {
  const cycleDays = clamp(Math.round(days), MIN_CYCLE_DAYS, MAX_CYCLE_DAYS);
  return {
    cycleDays,
    blocks: compactLanes(
      blocks
        .filter((b) => b.dayStart < cycleDays)
        .map((b) => (b.dayStart + b.daySpan > cycleDays ? { ...b, daySpan: cycleDays - b.dayStart } : b)),
    ),
  };
}

/**
 * Día bajo un punto en px relativos a la zona del ciclo, o null si cae fuera. `lane` es la fila
 * y `order` el orden de inserción (fraccionario): sobre la mitad alta de una fila entra antes
 * de lo que haya y sobre la baja, después.
 */
export function cellAt(x: number, y: number, cycleDays: number): { dayStart: number; lane: number; order: number } | null {
  const row = (y - HEADER_H) / LANE_H;
  if (x < 0 || row < 0 || x >= cycleDays * DAY_W || row >= MAX_LANES) return null;
  return { dayStart: Math.floor(x / DAY_W), lane: Math.floor(row), order: row - 0.5 };
}

/** Enfoques disponibles (predefinidos + propios); los propios usan la clave `custom:<id>`. */
export function resolveTypes(custom: { id: string; name: string; color: string; icon: string }[]): BlockTypeDef[] {
  return [
    ...DEFAULT_BLOCK_TYPES,
    ...custom.map((t) => ({
      key: `custom:${t.id}`,
      label: t.name,
      color: t.color,
      icon: ((BLOCK_ICONS as readonly string[]).includes(t.icon) ? t.icon : 'sparkles') as BlockIconKey,
      hint: 'Enfoque propio',
    })),
  ];
}

/** Bloque nuevo a partir de un enfoque (con sus valores por defecto). */
export function blockFromType(type: BlockTypeDef, id: string, dayStart: number, lane: number, cycleId = ''): CycleBlock {
  return {
    id,
    cycleId,
    label: type.label,
    color: type.color,
    blockType: type.key,
    dayStart,
    daySpan: 1,
    lane,
    zones: [],
    notes: '',
    icon: type.icon,
    exercises: [],
  };
}

/** Icono por defecto de un enfoque; se usa cuando el bloque no tiene icono propio (p. ej. bloques antiguos). */
export function defaultIconFor(blockType: string): BlockIconKey {
  return DEFAULT_BLOCK_TYPES.find((t) => t.key === blockType)?.icon ?? 'sparkles';
}
