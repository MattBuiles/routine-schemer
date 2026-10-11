export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 2.5;
export const GRID = 20;
export const MIN_BLOCK = GRID * 2;

export const DEFAULT_VIEWPORT: Viewport = { x: 0, y: 0, zoom: 1 };

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const snap = (value: number, step: number = GRID) => Math.round(value / step) * step;

export function screenToWorld(vp: Viewport, sx: number, sy: number) {
  return { x: (sx - vp.x) / vp.zoom, y: (sy - vp.y) / vp.zoom };
}

export function worldToScreen(vp: Viewport, wx: number, wy: number) {
  return { x: wx * vp.zoom + vp.x, y: wy * vp.zoom + vp.y };
}

/** Cambia el zoom manteniendo fijo el punto de pantalla (sx, sy). */
export function zoomAt(vp: Viewport, sx: number, sy: number, nextZoom: number): Viewport {
  const zoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
  const world = screenToWorld(vp, sx, sy);
  return { zoom, x: sx - world.x * zoom, y: sy - world.y * zoom };
}

export function panBy(vp: Viewport, dx: number, dy: number): Viewport {
  return { ...vp, x: vp.x + dx, y: vp.y + dy };
}

/** Normaliza un viewport recibido de fuera (p. ej. localStorage); devuelve el valor por defecto si es inválido. */
export function sanitizeViewport(value: unknown): Viewport {
  const v = value as Partial<Viewport> | null;
  if (!v || ![v.x, v.y, v.zoom].every((n) => typeof n === 'number' && Number.isFinite(n))) {
    return DEFAULT_VIEWPORT;
  }
  return { x: v.x as number, y: v.y as number, zoom: clamp(v.zoom as number, MIN_ZOOM, MAX_ZOOM) };
}

export function moveRect(rect: Rect, dx: number, dy: number, step: number = GRID): Rect {
  return { ...rect, x: snap(rect.x + dx, step), y: snap(rect.y + dy, step) };
}

/** Asas de redimensionado: lados (n, s, e, w) y esquinas. */
export type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface SizeLimits {
  min: { w: number; h: number };
  max: { w: number; h: number };
}

export const BLOCK_LIMITS: SizeLimits = {
  min: { w: MIN_BLOCK, h: MIN_BLOCK },
  max: { w: Number.POSITIVE_INFINITY, h: Number.POSITIVE_INFINITY },
};

/**
 * Redimensiona arrastrando un lado o una esquina, con ajuste a la cuadrícula y límites de tamaño.
 * El lado opuesto al asa se queda quieto: al tirar del borde izquierdo o superior cambia también la posición.
 */
export function resizeRect(
  rect: Rect,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  step: number = GRID,
  limits: SizeLimits = BLOCK_LIMITS,
): Rect {
  const grows = (size: number, delta: number, min: number, max: number) => clamp(snap(size + delta, step), min, max);
  let { x, y, w, h } = rect;

  if (handle.includes('e')) w = grows(rect.w, dx, limits.min.w, limits.max.w);
  if (handle.includes('w')) {
    w = grows(rect.w, -dx, limits.min.w, limits.max.w);
    x = rect.x + rect.w - w;
  }
  if (handle.includes('s')) h = grows(rect.h, dy, limits.min.h, limits.max.h);
  if (handle.includes('n')) {
    h = grows(rect.h, -dy, limits.min.h, limits.max.h);
    y = rect.y + rect.h - h;
  }
  return { x, y, w, h };
}
