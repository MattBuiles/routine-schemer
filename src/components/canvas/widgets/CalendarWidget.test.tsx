// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithStrata } from '@/test-utils';

const actions = vi.hoisted(() => ({ getCalendarEvents: vi.fn(), createCalendarEvent: vi.fn(), updateCalendarEvent: vi.fn(), deleteCalendarEvent: vi.fn() }));
vi.mock('@/app/actions/calendar', () => actions);

import CalendarWidget from './CalendarWidget';

const TODAY = new Date(2026, 9, 15, 12); // 15 de octubre de 2026 (jueves)
const event = (id: string, title: string, date: string, over = {}) => ({ id, userId: 'u', date, title, type: 'other', completed: false, createdAt: new Date(), updatedAt: new Date(), ...over });

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(TODAY);
  Object.values(actions).forEach((fn) => fn.mockReset());
  actions.getCalendarEvents.mockResolvedValue([event('e1', 'Pierna', '2026-10-15', { time: '18:30' })]);
  actions.updateCalendarEvent.mockResolvedValue(undefined);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('CalendarWidget', () => {
  it('abre el mes actual, pide solo ese mes y muestra los eventos de hoy', async () => {
    renderWithStrata(<CalendarWidget />);
    expect(screen.getByText('octubre 2026')).toBeTruthy();
    expect(await screen.findByText('Pierna')).toBeTruthy();
    expect(screen.getByText('18:30')).toBeTruthy();
    expect(actions.getCalendarEvents).toHaveBeenCalledWith({ from: '2026-10-01', to: '2026-10-31' });
  });

  it('empieza la semana en lunes: el 1 de octubre de 2026 (jueves) cae en la cuarta columna', () => {
    renderWithStrata(<CalendarWidget />);
    const day1 = screen.getByRole('button', { name: '2026-10-01' });
    const days = [...day1.parentElement!.children];
    const firstWeekRow = days.slice(7, 14); // tras las siete cabeceras
    expect(firstWeekRow.indexOf(day1)).toBe(3);
  });

  it('navegar de mes pide el mes nuevo', async () => {
    renderWithStrata(<CalendarWidget />);
    await screen.findByText('Pierna');
    fireEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getByText('noviembre 2026')).toBeTruthy();
    await waitFor(() => expect(actions.getCalendarEvents).toHaveBeenLastCalledWith({ from: '2026-11-01', to: '2026-11-30' }));
  });

  it('cruza el cambio de año hacia atrás y hacia delante', () => {
    renderWithStrata(<CalendarWidget />);
    for (let i = 0; i < 10; i++) fireEvent.click(screen.getByRole('button', { name: 'Mes anterior' }));
    expect(screen.getByText('diciembre 2025')).toBeTruthy();
    for (let i = 0; i < 2; i++) fireEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getByText('febrero 2026')).toBeTruthy();
  });

  it('seleccionar otro día cambia la lista y deja crear ahí', async () => {
    actions.createCalendarEvent.mockResolvedValue(event('e2', 'Descanso activo', '2026-10-20'));
    renderWithStrata(<CalendarWidget />);
    await screen.findByText('Pierna');
    fireEvent.click(screen.getByRole('button', { name: '2026-10-20' }));
    expect(screen.queryByText('Pierna')).toBeNull();
    expect(screen.getByText('Sin eventos este día.')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Nuevo evento'), { target: { value: 'Descanso activo' } });
    fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '09:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir evento' }));
    await waitFor(() => expect(actions.createCalendarEvent).toHaveBeenCalledWith({ date: '2026-10-20', title: 'Descanso activo', time: '09:00', type: 'other' }));
    expect(await screen.findByText('Descanso activo')).toBeTruthy();
  });

  it('no envía la hora si está vacía ni crea eventos sin título', async () => {
    actions.createCalendarEvent.mockResolvedValue(event('e3', 'Sin hora', '2026-10-15'));
    renderWithStrata(<CalendarWidget />);
    await screen.findByText('Pierna');
    expect((screen.getByRole('button', { name: 'Añadir evento' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('Nuevo evento'), { target: { value: 'Sin hora' } });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir evento' }));
    await waitFor(() => expect(actions.createCalendarEvent).toHaveBeenCalledWith({ date: '2026-10-15', title: 'Sin hora', type: 'other' }));
  });

  it('completar y eliminar un evento', async () => {
    actions.deleteCalendarEvent.mockResolvedValue(undefined);
    renderWithStrata(<CalendarWidget />);
    fireEvent.click(await screen.findByRole('button', { name: 'Completar Pierna' }));
    expect(actions.updateCalendarEvent).toHaveBeenCalledWith('e1', { completed: true });
    expect(await screen.findByRole('button', { name: 'Marcar pendiente Pierna' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar Pierna' }));
    await waitFor(() => expect(actions.deleteCalendarEvent).toHaveBeenCalledWith('e1'));
    await waitFor(() => expect(screen.queryByText('Pierna')).toBeNull());
  });

  it('si completar falla, revierte y avisa', async () => {
    actions.updateCalendarEvent.mockRejectedValue(new Error('x'));
    renderWithStrata(<CalendarWidget />);
    fireEvent.click(await screen.findByRole('button', { name: 'Completar Pierna' }));
    expect(await screen.findByText('No se pudo actualizar el evento.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Completar Pierna' })).toBeTruthy();
  });

  it('un fallo al cargar avisa', async () => {
    actions.getCalendarEvents.mockRejectedValue(new Error('x'));
    renderWithStrata(<CalendarWidget />);
    expect(await screen.findByText('No se pudieron cargar los eventos.')).toBeTruthy();
  });
});
