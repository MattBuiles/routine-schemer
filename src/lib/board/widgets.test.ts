import { describe, expect, it } from 'vitest';

import { MAX_WIDGET, MIN_WIDGET, defaultWidgetRect, sanitizeWidgets, type BoardWidget } from './widgets';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const widget = (over: Record<string, unknown> = {}) => ({ id: id(1), type: 'habits', x: 40, y: 60, w: 320, h: 400, ...over });

describe('sanitizeWidgets', () => {
  it('tolera entradas que no son una lista', () => {
    for (const bad of [null, undefined, 3, 'x', {}]) expect(sanitizeWidgets(bad)).toEqual([]);
  });

  it('descarta ids inválidos, tipos desconocidos y duplicados por tipo o id', () => {
    const out = sanitizeWidgets([
      widget({ id: 'no-uuid' }),
      widget({ id: id(2), type: 'historial' }),
      widget(),
      widget({ id: id(3) }),
      widget({ id: id(1), type: 'notes' }),
    ]);
    expect(out.map((w) => [w.id, w.type])).toEqual([[id(1), 'habits']]);
  });

  it('limita tamaños y coordenadas, y ajusta a la cuadrícula', () => {
    const [w] = sanitizeWidgets([widget({ w: 1, h: 99999, x: 1e9, y: -1e9 })]);
    expect(w.w).toBe(MIN_WIDGET.w);
    expect(w.h).toBe(MAX_WIDGET.h);
    expect(w.x).toBe(20000);
    expect(w.y).toBe(-20000);
    expect(sanitizeWidgets([widget({ x: 33 })])[0].x % 20).toBe(0);
  });

  it('usa tamaño por defecto si faltan medidas e ignora claves ajenas', () => {
    const [w] = sanitizeWidgets([{ ...widget({ w: undefined, h: 'x' }), userId: 'atacante' }]);
    expect(Object.keys(w).sort()).toEqual(['h', 'id', 'type', 'w', 'x', 'y']);
    expect(w.w).toBe(320);
    expect(w.h).toBe(400);
  });
});

describe('defaultWidgetRect', () => {
  const origin = { x: 240, y: 780 };

  it('el primero va en el origen y el siguiente a su derecha', () => {
    expect(defaultWidgetRect('habits', [], origin)).toMatchObject({ x: 240, y: 780, w: 320, h: 400 });
    const first: BoardWidget = { id: id(1), type: 'habits', x: 240, y: 780, w: 320, h: 400 };
    expect(defaultWidgetRect('notes', [first], origin).x).toBe(240 + 320 + 20);
  });
});
