import { describe, expect, it } from 'vitest';

import {
  DEFAULT_VIEWPORT,
  MAX_ZOOM,
  MIN_BLOCK,
  MIN_ZOOM,
  moveRect,
  resizeRect,
  sanitizeViewport,
  screenToWorld,
  snap,
  worldToScreen,
  zoomAt,
} from './geometry';

describe('viewport', () => {
  it('screenToWorld y worldToScreen son inversas', () => {
    const vp = { x: 40, y: -30, zoom: 1.5 };
    const w = screenToWorld(vp, 300, 200);
    const s = worldToScreen(vp, w.x, w.y);
    expect(s.x).toBeCloseTo(300);
    expect(s.y).toBeCloseTo(200);
  });

  it('zoomAt mantiene fijo el punto bajo el cursor', () => {
    const vp = { x: 10, y: 20, zoom: 1 };
    const before = screenToWorld(vp, 250, 180);
    const next = zoomAt(vp, 250, 180, 2);
    const after = screenToWorld(next, 250, 180);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it('zoomAt respeta los límites', () => {
    expect(zoomAt(DEFAULT_VIEWPORT, 0, 0, 100).zoom).toBe(MAX_ZOOM);
    expect(zoomAt(DEFAULT_VIEWPORT, 0, 0, 0.001).zoom).toBe(MIN_ZOOM);
  });

  it('sanitizeViewport descarta valores inválidos', () => {
    expect(sanitizeViewport(null)).toEqual(DEFAULT_VIEWPORT);
    expect(sanitizeViewport({ x: 'a', y: 0, zoom: 1 })).toEqual(DEFAULT_VIEWPORT);
    expect(sanitizeViewport({ x: 1, y: 2, zoom: 50 })).toEqual({ x: 1, y: 2, zoom: MAX_ZOOM });
  });
});

describe('bloques', () => {
  it('snap ajusta a la cuadrícula', () => {
    expect(snap(29)).toBe(20);
    expect(snap(31)).toBe(40);
  });

  it('moveRect mueve con ajuste y conserva el tamaño', () => {
    expect(moveRect({ x: 0, y: 0, w: 100, h: 60 }, 33, -47)).toEqual({ x: 40, y: -40, w: 100, h: 60 });
  });

  it('resizeRect respeta el mínimo y el asa elegida', () => {
    const r = { x: 0, y: 0, w: 100, h: 60 };
    expect(resizeRect(r, 'e', -500, 999)).toEqual({ ...r, w: MIN_BLOCK });
    expect(resizeRect(r, 's', 999, 41)).toEqual({ ...r, h: 100 });
    expect(resizeRect(r, 'se', 20, 20)).toEqual({ ...r, w: 120, h: 80 });
  });
});
