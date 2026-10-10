'use server';

import { and, asc, desc, eq, inArray } from 'drizzle-orm';

import { db } from '@/db/client';
import {
  mesocycles,
  mesocycleWeeks,
  progressionRules,
  sessionExercises,
  sessionTemplates,
  trainingPrograms,
  weeklySplitDays,
  weeklySplits,
} from '@/db/schema';
import { requireUserId } from '@/lib/auth/session';
import type {
  DayOfWeek,
  Mesocycle,
  PhaseType,
  Program,
  ProgressionRule,
  SessionTemplate,
  SessionType,
  SplitType,
  WeeklySplit,
} from '@/types/program';

export interface CreateProgramInput {
  name: string;
  description?: string;
  splitType: SplitType;
  totalWeeks: number;
  sessionsPerWeek: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  sessionTemplates: Array<{
    /** Id que usa el cliente para referenciar la plantilla desde los días del split. */
    id?: string;
    name: string;
    type: SessionType;
    focus: string[];
    color: string;
    estimatedDurationMinutes: number;
    exercises: Array<{
      exerciseId?: string;
      exerciseName: string;
      sets: number;
      reps: string;
      intensityPercent?: number;
      restSeconds: number;
      primaryMuscles: string[];
      secondaryMuscles: string[];
      notes?: string;
    }>;
  }>;
  weeklySplit: {
    name: string;
    type: SplitType;
    days: Array<{
      dayOfWeek: DayOfWeek;
      sessionTemplateName?: string;
      sessionTemplateId?: string | null;
      isRestDay: boolean;
      notes?: string;
    }>;
  };
  mesocycles: Array<{
    name: string;
    phase: PhaseType;
    goal: string;
    durationWeeks: number;
    baseIntensityPercent: number;
    baseVolumeMultiplier: number;
    color: string;
    notes?: string;
  }>;
  progressionRules?: Array<Omit<ProgressionRule, 'id'>>;
}

const WEEKDAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

async function requireOwnedProgram(programId: string, userId: string) {
  const [row] = await db
    .select()
    .from(trainingPrograms)
    .where(and(eq(trainingPrograms.id, programId), eq(trainingPrograms.userId, userId)));
  if (!row) throw new Error('Programa no encontrado');
  return row;
}

