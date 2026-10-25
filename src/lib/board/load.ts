import 'server-only';

import { and, asc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { blockTypes, boardBlocks, boardCycles, boardPhases, boards } from '@/db/schema';
import { DEFAULT_CYCLE_DAYS, compactLanes, defaultIconFor, type CycleDef } from '@/lib/board/cycle';
import { DEFAULT_CYCLE_NAME, sanitizeExercises } from '@/lib/board/sanitize';
import { DEFAULT_PLAN_WEEKS, sanitizePhases, sanitizePlanWeeks } from '@/lib/board/phases';
import { isIsoDate } from '@/lib/board/plan';
import { sanitizeWidgets } from '@/lib/board/widgets';
import type { BoardData } from '@/app/actions/board';

/** Tablero del usuario; si aún no existe devuelve un ciclo por defecto sin crear nada. */
export async function loadBoard(userId: string): Promise<BoardData> {
  const [board] = await db.select().from(boards).where(eq(boards.userId, userId));
  const customTypes = (await db.select().from(blockTypes).where(eq(blockTypes.userId, userId))).map(
    ({ id, name, color, icon }) => ({ id, name, color, icon }),
  );
  if (!board) {
    const cycles = [{ id: crypto.randomUUID(), name: DEFAULT_CYCLE_NAME, days: DEFAULT_CYCLE_DAYS }];
    return { cycles, blocks: [], widgets: [], phases: [], planStart: null, planWeeks: DEFAULT_PLAN_WEEKS, customTypes };
  }

  const rows = await db
    .select()
    .from(boardBlocks)
    .where(and(eq(boardBlocks.boardId, board.id), eq(boardBlocks.userId, userId)));
  const widgets = sanitizeWidgets(
    rows.filter((r) => r.kind === 'widget').map((r) => ({ id: r.id, type: r.widgetType, x: r.x, y: r.y, w: r.w, h: r.h })),
  );
  const cycleRows = await db
    .select()
    .from(boardCycles)
    .where(and(eq(boardCycles.boardId, board.id), eq(boardCycles.userId, userId)))
    .orderBy(asc(boardCycles.position));
  // Un tablero sin ciclos guardados (aún sin migrar a varios ciclos) usa su duración antigua.
  const cycles: CycleDef[] = cycleRows.length
    ? cycleRows.map((c) => ({ id: c.id, name: c.name, days: c.days }))
    : [{ id: crypto.randomUUID(), name: DEFAULT_CYCLE_NAME, days: board.cycleDays }];
  const phaseRows = await db.select().from(boardPhases).where(and(eq(boardPhases.boardId, board.id), eq(boardPhases.userId, userId)));
  return {
    cycles,
    customTypes,
    widgets,
    planStart: isIsoDate(board.planStart) ? board.planStart : null,
    planWeeks: sanitizePlanWeeks(board.planWeeks),
    phases: sanitizePhases(phaseRows.map((p) => ({ ...p, kind: p.kind })), sanitizePlanWeeks(board.planWeeks)),
    // Los bloques guardados con la disposición antigua (carriles fijos) se apilan al cargar.
    blocks: compactLanes(rows.filter((r) => r.kind === 'cycle').map((r) => ({
      id: r.id,
      cycleId: cycles.some((c) => c.id === r.cycleId) ? r.cycleId! : cycles[0].id,
      label: r.label,
      color: r.color,
      blockType: r.blockType ?? 'free',
      subtype: r.subType ?? '',
      dayStart: r.dayStart ?? 0,
      daySpan: r.daySpan ?? 1,
      lane: r.lane ?? 0,
      zones: r.zones,
      exercises: sanitizeExercises(r.exercises),
      notes: r.notes,
      icon: r.icon ?? defaultIconFor(r.blockType ?? 'free'),
    }))),
  };
}
