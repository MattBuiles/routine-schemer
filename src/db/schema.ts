import {
  boolean,
  date,
  doublePrecision,
  integer,
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
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const boardBlocks = pgTable('board_blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  boardId: uuid('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  kind: text('kind').notNull(),
  label: text('label').notNull().default(''),
  color: text('color').notNull().default('#3b82f6'),
  blockType: text('block_type'),
  dayStart: integer('day_start'),
  daySpan: integer('day_span'),
  lane: integer('lane'),
  load: integer('load'),
  zones: text('zones').array().notNull().default([]),
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
