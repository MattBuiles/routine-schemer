import { MAX_LANES, MAX_LOAD, placeBlock, resizeCycle, type CycleBlock } from './cycle';
import { clamp } from './geometry';

export const MAX_BLOCKS = 100;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);
export const isHexColor = (value: unknown): value is string => typeof value === 'string' && HEX_COLOR.test(value);

const int = (value: unknown, min: number, max: number, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? clamp(Math.round(value), min, max) : fallback;

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/**
 * Normaliza el ciclo recibido del cliente (JSON no confiable): descarta entradas inválidas,
 * limita rangos y resuelve solapes. El resultado siempre es seguro para guardar.
 */
export function sanitizeCycle(input: unknown): { cycleDays: number; blocks: CycleBlock[] } {
  const raw = (input ?? {}) as { cycleDays?: unknown; blocks?: unknown };
  const cycleDays = int(raw.cycleDays, 1, 28, 7);
  const list = Array.isArray(raw.blocks) ? raw.blocks.slice(0, MAX_BLOCKS) : [];

  const seen = new Set<string>();
  const placed: CycleBlock[] = [];
  for (const item of list as Record<string, unknown>[]) {
    if (!item || !isUuid(item.id) || seen.has(item.id.toLowerCase())) continue;
    seen.add(item.id.toLowerCase());
    const daySpan = int(item.daySpan, 1, cycleDays, 1);
    const block: CycleBlock = {
      id: item.id.toLowerCase(),
      label: text(item.label, 60),
      color: isHexColor(item.color) ? item.color : '#3b82f6',
      blockType: text(item.blockType, 40) || 'free',
      dayStart: int(item.dayStart, 0, cycleDays - daySpan, 0),
      daySpan,
      lane: int(item.lane, 0, MAX_LANES - 1, 0),
      load: int(item.load, 1, MAX_LOAD, 3),
    };
    const result = placeBlock(placed, block);
    if (result) placed.push(result);
  }
  return resizeCycle(placed, cycleDays);
}
