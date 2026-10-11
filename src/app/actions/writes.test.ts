import { beforeEach, describe, expect, it, vi } from 'vitest';

// Base de datos y sesión simuladas: se comprueba QUÉ se escribe, no cómo responde Postgres.
const state = vi.hoisted(() => ({
  inserted: [] as Record<string, unknown>[],
  updated: [] as Record<string, unknown>[],
  returned: {} as Record<string, unknown>,
}));

vi.mock('@/db/client', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn((values: Record<string, unknown>) => {
        state.inserted.push(values);
        return { returning: async () => [state.returned] };
      }),
    })),
    update: vi.fn(() => ({
      set: vi.fn((values: Record<string, unknown>) => {
        state.updated.push(values);
        return { where: async () => [] };
      }),
    })),
    delete: vi.fn(() => ({ where: async () => [] })),
  },
}));

vi.mock('@/lib/auth/session', () => ({ requireUserId: vi.fn(async () => 'user-1') }));

import { db } from '@/db/client';

import { createCalendarEvent, updateCalendarEvent } from './calendar';
import { createHabit, updateHabit } from './habits';
import { createNote, updateNote } from './notes';

// Entradas con claves que un cliente malicioso podría añadir al JSON de la server action.
const hostile = { userId: 'atacante', id: 'id-forzado', createdAt: new Date(0), sessionTemplateId: 'ajena' };
const as = <T>(value: object) => value as unknown as T;

const now = new Date('2026-10-10T12:00:00Z');

beforeEach(() => {
  state.inserted = [];
  state.updated = [];
  vi.mocked(db.insert).mockClear();
  vi.mocked(db.update).mockClear();
});

describe('hábitos', () => {
  const input = { name: 'Agua', type: 'water_intake' as const, target: 8, unit: 'vasos', color: '#3b82f6', icon: 'Droplets' };

  it('createHabit toma el userId de la sesión y descarta id, createdAt y userId del cliente', async () => {
    state.returned = { ...input, id: 'h1', userId: 'user-1', description: null, isActive: true, isFavorite: false, createdAt: now, updatedAt: now };
    await createHabit(as({ ...input, ...hostile }));

    expect(state.inserted).toEqual([{ ...input, userId: 'user-1' }]);
  });

  it('updateHabit solo escribe columnas permitidas', async () => {
    await updateHabit('h1', as({ name: 'Nuevo', ...hostile }));

    expect(state.updated).toHaveLength(1);
    expect(Object.keys(state.updated[0]).sort()).toEqual(['name', 'updatedAt']);
  });
});

describe('notas', () => {
  const input = { title: 'T', content: 'C' };

  it('createNote toma el userId de la sesión y descarta claves ajenas', async () => {
    state.returned = { ...input, id: 'n1', userId: 'user-1', type: 'general', tags: [], isPinned: false, createdAt: now, updatedAt: now };
    await createNote(as({ ...input, ...hostile }));

    expect(state.inserted).toEqual([{ ...input, userId: 'user-1' }]);
  });

  it('updateNote solo escribe columnas permitidas', async () => {
    await updateNote('n1', as({ isPinned: true, ...hostile }));

    expect(Object.keys(state.updated[0]).sort()).toEqual(['isPinned', 'updatedAt']);
  });
});

describe('eventos de calendario', () => {
  const input = { date: '2026-10-10', title: 'Empuje', type: 'workout' as const };

  it('createCalendarEvent fuerza el userId de la sesión y descarta claves ajenas', async () => {
    state.returned = { ...input, id: 'e1', userId: 'user-1', time: null, duration: null, description: null, completed: false, actualDuration: null, notes: null, category: null, createdAt: now, updatedAt: now };
    await createCalendarEvent(as({ ...input, ...hostile }));

    expect(state.inserted).toEqual([{ ...input, userId: 'user-1' }]);
  });

  it('updateCalendarEvent solo escribe columnas permitidas', async () => {
    await updateCalendarEvent('e1', as({ completed: true, ...hostile }));

    expect(state.updated).toHaveLength(1);
    expect(Object.keys(state.updated[0]).sort()).toEqual(['completed', 'updatedAt']);
  });
});
