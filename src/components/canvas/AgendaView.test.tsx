// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PlanInput } from '@/lib/board/today';
import AgendaView from './AgendaView';

afterEach(cleanup);

const plan = {
  planStart: '2026-10-05',
  planWeeks: 4,
  phases: [],
  cycles: [{ id: 'g', name: 'Gimnasio', days: 7 }],
  blocks: [{ id: 'b1', cycleId: 'g', label: 'Empuje', color: '#123456', blockType: 'hypertrophy', subtype: '', dayStart: 0, daySpan: 1, lane: 0, zones: ['Pecho'], exercises: [{ exerciseId: 'e1', name: 'Press banca', sets: 4, reps: '8', notes: '' }], notes: '', icon: 'flame' }],
} as unknown as PlanInput;

describe('AgendaView', () => {
  it('muestra los ejercicios del día elegido y abre el bloque al tocarlo', () => {
    const open = vi.fn();
    render(<AgendaView plan={plan} today="2026-10-05" onOpenBlock={open} onShowBoard={vi.fn()} />);
    expect(screen.getByText('Press banca')).toBeTruthy();
    expect(screen.getByText('4 × 8')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Empuje/ }));
    expect(open).toHaveBeenCalledWith('b1');
  });
  it('un día sin bloques es descanso y la semana se puede cambiar', () => {
    render(<AgendaView plan={plan} today="2026-10-05" onOpenBlock={vi.fn()} onShowBoard={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: '2026-10-06' }));
    expect(screen.getByText('Día de descanso.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Semana siguiente' }));
    expect(screen.getByText(/Semana 2 de 4/)).toBeTruthy();
  });
  it('sin fecha de inicio lo explica', () => {
    render(<AgendaView plan={{ ...plan, planStart: null }} today="2026-10-05" onOpenBlock={vi.fn()} onShowBoard={vi.fn()} />);
    expect(screen.getByText(/Fija la fecha de inicio/)).toBeTruthy();
  });
});
