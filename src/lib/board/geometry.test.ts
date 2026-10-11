import { describe, expect, it } from 'vitest';

import {
  DEFAULT_VIEWPORT,
  MAX_ZOOM,
  MIN_BLOCK,
  MIN_ZOOM,
  moveRect,
  resizeRect,
  BLOCK_LIMITS,
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

  it('resizeRect por el borde izquierdo o superior mueve el origen y deja quieto el lado opuesto', () => {
    const r = { x: 200, y: 100, w: 100, h: 60 };
    expect(resizeRect(r, 'w', -40, 999)).toEqual({ x: 160, y: 100, w: 140, h: 60 });
    expect(resizeRect(r, 'n', 999, -40)).toEqual({ x: 200, y: 60, w: 100, h: 100 });
    expect(resizeRect(r, 'nw', -20, -20)).toEqual({ x: 180, y: 80, w: 120, h: 80 });
    expect(resizeRect(r, 'sw', -20, 20)).toEqual({ x: 180, y: 100, w: 120, h: 80 });
    expect(resizeRect(r, 'ne', 20, -20)).toEqual({ x: 200, y: 80, w: 120, h: 80 });
  });

  it('al llegar al mínimo por la izquierda o arriba el lado opuesto sigue fijo', () => {
    const r = { x: 200, y: 100, w: 100, h: 60 };
    const small = resizeRect(r, 'nw', 9999, 9999);
    expect(small).toEqual({ x: 300 - MIN_BLOCK, y: 160 - MIN_BLOCK, w: MIN_BLOCK, h: MIN_BLOCK });
    expect(small.x + small.w).toBe(300);
    expect(small.y + small.h).toBe(160);
  });

  it('resizeRect respeta un máximo y un mínimo propios', () => {
    const limits = { min: { w: 240, h: 200 }, max: { w: 800, h: 800 } };
    const r = { x: 500, y: 500, w: 320, h: 400 };
    expect(resizeRect(r, 'se', 9999, 9999, 20, limits)).toMatchObject({ w: 800, h: 800 });
    expect(resizeRect(r, 'w', 9999, 0, 20, limits)).toEqual({ x: 580, y: 500, w: 240, h: 400 });
    expect(resizeRect(r, 'w', -9999, 0, 20, limits)).toEqual({ x: 20, y: 500, w: 800, h: 400 });
    expect(BLOCK_LIMITS.max.w).toBe(Number.POSITIVE_INFINITY);
  });
});
