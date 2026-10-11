// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_BLOCK_TYPES, resolveTypes } from '@/lib/board/cycle';
import { PHASE_TYPES } from '@/lib/board/phases';
import Palette from './Palette';

afterEach(cleanup);

function setup(types = [...DEFAULT_BLOCK_TYPES]) {
  const h = { onAdd: vi.fn(), onDragMove: vi.fn(), onDropType: vi.fn(), onDeleteCustom: vi.fn(), onAddPhase: vi.fn() };
  render(<Palette types={types} phaseTypes={PHASE_TYPES} {...h} />);
  return h;
}

const pointer = (type: string, init: PointerEventInit) => fireEvent(window, new MouseEvent(type, { bubbles: true, ...init }));

describe('Palette', () => {
  it('un clic añade el enfoque en el primer hueco', () => {
    const { onAdd, onDropType } = setup();
    const chip = screen.getByRole('button', { name: /Fuerza/ });
    fireEvent.pointerDown(chip, { clientX: 10, clientY: 10 });
    pointer('pointerup', { clientX: 10, clientY: 10 });
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ key: 'strength' }));
    expect(onDropType).not.toHaveBeenCalled();
  });

  it('arrastrar más allá del umbral informa del movimiento y suelta el enfoque donde acaba', () => {
    const { onAdd, onDragMove, onDropType } = setup();
    fireEvent.pointerDown(screen.getByRole('button', { name: /Hipertrofia/ }), { clientX: 10, clientY: 10 });
    pointer('pointermove', { clientX: 200, clientY: 300 });
    expect(onDragMove).toHaveBeenLastCalledWith(expect.objectContaining({ key: 'hypertrophy' }), 200, 300);
    pointer('pointerup', { clientX: 210, clientY: 310 });
    expect(onDropType).toHaveBeenCalledWith(expect.objectContaining({ key: 'hypertrophy' }), 210, 310);
    expect(onDragMove).toHaveBeenLastCalledWith(null, 210, 310);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('un movimiento por debajo del umbral sigue siendo un clic', () => {
    const { onAdd, onDropType } = setup();
    fireEvent.pointerDown(screen.getByRole('button', { name: /Potencia/ }), { clientX: 10, clientY: 10 });
    pointer('pointermove', { clientX: 12, clientY: 12 });
    pointer('pointerup', { clientX: 12, clientY: 12 });
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onDropType).not.toHaveBeenCalled();
  });

  it('Enter añade con teclado', () => {
    const { onAdd } = setup();
    fireEvent.keyDown(screen.getByRole('button', { name: /Descanso/ }), { key: 'Enter' });
    expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ key: 'rest' }));
  });

  it('muestra la descripción del enfoque al pasar por encima', () => {
    setup();
    expect(screen.getByText(/Clic para añadir/)).toBeTruthy();
    fireEvent.pointerEnter(screen.getByRole('button', { name: /Descanso/ }));
    expect(screen.getByText('Día libre de entrenamiento')).toBeTruthy();
  });

  it('solo los enfoques propios se pueden borrar', () => {
    const { onDeleteCustom } = setup(resolveTypes([{ id: 'c1', name: 'Mi tipo', color: '#112233', icon: 'zap' }]));
    expect(screen.queryByRole('button', { name: 'Eliminar enfoque Fuerza' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar enfoque Mi tipo' }));
    expect(onDeleteCustom).toHaveBeenCalledWith('c1');
  });

  it('las fases de la paleta se añaden con un clic', () => {
    const { onAddPhase } = setup();
    fireEvent.click(document.querySelector('[data-phase-type="peaking"]')!);
    expect(onAddPhase).toHaveBeenCalledWith(expect.objectContaining({ kind: 'peaking' }));
  });
});
