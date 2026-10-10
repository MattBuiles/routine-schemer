import { describe, expect, it } from 'vitest';

import type { CalendarEvent } from '@/types';
import type { SessionTemplate } from '@/types/program';

import { eventToScheduledSession, templateToWorkoutSession } from './plannerMapping';

const now = new Date('2026-10-01T00:00:00Z');

const template: SessionTemplate = {
  id: 'tpl-1',
  name: 'Empuje',
  type: 'skill',
  focus: [],
  exercises: [
    {
      id: 'ex-1',
      exerciseId: '',
      exerciseName: 'Press banca',
      sets: 4,
      reps: '8-10',
      restSeconds: 90,
      order: 0,
      primaryMuscles: ['pecho'],
      secondaryMuscles: ['tríceps'],
    },
  ],
  estimatedDurationMinutes: 60,
  estimatedVolume: 0,
  color: '#3b82f6',
  tags: [],
  createdAt: now,
  updatedAt: now,
};

const event = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: 'evt-1',
  userId: 'user-1',
  date: '2026-10-10',
  title: 'Empuje',
  type: 'workout',
  duration: 60,
  createdAt: now,
  updatedAt: now,
  ...overrides,
});

describe('templateToWorkoutSession', () => {
  it('traduce el tipo "skill" a "conditioning" y conserva los tipos compatibles', () => {
    expect(templateToWorkoutSession(template).type).toBe('conditioning');
    expect(templateToWorkoutSession({ ...template, type: 'strength' }).type).toBe('strength');
  });

  it('mapea los ejercicios con sus series, repeticiones y descanso', () => {
    const [exercise] = templateToWorkoutSession(template).exercises;
    expect(exercise).toMatchObject({ sets: 4, reps: '8-10', restTime: 90 });
    expect(exercise.exercise).toMatchObject({ name: 'Press banca', target: 'pecho', secondaryMuscles: ['tríceps'] });
  });
});

describe('eventToScheduledSession', () => {
  const templates = new Map([[template.id, template]]);

  it('calcula el día de la semana desde la fecha (2026-10-10 es sábado = 6)', () => {
    expect(eventToScheduledSession(event(), templates).dayOfWeek).toBe(6);
    expect(eventToScheduledSession(event({ date: '2026-10-04' }), templates).dayOfWeek).toBe(0);
  });

  it('marca como completada o programada según el evento', () => {
    expect(eventToScheduledSession(event({ completed: true }), templates).status).toBe('completed');
    expect(eventToScheduledSession(event({ completed: false }), templates).status).toBe('scheduled');
  });

  it('usa la plantilla cuando existe y una sesión mínima cuando ya no existe', () => {
    expect(eventToScheduledSession(event({ sessionId: 'tpl-1' }), templates).workoutSession.exercises).toHaveLength(1);

    const orphan = eventToScheduledSession(event({ sessionId: 'borrada', title: 'Sesión vieja', duration: 45 }), templates);
    expect(orphan.workoutSession).toMatchObject({ name: 'Sesión vieja', estimatedDuration: 45, exercises: [] });
  });

  it('conserva la hora y las notas', () => {
    const session = eventToScheduledSession(event({ time: '07:30', notes: 'Buen ritmo' }), templates);
    expect(session).toMatchObject({ id: 'evt-1', startTime: '07:30', notes: 'Buen ritmo' });
  });
});
