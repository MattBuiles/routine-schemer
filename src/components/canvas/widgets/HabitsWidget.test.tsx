// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getDateString } from '@/lib/utils';
import { renderWithStrata } from '@/test-utils';

const actions = vi.hoisted(() => ({
  getHabits: vi.fn(),
  getHabitRecords: vi.fn(),
  setHabitRecord: vi.fn(),
  createHabit: vi.fn(),
  deleteHabit: vi.fn(),
}));
vi.mock('@/app/actions/habits', () => actions);

import HabitsWidget from './HabitsWidget';

const today = getDateString(new Date());
const habit = (over = {}) => ({ id: 'h1', userId: 'u', name: 'Agua', type: 'custom', target: 8, unit: 'vasos', color: '#3b82f6', icon: 'Target', isActive: true, createdAt: new Date(), updatedAt: new Date(), ...over });

beforeEach(() => {
  Object.values(actions).forEach((fn) => fn.mockReset());
  actions.getHabits.mockResolvedValue([habit()]);
  actions.getHabitRecords.mockResolvedValue([{ id: 'r1', habitId: 'h1', userId: 'u', date: today, value: 2, createdAt: new Date() }]);
  actions.setHabitRecord.mockResolvedValue({});
});
afterEach(cleanup);

describe('HabitsWidget', () => {
  it('muestra los hábitos activos con el valor de hoy y la barra de progreso', async () => {
    actions.getHabits.mockResolvedValue([habit(), habit({ id: 'h2', name: 'Inactivo', isActive: false })]);
    renderWithStrata(<HabitsWidget />);
    expect(await screen.findByText('2 / 8 vasos')).toBeTruthy();
    expect(screen.queryByText('Inactivo')).toBeNull();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('25');
    expect(actions.getHabitRecords).toHaveBeenCalledWith({ from: today, to: today });
  });

  it('sumar y restar guardan el registro de hoy y actualizan al instante', async () => {
    renderWithStrata(<HabitsWidget />);
    fireEvent.click(await screen.findByRole('button', { name: 'Sumar Agua' }));
    expect(await screen.findByText('3 / 8 vasos')).toBeTruthy();
    expect(actions.setHabitRecord).toHaveBeenLastCalledWith('h1', today, 3);
    fireEvent.click(screen.getByRole('button', { name: 'Restar Agua' }));
    expect(await screen.findByText('2 / 8 vasos')).toBeTruthy();
    expect(actions.setHabitRecord).toHaveBeenLastCalledWith('h1', today, 2);
  });

  it('no baja de cero', async () => {
    actions.getHabitRecords.mockResolvedValue([]);
    renderWithStrata(<HabitsWidget />);
    fireEvent.click(await screen.findByRole('button', { name: 'Restar Agua' }));
    expect(actions.setHabitRecord).not.toHaveBeenCalled();
  });

  it('si guardar falla, revierte el valor y avisa', async () => {
    actions.setHabitRecord.mockRejectedValue(new Error('x'));
    renderWithStrata(<HabitsWidget />);
    fireEvent.click(await screen.findByRole('button', { name: 'Sumar Agua' }));
    expect(await screen.findByText('No se pudo guardar el registro.')).toBeTruthy();
    expect(screen.getByText('2 / 8 vasos')).toBeTruthy();
  });

  it('crea un hábito nuevo con los datos del formulario', async () => {
    actions.createHabit.mockResolvedValue(habit({ id: 'h9', name: 'Pasos', target: 10000, unit: 'pasos' }));
    renderWithStrata(<HabitsWidget />);
    fireEvent.click(await screen.findByRole('button', { name: 'Nuevo hábito' }));
    fireEvent.change(screen.getByLabelText('Nombre del hábito'), { target: { value: 'Pasos' } });
    fireEvent.change(screen.getByLabelText('Objetivo diario'), { target: { value: '10000' } });
    fireEvent.change(screen.getByLabelText('Unidad'), { target: { value: 'pasos' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
    await waitFor(() => expect(actions.createHabit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Pasos', type: 'custom', target: 10000, unit: 'pasos' })));
    expect(await screen.findByText('Pasos')).toBeTruthy();
  });

  it('no crea hábitos sin nombre', async () => {
    renderWithStrata(<HabitsWidget />);
    fireEvent.click(await screen.findByRole('button', { name: 'Nuevo hábito' }));
    expect((screen.getByRole('button', { name: 'Crear' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('sin hábitos lo explica', async () => {
    actions.getHabits.mockResolvedValue([]);
    renderWithStrata(<HabitsWidget />);
    expect(await screen.findByText('Sin hábitos')).toBeTruthy();
  });

  it('eliminar pide confirmación y borra solo si se acepta', async () => {
    actions.deleteHabit.mockResolvedValue(undefined);
    renderWithStrata(<HabitsWidget />);
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Agua' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    expect(actions.deleteHabit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Agua' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(actions.deleteHabit).toHaveBeenCalledWith('h1'));
  });

  it('un fallo al cargar avisa y deja la lista vacía', async () => {
    actions.getHabits.mockRejectedValue(new Error('red'));
    renderWithStrata(<HabitsWidget />);
    expect(await screen.findByText('No se pudieron cargar los hábitos.')).toBeTruthy();
  });
});
