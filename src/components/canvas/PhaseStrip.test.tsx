// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PHASE_TYPES, phaseFromType, type Phase } from '@/lib/board/phases';
import PhaseStrip from './PhaseStrip';

afterEach(cleanup);

const type = (kind: string) => PHASE_TYPES.find((t) => t.kind === kind)!;
const phases: Phase[] = [phaseFromType(type('volume'), 'a', 0), phaseFromType(type('deload'), 'b', 6)];

function setup(list = phases) {
  const handlers = { onSelect: vi.fn(), onPhasesChange: vi.fn(), onCreateAt: vi.fn() };
  render(<PhaseStrip origin={{ x: 0, y: 0 }} phases={list} selectedId={null} {...handlers} />);
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

  it('el plan indica cuántas semanas ocupa', () => {
    setup();
    expect(screen.getByText(/Plan de 7 semanas/)).toBeTruthy();
  });
});
