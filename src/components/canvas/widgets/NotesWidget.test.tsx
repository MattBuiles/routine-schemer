// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithStrata } from '@/test-utils';

const actions = vi.hoisted(() => ({ getNotes: vi.fn(), createNote: vi.fn(), updateNote: vi.fn(), deleteNote: vi.fn() }));
vi.mock('@/app/actions/notes', () => actions);

import NotesWidget from './NotesWidget';

const note = (id: string, title: string, over = {}) => ({ id, userId: 'u', title, content: `Texto de ${title}`, type: 'general', tags: [], isPinned: false, createdAt: new Date('2026-10-01'), updatedAt: new Date('2026-10-01'), ...over });

beforeEach(() => {
  Object.values(actions).forEach((fn) => fn.mockReset());
  actions.getNotes.mockResolvedValue([note('n1', 'Antigua'), note('n2', 'Reciente', { updatedAt: new Date('2026-10-09') })]);
  actions.updateNote.mockResolvedValue(undefined);
});
afterEach(cleanup);

const titles = () => screen.getAllByRole('article').map((a) => within(a).getByRole('heading').textContent);

describe('NotesWidget', () => {
  it('ordena por última modificación', async () => {
    renderWithStrata(<NotesWidget />);
    await screen.findByText('Reciente');
    expect(titles()).toEqual(['Reciente', 'Antigua']);
  });

  it('una nota fijada va primero y fijar lo guarda', async () => {
    renderWithStrata(<NotesWidget />);
    await screen.findByText('Reciente');
    fireEvent.click(screen.getByRole('button', { name: 'Fijar Antigua' }));
    await waitFor(() => expect(titles()).toEqual(['Antigua', 'Reciente']));
    expect(actions.updateNote).toHaveBeenCalledWith('n1', { isPinned: true });
  });

  it('si fijar falla, revierte y avisa', async () => {
    actions.updateNote.mockRejectedValue(new Error('x'));
    renderWithStrata(<NotesWidget />);
    await screen.findByText('Reciente');
    fireEvent.click(screen.getByRole('button', { name: 'Fijar Antigua' }));
    expect(await screen.findByText('No se pudo fijar la nota.')).toBeTruthy();
    expect(titles()).toEqual(['Reciente', 'Antigua']);
  });

  it('crea una nota nueva y la muestra arriba', async () => {
    actions.createNote.mockResolvedValue(note('n3', 'Nueva', { updatedAt: new Date('2026-10-11') }));
    renderWithStrata(<NotesWidget />);
    fireEvent.click(await screen.findByRole('button', { name: 'Nueva nota' }));
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText('Título de la nota'), { target: { value: 'Nueva' } });
    fireEvent.change(screen.getByLabelText('Contenido de la nota'), { target: { value: 'Contenido' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(actions.createNote).toHaveBeenCalledWith({ title: 'Nueva', content: 'Contenido' }));
    await waitFor(() => expect(titles()[0]).toBe('Nueva'));
  });

  it('edita una nota en el sitio', async () => {
    renderWithStrata(<NotesWidget />);
    fireEvent.click(await screen.findByRole('button', { name: 'Editar Antigua' }));
    expect((screen.getByLabelText('Título de la nota') as HTMLInputElement).value).toBe('Antigua');
    fireEvent.change(screen.getByLabelText('Título de la nota'), { target: { value: 'Editada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(actions.updateNote).toHaveBeenCalledWith('n1', { title: 'Editada', content: 'Texto de Antigua' }));
    expect(await screen.findByText('Editada')).toBeTruthy();
  });

  it('cancelar la edición no guarda nada', async () => {
    renderWithStrata(<NotesWidget />);
    fireEvent.click(await screen.findByRole('button', { name: 'Editar Antigua' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(actions.updateNote).not.toHaveBeenCalled();
    expect(screen.getByText('Antigua')).toBeTruthy();
  });

  it('eliminar pide confirmación', async () => {
    actions.deleteNote.mockResolvedValue(undefined);
    renderWithStrata(<NotesWidget />);
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar Antigua' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(actions.deleteNote).toHaveBeenCalledWith('n1'));
    await waitFor(() => expect(screen.queryByText('Antigua')).toBeNull());
  });

  it('sin notas lo explica y un fallo de carga avisa', async () => {
    actions.getNotes.mockResolvedValueOnce([]);
    renderWithStrata(<NotesWidget />);
    expect(await screen.findByText('Sin notas')).toBeTruthy();
    cleanup();
    actions.getNotes.mockRejectedValueOnce(new Error('x'));
    renderWithStrata(<NotesWidget />);
    expect(await screen.findByText('No se pudieron cargar las notas.')).toBeTruthy();
  });
});
