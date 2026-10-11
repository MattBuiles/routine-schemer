// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { act } from '@testing-library/react';
import { pointer, stubPointerCapture } from '@/test-utils';
import WidgetFrame from './WidgetFrame';

beforeEach(stubPointerCapture);
afterEach(cleanup);

function setup(selected = false) {
  const h = { onSelect: vi.fn(), onGestureStart: vi.fn(), onRectChange: vi.fn(), onGestureEnd: vi.fn(), onClose: vi.fn() };
  render(
    <WidgetFrame rect={{ x: 100, y: 200, w: 320, h: 400 }} title="Notas" icon={<span />} selected={selected} {...h}>
      <button>dentro</button>
    </WidgetFrame>,
  );
  return h;
}

describe('WidgetFrame', () => {
  it('se coloca con su rectángulo y muestra su contenido interactivo', () => {
    setup();
    const frame = screen.getByRole('region', { name: 'Notas' });
    expect([frame.style.left, frame.style.top, frame.style.width, frame.style.height]).toEqual(['100px', '200px', '320px', '400px']);
    expect(screen.getByRole('button', { name: 'dentro' })).toBeTruthy();
  });

  it('cerrar avisa sin iniciar un arrastre', () => {
    const { onClose, onGestureStart } = setup();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Cerrar Notas' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar Notas' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onGestureStart).not.toHaveBeenCalled();
  });

  it('tocar el contenido selecciona el widget pero no lo arrastra', () => {
    const { onSelect, onGestureStart } = setup();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'dentro' }));
    expect(onSelect).toHaveBeenCalled();
    expect(onGestureStart).not.toHaveBeenCalled();
  });

  it('arrastrar la cabecera inicia y termina un gesto', () => {
    const { onGestureStart, onGestureEnd, onSelect } = setup();
    const header = screen.getByRole('heading', { name: 'Notas' }).parentElement!;
    fireEvent.pointerDown(header, { pointerId: 1, clientX: 0, clientY: 0 });
    expect(onSelect).toHaveBeenCalled();
    expect(onGestureStart).toHaveBeenCalledOnce();
    fireEvent.pointerUp(header, { pointerId: 1 });
    expect(onGestureEnd).toHaveBeenCalledOnce();
  });

  it('resalta el widget seleccionado', () => {
    setup(true);
    expect(screen.getByRole('region', { name: 'Notas' }).className).toContain('ring-accent');
  });

  const handle = (name: string) => document.querySelector(`[data-handle="${name}"]`)!;
  const drag = (name: string, dx: number, dy: number) => {
    act(() => {
      pointer(handle(name), 'pointerdown', { clientX: 0, clientY: 0 });
      pointer(handle(name), 'pointermove', { clientX: dx, clientY: dy });
      pointer(handle(name), 'pointerup', { clientX: dx, clientY: dy });
    });
  };

  it('tiene asas en los cuatro lados y las cuatro esquinas', () => {
    setup();
    expect([...document.querySelectorAll('[data-handle]')].map((h) => h.getAttribute('data-handle')).sort()).toEqual(['e', 'n', 'ne', 'nw', 's', 'se', 'sw', 'w']);
  });

  it.each([
    ['e', 40, 0, { x: 100, y: 200, w: 360, h: 400 }],
    ['s', 0, 60, { x: 100, y: 200, w: 320, h: 460 }],
    ['w', -40, 0, { x: 60, y: 200, w: 360, h: 400 }],
    ['n', 0, -60, { x: 100, y: 140, w: 320, h: 460 }],
    ['nw', -20, -20, { x: 80, y: 180, w: 340, h: 420 }],
    ['se', 20, 20, { x: 100, y: 200, w: 340, h: 420 }],
  ] as const)('arrastrar el asa %s redimensiona y desplaza lo justo', (name, dx, dy, expected) => {
    const { onRectChange, onGestureStart, onGestureEnd } = setup();
    drag(name, dx, dy);
    expect(onGestureStart).toHaveBeenCalledOnce();
    expect(onRectChange).toHaveBeenLastCalledWith(expected);
    expect(onGestureEnd).toHaveBeenCalledOnce();
  });

  it('respeta el tamaño mínimo y el máximo y el lado opuesto no se mueve', () => {
    const { onRectChange } = setup();
    drag('w', 5000, 0);
    expect(onRectChange).toHaveBeenLastCalledWith({ x: 180, y: 200, w: 240, h: 400 }); // borde derecho fijo en 420
    drag('e', 5000, 0);
    expect(onRectChange).toHaveBeenLastCalledWith({ x: 100, y: 200, w: 800, h: 400 });
  });
});
