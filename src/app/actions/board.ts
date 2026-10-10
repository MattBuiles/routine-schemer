'use server';

import { and, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { blockTypes, boardBlocks, boards } from '@/db/schema';
import { requireUserId } from '@/lib/auth/session';
import { DEFAULT_CYCLE_DAYS, type CycleBlock } from '@/lib/board/cycle';
import { isHexColor, isUuid, sanitizeCycle } from '@/lib/board/sanitize';

export interface CustomBlockType {
  id: string;
  name: string;
  color: string;
}

export interface BoardData {
  cycleDays: number;
  blocks: CycleBlock[];
  customTypes: CustomBlockType[];
}

/** Tablero del usuario; si aún no existe devuelve el ciclo por defecto sin crear nada. */
export async function getBoard(): Promise<BoardData> {
  const userId = await requireUserId();
  const [board] = await db.select().from(boards).where(eq(boards.userId, userId));
  const customTypes = (await db.select().from(blockTypes).where(eq(blockTypes.userId, userId))).map(
    ({ id, name, color }) => ({ id, name, color }),
  );
  if (!board) return { cycleDays: DEFAULT_CYCLE_DAYS, blocks: [], customTypes };

  const rows = await db
    .select()
    .from(boardBlocks)
    .where(and(eq(boardBlocks.boardId, board.id), eq(boardBlocks.userId, userId), eq(boardBlocks.kind, 'cycle')));
  return {
    cycleDays: board.cycleDays,
    customTypes,
    blocks: rows.map((r) => ({
      id: r.id,
      label: r.label,
      color: r.color,
      blockType: r.blockType ?? 'free',
      dayStart: r.dayStart ?? 0,
      daySpan: r.daySpan ?? 1,
      lane: r.lane ?? 0,
      load: r.load ?? 3,
    })),
  };
}

/**
 * Guarda el ciclo completo (duración y bloques). La entrada del cliente se normaliza con
 * `sanitizeCycle` y el `userId` sale de la sesión; los widgets del tablero no se tocan.
 */
export async function saveCycle(input: { cycleDays: number; blocks: CycleBlock[] }): Promise<void> {
  const userId = await requireUserId();
  const { cycleDays, blocks } = sanitizeCycle(input);

  const [board] = await db
    .insert(boards)
    .values({ userId, cycleDays })
    .onConflictDoUpdate({ target: boards.userId, set: { cycleDays, updatedAt: new Date() } })
    .returning({ id: boards.id });

  // neon-http no tiene transacciones interactivas; batch las ejecuta atómicamente.
  const clear = db
    .delete(boardBlocks)
    .where(and(eq(boardBlocks.boardId, board.id), eq(boardBlocks.userId, userId), eq(boardBlocks.kind, 'cycle')));
  if (blocks.length === 0) {
    await clear;
    return;
  }
  await db.batch([
    clear,
    db.insert(boardBlocks).values(
      blocks.map((b) => ({
        id: b.id,
        boardId: board.id,
        userId,
        kind: 'cycle',
        label: b.label,
        color: b.color,
        blockType: b.blockType,
        dayStart: b.dayStart,
        daySpan: b.daySpan,
        lane: b.lane,
        load: b.load,
      })),
    ),
  ]);
}

export async function createBlockType(input: { name: string; color: string }): Promise<CustomBlockType> {
  const userId = await requireUserId();
  const name = typeof input?.name === 'string' ? input.name.trim().slice(0, 40) : '';
  if (!name) throw new Error('El tipo necesita un nombre');
  const color = isHexColor(input.color) ? input.color : '#3b82f6';
  const [row] = await db.insert(blockTypes).values({ userId, name, color }).returning();
  return { id: row.id, name: row.name, color: row.color };
}

export async function deleteBlockType(id: string): Promise<void> {
  const userId = await requireUserId();
  if (!isUuid(id)) return;
  await db.delete(blockTypes).where(and(eq(blockTypes.id, id), eq(blockTypes.userId, userId)));
}
