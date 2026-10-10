'use client';

import React, { useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import {
  DAY_W,
  HEADER_H,
  LANE_H,
  MAX_CYCLE_DAYS,
  MAX_LANES,
  MIN_CYCLE_DAYS,
  fromRect,
  placeBlock,
  toRect,
  type CycleBlock,
} from '@/lib/board/cycle';
import type { Rect } from '@/lib/board/geometry';
import Block from './Block';

// x deja libre la paleta flotante (16px de margen + 176px de ancho) con el viewport por defecto.
export const ZONE_ORIGIN = { x: 240, y: 100 };

interface CycleZoneProps {
  cycleDays: number;
  blocks: CycleBlock[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Reemplaza los bloques (un único paso de deshacer). */
  onBlocksChange: (blocks: CycleBlock[]) => void;
  onDelete: (id: string) => void;
  onCycleDaysChange: (days: number) => void;
  /** Doble clic en un hueco: día y carril bajo el cursor. */
  onCreateAt: (dayStart: number, lane: number) => void;
}

/** Zona del ciclo: días en columnas, carriles en filas; ancho de bloque = días, alto = carga. */
export default function CycleZone({
  cycleDays,
  blocks,
  selectedId,
  onSelect,
  onBlocksChange,
  onDelete,
  onCycleDaysChange,
  onCreateAt,
}: CycleZoneProps) {
  const [live, setLive] = useState<{ id: string; rect: Rect } | null>(null);
  const liveRef = useRef<{ id: string; rect: Rect } | null>(null);

  const width = cycleDays * DAY_W;
  const height = HEADER_H + MAX_LANES * LANE_H;

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
    const placed = placeBlock(blocks, { ...block, ...fromRect(current.rect, cycleDays) });
    if (!placed) return; // sin hueco: el bloque vuelve a su sitio
    if (JSON.stringify(placed) !== JSON.stringify(block)) {
      onBlocksChange(blocks.map((b) => (b.id === id ? placed : b)));
    }
  };

  const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.cell) return;
    const box = e.currentTarget.getBoundingClientRect();
    const zoom = box.width / width;
    const x = (e.clientX - box.left) / zoom;
    const y = (e.clientY - box.top) / zoom;
    if (y < HEADER_H) return;
    onCreateAt(Math.min(cycleDays - 1, Math.floor(x / DAY_W)), Math.min(MAX_LANES - 1, Math.floor((y - HEADER_H) / LANE_H)));
  };

  return (
    <div className="absolute" style={{ left: ZONE_ORIGIN.x, top: ZONE_ORIGIN.y }}>
      <div
        data-testid="cycle-zone"
        className="relative rounded-2xl border border-border bg-surface/70 shadow-[var(--shadow)]"
        style={{ width, height }}
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
        {Array.from({ length: MAX_LANES - 1 }, (_, i) => (
          <div
            key={i}
            className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-border"
            style={{ top: HEADER_H + (i + 1) * LANE_H - 10 }}
          />
        ))}

        {blocks.map((b) => (
          <Block
            key={b.id}
            rect={live?.id === b.id ? live.rect : toRect(b)}
            color={b.color}
            label={b.label || 'Sin nombre'}
            selected={b.id === selectedId}
            onSelect={() => onSelect(b.id)}
            onGestureStart={() => undefined}
            onRectChange={(rect) => setLiveRect(b.id, rect)}
            onGestureEnd={() => settle(b.id)}
            onDelete={() => onDelete(b.id)}
          />
        ))}

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
      </div>
      <p className="mt-2 text-xs text-muted">
        Ciclo de {cycleDays} {cycleDays === 1 ? 'día' : 'días'} · se repite al terminar
      </p>
    </div>
  );
}
