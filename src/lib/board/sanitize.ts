import {
  BLOCK_ICONS,
  MAX_CYCLES,
  MAX_CYCLE_DAYS,
  MAX_CYCLE_NAME,
  MAX_EXERCISES,
  MAX_LANES,
  MAX_SETS,
  MAX_SUBTYPE,
  MAX_ZONES,
  MIN_CYCLE_DAYS,
  DEFAULT_CYCLE_DAYS,
  compactLanes,
  defaultIconFor,
  resizeCycle,
  type BlockExercise,
  type CycleBlock,
  type CycleDef,
} from './cycle';
import { clamp } from './geometry';

export const MAX_BLOCKS = 100;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);
export const isHexColor = (value: unknown): value is string => typeof value === 'string' && HEX_COLOR.test(value);

const int = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? clamp(Math.round(value), min, max) : fallback;

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const cleanZones = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const item of value) {
    const tag = text(item, 24);
    if (tag) seen.add(tag);
    if (seen.size >= MAX_ZONES) break;
  }
  return [...seen];
};

/** Normaliza la lista de ejercicios de un bloque: solo ids de uuid, rangos acotados y textos recortados. */
export function sanitizeExercises(value: unknown): BlockExercise[] {
  if (!Array.isArray(value)) return [];
  const result: BlockExercise[] = [];
  for (const item of value.slice(0, MAX_EXERCISES) as Record<string, unknown>[]) {
    if (!item || !isUuid(item.exerciseId)) continue;
    const name = text(item.name, 120);
    if (!name) continue;
    result.push({
      exerciseId: item.exerciseId.toLowerCase(),
      name,
      sets: int(item.sets, 1, MAX_SETS, 3),
      reps: text(item.reps, 12) || '8-12',
      notes: text(item.notes, 200),
    });
  }
  return result;
}

/**
 * Normaliza el ciclo recibido del cliente (JSON no confiable): descarta entradas inválidas,
 * limita rangos y resuelve solapes. El resultado siempre es seguro para guardar. Los bloques
 * resultantes pertenecen al ciclo `cycleId`, sea cual sea el que traigan.
 */
export function sanitizeCycle(input: unknown, cycleId = ''): { cycleDays: number; blocks: CycleBlock[] } {
  const raw = (input ?? {}) as { cycleDays?: unknown; blocks?: unknown };
  const cycleDays = int(raw.cycleDays, 1, 28, 7);
  const list = Array.isArray(raw.blocks) ? raw.blocks.slice(0, MAX_BLOCKS) : [];

  const seen = new Set<string>();
  const blocks: CycleBlock[] = [];
  for (const item of list as Record<string, unknown>[]) {
    if (!item || !isUuid(item.id) || seen.has(item.id.toLowerCase())) continue;
    seen.add(item.id.toLowerCase());
    const daySpan = int(item.daySpan, 1, cycleDays, 1);
    const blockType = text(item.blockType, 40) || 'free';
    const block: CycleBlock = {
      id: item.id.toLowerCase(),
      cycleId,
      label: text(item.label, 60),
      color: isHexColor(item.color) ? item.color : '#3b82f6',
      blockType,
      subtype: text(item.subtype, MAX_SUBTYPE),
      dayStart: int(item.dayStart, 0, cycleDays - daySpan, 0),
      daySpan,
      lane: int(item.lane, 0, MAX_LANES - 1, 0),
      zones: cleanZones(item.zones),
      notes: text(item.notes, 500),
      exercises: sanitizeExercises(item.exercises),
      icon: (BLOCK_ICONS as readonly string[]).includes(item.icon as string) ? (item.icon as string) : defaultIconFor(blockType),
    };
    blocks.push(block);
  }
  // La fila que manda el cliente solo marca el orden: se apilan y se descarta lo que no cabe.
  return resizeCycle(compactLanes(blocks).filter((b) => b.lane < MAX_LANES), cycleDays);
}

export const DEFAULT_CYCLE_NAME = 'Gimnasio';

/**
 * Normaliza los ciclos y los bloques recibidos del cliente: hasta MAX_CYCLES ciclos con id válido y sin repetir,
 * nombre y duración acotados, y cada bloque en el ciclo al que apunta (los que apuntan a uno inexistente se
 * descartan, y un id de bloque solo puede aparecer una vez en todo el tablero). Sin ciclos válidos devuelve uno
 * vacío con id nuevo.
 */
export function sanitizeCycles(input: unknown): { cycles: CycleDef[]; blocks: CycleBlock[] } {
  const raw = (input ?? {}) as { cycles?: unknown; blocks?: unknown };
  const seen = new Set<string>();
  const cycles: CycleDef[] = [];
  for (const item of (Array.isArray(raw.cycles) ? raw.cycles : []).slice(0, MAX_CYCLES) as Record<string, unknown>[]) {
    if (!item || !isUuid(item.id) || seen.has(item.id.toLowerCase())) continue;
    seen.add(item.id.toLowerCase());
    cycles.push({
      id: item.id.toLowerCase(),
      name: text(item.name, MAX_CYCLE_NAME) || 'Ciclo',
      days: int(item.days, MIN_CYCLE_DAYS, MAX_CYCLE_DAYS, DEFAULT_CYCLE_DAYS),
    });
  }
  if (cycles.length === 0) return { cycles: [{ id: crypto.randomUUID(), name: DEFAULT_CYCLE_NAME, days: DEFAULT_CYCLE_DAYS }], blocks: [] };

  const seenBlocks = new Set<string>();
  const list = (Array.isArray(raw.blocks) ? raw.blocks : []).filter((b: unknown): b is Record<string, unknown> => {
    const item = b as Record<string, unknown> | null;
    if (!item || !isUuid(item.id) || seenBlocks.has(item.id.toLowerCase())) return false;
    seenBlocks.add(item.id.toLowerCase());
    return true;
  });
  const blocks = cycles
    .flatMap((c) =>
      sanitizeCycle({ cycleDays: c.days, blocks: list.filter((b) => typeof b.cycleId === 'string' && b.cycleId.toLowerCase() === c.id) }, c.id).blocks,
    )
    .slice(0, MAX_BLOCKS);
  return { cycles, blocks };
}
