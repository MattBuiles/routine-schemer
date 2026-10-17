'use client';

import React, { useRef, useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { getDateString } from '@/lib/utils';
import { addDays, formatShort, planWeekOf, weekRange } from '@/lib/board/plan';
import {
  MAX_PLAN_WEEKS,
  MIN_PLAN_WEEKS,
  PHASE_H,
  WEEK_W,
  movePhase,
  phaseEnd,
  resizePhase,
  resizePhaseStart,
  type Phase,
} from '@/lib/board/phases';
import { useCanvasZoom } from './Canvas';

const TICKS_H = 40;
/** Separación visual entre fases contiguas (px a cada lado). */
const PHASE_GAP = 3;

interface PhaseStripProps {
  origin: { x: number; y: number };
  phases: Phase[];
  /** Duración total del plan en semanas: la franja muestra exactamente esas columnas. */
  planWeeks: number;
  onPlanWeeksChange: (weeks: number) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onPhasesChange: (phases: Phase[]) => void;
  /** Doble clic en un hueco: semana bajo el cursor. */
  onCreateAt: (week: number) => void;
  /** Fecha en la que empieza la semana 1 (AAAA-MM-DD) o null si el plan no está anclado al calendario. */
  planStart: string | null;
  onPlanStartChange: (date: string | null) => void;
}

interface Gesture {
  pointerId: number;
  id: string;
  mode: 'move' | 'resize' | 'resize-start';
  startX: number;
}

/** Franja de fases sobre el ciclo: semanas en columnas; arrastrar mueve la fase y el borde derecho cambia su duración. */
export default function PhaseStrip({ origin, phases, planWeeks, onPlanWeeksChange, selectedId, onSelect, onPhasesChange, onCreateAt, planStart, onPlanStartChange }: PhaseStripProps) {
  const zoom = useCanvasZoom();
  const gesture = useRef<Gesture | null>(null);
  const [preview, setPreview] = useState<Phase[] | null>(null);
  const previewRef = useRef<Phase[] | null>(null);

  const shown = preview ?? phases;
  const todayWeek = planStart ? planWeekOf(planStart, getDateString(new Date()), planWeeks) : null;

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
    const next =
      g.mode === 'move'
        ? movePhase(phases, g.id, base.startWeek + weeks, planWeeks)
        : g.mode === 'resize'
          ? resizePhase(phases, g.id, base.weeks + weeks, planWeeks)
          : resizePhaseStart(phases, g.id, base.startWeek + weeks);
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
        className="absolute -top-12 left-0 flex items-center gap-2 whitespace-nowrap rounded-xl border border-border bg-surface/70 px-2.5 py-1.5 text-xs text-muted shadow-[var(--shadow)]"
        onPointerDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <label className="flex items-center gap-2">
          Inicio del plan
          <input
            type="date"
            aria-label="Inicio del plan"
            value={planStart ?? ''}
            onChange={(e) => onPlanStartChange(e.target.value || null)}
            className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-fg focus:border-accent focus:outline-none"
          />
        </label>
        <button type="button" className="rounded-lg border border-border bg-surface px-2 py-1 hover:text-fg" onClick={() => onPlanStartChange(getDateString(new Date()))}>
          Hoy
        </button>
        {planStart && (
          <button type="button" className="rounded-lg px-2 py-1 hover:text-fg" onClick={() => onPlanStartChange(null)}>
            Quitar fecha
          </button>
        )}
        <span className="ml-1 border-l border-border pl-3">
          Plan de {planWeeks} {planWeeks === 1 ? 'semana' : 'semanas'} · se repite al terminar
          {planStart && todayWeek !== null && ` · hoy: semana ${todayWeek + 1} de ${planWeeks}`}
          {planStart && todayWeek === null && ' · el plan aún no ha empezado'}
        </span>
      </div>
      <div
        data-testid="phase-strip"
        className="relative rounded-2xl border border-border bg-surface/70 shadow-[var(--shadow)]"
        style={{ width: planWeeks * WEEK_W, height: TICKS_H + PHASE_H + 8 }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.tick) onSelect(null);
        }}
        onDoubleClick={(e) => {
          if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.tick) return;
          const box = e.currentTarget.getBoundingClientRect();
          onCreateAt(Math.floor((e.clientX - box.left) / (box.width / planWeeks)));
        }}
      >
        {Array.from({ length: planWeeks }, (_, week) => (
          <div
            key={week}
            data-tick
            className="absolute top-0 flex items-center justify-center border-l border-border text-[10px] text-muted first:border-l-0"
            style={{ left: week * WEEK_W, width: WEEK_W, height: TICKS_H + PHASE_H + 8 }}
          >
            <span data-tick className={`absolute top-1 ${todayWeek === week ? 'font-bold text-accent' : ''}`}>
              {week + 1}
            </span>
            {planStart && (
              <span data-tick className={`absolute top-5 text-[9px] leading-none ${todayWeek === week ? 'font-semibold text-accent' : 'text-muted'}`}>
                {formatShort(addDays(planStart, week * 7))}
              </span>
            )}
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
              const next = e.shiftKey ? resizePhase(phases, p.id, p.weeks + delta, planWeeks) : movePhase(phases, p.id, p.startWeek + delta, planWeeks);
              // En el límite del plan no hay nada que mover: no se anota un paso de deshacer vacío.
              if (next && JSON.stringify(next) !== JSON.stringify(phases)) onPhasesChange(next);
            }}
            onPointerDown={begin(p, 'move')}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            className={`absolute cursor-grab overflow-hidden rounded-xl border-2 border-transparent px-4 py-1 text-xs font-semibold text-white shadow-md outline-none active:cursor-grabbing ${p.id === selectedId ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : ''}`}
            style={{ left: p.startWeek * WEEK_W + PHASE_GAP, top: TICKS_H, width: p.weeks * WEEK_W - PHASE_GAP * 2, height: PHASE_H, backgroundColor: p.color }}
          >
            <div className="pointer-events-none truncate">{p.name}</div>
            {p.weeks >= 3 && (
              <div className="pointer-events-none text-[10px] font-medium opacity-90">
                {planStart ? (() => {
                  const range = weekRange(planStart, p.startWeek, p.weeks);
                  return `${formatShort(range.start)} – ${formatShort(range.end)}`;
                })() : `${p.weeks} sem · sem ${p.startWeek + 1}–${phaseEnd(p)}`}
              </div>
            )}
            {(['w', 'e'] as const).map((side) => (
              <div
                key={side}
                data-handle={side}
                title={side === 'e' ? 'Arrastra para cambiar la última semana' : 'Arrastra para cambiar la primera semana'}
                className={`absolute bottom-0 top-0 flex w-3 cursor-ew-resize items-center justify-center bg-white/25 hover:bg-white/45 ${side === 'e' ? 'right-0' : 'left-0'}`}
                onPointerDown={begin(p, side === 'e' ? 'resize' : 'resize-start')}
                onPointerMove={move}
                onPointerUp={end}
                onPointerCancel={end}
              >
                <span aria-hidden className="pointer-events-none h-5 w-0.5 rounded-full bg-white/80" />
              </div>
            ))}
          </div>
        ))}
      
      </div>
      <div
        className="absolute -right-12 top-2 flex flex-col gap-1"
        onPointerDown={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Añadir semana al plan"
          disabled={planWeeks >= MAX_PLAN_WEEKS}
          className="rounded-lg border border-border bg-surface p-2 text-muted hover:text-fg disabled:opacity-40"
          onClick={() => onPlanWeeksChange(planWeeks + 1)}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          aria-label="Quitar semana al plan"
          disabled={planWeeks <= MIN_PLAN_WEEKS}
          className="rounded-lg border border-border bg-surface p-2 text-muted hover:text-fg disabled:opacity-40"
          onClick={() => onPlanWeeksChange(planWeeks - 1)}
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
