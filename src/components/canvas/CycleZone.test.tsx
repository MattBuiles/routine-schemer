// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { blockFromType, DEFAULT_BLOCK_TYPES, DAY_W, HEADER_H, LANE_H, type CycleBlock } from '@/lib/board/cycle';
import { stubPointerCapture } from '@/test-utils';
import CycleZone from './CycleZone';

const strength = DEFAULT_BLOCK_TYPES.find((t) => t.key === 'strength')!;
const block = (id: string, dayStart: number, lane: number): CycleBlock => ({ ...blockFromType(strength, id, dayStart, lane), label: `Bloque ${id}` });

function setup(over: Partial<React.ComponentProps<typeof CycleZone>> = {}) {
  const handlers = {
    onSelect: vi.fn(),
    onBlocksChange: vi.fn(),
    onDelete: vi.fn(),
    onCycleDaysChange: vi.fn(),
    onCreateAt: vi.fn(),
  };
  render(<CycleZone cycleDays={7} blocks={[block('a', 1, 0)]} selectedId={null} {...handlers} {...over} />);
  return handlers;
}

beforeEach(() => {
  stubPointerCapture();
  // jsdom no calcula layout: la zona mide lo que mide en pantalla al 100 % de zoom.
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const zone = this.getAttribute('data-testid') === 'cycle-zone';
    return { x: 0, y: 0, left: 0, top: 0, right: 7 * DAY_W, bottom: 600, width: zone ? 7 * DAY_W : 0, height: zone ? 600 : 0, toJSON() {} };
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('CycleZone', () => {
  it('muestra una columna por día y el resumen del ciclo', () => {
    setup();
    for (let d = 1; d <= 7; d++) expect(screen.getByText(`Día ${d}`)).toBeTruthy();
    expect(screen.getByText(/Ciclo de 7 días/)).toBeTruthy();
  });

  it('pinta los bloques en su día y carril', () => {
    setup({ blocks: [block('a', 2, 1)] });
    const el = screen.getByRole('group', { name: 'Bloque a' });
    expect([el.style.left, el.style.top]).toEqual([`${2 * DAY_W}px`, `${HEADER_H + LANE_H}px`]);
  });

  it('los botones piden añadir o quitar un día y respetan los límites', () => {
    const { onCycleDaysChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir día' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quitar día' }));
    expect(onCycleDaysChange.mock.calls).toEqual([[8], [6]]);
    cleanup();
    setup({ cycleDays: 1 });
    expect((screen.getByRole('button', { name: 'Quitar día' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('doble clic en un hueco crea en ese día y carril', () => {
    const { onCreateAt } = setup();
    fireEvent.doubleClick(screen.getByTestId('cycle-zone'), { clientX: DAY_W * 3 + 10, clientY: HEADER_H + LANE_H * 2 + 10 });
    expect(onCreateAt).toHaveBeenCalledWith(3, 2);
  });

  it('doble clic sobre la cabecera de días no crea nada', () => {
    const { onCreateAt } = setup();
    fireEvent.doubleClick(screen.getByTestId('cycle-zone'), { clientX: 50, clientY: 10 });
    expect(onCreateAt).not.toHaveBeenCalled();
  });

  it('Supr elimina el bloque seleccionado', () => {
    const { onDelete } = setup({ selectedId: 'a' });
    fireEvent.keyDown(screen.getByRole('group', { name: 'Bloque a' }), { key: 'Delete' });
    expect(onDelete).toHaveBeenCalledWith('a');
  });

  it('las flechas mueven el bloque de día en día y de carril en carril', () => {
    const { onBlocksChange } = setup({ blocks: [block('a', 1, 0)] });
    const el = screen.getByRole('group', { name: 'Bloque a' });
    fireEvent.keyDown(el, { key: 'ArrowRight' });
    fireEvent.keyDown(el, { key: 'ArrowDown' });
    expect(onBlocksChange.mock.calls[0][0][0]).toMatchObject({ dayStart: 2, lane: 0 });
    expect(onBlocksChange.mock.calls[1][0][0]).toMatchObject({ dayStart: 1, lane: 1 });
  });

  it('Mayús + flechas cambian el ancho en días y la carga', () => {
    const { onBlocksChange } = setup({ blocks: [block('a', 1, 0)] });
    const el = screen.getByRole('group', { name: 'Bloque a' });
    fireEvent.keyDown(el, { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(el, { key: 'ArrowDown', shiftKey: true });
    expect(onBlocksChange.mock.calls[0][0][0]).toMatchObject({ daySpan: 2 });
    expect(onBlocksChange.mock.calls[1][0][0]).toMatchObject({ load: strength.defaultLoad + 1 });
  });

  it('no mueve un bloque fuera del ciclo', () => {
    const { onBlocksChange } = setup({ blocks: [block('a', 0, 0)] });
    fireEvent.keyDown(screen.getByRole('group', { name: 'Bloque a' }), { key: 'ArrowLeft' });
    expect(onBlocksChange).not.toHaveBeenCalled();
  });

  it('seleccionar un bloque enfocándolo lo notifica', () => {
    const { onSelect } = setup();
    fireEvent.focus(screen.getByRole('group', { name: 'Bloque a' }));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('muestra la vista previa del hueco cuando se arrastra desde la paleta', () => {
    setup({ dropPreview: { dayStart: 4, lane: 1, color: '#2563eb', label: 'Hipertrofia', icon: 'flame' } });
    const preview = screen.getByTestId('drop-preview');
    expect([preview.style.left, preview.style.top, preview.textContent]).toEqual([`${4 * DAY_W}px`, `${HEADER_H + LANE_H}px`, 'Hipertrofia']);
  });
});
