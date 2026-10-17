// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { blockFromType, DEFAULT_BLOCK_TYPES } from '@/lib/board/cycle';
import { stubPointerCapture, renderWithStrata } from '@/test-utils';

const board = vi.hoisted(() => ({
  getBoard: vi.fn(),
  saveCycle: vi.fn(),
  saveWidgets: vi.fn(),
  savePhases: vi.fn(),
  createBlockType: vi.fn(),
  deleteBlockType: vi.fn(),
}));
vi.mock('@/app/actions/board', () => board);
vi.mock('@/app/actions/habits', () => ({ getHabits: vi.fn(async () => []), getHabitRecords: vi.fn(async () => []), setHabitRecord: vi.fn(), createHabit: vi.fn(), deleteHabit: vi.fn() }));
vi.mock('@/app/actions/notes', () => ({ getNotes: vi.fn(async () => []), createNote: vi.fn(), updateNote: vi.fn(), deleteNote: vi.fn() }));
vi.mock('@/app/actions/calendar', () => ({ getCalendarEvents: vi.fn(async () => []), createCalendarEvent: vi.fn(), updateCalendarEvent: vi.fn(), deleteCalendarEvent: vi.fn() }));
vi.mock('@/app/actions/exercises', () => ({ searchExercises: vi.fn(async () => ({ items: [], total: 0 })), getExercise: vi.fn() }));
const session = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock('@/lib/auth/client', () => ({ authClient: session }));

import BoardEngine from './BoardEngine';

const strength = DEFAULT_BLOCK_TYPES.find((t) => t.key === 'strength')!;
const savedBlock = { ...blockFromType(strength, '00000000-0000-4000-8000-000000000001', 0, 0), label: 'Empuje' };
const emptyBoard = { cycleDays: 7, blocks: [], widgets: [], phases: [], planStart: null, planWeeks: 12, customTypes: [] };

beforeEach(() => {
  stubPointerCapture();
  Object.values(board).forEach((fn) => fn.mockReset());
  session.getSession.mockReset();
  session.getSession.mockResolvedValue({ data: { user: { id: 'u' } } });
  board.getBoard.mockResolvedValue(emptyBoard);
  board.saveCycle.mockResolvedValue(undefined);
  board.saveWidgets.mockResolvedValue(undefined);
  board.savePhases.mockResolvedValue(undefined);
  localStorage.clear();
});
afterEach(cleanup);

const loaded = async () => screen.findByTestId('cycle-zone');
const SAVED = { timeout: 3000 };

