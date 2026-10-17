// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { blockFromType, DEFAULT_BLOCK_TYPES, DAY_W, HEADER_H, LANE_H, type CycleBlock } from '@/lib/board/cycle';
import { pointer, stubPointerCapture } from '@/test-utils';
import CycleZone from './CycleZone';

const strength = DEFAULT_BLOCK_TYPES.find((t) => t.key === 'strength')!;
const cycle = { id: 'c1', name: 'Gimnasio', days: 7 };
const block = (id: string, dayStart: number, lane: number): CycleBlock => ({ ...blockFromType(strength, id, dayStart, lane, 'c1'), label: `Bloque ${id}` });

function setup(over: Partial<React.ComponentProps<typeof CycleZone>> = {}) {
  const handlers = {
    onSelect: vi.fn(),
    onBlocksChange: vi.fn(),
    onDelete: vi.fn(),
    onCycleDaysChange: vi.fn(),
    onCreateAt: vi.fn(),
    onNameChange: vi.fn(),
  };
  render(<CycleZone cycle={cycle} top={0} blocks={[block('a', 1, 0)]} selectedId={null} {...handlers} {...over} />);
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
    expect(screen.getByText(/7 días · se repite al terminar/)).toBeTruthy();
    expect((screen.getByLabelText('Nombre del ciclo') as HTMLInputElement).value).toBe('Gimnasio');
  });

  it('pinta los bloques en su día y carril', () => {
    setup({ blocks: [block('a', 2, 1)] });
    const el = screen.getByRole('group', { name: 'Bloque a' });
    // El bloque se pinta 5 px más pequeño por lado para separarlo de sus vecinos.
    expect([el.style.left, el.style.top, el.style.width]).toEqual([`${2 * DAY_W + 5}px`, `${HEADER_H + LANE_H + 5}px`, `${DAY_W - 10}px`]);
  });

  it('los botones piden añadir o quitar un día y respetan los límites', () => {
    const { onCycleDaysChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir día' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quitar día' }));
    expect(onCycleDaysChange.mock.calls).toEqual([[8], [6]]);
    cleanup();
    setup({ cycle: { ...cycle, days: 1 } });
    expect((screen.getByRole('button', { name: 'Quitar día' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('doble clic en un hueco crea en ese día y da el orden de inserción en la pila', () => {
    const { onCreateAt } = setup();
    fireEvent.doubleClick(screen.getByTestId('cycle-zone'), { clientX: DAY_W * 3 + 10, clientY: HEADER_H + LANE_H * 2 + LANE_H * 0.25 });
    expect(onCreateAt.mock.calls[0][0]).toBe(3);
    expect(onCreateAt.mock.calls[0][1]).toBeCloseTo(1.75);
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

  it('las flechas mueven el bloque de día en día y lo suben o bajan en la pila de su día', () => {
    const blocks = [block('a', 1, 0), block('b', 1, 1)];
    const { onBlocksChange } = setup({ blocks });
    const a = screen.getByRole('group', { name: 'Bloque a' });
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    fireEvent.keyDown(a, { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('group', { name: 'Bloque b' }), { key: 'ArrowUp' });
    const lanes = (call: number) => Object.fromEntries(onBlocksChange.mock.calls[call][0].map((x: CycleBlock) => [x.id, [x.dayStart, x.lane]]));
    expect(lanes(0)).toEqual({ a: [2, 0], b: [1, 0] }); // b sube solo: ya no comparte día con a
    expect(lanes(1)).toEqual({ a: [1, 1], b: [1, 0] }); // a baja y b pasa a la cima
    expect(lanes(2)).toEqual({ a: [1, 1], b: [1, 0] }); // b sube sobre a
  });

  it('un bloque único no se mueve de fila con las flechas', () => {
    const { onBlocksChange } = setup({ blocks: [block('a', 1, 0)] });
    fireEvent.keyDown(screen.getByRole('group', { name: 'Bloque a' }), { key: 'ArrowDown' });
    expect(onBlocksChange).not.toHaveBeenCalled();
  });

  it('Mayús + flechas cambian el ancho en días y el alto es fijo', () => {
    const { onBlocksChange } = setup({ blocks: [block('a', 1, 0)] });
    const el = screen.getByRole('group', { name: 'Bloque a' });
    fireEvent.keyDown(el, { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(el, { key: 'ArrowDown', shiftKey: true });
    expect(onBlocksChange).toHaveBeenCalledTimes(1);
    expect(onBlocksChange.mock.calls[0][0][0]).toMatchObject({ daySpan: 2 });
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
    setup({ dropPreview: { cycleId: 'c1', dayStart: 4, lane: 1, color: '#2563eb', label: 'Hipertrofia', icon: 'flame' } });
    const preview = screen.getByTestId('drop-preview');
    expect([preview.style.left, preview.style.top, preview.textContent]).toEqual([`${4 * DAY_W + 5}px`, `${HEADER_H + LANE_H + 5}px`, 'Hipertrofia']);
  });

  it('el bloque seleccionado se ensancha tirando de su borde izquierdo (cambia el día de inicio y los días que abarca)', () => {
    const { onBlocksChange } = setup({ blocks: [block('a', 2, 0)], selectedId: 'a' });
    const handle = screen.getByRole('group', { name: 'Bloque a' }).querySelector('[data-handle="w"]')!;
    act(() => {
      pointer(handle, 'pointerdown', { clientX: 0 });
      pointer(handle, 'pointermove', { clientX: -DAY_W });
      pointer(handle, 'pointerup', { clientX: -DAY_W });
    });
    expect(onBlocksChange.mock.calls[0][0][0]).toMatchObject({ dayStart: 1, daySpan: 2 });
  });

  it('tirar del borde derecho añade días y el bloque no tiene asa inferior', () => {
    const { onBlocksChange } = setup({ blocks: [block('a', 2, 0)], selectedId: 'a' });
    const el = screen.getByRole('group', { name: 'Bloque a' });
    const handle = el.querySelector('[data-handle="e"]')!;
    act(() => {
      pointer(handle, 'pointerdown', { clientX: 0 });
      pointer(handle, 'pointermove', { clientX: DAY_W * 2 });
      pointer(handle, 'pointerup', { clientX: DAY_W * 2 });
    });
    expect(onBlocksChange.mock.calls[0][0][0]).toMatchObject({ dayStart: 2, daySpan: 3 });
    expect(el.querySelector('[data-handle="s"]')).toBeNull();
    expect(el.querySelector('[data-handle="se"]')).toBeNull();
  });

  it('crece la zona con la pila: filas usadas más una libre, con un mínimo de tres', () => {
    setup({ blocks: [block('a', 0, 0)] });
    expect(screen.getByTestId('cycle-zone').style.height).toBe(`${HEADER_H + 3 * LANE_H}px`);
    cleanup();
    setup({ blocks: [block('a', 0, 0), block('b', 0, 1), block('c', 0, 2), block('d', 0, 3)] });
    expect(screen.getByTestId('cycle-zone').style.height).toBe(`${HEADER_H + 5 * LANE_H}px`);
  });

  it('el nombre se guarda al salir del campo y un nombre vacío vuelve a «Ciclo»', () => {
    const { onNameChange } = setup();
    const input = screen.getByLabelText('Nombre del ciclo') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '  Cardio  ' } });
    fireEvent.blur(input);
    expect(onNameChange).toHaveBeenLastCalledWith('Cardio');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.blur(input);
    expect(onNameChange).toHaveBeenLastCalledWith('Ciclo');
  });

  it('no guarda nada si el nombre no cambió y Enter confirma', () => {
    const { onNameChange } = setup();
    const input = screen.getByLabelText('Nombre del ciclo') as HTMLInputElement;
    fireEvent.blur(input);
    expect(onNameChange).not.toHaveBeenCalled();
    input.focus();
    fireEvent.change(input, { target: { value: 'Otro' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onNameChange).toHaveBeenCalledWith('Otro');
  });

  it('solo se puede eliminar el ciclo cuando hay más de uno', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Eliminar ciclo' })).toBeNull();
    cleanup();
    const onDeleteCycle = vi.fn();
    setup({ onDeleteCycle });
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar ciclo' }));
    expect(onDeleteCycle).toHaveBeenCalledTimes(1);
  });

  it('la vista previa de otro ciclo no se pinta aquí', () => {
    setup({ dropPreview: { cycleId: 'otro', dayStart: 1, lane: 0, color: '#2563eb', label: 'Hipertrofia', icon: 'flame' } });
    expect(screen.queryByTestId('drop-preview')).toBeNull();
  });

  it('la zona se coloca a la altura que le da su posición en la pila de ciclos', () => {
    setup({ top: 700 });
    const zone = screen.getByTestId('cycle-zone').parentElement as HTMLElement;
    expect(zone.style.top).toBe(`${260 + 700}px`);
    expect(screen.getByTestId('cycle-zone').getAttribute('data-cycle-id')).toBe('c1');
  });
});
