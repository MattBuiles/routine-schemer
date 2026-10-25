'use server';

import { and, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { blockTypes, boardBlocks, boardCycles, boardPhases, boards } from '@/db/schema';
import { requireUserId } from '@/lib/auth/session';
import { loadBoard } from '@/lib/board/load';
import { BLOCK_ICONS, DEFAULT_CYCLE_DAYS, type CycleBlock, type CycleDef } from '@/lib/board/cycle';
import { isHexColor, isUuid, sanitizeCycles } from '@/lib/board/sanitize';
import { sanitizePhases, sanitizePlanWeeks, type Phase } from '@/lib/board/phases';
import { isIsoDate } from '@/lib/board/plan';
import { sanitizeWidgets, type BoardWidget, type WidgetType } from '@/lib/board/widgets';

export interface CustomBlockType {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface BoardData {
  /** Ciclos del tablero (siempre al menos uno), en el orden en que se muestran. */
  cycles: CycleDef[];
  blocks: CycleBlock[];
  widgets: BoardWidget[];
  phases: Phase[];
  /** Fecha (AAAA-MM-DD) en la que empieza la semana 1 del plan, o null si no está anclado al calendario. */
  planStart: string | null;
  /** Duración total del plan en semanas; al terminar vuelve a empezar. */
  planWeeks: number;
  customTypes: CustomBlockType[];
}

/** Tablero del usuario; si aún no existe devuelve un ciclo por defecto sin crear nada. */
export async function getBoard(): Promise<BoardData> {
  return loadBoard(await requireUserId());
}

/**
 * Guarda los ciclos del tablero con sus bloques (reemplaza todos). La entrada del cliente se normaliza con
 * `sanitizeCycles` y el `userId` sale de la sesión; los widgets y el plan no se tocan.
 */
export async function saveCycles(input: { cycles: CycleDef[]; blocks: CycleBlock[] }): Promise<void> {
  const userId = await requireUserId();
  const { cycles, blocks } = sanitizeCycles(input);

  const [board] = await db
    .insert(boards)
    .values({ userId, cycleDays: cycles[0].days })
    .onConflictDoUpdate({ target: boards.userId, set: { cycleDays: cycles[0].days, updatedAt: new Date() } })
    .returning({ id: boards.id });

  // neon-http no tiene transacciones interactivas; batch las ejecuta atómicamente.
  await db.batch([
    db.delete(boardBlocks).where(and(eq(boardBlocks.boardId, board.id), eq(boardBlocks.userId, userId), eq(boardBlocks.kind, 'cycle'))),
    db.delete(boardCycles).where(and(eq(boardCycles.boardId, board.id), eq(boardCycles.userId, userId))),
    db.insert(boardCycles).values(cycles.map((c, position) => ({ id: c.id, boardId: board.id, userId, name: c.name, days: c.days, position }))),
    ...(blocks.length === 0
      ? []
      : [
          db.insert(boardBlocks).values(
            blocks.map((b) => ({
              id: b.id,
              boardId: board.id,
              cycleId: b.cycleId,
              userId,
              kind: 'cycle',
              label: b.label,
              color: b.color,
              blockType: b.blockType,
              subType: b.subtype,
              dayStart: b.dayStart,
              daySpan: b.daySpan,
              lane: b.lane,
              zones: b.zones,
              exercises: b.exercises,
              notes: b.notes,
              icon: b.icon,
            })),
          ),
        ]),
  ]);
}

/** Guarda los widgets del tablero (reemplaza todos); no toca los bloques del ciclo. */
export async function saveWidgets(input: BoardWidget[]): Promise<void> {
  const userId = await requireUserId();
  const widgets = sanitizeWidgets(input);

  // Si el tablero aún no existe se crea con el ciclo por defecto; si existe, solo se refresca la fecha.
  const [board] = await db
    .insert(boards)
    .values({ userId, cycleDays: DEFAULT_CYCLE_DAYS })
    .onConflictDoUpdate({ target: boards.userId, set: { updatedAt: new Date() } })
    .returning({ id: boards.id });

  const clear = db
    .delete(boardBlocks)
    .where(and(eq(boardBlocks.boardId, board.id), eq(boardBlocks.userId, userId), eq(boardBlocks.kind, 'widget')));
  if (widgets.length === 0) {
    await clear;
    return;
  }
  await db.batch([
    clear,
    db.insert(boardBlocks).values(
      widgets.map((w) => ({
        id: w.id,
        boardId: board.id,
        userId,
        kind: 'widget',
        label: '',
        widgetType: w.type satisfies WidgetType,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
      })),
    ),
  ]);
}

/**
 * Guarda el plan: las fases (reemplaza todas), la fecha de inicio y la duración total. No toca el ciclo ni los widgets.
 * Una fecha que no sea AAAA-MM-DD real se guarda como «sin anclar»; las fases se recortan a la duración.
 */
export async function savePhases(input: { phases: Phase[]; planStart: string | null; planWeeks: number }): Promise<void> {
  const userId = await requireUserId();
  const planWeeks = sanitizePlanWeeks(input?.planWeeks);
  const phases = sanitizePhases(input?.phases, planWeeks);
  const planStart = isIsoDate(input?.planStart) ? input.planStart : null;

  const [board] = await db
    .insert(boards)
    .values({ userId, cycleDays: DEFAULT_CYCLE_DAYS, planStart, planWeeks })
    .onConflictDoUpdate({ target: boards.userId, set: { planStart, planWeeks, updatedAt: new Date() } })
    .returning({ id: boards.id });

  const clear = db.delete(boardPhases).where(and(eq(boardPhases.boardId, board.id), eq(boardPhases.userId, userId)));
  if (phases.length === 0) {
    await clear;
    return;
  }
  await db.batch([
    clear,
    db.insert(boardPhases).values(
      phases.map((p) => ({
        id: p.id,
        boardId: board.id,
        userId,
        name: p.name,
        kind: p.kind,
        startWeek: p.startWeek,
        weeks: p.weeks,
        color: p.color,
        volumePct: p.volumePct,
        intensityPct: p.intensityPct,
        rampSets: p.rampSets,
        rampLoad: p.rampLoad,
        deloadLast: p.deloadLast,
      })),
    ),
  ]);
}

export async function createBlockType(input: { name: string; color: string; icon?: string }): Promise<CustomBlockType> {
  const userId = await requireUserId();
  const name = typeof input?.name === 'string' ? input.name.trim().slice(0, 40) : '';
  if (!name) throw new Error('El tipo necesita un nombre');
  const color = isHexColor(input.color) ? input.color : '#3b82f6';
  const icon = (BLOCK_ICONS as readonly string[]).includes(input.icon as string) ? (input.icon as string) : 'sparkles';
  const [row] = await db.insert(blockTypes).values({ userId, name, color, icon }).returning();
  return { id: row.id, name: row.name, color: row.color, icon: row.icon };
}

export async function deleteBlockType(id: string): Promise<void> {
  const userId = await requireUserId();
  if (!isUuid(id)) return;
  await db.delete(blockTypes).where(and(eq(blockTypes.id, id), eq(blockTypes.userId, userId)));
}
