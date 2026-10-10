import { GRID, clamp, type Rect } from './geometry';

/** Geometría del ciclo: columnas de días, carriles verticales y alto = carga. Todo múltiplo de GRID. */
export const DAY_W = 120;
export const HEADER_H = 40;
export const LANE_H = 140;
export const MAX_LANES = 4;
export const MAX_LOAD = 5;
export const MIN_CYCLE_DAYS = 1;
export const MAX_CYCLE_DAYS = 28;
export const DEFAULT_CYCLE_DAYS = 7;

export const MAX_ZONES = 6;

/** Iconos disponibles para un bloque (se resuelven a componentes en la UI). */
export const BLOCK_ICONS = ['dumbbell', 'flame', 'zap', 'heart-pulse', 'target', 'leaf', 'moon', 'sparkles', 'mountain', 'swords', 'timer', 'bike'] as const;
export type BlockIconKey = (typeof BLOCK_ICONS)[number];

/** Zonas sugeridas (el usuario también puede escribir las suyas). */
export const ZONE_SUGGESTIONS = ['Pecho', 'Espalda', 'Hombros', 'Brazos', 'Piernas', 'Glúteos', 'Core', 'Cardio', 'Movilidad', 'Técnica', 'Empuje', 'Tracción'] as const;

export interface CycleBlock {
  id: string;
  label: string;
  color: string;
  /** Clave del enfoque: predefinido (`strength`…) o propio (`custom:<id>`). */
  blockType: string;
  dayStart: number;
  daySpan: number;
  lane: number;
  load: number;
  /** Zonas: grupos musculares, patrones o ideas (etiquetas libres). */
  zones: string[];
  notes: string;
  icon: string;
}

export interface BlockTypeDef {
  key: string;
  label: string;
  color: string;
  icon: BlockIconKey;
  hint: string;
  defaultLoad: number;
}

/** Enfoques de sesión predefinidos de la paleta (objetivo del bloque). */
export const DEFAULT_BLOCK_TYPES: readonly BlockTypeDef[] = [
  { key: 'strength', label: 'Fuerza', color: '#dc2626', icon: 'dumbbell', hint: 'Cargas altas, pocas repeticiones', defaultLoad: 4 },
  { key: 'hypertrophy', label: 'Hipertrofia', color: '#2563eb', icon: 'flame', hint: 'Volumen moderado, cerca del fallo', defaultLoad: 4 },
  { key: 'power', label: 'Potencia', color: '#f59e0b', icon: 'zap', hint: 'Velocidad y explosividad', defaultLoad: 3 },
  { key: 'endurance', label: 'Resistencia', color: '#10b981', icon: 'heart-pulse', hint: 'Capacidad aeróbica y trabajo continuo', defaultLoad: 3 },
  { key: 'skill', label: 'Técnica', color: '#8b5cf6', icon: 'target', hint: 'Práctica de movimiento, baja fatiga', defaultLoad: 2 },
  { key: 'recovery', label: 'Recuperación', color: '#06b6d4', icon: 'leaf', hint: 'Movilidad y trabajo suave', defaultLoad: 1 },
  { key: 'rest', label: 'Descanso', color: '#71717a', icon: 'moon', hint: 'Día libre de entrenamiento', defaultLoad: 1 },
  { key: 'free', label: 'Libre', color: '#a855f7', icon: 'sparkles', hint: 'Lo que tú definas', defaultLoad: 3 },
];

export const blockHeight = (load: number) => GRID * (clamp(Math.round(load), 1, MAX_LOAD) + 1);

/** Rectángulo (px, relativo a la zona del ciclo) de un bloque. */
export function toRect(b: CycleBlock): Rect {
  return { x: b.dayStart * DAY_W, y: HEADER_H + b.lane * LANE_H, w: b.daySpan * DAY_W, h: blockHeight(b.load) };
}

/** Convierte un rectángulo libre en coordenadas de ciclo válidas (día, ancho, carril, carga). */
export function fromRect(rect: Rect, cycleDays: number): Pick<CycleBlock, 'dayStart' | 'daySpan' | 'lane' | 'load'> {
  const daySpan = clamp(Math.round(rect.w / DAY_W), 1, cycleDays);
  const dayStart = clamp(Math.round(rect.x / DAY_W), 0, cycleDays - daySpan);
  const lane = clamp(Math.round((rect.y - HEADER_H) / LANE_H), 0, MAX_LANES - 1);
  const load = clamp(Math.round(rect.h / GRID) - 1, 1, MAX_LOAD);
  return { dayStart, daySpan, lane, load };
}

