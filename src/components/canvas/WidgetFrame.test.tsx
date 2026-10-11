// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { stubPointerCapture } from '@/test-utils';
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
});