function toProgram(row: typeof trainingPrograms.$inferSelect): Program {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    description: row.description ?? undefined,
    splitType: row.splitType as SplitType,
    totalWeeks: row.totalWeeks,
    sessionsPerWeek: row.sessionsPerWeek,
    mesocycles: [],
    sessionTemplates: [],
    weeklySplits: [],
    progressionRules: [],
    isActive: row.isActive,
    isTemplate: row.isTemplate,
    tags: row.tags,
    difficulty: row.difficulty as Program['difficulty'],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const groupBy = <T, K>(items: T[], key: (item: T) => K) => {
  const groups = new Map<K, T[]>();
  for (const item of items) groups.set(key(item), [...(groups.get(key(item)) ?? []), item]);
  return groups;
};

/** Carga los programas con sus plantillas, splits, mesociclos y reglas en un número fijo de consultas. */
async function loadPrograms(rows: (typeof trainingPrograms.$inferSelect)[]): Promise<Program[]> {
  if (rows.length === 0) return [];
  const programIds = rows.map(r => r.id);

  const [templateRows, splitRows, mesoRows, ruleRows] = await Promise.all([
    db.select().from(sessionTemplates).where(inArray(sessionTemplates.programId, programIds)).orderBy(asc(sessionTemplates.orderIndex)),
    db.select().from(weeklySplits).where(inArray(weeklySplits.programId, programIds)).orderBy(asc(weeklySplits.name)),
    db.select().from(mesocycles).where(inArray(mesocycles.programId, programIds)).orderBy(asc(mesocycles.orderIndex)),
    db.select().from(progressionRules).where(inArray(progressionRules.programId, programIds)),
  ]);

  const templateIds = templateRows.map(t => t.id);
  const splitIds = splitRows.map(s => s.id);
  const mesoIds = mesoRows.map(m => m.id);

  const [exerciseRows, dayRows, weekRows] = await Promise.all([
    templateIds.length
      ? db.select().from(sessionExercises).where(inArray(sessionExercises.sessionTemplateId, templateIds)).orderBy(asc(sessionExercises.orderIndex))
      : [],
    splitIds.length ? db.select().from(weeklySplitDays).where(inArray(weeklySplitDays.weeklySplitId, splitIds)) : [],
    mesoIds.length
      ? db.select().from(mesocycleWeeks).where(inArray(mesocycleWeeks.mesocycleId, mesoIds)).orderBy(asc(mesocycleWeeks.weekNumber))
      : [],
  ]);

  const exercisesByTemplate = groupBy(exerciseRows, e => e.sessionTemplateId);
  const daysBySplit = groupBy(dayRows, d => d.weeklySplitId);
  const weeksByMeso = groupBy(weekRows, w => w.mesocycleId);
  const templatesByProgram = groupBy(templateRows, t => t.programId);
  const splitsByProgram = groupBy(splitRows, s => s.programId);
  const mesosByProgram = groupBy(mesoRows, m => m.programId);
  const rulesByProgram = groupBy(ruleRows, r => r.programId);

  return rows.map(row => ({
    ...toProgram(row),
    sessionTemplates: (templatesByProgram.get(row.id) ?? []).map((t): SessionTemplate => ({
      id: t.id,
      name: t.name,
      type: t.type as SessionType,
      focus: t.focus,
      exercises: (exercisesByTemplate.get(t.id) ?? []).map(e => ({
        id: e.id,
        exerciseId: e.exerciseId ?? '',
        exerciseName: e.exerciseName,
        sets: e.sets,
        reps: e.reps,
        intensityPercent: e.intensityPercent ?? undefined,
        tempo: e.tempo ?? undefined,
        restSeconds: e.restSeconds,
        rpe: e.rpe ?? undefined,
        notes: e.notes ?? undefined,
        order: e.orderIndex,
        primaryMuscles: e.primaryMuscles,
        secondaryMuscles: e.secondaryMuscles,
      })),
      estimatedDurationMinutes: t.estimatedDurationMinutes,
      estimatedVolume: 0,
      color: t.color,
      notes: t.notes ?? undefined,
      tags: [],
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
    weeklySplits: (splitsByProgram.get(row.id) ?? []).map((s): WeeklySplit => ({
      id: s.id,
      name: s.name,
      type: s.type as SplitType,
      days: (daysBySplit.get(s.id) ?? [])
        .sort((a, b) => WEEKDAYS.indexOf(a.dayOfWeek as DayOfWeek) - WEEKDAYS.indexOf(b.dayOfWeek as DayOfWeek))
        .map(d => ({
          dayOfWeek: d.dayOfWeek as DayOfWeek,
          sessionTemplateId: d.sessionTemplateId,
          isRestDay: d.isRestDay,
          notes: d.notes ?? undefined,
        })),
      totalSessionsPerWeek: s.totalSessionsPerWeek,
      estimatedWeeklyVolume: 0,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
    mesocycles: (mesosByProgram.get(row.id) ?? []).map((m): Mesocycle => ({
      id: m.id,
      name: m.name,
      phase: m.phase as PhaseType,
      goal: m.goal,
      durationWeeks: m.durationWeeks,
      weeks: (weeksByMeso.get(m.id) ?? []).map(w => ({
        weekNumber: w.weekNumber,
        weeklySplitId: w.weeklySplitId ?? '',
        progressionModifier: w.progressionModifier,
        intensityModifier: w.intensityModifier,
        volumeModifier: w.volumeModifier,
        notes: w.notes ?? undefined,
      })),
      baseIntensityPercent: m.baseIntensityPercent,
      baseVolumeMultiplier: m.baseVolumeMultiplier,
      color: m.color,
      order: m.orderIndex,
      notes: m.notes ?? undefined,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    })),
    progressionRules: (rulesByProgram.get(row.id) ?? []).map(r => ({
      id: r.id,
      type: r.type as ProgressionRule['type'],
      variable: r.variable as ProgressionRule['variable'],
      startValue: r.startValue,
      incrementPerWeek: r.incrementPerWeek,
      incrementPerMesocycle: r.incrementPerMesocycle ?? undefined,
      capValue: r.capValue ?? undefined,
      deloadReduction: r.deloadReduction ?? undefined,
    })),
  }));
}

export async function getPrograms(): Promise<Program[]> {
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(trainingPrograms)
    .where(eq(trainingPrograms.userId, userId))
    .orderBy(desc(trainingPrograms.createdAt));
  return loadPrograms(rows);
}

export async function getProgram(programId: string): Promise<Program | null> {
  const userId = await requireUserId();
  const rows = await db
    .select()
    .from(trainingPrograms)
    .where(and(eq(trainingPrograms.id, programId), eq(trainingPrograms.userId, userId)));
  return (await loadPrograms(rows))[0] ?? null;
}

const TRAINING_DAYS: Record<number, DayOfWeek[]> = {
  1: ['monday'],
  2: ['monday', 'thursday'],
  3: ['monday', 'wednesday', 'friday'],
  4: ['monday', 'tuesday', 'thursday', 'friday'],
  5: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  6: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
  7: WEEKDAYS,
};

/** Si el split no asigna sesiones a ningún día, reparte las plantillas en los días de entreno según `sessionsPerWeek`. */
function resolveSplitDays(input: CreateProgramInput): CreateProgramInput['weeklySplit']['days'] {
  const given = input.weeklySplit.days;
  if (given.some(day => day.sessionTemplateName || day.sessionTemplateId)) return given;

  const trainingDays = TRAINING_DAYS[Math.min(Math.max(input.sessionsPerWeek, 1), 7)];
  const templates = input.sessionTemplates;
  return WEEKDAYS.map(dayOfWeek => {
    const index = trainingDays.indexOf(dayOfWeek);
    const template = index >= 0 && templates.length > 0 ? templates[index % templates.length] : undefined;
    return template
      ? { dayOfWeek, sessionTemplateName: template.name, isRestDay: false }
      : { dayOfWeek, isRestDay: true };
  });
}

/** Sentencias que (re)crean todo lo que cuelga de un programa. Los ids se generan aquí para poder lanzarlas en un solo batch. */
function structureStatements(programId: string, input: CreateProgramInput) {
  const splitId = crypto.randomUUID();
  const templateIdsByName = new Map<string, string>();
  const templateIdsByClientId = new Map<string, string>();

  const templateRows: (typeof sessionTemplates.$inferInsert)[] = [];
  const exerciseRows: (typeof sessionExercises.$inferInsert)[] = [];

  input.sessionTemplates.forEach((template, templateIndex) => {
    const id = crypto.randomUUID();
    templateIdsByName.set(template.name, id);
    if (template.id) templateIdsByClientId.set(template.id, id);
    templateRows.push({
      id,
      programId,
      name: template.name,
      type: template.type,
      focus: template.focus,
      color: template.color,
      estimatedDurationMinutes: template.estimatedDurationMinutes,
      orderIndex: templateIndex,
    });
    template.exercises.forEach((exercise, i) => {
      exerciseRows.push({
        sessionTemplateId: id,
        exerciseId: exercise.exerciseId || undefined,
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
        reps: exercise.reps,
        intensityPercent: exercise.intensityPercent,
        restSeconds: exercise.restSeconds,
        orderIndex: i,
        primaryMuscles: exercise.primaryMuscles,
        secondaryMuscles: exercise.secondaryMuscles,
        notes: exercise.notes,
      });
    });
  });

  const dayRows = resolveSplitDays(input).map(day => {
    const sessionTemplateId =
      (day.sessionTemplateName && templateIdsByName.get(day.sessionTemplateName)) ||
      (day.sessionTemplateId && templateIdsByClientId.get(day.sessionTemplateId)) ||
      undefined;
    return {
      weeklySplitId: splitId,
      dayOfWeek: day.dayOfWeek,
      sessionTemplateId,
      isRestDay: sessionTemplateId ? false : day.isRestDay,
      notes: day.notes,
    };
  });

  const mesoRows: (typeof mesocycles.$inferInsert)[] = [];
  const weekRows: (typeof mesocycleWeeks.$inferInsert)[] = [];
  input.mesocycles.forEach((meso, i) => {
    const id = crypto.randomUUID();
    mesoRows.push({
      id,
      programId,
      name: meso.name,
      phase: meso.phase,
      goal: meso.goal,
      durationWeeks: meso.durationWeeks,
      baseIntensityPercent: meso.baseIntensityPercent,
      baseVolumeMultiplier: meso.baseVolumeMultiplier,
      color: meso.color,
      orderIndex: i,
      notes: meso.notes,
    });
    for (let weekNumber = 1; weekNumber <= meso.durationWeeks; weekNumber++) {
      // La última semana de cada mesociclo (o todas las de una fase deload) lleva descarga.
      const isDeload = meso.phase === 'deload' || weekNumber === meso.durationWeeks;
      weekRows.push({
        mesocycleId: id,
        weekNumber,
        weeklySplitId: splitId,
        progressionModifier: isDeload ? 0.7 : 1,
      });
    }
  });

  const ruleRows = (input.progressionRules ?? []).map(({ type, variable, startValue, incrementPerWeek, incrementPerMesocycle, capValue, deloadReduction }) => ({
    programId,
    type,
    variable,
    startValue,
    incrementPerWeek,
    incrementPerMesocycle,
    capValue,
    deloadReduction,
  }));

  return [
    ...(templateRows.length ? [db.insert(sessionTemplates).values(templateRows)] : []),
    ...(exerciseRows.length ? [db.insert(sessionExercises).values(exerciseRows)] : []),
    db.insert(weeklySplits).values({
      id: splitId,
      programId,
      name: input.weeklySplit.name,
      type: input.weeklySplit.type,
      totalSessionsPerWeek: input.sessionsPerWeek,
    }),
    ...(dayRows.length ? [db.insert(weeklySplitDays).values(dayRows)] : []),
    ...(mesoRows.length ? [db.insert(mesocycles).values(mesoRows)] : []),
    ...(weekRows.length ? [db.insert(mesocycleWeeks).values(weekRows)] : []),
    ...(ruleRows.length ? [db.insert(progressionRules).values(ruleRows)] : []),
  ];
}

/** Convierte la forma de `Program` (la que edita el asistente) en la entrada de las acciones. */
function structureInput(program: Pick<Program, 'name' | 'splitType' | 'sessionsPerWeek' | 'sessionTemplates' | 'weeklySplits' | 'mesocycles' | 'progressionRules'>) {
  const split = program.weeklySplits[0];
  return {
    sessionTemplates: program.sessionTemplates.map(t => ({
      id: t.id,
      name: t.name,
      type: t.type,
      focus: t.focus,
      color: t.color,
      estimatedDurationMinutes: t.estimatedDurationMinutes,
      exercises: t.exercises.map(e => ({
        exerciseId: e.exerciseId || undefined,
        exerciseName: e.exerciseName,
        sets: e.sets,
        reps: e.reps,
        intensityPercent: e.intensityPercent,
        restSeconds: e.restSeconds,
        primaryMuscles: e.primaryMuscles,
        secondaryMuscles: e.secondaryMuscles,
        notes: e.notes,
      })),
    })),
    weeklySplit: {
      name: split?.name ?? program.name,
      type: split?.type ?? program.splitType,
      days: (split?.days ?? []).map(d => ({
        dayOfWeek: d.dayOfWeek,
        sessionTemplateId: d.sessionTemplateId,
        isRestDay: d.isRestDay,
        notes: d.notes,
      })),
    },
    mesocycles: program.mesocycles.map(m => ({
      name: m.name,
      phase: m.phase,
      goal: m.goal,
      durationWeeks: m.durationWeeks,
      baseIntensityPercent: m.baseIntensityPercent,
      baseVolumeMultiplier: m.baseVolumeMultiplier,
      color: m.color,
      notes: m.notes,
    })),
    progressionRules: program.progressionRules,
  };
}

async function insertCompleteProgram(userId: string, input: CreateProgramInput): Promise<string> {
  const programId = crypto.randomUUID();

  // neon-http no tiene transacciones interactivas; batch las ejecuta atómicamente.
  await db.batch([
    db.insert(trainingPrograms).values({
      id: programId,
      userId,
      name: input.name,
      description: input.description,
      splitType: input.splitType,
      totalWeeks: input.totalWeeks,
      sessionsPerWeek: input.sessionsPerWeek,
      difficulty: input.difficulty ?? 'intermediate',
      tags: input.tags ?? [],
    }),
    ...structureStatements(programId, input),
  ] as Parameters<typeof db.batch>[0]);

  return programId;
}

export async function createCompleteProgram(input: CreateProgramInput): Promise<string> {
  return insertCompleteProgram(await requireUserId(), input);
}

export async function updateProgram(programId: string, updates: Partial<Program>): Promise<void> {
  const userId = await requireUserId();
  const current = await requireOwnedProgram(programId, userId);

  const values = {
    name: updates.name,
    description: updates.description,
    splitType: updates.splitType,
    totalWeeks: updates.totalWeeks,
    sessionsPerWeek: updates.sessionsPerWeek,
    difficulty: updates.difficulty,
    tags: updates.tags,
    isActive: updates.isActive,
  };
  const defined = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined));
  const updateRow = db
    .update(trainingPrograms)
    .set({ ...defined, updatedAt: new Date() })
    .where(and(eq(trainingPrograms.id, programId), eq(trainingPrograms.userId, userId)));

  // Si llega estructura (edición desde el asistente) se reemplaza completa; si no, solo cambian los datos básicos.
  const hasStructure = updates.sessionTemplates && updates.weeklySplits && updates.mesocycles;
  if (!hasStructure) {
    await updateRow;
    return;
  }

  const structure = structureInput({
    name: updates.name ?? current.name,
    splitType: updates.splitType ?? (current.splitType as SplitType),
    sessionsPerWeek: updates.sessionsPerWeek ?? current.sessionsPerWeek,
    sessionTemplates: updates.sessionTemplates!,
    weeklySplits: updates.weeklySplits!,
    mesocycles: updates.mesocycles!,
    progressionRules: updates.progressionRules ?? [],
  });

  await db.batch([
    db.delete(sessionTemplates).where(eq(sessionTemplates.programId, programId)),
    db.delete(weeklySplits).where(eq(weeklySplits.programId, programId)),
    db.delete(mesocycles).where(eq(mesocycles.programId, programId)),
    db.delete(progressionRules).where(eq(progressionRules.programId, programId)),
    updateRow,
    ...structureStatements(programId, {
      name: updates.name ?? current.name,
      splitType: updates.splitType ?? (current.splitType as SplitType),
      totalWeeks: updates.totalWeeks ?? current.totalWeeks,
      sessionsPerWeek: updates.sessionsPerWeek ?? current.sessionsPerWeek,
      ...structure,
    }),
  ] as Parameters<typeof db.batch>[0]);
}

export async function deleteProgram(programId: string): Promise<void> {
  const userId = await requireUserId();
  await db
    .delete(trainingPrograms)
    .where(and(eq(trainingPrograms.id, programId), eq(trainingPrograms.userId, userId)));
}

export async function duplicateProgram(programId: string): Promise<string> {
  const userId = await requireUserId();
  const original = await getProgram(programId);
  if (!original) throw new Error('Programa no encontrado');

  return insertCompleteProgram(userId, {
    name: `${original.name} (Copia)`,
    description: original.description,
    splitType: original.splitType,
    totalWeeks: original.totalWeeks,
    sessionsPerWeek: original.sessionsPerWeek,
    difficulty: original.difficulty,
    tags: original.tags,
    ...structureInput(original),
  });
}
