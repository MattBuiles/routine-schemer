import {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

export const userProfiles = pgTable('user_profiles', {
  id: text('id').primaryKey(),
  age: integer('age'),
  weight: numeric('weight', { precision: 5, scale: 2 }),
  height: numeric('height', { precision: 5, scale: 2 }),
  bodyFat: numeric('body_fat', { precision: 4, scale: 2 }),
  activityLevel: text('activity_level'),
  experience: text('experience'),
  weeklyGoal: integer('weekly_goal'),
  preferences: jsonb('preferences').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userGoals = pgTable('user_goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => userProfiles.id, { onDelete: 'cascade' }),
  goal: text('goal').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trainingPrograms = pgTable('training_programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  splitType: text('split_type').notNull(),
  totalWeeks: integer('total_weeks').notNull(),
  sessionsPerWeek: integer('sessions_per_week').notNull(),
  isActive: boolean('is_active').notNull().default(false),
  isTemplate: boolean('is_template').notNull().default(false),
  tags: text('tags').array().notNull().default([]),
  difficulty: text('difficulty').notNull().default('intermediate'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessionTemplates = pgTable('session_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  programId: uuid('program_id').notNull().references(() => trainingPrograms.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  focus: text('focus').array().notNull().default([]),
  color: text('color').notNull().default('#3b82f6'),
  estimatedDurationMinutes: integer('estimated_duration_minutes').notNull().default(60),
  orderIndex: integer('order_index').notNull().default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessionExercises = pgTable('session_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionTemplateId: uuid('session_template_id').notNull().references(() => sessionTemplates.id, { onDelete: 'cascade' }),
  exerciseId: text('exercise_id'),
  exerciseName: text('exercise_name').notNull(),
  sets: integer('sets').notNull(),
  reps: text('reps').notNull(),
  intensityPercent: doublePrecision('intensity_percent'),
  tempo: text('tempo'),
  restSeconds: integer('rest_seconds').notNull(),
  rpe: doublePrecision('rpe'),
  notes: text('notes'),
  orderIndex: integer('order_index').notNull().default(0),
  primaryMuscles: text('primary_muscles').array().notNull().default([]),
  secondaryMuscles: text('secondary_muscles').array().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const weeklySplits = pgTable('weekly_splits', {
  id: uuid('id').defaultRandom().primaryKey(),
  programId: uuid('program_id').notNull().references(() => trainingPrograms.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  totalSessionsPerWeek: integer('total_sessions_per_week').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const weeklySplitDays = pgTable('weekly_split_days', {
  id: uuid('id').defaultRandom().primaryKey(),
  weeklySplitId: uuid('weekly_split_id').notNull().references(() => weeklySplits.id, { onDelete: 'cascade' }),
  dayOfWeek: text('day_of_week').notNull(),
  sessionTemplateId: uuid('session_template_id').references(() => sessionTemplates.id, { onDelete: 'set null' }),
  isRestDay: boolean('is_rest_day').notNull().default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const mesocycles = pgTable('mesocycles', {
  id: uuid('id').defaultRandom().primaryKey(),
  programId: uuid('program_id').notNull().references(() => trainingPrograms.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phase: text('phase').notNull(),
  goal: text('goal').notNull(),
  durationWeeks: integer('duration_weeks').notNull(),
  baseIntensityPercent: doublePrecision('base_intensity_percent').notNull().default(70),
  baseVolumeMultiplier: doublePrecision('base_volume_multiplier').notNull().default(1),
  color: text('color').notNull().default('#3b82f6'),
  orderIndex: integer('order_index').notNull().default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const mesocycleWeeks = pgTable('mesocycle_weeks', {
  id: uuid('id').defaultRandom().primaryKey(),
  mesocycleId: uuid('mesocycle_id').notNull().references(() => mesocycles.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(),
  weeklySplitId: uuid('weekly_split_id').references(() => weeklySplits.id, { onDelete: 'set null' }),
  progressionModifier: doublePrecision('progression_modifier').notNull().default(1),
  intensityModifier: doublePrecision('intensity_modifier').notNull().default(1),
  volumeModifier: doublePrecision('volume_modifier').notNull().default(1),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const progressionRules = pgTable('progression_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  programId: uuid('program_id').notNull().references(() => trainingPrograms.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  variable: text('variable').notNull(),
  startValue: doublePrecision('start_value').notNull(),
  incrementPerWeek: doublePrecision('increment_per_week').notNull(),
  incrementPerMesocycle: doublePrecision('increment_per_mesocycle'),
  capValue: doublePrecision('cap_value'),
  deloadReduction: doublePrecision('deload_reduction'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

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
  workoutSessionId: uuid('workout_session_id').references(() => sessionTemplates.id, { onDelete: 'set null' }),
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
  sessionTemplateId: uuid('session_template_id').references(() => sessionTemplates.id, { onDelete: 'set null' }),
  completed: boolean('completed').notNull().default(false),
  actualDuration: integer('actual_duration'),
  notes: text('notes'),
  category: text('category'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
