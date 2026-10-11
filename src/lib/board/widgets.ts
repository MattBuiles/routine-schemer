import { GRID, clamp, snap, type Rect } from './geometry';
import { isUuid } from './sanitize';

export const WIDGET_TYPES = ['habits', 'notes', 'calendar'] as const;
export type WidgetType = (typeof WIDGET_TYPES)[number];

export interface BoardWidget extends Rect {
  id: string;
  type: WidgetType;
}

export const WIDGET_INFO: Record<WidgetType, { title: string; w: number; h: number }> = {
  habits: { title: 'Hábitos', w: 320, h: 400 },
  notes: { title: 'Notas', w: 320, h: 400 },
  calendar: { title: 'Calendario', w: 380, h: 440 },
};

export const MIN_WIDGET = { w: 240, h: 200 };
export const MAX_WIDGET = { w: 800, h: 800 };
const COORD_LIMIT = 20000;

const isWidgetType = (value: unknown): value is WidgetType => (WIDGET_TYPES as readonly unknown[]).includes(value);

const coord = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? snap(clamp(value, -COORD_LIMIT, COORD_LIMIT)) : fallback;

const size = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? snap(clamp(value, min, max)) : fallback;

/** Normaliza los widgets recibidos del cliente (JSON no confiable): uno por tipo, rangos y tamaños acotados. */
export function sanitizeWidgets(input: unknown): BoardWidget[] {
  if (!Array.isArray(input)) return [];
  const seenTypes = new Set<WidgetType>();
  const seenIds = new Set<string>();
  const result: BoardWidget[] = [];
  for (const item of input.slice(0, WIDGET_TYPES.length * 2) as Record<string, unknown>[]) {
    if (!item || !isUuid(item.id) || !isWidgetType(item.type)) continue;
    const id = item.id.toLowerCase();
    if (seenTypes.has(item.type) || seenIds.has(id)) continue;
    seenTypes.add(item.type);
    seenIds.add(id);
    const info = WIDGET_INFO[item.type];
    result.push({
      id,
      type: item.type,
      x: coord(item.x, 0),
      y: coord(item.y, 0),
      w: size(item.w, MIN_WIDGET.w, MAX_WIDGET.w, info.w),
      h: size(item.h, MIN_WIDGET.h, MAX_WIDGET.h, info.h),
    });
  }
  return result;
}

/** Posición inicial de un widget nuevo: en fila bajo `origin`, sin tapar a los que ya existen. */
export function defaultWidgetRect(type: WidgetType, existing: BoardWidget[], origin: { x: number; y: number }): Rect {
  const { w, h } = WIDGET_INFO[type];
  const x = existing.reduce((right, widget) => Math.max(right, widget.x + widget.w + GRID), origin.x);
  return { x: snap(x), y: snap(origin.y), w, h };
}