const overlaps = (a: CycleBlock, b: CycleBlock) =>
  a.lane === b.lane && a.dayStart < b.dayStart + b.daySpan && b.dayStart < a.dayStart + a.daySpan;

/**
 * Sitúa `block` sin solapes: conserva su carril si cabe y, si no, usa el primero libre
 * (primero hacia abajo, luego hacia arriba). `null` si no hay hueco en ningún carril.
 */
export function placeBlock(others: CycleBlock[], block: CycleBlock): CycleBlock | null {
  const rest = others.filter((o) => o.id !== block.id);
  const order = Array.from({ length: MAX_LANES }, (_, i) => i).sort(
    (a, b) => Math.abs(a - block.lane) - Math.abs(b - block.lane) || b - a,
  );
  for (const lane of order) {
    const candidate = { ...block, lane };
    if (!rest.some((o) => overlaps(candidate, o))) return candidate;
  }
  return null;
}

/** Primer hueco libre de `span` días (carril por carril) para crear bloques sin posición explícita. */
export function findFreeSlot(blocks: CycleBlock[], cycleDays: number, span = 1): { dayStart: number; lane: number } | null {
  const daySpan = Math.min(span, cycleDays);
  const probe = { id: '', label: '', color: '', blockType: '', daySpan, load: 1, zones: [], notes: '', icon: '' };
  for (let lane = 0; lane < MAX_LANES; lane++) {
    for (let dayStart = 0; dayStart + daySpan <= cycleDays; dayStart++) {
      if (!blocks.some((o) => overlaps({ ...probe, dayStart, lane }, o))) return { dayStart, lane };
    }
  }
  return null;
}

/** Bloques que quedarían fuera (en parte o del todo) si el ciclo pasa a `days` días. */
export const blocksBeyond = (blocks: CycleBlock[], days: number) => blocks.filter((b) => b.dayStart + b.daySpan > days);

/**
 * Cambia la duración del ciclo: los bloques que empiezan fuera se eliminan y los que
 * lo cruzan se recortan al nuevo final.
 */
export function resizeCycle(blocks: CycleBlock[], days: number): { cycleDays: number; blocks: CycleBlock[] } {
  const cycleDays = clamp(Math.round(days), MIN_CYCLE_DAYS, MAX_CYCLE_DAYS);
  return {
    cycleDays,
    blocks: blocks
      .filter((b) => b.dayStart < cycleDays)
      .map((b) => (b.dayStart + b.daySpan > cycleDays ? { ...b, daySpan: cycleDays - b.dayStart } : b)),
  };
}

/** Casilla (día y carril) bajo un punto en px relativos a la zona del ciclo, o null si cae fuera. */
export function cellAt(x: number, y: number, cycleDays: number): { dayStart: number; lane: number } | null {
  const row = y - HEADER_H;
  if (x < 0 || row < 0 || x >= cycleDays * DAY_W || row >= MAX_LANES * LANE_H) return null;
  return { dayStart: Math.floor(x / DAY_W), lane: Math.floor(row / LANE_H) };
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
      defaultLoad: 3,
    })),
  ];
}

/** Bloque nuevo a partir de un enfoque (con sus valores por defecto). */
export function blockFromType(type: BlockTypeDef, id: string, dayStart: number, lane: number): CycleBlock {
  return {
    id,
    label: type.label,
    color: type.color,
    blockType: type.key,
    dayStart,
    daySpan: 1,
    lane,
    load: type.defaultLoad,
    zones: [],
    notes: '',
    icon: type.icon,
  };
}

/** Icono por defecto de un enfoque; se usa cuando el bloque no tiene icono propio (p. ej. bloques antiguos). */
export function defaultIconFor(blockType: string): BlockIconKey {
  return DEFAULT_BLOCK_TYPES.find((t) => t.key === blockType)?.icon ?? 'sparkles';
}
