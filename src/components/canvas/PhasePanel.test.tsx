// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PHASE_TYPES, phaseFromType } from '@/lib/board/phases';
import PhasePanel from './PhasePanel';

afterEach(cleanup);

const volume = PHASE_TYPES.find((t) => t.kind === 'volume')!;
const basePhase = { ...phaseFromType(volume, 'p1', 4), volumePct: 0, intensityPct: 0, rampSets: 1, rampLoad: 0, deloadLast: false };

function setup(over: Partial<typeof basePhase> = {}, exerciseSets = [3]) {
  const handlers = { onResize: vi.fn(), onChange: vi.fn(), onDelete: vi.fn(), onClose: vi.fn() };
  render(<PhasePanel phase={{ ...basePhase, ...over }} exerciseSets={exerciseSets} {...handlers} />);
  return handlers;
}

describe('PhasePanel', () => {
  it('proyecta semana a semana con la numeración del plan', () => {
    setup();
    const rows = within(screen.getByRole('table', { name: 'Proyección semana a semana' })).getAllByRole('row').slice(1);
    expect(rows.map((r) => r.textContent)).toEqual(['53100%', '64100%', '75100%', '86100%']);
  });

  it('sin ejercicios no inventa series y lo explica', () => {
    setup({}, []);
    expect(screen.getByText(/Añade ejercicios a los bloques/)).toBeTruthy();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('cambiar de tipo aplica los valores por defecto y el nombre del tipo', () => {
    const { onChange } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Peaking' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ kind: 'peaking', name: 'Peaking', color: '#f59e0b', volumePct: -25, intensityPct: 10 }));
  });

  it('cambiar de tipo conserva un nombre personalizado', () => {
    const { onChange } = setup({ name: 'Bloque de verano' });
    fireEvent.click(screen.getByRole('button', { name: 'Intensidad' }));
    expect(onChange.mock.calls[0][0]).not.toHaveProperty('name');
  });

  it('los botones de duración piden el cambio de semanas', () => {
    const { onResize } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir una semana' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quitar una semana' }));
    expect(onResize.mock.calls).toEqual([[5], [3]]);
  });

  it('una fase de una semana no deja quitar más ni marcar descarga final', () => {
    setup({ weeks: 1 });
    expect((screen.getByRole('button', { name: 'Quitar una semana' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('switch') as HTMLInputElement).disabled).toBe(true);
  });

  it('la rampa y la descarga final emiten cambios acotados', () => {
    const { onChange } = setup();
    fireEvent.change(screen.getByLabelText('Series extra por semana'), { target: { value: '9' } });
    fireEvent.change(screen.getByLabelText('Carga extra por semana'), { target: { value: '-50' } });
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange.mock.calls).toEqual([[{ rampSets: 3 }], [{ rampLoad: -10 }], [{ deloadLast: true }]]);
  });

  it('eliminar y cerrar avisan al padre', () => {
    const { onDelete, onClose } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar fase' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
