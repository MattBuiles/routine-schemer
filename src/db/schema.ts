import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

export const habits = pgTable('habits', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull().default('custom'),
  target: doublePrecision('target').notNull(),
  unit: text('unit').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  isFavorite: boolean('is_favorite').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const habitRecords = pgTable('habit_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  date: date('date', { mode: 'string' }).notNull(),
  value: doublePrecision('value').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [unique('habit_records_habit_id_date_key').on(table.habitId, table.date)]);

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type').notNull().default('general'),
  tags: text('tags').array().notNull().default([]),
  isPinned: boolean('is_pinned').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const calendarEvents = pgTable('calendar_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  date: date('date', { mode: 'string' }).notNull(),
  time: time('time'),
  title: text('title').notNull(),
  type: text('type').notNull().default('other'),
  duration: integer('duration'),
  description: text('description'),
  completed: boolean('completed').notNull().default(false),
  actualDuration: integer('actual_duration'),
  notes: text('notes'),
  category: text('category'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const boards = pgTable('boards', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().unique(),
  cycleDays: integer('cycle_days').notNull().default(7),
  planStart: date('plan_start', { mode: 'string' }),
  planWeeks: integer('plan_weeks').notNull().default(12),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const boardCycles = pgTable('board_cycles', {
  id: uuid('id').defaultRandom().primaryKey(),
  boardId: uuid('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  name: text('name').notNull().default('Ciclo'),
  days: integer('days').notNull().default(7),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const boardBlocks = pgTable('board_blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  boardId: uuid('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  cycleId: uuid('cycle_id').references(() => boardCycles.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  label: text('label').notNull().default(''),
  color: text('color').notNull().default('#3b82f6'),
  blockType: text('block_type'),
  subType: text('sub_type'),
  dayStart: integer('day_start'),
  daySpan: integer('day_span'),
  lane: integer('lane'),
  load: integer('load'),
  zones: text('zones').array().notNull().default([]),
  exercises: jsonb('exercises').notNull().default([]),
  notes: text('notes').notNull().default(''),
  icon: text('icon'),
  widgetType: text('widget_type'),
  x: integer('x'),
  y: integer('y'),
  w: integer('w'),
  h: integer('h'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const blockTypes = pgTable('block_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#3b82f6'),
  icon: text('icon').notNull().default('sparkles'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const exercises = pgTable('exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id'),
  source: text('source').notNull(),
  sourceId: text('source_id').notNull(),
  nameEn: text('name_en').notNull(),
  nameEs: text('name_es'),
  category: text('category'),
  level: text('level'),
  equipment: text('equipment').array().notNull().default([]),
  primaryMuscles: text('primary_muscles').array().notNull().default([]),
  secondaryMuscles: text('secondary_muscles').array().notNull().default([]),
  instructionsEn: text('instructions_en').notNull().default(''),
  instructionsEs: text('instructions_es'),
  images: text('images').array().notNull().default([]),
  license: text('license').notNull().default(''),
  attribution: text('attribution'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [unique('exercises_source_key').on(table.source, table.sourceId)]);

export const boardPhases = pgTable('board_phases', {
  id: uuid('id').defaultRandom().primaryKey(),
  boardId: uuid('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  kind: text('kind').notNull(),
  startWeek: integer('start_week').notNull(),
  weeks: integer('weeks').notNull(),
  color: text('color').notNull().default('#3b82f6'),
  volumePct: integer('volume_pct').notNull().default(0),
  intensityPct: integer('intensity_pct').notNull().default(0),
  rampSets: integer('ramp_sets').notNull().default(0),
  rampLoad: doublePrecision('ramp_load').notNull().default(0),
  deloadLast: boolean('deload_last').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const mobileAuthCodes = pgTable('mobile_auth_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  codeHash: text('code_hash').notNull().unique(),
  codeChallenge: text('code_challenge').notNull(),
  userId: text('user_id').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const mobileSessions = pgTable('mobile_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tokenHash: text('token_hash').notNull().unique(),
  userId: text('user_id').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Columnas comunes de lo que se sincroniza: la hora del teléfono decide qué edición gana y seq es el cursor de lectura. */
const syncColumns = {
  clientUpdatedAt: bigint('client_updated_at', { mode: 'number' }).notNull(),
  deleted: boolean('deleted').notNull().default(false),
  seq: bigint('seq', { mode: 'number' }).notNull().default(sql`nextval('wk_sync_seq')`),
};

export const wkWorkouts = pgTable('wk_workouts', {
  id: uuid('id').primaryKey(),
  userId: text('user_id').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  note: text('note').notNull().default(''),
  cycleId: uuid('cycle_id'),
  planWeek: integer('plan_week'),
  planDay: integer('plan_day'),
  ...syncColumns,
});

export const wkWorkoutExercises = pgTable('wk_workout_exercises', {
  id: uuid('id').primaryKey(),
  userId: text('user_id').notNull(),
  workoutId: uuid('workout_id').notNull(),
  exerciseId: uuid('exercise_id'),
  name: text('name').notNull(),
  position: integer('position').notNull(),
  supersetGroup: integer('superset_group'),
  targetSets: integer('target_sets'),
  targetReps: text('target_reps'),
  note: text('note'),
  restS: integer('rest_s'),
  ...syncColumns,
});

export const wkSets = pgTable('wk_sets', {
  id: uuid('id').primaryKey(),
  userId: text('user_id').notNull(),
  workoutExerciseId: uuid('workout_exercise_id').notNull(),
  position: integer('position').notNull(),
  kind: text('kind').notNull(),
  weightKg: doublePrecision('weight_kg'),
  reps: integer('reps'),
  rir: integer('rir'),
  restS: integer('rest_s'),
  inclinePct: doublePrecision('incline_pct'),
  perSide: boolean('per_side').notNull().default(false),
  doneAt: timestamp('done_at', { withTimezone: true }),
  ...syncColumns,
});
