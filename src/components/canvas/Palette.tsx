'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { DEFAULT_BLOCK_TYPES } from '@/lib/board/cycle';

export interface PaletteType {
  key: string;
  label: string;
  color: string;
  /** Id del tipo propio (permite borrarlo); los predefinidos no lo tienen. */
  customId?: string;
}

interface PaletteProps {
  customTypes: PaletteType[];
  onAdd: (type: PaletteType) => void;
  /** Suelta un tipo en pantalla; devuelve true si se creó un bloque. */
  onDropType: (type: PaletteType, clientX: number, clientY: number) => void;
  onDeleteCustom: (customId: string) => void;
}

const DRAG_THRESHOLD = 6;

/** Bandeja de tipos: clic = añadir en el primer hueco; arrastrar y soltar sobre el ciclo = crear ahí. */
export default function Palette({ customTypes, onAdd, onDropType, onDeleteCustom }: PaletteProps) {
  const [ghost, setGhost] = useState<{ type: PaletteType; x: number; y: number } | null>(null);
  const drag = useRef<{ type: PaletteType; startX: number; startY: number; active: boolean } | null>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (!d.active && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > DRAG_THRESHOLD) d.active = true;
      if (d.active) setGhost({ type: d.type, x: e.clientX, y: e.clientY });
    };
    const up = (e: PointerEvent) => {
      const d = drag.current;
      drag.current = null;
      setGhost(null);
      if (!d) return;
      if (d.active) onDropType(d.type, e.clientX, e.clientY);
      else onAdd(d.type);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [onAdd, onDropType]);

  const types: PaletteType[] = [...DEFAULT_BLOCK_TYPES.map((t) => ({ ...t })), ...customTypes];

  return (
    <>
      <div
        aria-label="Paleta de bloques"
        className="absolute left-4 top-20 flex max-h-[calc(100vh-10rem)] w-44 flex-col gap-1 overflow-y-auto rounded-xl border border-border bg-surface/90 p-2 shadow-[var(--shadow)] backdrop-blur"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <p className="px-1 pb-1 text-2xs font-medium uppercase tracking-wide text-muted">Bloques</p>
        {types.map((t) => (
          <div key={t.customId ?? t.key} className="group flex items-center gap-1">
            <button
              type="button"
              data-palette-type={t.key}
              onPointerDown={(e) => {
                drag.current = { type: t, startX: e.clientX, startY: e.clientY, active: false };
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onAdd(t);
                }
              }}
              className="flex flex-1 touch-none items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-fg hover:bg-surface-2"
            >
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: t.color }} />
              <span className="truncate">{t.label}</span>
            </button>
            {t.customId && (
              <button
                type="button"
                aria-label={`Eliminar tipo ${t.label}`}
                onClick={() => onDeleteCustom(t.customId!)}
                className="rounded p-1 text-muted opacity-0 hover:text-fg group-hover:opacity-100 focus:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      {ghost && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-lg"
          style={{ left: ghost.x, top: ghost.y, backgroundColor: ghost.type.color }}
        >
          {ghost.type.label}
        </div>
      )}
    </>
  );
}
