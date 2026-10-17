// @vitest-environment jsdom
import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { blockFromType, DEFAULT_BLOCK_TYPES, type CycleBlock } from '@/lib/board/cycle';
import { renderWithStrata } from '@/test-utils';

const actions = vi.hoisted(() => ({
  searchExercises: vi.fn(async () => ({ items: [{ id: 'e1', nameEn: 'Bench Press', nameEs: 'Press de Banca', category: null, level: null, equipment: [], primaryMuscles: [], image: null }], total: 1 })),
  getExercise: vi.fn(),
}));
vi.mock('@/app/actions/exercises', () => actions);

import BlockPanel from './BlockPanel';

afterEach(cleanup);

const strength = DEFAULT_BLOCK_TYPES.find((t) => t.key === 'strength')!;
const exercise = (name: string, id = name) => ({ exerciseId: id, name, sets: 3, reps: '8-12', notes: '' });
const baseBlock: CycleBlock = { ...blockFromType(strength, 'b1', 0, 0), label: 'Empuje', zones: ['Pecho'] };

function setup(over: Partial<CycleBlock> = {}) {
  const handlers = { onChange: vi.fn(), onChangeType: vi.fn(), onDelete: vi.fn(), onSaveType: vi.fn(), onClose: vi.fn() };
  renderWithStrata(<BlockPanel block={{ ...baseBlock, ...over }} types={[...DEFAULT_BLOCK_TYPES]} {...handlers} />);
  return handlers;
}

describe('BlockPanel · enfoque, nombre y zonas', () => {
  it('marca el enfoque actual y permite cambiarlo', () => {
    const { onChangeType } = setup();
    expect(screen.getByRole('button', { name: 'Fuerza' }).getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Hipertrofia' }));
    expect(onChangeType).toHaveBeenCalledWith(expect.objectContaining({ key: 'hypertrophy' }));
  });

  it('editar el nombre emite el cambio', () => {
    const { onChange } = setup();
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Tirón' } });
    expect(onChange).toHaveBeenCalledWith({ label: 'Tirón' });
  });

  it('añade una zona con Enter, sin duplicados y puede quitarla', () => {
    const { onChange } = setup();
    const input = screen.getByPlaceholderText('Añade una zona y pulsa Enter');
    fireEvent.change(input, { target: { value: 'Hombros' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith({ zones: ['Pecho', 'Hombros'] });

    fireEvent.change(input, { target: { value: 'pecho' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Quitar Pecho' }));
    expect(onChange).toHaveBeenLastCalledWith({ zones: [] });
  });

  it('las sugerencias añaden la zona y desaparecen las ya usadas', () => {
    const { onChange } = setup();
    expect(screen.queryByRole('button', { name: '+ Pecho' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '+ Espalda' }));
    expect(onChange).toHaveBeenCalledWith({ zones: ['Pecho', 'Espalda'] });
  });

  it('con el máximo de zonas se bloquea el campo', () => {
    setup({ zones: ['a', 'b', 'c', 'd', 'e', 'f'] });
    expect((screen.getByPlaceholderText('Máximo alcanzado') as HTMLInputElement).disabled).toBe(true);
  });

  it('el color y el icono emiten su cambio y no hay selector de carga', () => {
    const { onChange } = setup();
    expect(screen.queryByText('Carga')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Color #10b981' }));
    fireEvent.click(screen.getByRole('button', { name: 'Icono flame' }));
    expect(onChange.mock.calls).toEqual([[{ color: '#10b981' }], [{ icon: 'flame' }]]);
  });

  it('guardar como enfoque exige un nombre', () => {
    setup({ label: '  ' });
    expect((screen.getByRole('button', { name: 'Guardar como enfoque' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('eliminar y cerrar avisan al padre', () => {
    const { onDelete, onClose } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar bloque' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar panel' }));
    expect(onDelete).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe('BlockPanel · ejercicios', () => {
  it('lista los ejercicios y edita series, repeticiones y notas del que toca', () => {
    const { onChange } = setup({ exercises: [exercise('Press'), exercise('Remo')] });
    fireEvent.change(screen.getByLabelText('Series de Remo'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Repeticiones de Remo'), { target: { value: 'AMRAP' } });
    fireEvent.change(screen.getByLabelText('Notas de Remo'), { target: { value: 'Pausa' } });
    const edited = (n: number) => onChange.mock.calls[n][0].exercises;
    expect(edited(0)).toEqual([exercise('Press'), { ...exercise('Remo'), sets: 5 }]);
    expect(edited(1)[1].reps).toBe('AMRAP');
    expect(edited(2)[1].notes).toBe('Pausa');
  });

  it('acota las series entre 1 y 20', () => {
    const { onChange } = setup({ exercises: [exercise('Press')] });
    fireEvent.change(screen.getByLabelText('Series de Press'), { target: { value: '99' } });
    fireEvent.change(screen.getByLabelText('Series de Press'), { target: { value: '0' } });
    expect(onChange.mock.calls.map((c) => c[0].exercises[0].sets)).toEqual([20, 1]);
  });

  it('reordena con subir y bajar y no deja subir el primero ni bajar el último', () => {
    const { onChange } = setup({ exercises: [exercise('Press'), exercise('Remo')] });
    expect((screen.getByRole('button', { name: 'Subir Press' }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole('button', { name: 'Bajar Remo' }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Subir Remo' }));
    expect(onChange.mock.calls[0][0].exercises.map((e: { name: string }) => e.name)).toEqual(['Remo', 'Press']);
  });

  it('quita un ejercicio', () => {
    const { onChange } = setup({ exercises: [exercise('Press'), exercise('Remo')] });
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Press' }));
    expect(onChange).toHaveBeenCalledWith({ exercises: [exercise('Remo')] });
  });

  it('añadir desde el selector agrega el ejercicio con valores por defecto y cierra el selector', async () => {
    const { onChange } = setup({ exercises: [exercise('Remo')] });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir ejercicio' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(await within(dialog).findByRole('button', { name: 'Añadir Press de Banca' }));
    expect(onChange).toHaveBeenCalledWith({ exercises: [exercise('Remo'), { exerciseId: 'e1', name: 'Press de Banca', sets: 3, reps: '8-12', notes: '' }] });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('con 30 ejercicios no deja añadir más', () => {
    setup({ exercises: Array.from({ length: 30 }, (_, i) => exercise(`Ej ${i}`, `id${i}`)) });
    expect((screen.getByRole('button', { name: 'Añadir ejercicio' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
