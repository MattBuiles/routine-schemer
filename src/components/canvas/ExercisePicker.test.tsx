// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithStrata } from '@/test-utils';

const actions = vi.hoisted(() => ({ searchExercises: vi.fn(), getExercise: vi.fn() }));
vi.mock('@/app/actions/exercises', () => actions);

import ExercisePicker from './ExercisePicker';

const summary = (id: string, nameEn: string, nameEs: string | null = null) => ({ id, nameEn, nameEs, category: 'strength', level: null, equipment: ['barbell'], primaryMuscles: ['chest'], image: null });

beforeEach(() => {
  actions.searchExercises.mockReset();
  actions.getExercise.mockReset();
  actions.searchExercises.mockResolvedValue({ items: [summary('e1', 'Bench Press', 'Press de Banca'), summary('e2', 'Squat')], total: 2 });
});
afterEach(cleanup);

function open(onPick = vi.fn(), onClose = vi.fn()) {
  renderWithStrata(<ExercisePicker open onClose={onClose} onPick={onPick} />);
  return { onPick, onClose };
}

describe('ExercisePicker', () => {
  it('no pinta nada ni consulta mientras está cerrado', () => {
    renderWithStrata(<ExercisePicker open={false} onClose={() => {}} onPick={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(actions.searchExercises).not.toHaveBeenCalled();
  });

  it('lista los resultados con el nombre en español si existe y el total', async () => {
    open();
    expect(await screen.findByText('Press de Banca')).toBeTruthy();
    expect(screen.getByText('Squat')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('2 ejercicios');
  });

  it('elegir un ejercicio lo entrega con su id y nombres', async () => {
    const { onPick } = open();
    fireEvent.click(await screen.findByRole('button', { name: 'Añadir Press de Banca' }));
    expect(onPick).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1', nameEn: 'Bench Press', nameEs: 'Press de Banca' }));
  });

  it('el texto y los filtros llegan a la búsqueda con músculo y equipo como valores de la lista', async () => {
    open();
    await screen.findByText('Squat');
    fireEvent.change(screen.getByLabelText('Buscar ejercicio'), { target: { value: 'curl' } });
    fireEvent.change(screen.getByLabelText('Músculo'), { target: { value: 'biceps' } });
    fireEvent.change(screen.getByLabelText('Equipamiento'), { target: { value: 'dumbbell' } });
    await waitFor(() => expect(actions.searchExercises).toHaveBeenLastCalledWith({ query: 'curl', muscle: 'biceps', equipment: 'dumbbell', limit: 30 }));
  });

  it('sin resultados lo dice', async () => {
    actions.searchExercises.mockResolvedValue({ items: [], total: 0 });
    open();
    expect(await screen.findByText(/Sin resultados/)).toBeTruthy();
  });

  it('«Cargar más» pide la siguiente página y la añade', async () => {
    actions.searchExercises.mockResolvedValueOnce({ items: [summary('e1', 'Bench Press')], total: 2 });
    open();
    await screen.findByText('Bench Press');
    actions.searchExercises.mockResolvedValueOnce({ items: [summary('e2', 'Squat')], total: 2 });
    fireEvent.click(screen.getByRole('button', { name: /Cargar más/ }));
    expect(await screen.findByText('Squat')).toBeTruthy();
    expect(actions.searchExercises).toHaveBeenLastCalledWith(expect.objectContaining({ offset: 1 }));
  });

  it('el detalle prefiere las instrucciones en español y muestra los autores', async () => {
    actions.getExercise.mockResolvedValue({ ...summary('e1', 'Bench Press', 'Press de Banca'), secondaryMuscles: [], instructionsEn: 'Lie down.', instructionsEs: 'Túmbate.', images: [], license: 'CC-BY-SA 4', attribution: 'ana, luis' });
    open();
    fireEvent.click(await screen.findByRole('button', { name: 'Ver detalle de Press de Banca' }));
    const detail = await screen.findByLabelText('Detalle del ejercicio');
    expect(detail.textContent).toContain('Túmbate.');
    expect(screen.getByText(/autores de este ejercicio: ana, luis/)).toBeTruthy();
  });

  it('un fallo de la búsqueda avisa en lugar de romper', async () => {
    actions.searchExercises.mockRejectedValue(new Error('red'));
    open();
    expect(await screen.findByText('No se pudo buscar en la biblioteca.')).toBeTruthy();
  });

  it('Escape cierra el selector', async () => {
    const { onClose } = open();
    await screen.findByText('Squat');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