describe('BoardEngine', () => {
  it('muestra el tablero guardado', async () => {
    board.getBoard.mockResolvedValue({ ...emptyBoard, blocks: [savedBlock] });
    renderWithStrata(<BoardEngine />);
    await loaded();
    expect(screen.getByRole('group', { name: 'Empuje' })).toBeTruthy();
    expect(screen.getByText(/Ciclo de 7 días/)).toBeTruthy();
  });

  it('un tablero recién cargado no se vuelve a guardar', async () => {
    renderWithStrata(<BoardEngine />);
    await loaded();
    await new Promise((r) => setTimeout(r, 1200));
    expect(board.saveCycle).not.toHaveBeenCalled();
    expect(board.saveWidgets).not.toHaveBeenCalled();
    expect(board.savePhases).not.toHaveBeenCalled();
  });

  it('si no carga, lo dice', async () => {
    board.getBoard.mockRejectedValue(new Error('x'));
    renderWithStrata(<BoardEngine />);
    expect(await screen.findByText(/No se pudo cargar tu tablero/)).toBeTruthy();
  });

  it('añadir un enfoque desde la paleta crea el bloque, abre su panel y lo guarda con retardo', async () => {
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.keyDown(screen.getByRole('button', { name: /Fuerza/ }), { key: 'Enter' });
    expect(screen.getByRole('group', { name: 'Fuerza' })).toBeTruthy();
    expect(screen.getByRole('complementary', { name: 'Propiedades del bloque' })).toBeTruthy();
    expect(board.saveCycle).not.toHaveBeenCalled(); // el guardado espera al debounce
    await waitFor(() => expect(board.saveCycle).toHaveBeenCalledTimes(1), SAVED);
    expect(board.saveCycle.mock.calls[0][0].blocks[0]).toMatchObject({ label: 'Fuerza', blockType: 'strength', dayStart: 0, lane: 0 });
    await waitFor(() => expect(screen.getByText('Guardado')).toBeTruthy(), SAVED);
    expect(board.saveWidgets).not.toHaveBeenCalled();
  });

  it('deshacer quita el bloque y vuelve a guardar el estado anterior', async () => {
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.keyDown(screen.getByRole('button', { name: /Fuerza/ }), { key: 'Enter' });
    await waitFor(() => expect(board.saveCycle).toHaveBeenCalledTimes(1), SAVED);
    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
    expect(screen.queryByRole('group', { name: 'Fuerza' })).toBeNull();
    await waitFor(() => expect(board.saveCycle).toHaveBeenCalledTimes(2), SAVED);
    expect(board.saveCycle.mock.calls[1][0].blocks).toEqual([]);
  });

  it('Ctrl+Z deshace, pero no mientras se escribe en un campo', async () => {
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.keyDown(screen.getByRole('button', { name: /Fuerza/ }), { key: 'Enter' });
    const name = screen.getByLabelText('Nombre');
    fireEvent.keyDown(name, { key: 'z', ctrlKey: true });
    expect(screen.getByRole('group', { name: 'Fuerza' })).toBeTruthy();
    fireEvent.keyDown(document.body, { key: 'z', ctrlKey: true });
    expect(screen.queryByRole('group', { name: 'Fuerza' })).toBeNull();
  });

  it('renombrar el bloque desde el panel actualiza el lienzo', async () => {
    board.getBoard.mockResolvedValue({ ...emptyBoard, blocks: [savedBlock] });
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.focus(screen.getByRole('group', { name: 'Empuje' }));
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Tirón' } });
    expect(screen.getByRole('group', { name: 'Tirón' })).toBeTruthy();
    await waitFor(() => expect(board.saveCycle.mock.calls.at(-1)![0].blocks[0].label).toBe('Tirón'), SAVED);
  });

  it('cambiar el enfoque conserva un nombre personalizado y actualiza color e icono', async () => {
    board.getBoard.mockResolvedValue({ ...emptyBoard, blocks: [savedBlock] });
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.focus(screen.getByRole('group', { name: 'Empuje' }));
    const panel = screen.getByRole('complementary', { name: 'Propiedades del bloque' });
    fireEvent.click(within(panel).getByRole('button', { name: 'Hipertrofia' }));
    await waitFor(() => expect(board.saveCycle.mock.calls.at(-1)![0].blocks[0]).toMatchObject({ label: 'Empuje', blockType: 'hypertrophy', color: '#2563eb', icon: 'flame' }), SAVED);
  });

  it('eliminar el bloque lo quita y cierra el panel', async () => {
    board.getBoard.mockResolvedValue({ ...emptyBoard, blocks: [savedBlock] });
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.focus(screen.getByRole('group', { name: 'Empuje' }));
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar bloque' }));
    expect(screen.queryByRole('group', { name: 'Empuje' })).toBeNull();
    expect(screen.queryByRole('complementary', { name: 'Propiedades del bloque' })).toBeNull();
  });

  it('añadir y quitar un widget guarda solo los widgets', async () => {
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir Notas' }));
    expect(screen.getByRole('region', { name: 'Notas' })).toBeTruthy();
    await waitFor(() => expect(board.saveWidgets).toHaveBeenCalledTimes(1), SAVED);
    expect(board.saveWidgets.mock.calls[0][0]).toEqual([expect.objectContaining({ type: 'notes' })]);
    expect(board.saveCycle).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar Notas' }));
    expect(screen.queryByRole('region', { name: 'Notas' })).toBeNull();
    await waitFor(() => expect(board.saveWidgets).toHaveBeenLastCalledWith([]), SAVED);
  });

  it('añadir fases abre su panel, las guarda y las encadena sin solaparse', async () => {
    renderWithStrata(<BoardEngine />);
    await loaded();
    const chip = (kind: string) => document.querySelector(`[data-phase-type="${kind}"]`) as HTMLElement;
    fireEvent.click(chip('volume'));
    expect(screen.getByRole('complementary', { name: 'Propiedades de la fase' })).toBeTruthy();
    fireEvent.click(chip('intensity'));
    fireEvent.click(chip('deload'));
    await waitFor(() => expect(board.savePhases.mock.calls.at(-1)![0].phases).toHaveLength(3), SAVED);
    const { phases } = board.savePhases.mock.calls.at(-1)![0];
    expect(phases.map((p: { kind: string; startWeek: number; weeks: number }) => [p.kind, p.startWeek, p.weeks])).toEqual([['volume', 0, 4], ['intensity', 4, 4], ['deload', 8, 1]]);
  });

  it('fijar el inicio del plan lo guarda con las fases y quitarlo lo borra', async () => {
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.change(screen.getByLabelText('Inicio del plan'), { target: { value: '2026-10-12' } });
    await waitFor(() => expect(board.savePhases).toHaveBeenCalledTimes(1), SAVED);
    expect(board.savePhases.mock.calls[0][0]).toEqual({ phases: [], planStart: '2026-10-12', planWeeks: 12 });
    expect(board.saveCycle).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Quitar fecha' }));
    await waitFor(() => expect(board.savePhases).toHaveBeenLastCalledWith({ phases: [], planStart: null, planWeeks: 12 }), SAVED);
  });

  it('con el plan anclado, las semanas del plan muestran su fecha de inicio', async () => {
    board.getBoard.mockResolvedValue({ ...emptyBoard, planStart: '2026-10-12' });
    renderWithStrata(<BoardEngine />);
    await loaded();
    expect(screen.getByText('12 oct')).toBeTruthy();
    expect(screen.getByText('19 oct')).toBeTruthy();
    expect((screen.getByLabelText('Inicio del plan') as HTMLInputElement).value).toBe('2026-10-12');
  });

  it('el calendario del tablero enseña el plan del día cuando hay fecha de inicio', async () => {
    const start = new Date();
    const iso = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    board.getBoard.mockResolvedValue({
      ...emptyBoard,
      planStart: iso,
      blocks: [{ ...savedBlock, exercises: [{ exerciseId: '00000000-0000-4000-8000-000000000009', name: 'Press de Banca', sets: 3, reps: '8-12', notes: '' }] }],
      widgets: [{ id: '00000000-0000-4000-8000-0000000000aa', type: 'calendar', x: 0, y: 800, w: 380, h: 440 }],
      phases: [{ id: '00000000-0000-4000-8000-0000000000bb', name: 'Volumen', kind: 'volume', startWeek: 0, weeks: 4, color: '#3b82f6', volumePct: 0, intensityPct: 0, rampSets: 1, rampLoad: 0, deloadLast: false }],
    });
    renderWithStrata(<BoardEngine />);
    const plan = await screen.findByRole('region', { name: 'Plan del día' });
    expect(plan.textContent).toContain('Volumen · semana 1 de 4');
    expect(plan.textContent).toContain('Día 1 del ciclo');
    expect(plan.textContent).toContain('Press de Banca');
    expect(plan.textContent).toContain('3×8-12');
  });

  it('el plan se alarga y se acorta con los botones y se guarda su duración', async () => {
    renderWithStrata(<BoardEngine />);
    await loaded();
    expect(screen.getByText(/Plan de 12 semanas/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir semana al plan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Añadir semana al plan' }));
    fireEvent.click(screen.getByRole('button', { name: 'Quitar semana al plan' }));
    expect(screen.getByText(/Plan de 13 semanas/)).toBeTruthy();
    await waitFor(() => expect(board.savePhases).toHaveBeenLastCalledWith({ phases: [], planStart: null, planWeeks: 13 }), SAVED);
  });

  it('acortar el plan pide confirmación si se pierden fases y respeta un «Cancelar»', async () => {
    const phase = (n: number, startWeek: number, weeks: number) => ({ id: `00000000-0000-4000-8000-00000000000${n}`, name: `Fase ${n}`, kind: 'volume', startWeek, weeks, color: '#3b82f6', volumePct: 0, intensityPct: 0, rampSets: 0, rampLoad: 0, deloadLast: false });
    board.getBoard.mockResolvedValue({ ...emptyBoard, planWeeks: 5, phases: [phase(1, 0, 4), phase(2, 4, 1)] });
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar semana al plan' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText(/Plan de 5 semanas/)).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Fase Fase 2' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Quitar semana al plan' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Acortar' }));
    expect(await screen.findByText(/Plan de 4 semanas/)).toBeTruthy();
    expect(screen.queryByRole('group', { name: 'Fase Fase 2' })).toBeNull();
    await waitFor(() => expect(board.savePhases.mock.calls.at(-1)![0]).toMatchObject({ planWeeks: 4, phases: [expect.objectContaining({ startWeek: 0, weeks: 4 })] }), SAVED);
  });

  it('acortar el plan recorta sin preguntar la fase que cruza el nuevo final', async () => {
    const phase = { id: '00000000-0000-4000-8000-000000000001', name: 'Fase 1', kind: 'volume', startWeek: 0, weeks: 5, color: '#3b82f6', volumePct: 0, intensityPct: 0, rampSets: 0, rampLoad: 0, deloadLast: false };
    board.getBoard.mockResolvedValue({ ...emptyBoard, planWeeks: 5, phases: [phase] });
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar semana al plan' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(board.savePhases.mock.calls.at(-1)![0]).toMatchObject({ planWeeks: 4, phases: [expect.objectContaining({ weeks: 4 })] }), SAVED);
  });

  it('acortar el ciclo pide confirmación si se pierden bloques y respeta un «Cancelar»', async () => {
    board.getBoard.mockResolvedValue({ ...emptyBoard, cycleDays: 3, blocks: [{ ...savedBlock, dayStart: 2 }] });
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar día' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await new Promise((r) => setTimeout(r, 50)); // da tiempo a que una confirmación mal gestionada acortara el ciclo
    expect(screen.getByText(/Ciclo de 3 días/)).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Empuje' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Quitar día' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Acortar' }));
    expect(await screen.findByText(/Ciclo de 2 días/)).toBeTruthy();
    expect(screen.queryByRole('group', { name: 'Empuje' })).toBeNull();
  });

  it('un fallo al guardar con la sesión caducada lo explica', async () => {
    board.saveCycle.mockRejectedValue(new Error('No autenticado'));
    session.getSession.mockResolvedValue({ data: null });
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.keyDown(screen.getByRole('button', { name: /Fuerza/ }), { key: 'Enter' });
    expect(await screen.findByText(/Tu sesión caducó/, {}, SAVED)).toBeTruthy();
    expect(screen.getByText('Sin guardar')).toBeTruthy();
  });

  it('un fallo al guardar con sesión válida avisa de que se reintentará', async () => {
    board.saveCycle.mockRejectedValue(new Error('red'));
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.keyDown(screen.getByRole('button', { name: /Fuerza/ }), { key: 'Enter' });
    expect(await screen.findByText(/Se reintentará con el próximo cambio/, {}, SAVED)).toBeTruthy();
  });

  it('«Guardar como enfoque» añade el tipo propio a la paleta', async () => {
    board.getBoard.mockResolvedValue({ ...emptyBoard, blocks: [savedBlock] });
    board.createBlockType.mockResolvedValue({ id: 'c1', name: 'Empuje', color: '#dc2626', icon: 'dumbbell' });
    renderWithStrata(<BoardEngine />);
    await loaded();
    fireEvent.focus(screen.getByRole('group', { name: 'Empuje' }));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar como enfoque' }));
    await waitFor(() => expect(board.createBlockType).toHaveBeenCalledWith({ name: 'Empuje', color: '#dc2626', icon: 'dumbbell' }));
    expect(await screen.findByRole('button', { name: 'Eliminar enfoque Empuje' })).toBeTruthy();
  });
});
