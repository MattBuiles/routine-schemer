// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHASE_TYPES, phaseFromType, type Phase } from '@/lib/board/phases';
import { pointer, stubPointerCapture } from '@/test-utils';
import PhaseStrip from './PhaseStrip';

beforeEach(stubPointerCapture);
afterEach(cleanup);

const type = (kind: string) => PHASE_TYPES.find((t) => t.kind === kind)!;
const phases: Phase[] = [phaseFromType(type('volume'), 'a', 0), phaseFromType(type('deload'), 'b', 6)];

function setup(list = phases, planWeeks = 16) {
  const handlers = { onSelect: vi.fn(), onPhasesChange: vi.fn(), onCreateAt: vi.fn(), onPlanWeeksChange: vi.fn() };
  render(<PhaseStrip origin={{ x: 0, y: 0 }} phases={list} planWeeks={planWeeks} selectedId={null} planStart={null} onPlanStartChange={vi.fn()} {...handlers} />);
  return handlers;
}

describe('PhaseStrip', () => {
  it('pinta cada fase con su posición y anchura en semanas', () => {
    setup();
    const a = screen.getByRole('group', { name: 'Fase Volumen' });
    const b = screen.getByRole('group', { name: 'Fase Descarga' });
    // Cada fase se pinta 3 px más pequeña por lado para separarla de las contiguas.
    expect([a.style.left, a.style.width]).toEqual(['3px', '154px']);
    expect([b.style.left, b.style.width]).toEqual(['243px', '34px']);
  });

  it('las flechas mueven la fase y Mayús+flecha cambia su duración', () => {
    const { onPhasesChange } = setup();
    const a = screen.getByRole('group', { name: 'Fase Volumen' });
    fireEvent.keyDown(a, { key: 'ArrowRight' });
    expect(onPhasesChange.mock.calls[0][0].find((p: Phase) => p.id === 'a').startWeek).toBe(1);

    fireEvent.keyDown(a, { key: 'ArrowRight', shiftKey: true });
    expect(onPhasesChange.mock.calls[1][0].find((p: Phase) => p.id === 'a').weeks).toBe(5);
  });

  it('no deja que una fase pise a la siguiente', () => {
    const { onPhasesChange } = setup([phaseFromType(type('volume'), 'a', 0), phaseFromType(type('deload'), 'b', 4)]);
    fireEvent.keyDown(screen.getByRole('group', { name: 'Fase Volumen' }), { key: 'ArrowRight' });
    expect(onPhasesChange).not.toHaveBeenCalled();
  });

  it('enfocar una fase la selecciona', () => {
    const { onSelect } = setup();
    fireEvent.focus(screen.getByRole('group', { name: 'Fase Volumen' }));
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('el plan indica su duración total y que se repite', () => {
    setup();
    expect(screen.getByText(/Plan de 16 semanas.*se repite al terminar/)).toBeTruthy();
  });

  it('la franja tiene exactamente una columna por semana del plan', () => {
    setup(phases, 10);
    const strip = screen.getByTestId('phase-strip');
    expect(strip.style.width).toBe('400px');
    expect(strip.querySelectorAll('[data-tick].absolute.top-0')).toHaveLength(10);
  });

  it('los botones piden alargar o acortar el plan y respetan los límites 1–52', () => {
    const { onPlanWeeksChange } = setup(phases, 10);
    fireEvent.click(screen.getByRole('button', { name: 'Añadir semana al plan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quitar semana al plan' }));
    expect(onPlanWeeksChange.mock.calls).toEqual([[11], [9]]);
    cleanup();
    setup(phases, 1);
    expect((screen.getByRole('button', { name: 'Quitar semana al plan' }) as HTMLButtonElement).disabled).toBe(true);
    cleanup();
    setup(phases, 52);
    expect((screen.getByRole('button', { name: 'Añadir semana al plan' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('una fase no se puede mover ni alargar más allá del final del plan', () => {
    const { onPhasesChange } = setup([phaseFromType(type('volume'), 'a', 0), phaseFromType(type('deload'), 'b', 6)], 7);
    const b = screen.getByRole('group', { name: 'Fase Descarga' });
    fireEvent.keyDown(b, { key: 'ArrowRight' });
    fireEvent.keyDown(b, { key: 'ArrowRight', shiftKey: true });
    expect(onPhasesChange).not.toHaveBeenCalled();
  });

  it('la semana de hoy se cuenta dentro de la vuelta actual del plan', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-12-14T12:00:00')); // semana 10 desde el 12 oct: con un plan de 4 semanas, la 2
    render(<PhaseStrip origin={{ x: 0, y: 0 }} phases={phases} planWeeks={4} selectedId={null} planStart="2026-10-12" onPlanStartChange={vi.fn()} onSelect={vi.fn()} onPhasesChange={vi.fn()} onCreateAt={vi.fn()} onPlanWeeksChange={vi.fn()} />);
    expect(screen.getByText(/hoy: semana 2 de 4/)).toBeTruthy();
    vi.useRealTimers();
  });

  const weeks = (call: Phase[]) => call.map((p) => [p.id, p.startWeek, p.weeks]);
  const dragHandle = (phaseName: string, side: 'w' | 'e', dx: number) => {
    const handle = screen.getByRole('group', { name: `Fase ${phaseName}` }).querySelector(`[data-handle="${side}"]`)!;
    act(() => {
      pointer(handle, 'pointerdown', { clientX: 0 });
      pointer(handle, 'pointermove', { clientX: dx });
      pointer(handle, 'pointerup', { clientX: dx });
    });
  };

  it('tiene un asa visible en cada extremo de la fase', () => {
    setup();
    const group = screen.getByRole('group', { name: 'Fase Volumen' });
    expect([...group.querySelectorAll('[data-handle]')].map((h) => h.getAttribute('data-handle')).sort()).toEqual(['e', 'w']);
  });

  it('arrastrar el asa derecha suma semanas (cada semana son 40 px) y empuja a la fase contigua', () => {
    const contiguous = [phaseFromType(type('volume'), 'a', 0), phaseFromType(type('deload'), 'b', 4)];
    const { onPhasesChange } = setup(contiguous);
    dragHandle('Volumen', 'e', 80);
    expect(weeks(onPhasesChange.mock.calls[0][0])).toEqual([['a', 0, 6], ['b', 6, 1]]);
  });

  it('arrastrar el asa derecha hacia la izquierda recorta semanas', () => {
    const { onPhasesChange } = setup();
    dragHandle('Volumen', 'e', -80);
    expect(weeks(onPhasesChange.mock.calls[0][0]).slice(0, 1)).toEqual([['a', 0, 2]]);
  });

  it('arrastrar el asa izquierda cambia la primera semana y deja fijo el final', () => {
    const { onPhasesChange } = setup([phaseFromType(type('volume'), 'a', 4)]);
    dragHandle('Volumen', 'w', -80);
    expect(weeks(onPhasesChange.mock.calls[0][0])).toEqual([['a', 2, 6]]);
  });

  it('el asa izquierda no invade a la fase anterior', () => {
    const { onPhasesChange } = setup([phaseFromType(type('volume'), 'a', 0), phaseFromType(type('intensity'), 'b', 4)]);
    dragHandle('Intensidad', 'w', -400);
    expect(onPhasesChange).not.toHaveBeenCalled(); // ya estaba pegada a la anterior: nada cambia
  });
});
