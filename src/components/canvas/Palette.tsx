'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GripVertical, X } from 'lucide-react';

import type { BlockTypeDef } from '@/lib/board/cycle';
import { getIcon } from './blockIcons';

interface PaletteProps {
  types: BlockTypeDef[];
  /** Tipos con `custom:` en su clave se pueden borrar. */
  onAdd: (type: BlockTypeDef) => void;
  onDragMove: (type: BlockTypeDef | null, clientX: number, clientY: number) => void;
  onDropType: (type: BlockTypeDef, clientX: number, clientY: number) => void;
  onDeleteCustom: (customId: string) => void;
}

const DRAG_THRESHOLD = 6;

/** Bandeja de tipos: clic = añadir en el primer hueco; arrastrar y soltar sobre el ciclo = crear ahí. */
export default function Palette({ types, onAdd, onDragMove, onDropType, onDeleteCustom }: PaletteProps) {
  const [ghost, setGhost] = useState<{ type: BlockTypeDef; x: number; y: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const drag = useRef<{ type: BlockTypeDef; startX: number; startY: number; active: boolean } | null>(null);
  const callbacks = useRef({ onAdd, onDragMove, onDropType });
  callbacks.current = { onAdd, onDragMove, onDropType };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      if (!d.active && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > DRAG_THRESHOLD) d.active = true;
      if (d.active) {
        setGhost({ type: d.type, x: e.clientX, y: e.clientY });
        callbacks.current.onDragMove(d.type, e.clientX, e.clientY);
      }
    };
    const up = (e: PointerEvent) => {
      const d = drag.current;
      drag.current = null;
      setGhost(null);
      if (!d) return;
      callbacks.current.onDragMove(null, e.clientX, e.clientY);
      if (d.active) callbacks.current.onDropType(d.type, e.clientX, e.clientY);
      else callbacks.current.onAdd(d.type);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  const hovered = types.find((t) => t.key === hover);

  return (
    <>
      <div
        aria-label="Paleta de bloques"
        className="absolute left-4 top-20 w-52 select-none rounded-2xl border border-border bg-surface/90 p-2 shadow-[var(--shadow)] backdrop-blur"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerLeave={() => setHover(null)}
      >
        <p className="px-2 pb-1 pt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">Arrastra al ciclo</p>
        <div className="flex max-h-[calc(100vh-15rem)] flex-col gap-1 overflow-y-auto">
          {types.map((t) => {
            const Icon = getIcon(t.icon);
            const active = ghost?.type.key === t.key;
            return (
              <div key={t.key} className="group flex items-center gap-1">
                <button
                  type="button"
                  data-palette-type={t.key}
                  onPointerDown={(e) => {
                    drag.current = { type: t, startX: e.clientX, startY: e.clientY, active: false };
                  }}
                  onPointerEnter={() => setHover(t.key)}
                  onFocus={() => setHover(t.key)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onAdd(t);
                    }
                  }}
                  className={`relative flex flex-1 touch-none cursor-grab items-center gap-2.5 overflow-hidden rounded-xl px-2 py-2 text-left text-sm text-fg transition-all duration-150 ease-out hover:translate-x-1 hover:bg-surface-2 active:scale-[0.97] active:cursor-grabbing motion-reduce:transition-none motion-reduce:hover:translate-x-0 ${active ? 'opacity-50' : ''}`}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition-transform duration-150 group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none"
                    style={{ backgroundColor: t.color, boxShadow: hover === t.key ? `0 4px 12px ${t.color}66` : undefined }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 truncate">{t.label}</span>
                  <GripVertical className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                {t.key.startsWith('custom:') && (
                  <button
                    type="button"
                    aria-label={`Eliminar tipo ${t.label}`}
                    onClick={() => onDeleteCustom(t.key.slice('custom:'.length))}
                    className="rounded p-1 text-muted opacity-0 hover:text-fg group-hover:opacity-100 focus:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 min-h-8 rounded-lg bg-surface-2 px-2 py-1.5 text-xs text-muted">
          {hovered ? hovered.hint : 'Clic para añadir en el primer hueco, o arrastra a un día.'}
        </p>
      </div>
      {ghost && (
        <div
          className="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-1/2 rotate-3 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-2xl"
          style={{ left: ghost.x, top: ghost.y, backgroundColor: ghost.type.color }}
        >
          {React.createElement(getIcon(ghost.type.icon), { className: 'h-4 w-4' })}
          {ghost.type.label}
        </div>
      )}
    </>
  );
}
