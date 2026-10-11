'use client';

import React, { useRef, useState } from 'react';

import {
  MAX_PLAN_WEEKS,
  PHASE_H,
  WEEK_W,
  movePhase,
  nextFreeStart,
  phaseEnd,
  resizePhase,
  type Phase,
} from '@/lib/board/phases';
import { useCanvasZoom } from './Canvas';

const TICKS_H = 24;

interface PhaseStripProps {
  origin: { x: number; y: number };
  phases: Phase[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onPhasesChange: (phases: Phase[]) => void;
  /** Doble clic en un hueco: semana bajo el cursor. */
  onCreateAt: (week: number) => void;
}

interface Gesture {
  pointerId: number;
  id: string;
  mode: 'move' | 'resize';
  startX: number;
}

/** Franja de fases sobre el ciclo: semanas en columnas; arrastrar mueve la fase y el borde derecho cambia su duración. */
export default function PhaseStrip({ origin, phases, selectedId, onSelect, onPhasesChange, onCreateAt }: PhaseStripProps) {
  const zoom = useCanvasZoom();
  const gesture = useRef<Gesture | null>(null);
  const [preview, setPreview] = useState<Phase[] | null>(null);
  const previewRef = useRef<Phase[] | null>(null);

  // Se muestran unas semanas de más tras la última fase para poder seguir añadiendo.
  const visibleWeeks = Math.min(MAX_PLAN_WEEKS, Math.max(16, (nextFreeStart(phases, 1) ?? MAX_PLAN_WEEKS) + 8));
  const shown = preview ?? phases;

  const begin = (phase: Phase, mode: Gesture['mode']) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { pointerId: e.pointerId, id: phase.id, mode, startX: e.clientX };
    onSelect(phase.id);
  };

  const move = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    const weeks = Math.round((e.clientX - g.startX) / zoom / WEEK_W);
    const base = phases.find((p) => p.id === g.id)!;
    const next = g.mode === 'move' ? movePhase(phases, g.id, base.startWeek + weeks) : resizePhase(phases, g.id, base.weeks + weeks);
    // Si la posición no es válida (solape) se mantiene la última vista previa válida.
    if (next) {
      previewRef.current = next;
      setPreview(next);
    }
  };

  const end = (e: React.PointerEvent) => {
    if (gesture.current?.pointerId !== e.pointerId) return;
    gesture.current = null;
    const result = previewRef.current;
    previewRef.current = null;
    setPreview(null);
    if (result && JSON.stringify(result) !== JSON.stringify(phases)) onPhasesChange(result);
  };

  return (
    <div className="absolute" style={{ left: origin.x, top: origin.y }}>
      <div
        data-testid="phase-strip"
        className="relative rounded-2xl border border-border bg-surface/70 shadow-[var(--shadow)]"
        style={{ width: visibleWeeks * WEEK_W, height: TICKS_H + PHASE_H + 8 }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.tick) onSelect(null);
        }}
        onDoubleClick={(e) => {
          if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.tick) return;
          const box = e.currentTarget.getBoundingClientRect();
          onCreateAt(Math.floor((e.clientX - box.left) / (box.width / visibleWeeks)));
        }}
      >
        {Array.from({ length: visibleWeeks }, (_, week) => (
          <div
            key={week}
            data-tick
            className="absolute top-0 flex items-center justify-center border-l border-border text-[10px] text-muted first:border-l-0"
            style={{ left: week * WEEK_W, width: WEEK_W, height: TICKS_H + PHASE_H + 8 }}
          >
            <span data-tick className="absolute top-1">
              {week + 1}
            </span>
          </div>
        ))}

        {shown.map((p) => (
          <div
            key={p.id}
            role="group"
            aria-label={`Fase ${p.name}`}
            tabIndex={0}
            onFocus={() => onSelect(p.id)}
            onKeyDown={(e) => {
              const delta = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
              if (!delta) return;
              e.preventDefault();
              const next = e.shiftKey ? resizePhase(phases, p.id, p.weeks + delta) : movePhase(phases, p.id, p.startWeek + delta);
              if (next) onPhasesChange(next);
            }}
            onPointerDown={begin(p, 'move')}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            className={`absolute cursor-grab overflow-hidden rounded-xl border-2 border-transparent px-2 py-1 text-xs font-semibold text-white shadow-md outline-none active:cursor-grabbing ${p.id === selectedId ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : ''}`}
            style={{ left: p.startWeek * WEEK_W, top: TICKS_H, width: p.weeks * WEEK_W, height: PHASE_H, backgroundColor: p.color }}
          >
            <div className="pointer-events-none truncate">{p.name}</div>
            {p.weeks >= 3 && (
              <div className="pointer-events-none text-[10px] font-medium opacity-90">
                {p.weeks} sem · sem {p.startWeek + 1}–{phaseEnd(p)}
              </div>
            )}
            <div
              data-handle="e"
              className="absolute bottom-0 right-0 top-0 w-2 cursor-ew-resize bg-white/30"
              onPointerDown={begin(p, 'resize')}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">
        Plan de {Math.max(0, phases.reduce((end, p) => Math.max(end, phaseEnd(p)), 0))} semanas · cada fase repite el ciclo
      </p>
    </div>
  );
}
