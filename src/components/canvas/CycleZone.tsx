'use client';

import React, { useRef, useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';

import {
  DAY_W,
  HEADER_H,
  LANE_H,
  CYCLE_FOOT_H,
  MAX_CYCLE_DAYS,
  MAX_CYCLE_NAME,
  MIN_CYCLE_DAYS,
  cycleHeight,
  fromRect,
  stackBlocks,
  toRect,
  type CycleBlock,
  type CycleDef,
} from '@/lib/board/cycle';
import type { Rect } from '@/lib/board/geometry';
import Block from './Block';
import BlockContent from './BlockContent';
import { getIcon } from './blockIcons';

// x deja libre la paleta flotante (16px de margen + 176px de ancho) con el viewport por defecto.
export interface DropPreview {
  /** Ciclo sobre el que se arrastra: solo su zona pinta la vista previa. */
  cycleId: string;
  dayStart: number;
  lane: number;
  color: string;
  label: string;
  icon: string;
}

/** Separación visual entre bloques contiguos (px a cada lado). */
const BLOCK_GAP = 5;

export const ZONE_ORIGIN = { x: 240, y: 260 };

interface CycleZoneProps {
  cycle: CycleDef;
  /** Posición vertical (px) bajo el origen de la zona: los ciclos se apilan según lo que ocupa cada uno. */
  top: number;
  /** Solo los bloques de este ciclo. */
  blocks: CycleBlock[];
  selectedId: string | null;
  /** Hueco donde caería el bloque que se arrastra desde la paleta. */
  dropPreview?: DropPreview | null;
  onSelect: (id: string | null) => void;
  /** Reemplaza los bloques (un único paso de deshacer). */
  onBlocksChange: (blocks: CycleBlock[]) => void;
  onDelete: (id: string) => void;
  onCycleDaysChange: (days: number) => void;
  onNameChange: (name: string) => void;
  /** Sin valor cuando es el único ciclo: no se puede borrar. */
  onDeleteCycle?: () => void;
  /** Doble clic en un hueco: día y orden de inserción en la pila bajo el cursor. */
  onCreateAt: (dayStart: number, order: number) => void;
}

/** Zona del ciclo: días en columnas, carriles en filas; ancho de bloque = días, alto = carga. */
export default function CycleZone({
  cycle,
  top,
  blocks,
  selectedId,
  dropPreview,
  onSelect,
  onBlocksChange,
  onDelete,
  onCycleDaysChange,
  onNameChange,
  onDeleteCycle,
  onCreateAt,
}: CycleZoneProps) {
  const cycleDays = cycle.days;
  const [live, setLive] = useState<{ id: string; rect: Rect } | null>(null);
  const liveRef = useRef<{ id: string; rect: Rect } | null>(null);

  const width = cycleDays * DAY_W;
  const height = cycleHeight(blocks);

  const setLiveRect = (id: string, rect: Rect) => {
    liveRef.current = { id, rect };
    setLive(liveRef.current);
  };

  const settle = (id: string) => {
    const current = liveRef.current;
    liveRef.current = null;
    setLive(null);
    const block = blocks.find((b) => b.id === id);
    if (!current || current.id !== id || !block) return;
    const next = fromRect(current.rect, cycleDays);
    // Si empata con otro bloque de la fila, gana el sentido del movimiento: hacia arriba antes, hacia abajo después.
    const lane = next.lane < block.lane ? next.lane - 0.01 : next.lane > block.lane ? next.lane + 0.01 : next.lane;
    const stacked = stackBlocks(blocks, { ...block, ...next, lane });
    if (!stacked) return; // sin hueco: el bloque vuelve a su sitio
    if (JSON.stringify(stacked) !== JSON.stringify(blocks)) onBlocksChange(stacked);
  };

  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.cell) return;
    const box = e.currentTarget.getBoundingClientRect();
    const zoom = box.width / width;
    const x = (e.clientX - box.left) / zoom;
    const y = (e.clientY - box.top) / zoom;
    if (y < HEADER_H || y >= height) return;
    onCreateAt(Math.min(cycleDays - 1, Math.floor(x / DAY_W)), (y - HEADER_H) / LANE_H - 0.5);
  };

  return (
    <div className="absolute" style={{ left: ZONE_ORIGIN.x, top: ZONE_ORIGIN.y + top }}>
      <div
        data-testid="cycle-zone"
        data-cycle-id={cycle.id}
        className="relative rounded-2xl border border-border bg-surface/70 shadow-[var(--shadow)]"
        style={{ width, height: height + CYCLE_FOOT_H }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.cell) onSelect(null);
        }}
        onDoubleClick={onDoubleClick}
      >
        {Array.from({ length: cycleDays }, (_, day) => (
          <div
            key={day}
            data-cell
            className="absolute top-0 border-l border-border first:border-l-0"
            style={{ left: day * DAY_W, width: DAY_W, height, background: day % 2 ? 'transparent' : 'var(--bg-subtle)', opacity: 0.6 }}
          >
            <div data-cell className="flex items-center justify-center text-xs font-medium text-muted" style={{ height: HEADER_H }}>
              Día {day + 1}
            </div>
          </div>
        ))}

        {blocks.map((b) => (
          <Block
            key={b.id}
            rect={live?.id === b.id ? live.rect : toRect(b)}
            color={b.color}
            label={b.label || 'Sin nombre'}
            content={<BlockContent block={b} />}
            selected={b.id === selectedId}
            onSelect={() => onSelect(b.id)}
            onGestureStart={() => undefined}
            onRectChange={(rect) => setLiveRect(b.id, rect)}
            onGestureEnd={() => settle(b.id)}
            onDelete={() => onDelete(b.id)}
            keyStep={{ x: DAY_W, y: LANE_H }}
            inset={BLOCK_GAP}
            widthOnly
          />
        ))}

        {dropPreview?.cycleId === cycle.id && (
          <div
            data-testid="drop-preview"
            className="pointer-events-none absolute flex items-center gap-1.5 rounded-xl border-2 border-dashed px-2 text-sm font-semibold"
            style={{
              left: dropPreview.dayStart * DAY_W + BLOCK_GAP,
              top: HEADER_H + dropPreview.lane * LANE_H + BLOCK_GAP,
              width: DAY_W - BLOCK_GAP * 2,
              height: LANE_H - BLOCK_GAP * 2,
              borderColor: dropPreview.color,
              backgroundColor: `${dropPreview.color}22`,
              color: dropPreview.color,
            }}
          >
            {React.createElement(getIcon(dropPreview.icon), { className: 'h-4 w-4' })}
            {dropPreview.label}
          </div>
        )}

        <div
          className="absolute -right-12 top-2 flex flex-col gap-1"
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <button
            aria-label="Añadir día"
            disabled={cycleDays >= MAX_CYCLE_DAYS}
            className="rounded-lg border border-border bg-surface p-2 text-muted hover:text-fg disabled:opacity-40"
            onClick={() => onCycleDaysChange(cycleDays + 1)}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            aria-label="Quitar día"
            disabled={cycleDays <= MIN_CYCLE_DAYS}
            className="rounded-lg border border-border bg-surface p-2 text-muted hover:text-fg disabled:opacity-40"
            onClick={() => onCycleDaysChange(cycleDays - 1)}
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        <div
          className="absolute inset-x-0 flex items-center gap-2 border-t border-border px-3 text-xs text-muted"
          style={{ top: height, height: CYCLE_FOOT_H }}
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <input
            key={cycle.name}
            aria-label="Nombre del ciclo"
            defaultValue={cycle.name}
            maxLength={MAX_CYCLE_NAME}
            onBlur={(e) => {
              const name = e.target.value.trim() || 'Ciclo';
              if (name !== cycle.name) onNameChange(name);
              else e.target.value = cycle.name;
            }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            style={{ width: `${Math.max(8, cycle.name.length + 2)}ch` }}
            className="rounded-md border border-transparent bg-transparent px-1.5 py-0.5 font-semibold text-fg hover:border-border focus:border-accent focus:outline-none"
          />
          <span>
            · {cycleDays} {cycleDays === 1 ? 'día' : 'días'} · se repite al terminar
          </span>
          {onDeleteCycle && (
            <button type="button" aria-label="Eliminar ciclo" className="ml-auto rounded-lg p-1.5 text-muted hover:text-fg" onClick={onDeleteCycle}>
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
