'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Button, Input, useToast } from 'strata';

import { createCalendarEvent, deleteCalendarEvent, getCalendarEvents, updateCalendarEvent } from '@/app/actions/calendar';
import { exerciseSetsInWeek } from '@/lib/board/phases';
import { blocksOnCycleDay, formatShort, locateDate, type PlanAnchor } from '@/lib/board/plan';
import type { CycleBlock } from '@/lib/board/cycle';
import { getDateString } from '@/lib/utils';
import type { CalendarEvent } from '@/types';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Plan anclado al calendario más los bloques del ciclo que se repite. */
export interface PlanAnchorWithBlocks extends PlanAnchor {
  blocks: CycleBlock[];
}

/** Casillas del mes (lunes primero): `null` rellena los huecos antes del día 1. */
function monthCells(year: number, month: number): (string | null)[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => getDateString(new Date(year, month, i + 1)))];
}

/** Calendario mensual con eventos del día seleccionado. */
export default function CalendarWidget({ plan = null }: { plan?: PlanAnchorWithBlocks | null }) {
  const toast = useToast();
  const today = getDateString(new Date());
  const [cursor, setCursor] = useState(() => ({ year: new Date().getFullYear(), month: new Date().getMonth() }));
  const [selected, setSelected] = useState(today);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [draft, setDraft] = useState({ title: '', time: '' });

  const cells = useMemo(() => monthCells(cursor.year, cursor.month), [cursor]);

  const load = useCallback(async () => {
    const from = getDateString(new Date(cursor.year, cursor.month, 1));
    const to = getDateString(new Date(cursor.year, cursor.month + 1, 0));
    try {
      setEvents(await getCalendarEvents({ from, to }));
    } catch {
      toast({ tone: 'error', message: 'No se pudieron cargar los eventos.' });
    }
  }, [cursor, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const shift = (delta: number) => {
    const next = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = draft.title.trim();
    if (!title) return;
    try {
      const created = await createCalendarEvent({ date: selected, title, ...(draft.time && { time: draft.time }), type: 'other' });
      setEvents((list) => [...list, created]);
      setDraft({ title: '', time: '' });
    } catch {
      toast({ tone: 'error', message: 'No se pudo crear el evento.' });
    }
  };

  const toggle = async (event: CalendarEvent) => {
    const completed = !event.completed;
    setEvents((list) => list.map((x) => (x.id === event.id ? { ...x, completed } : x)));
    try {
      await updateCalendarEvent(event.id, { completed });
    } catch {
      setEvents((list) => list.map((x) => (x.id === event.id ? { ...x, completed: event.completed } : x)));
      toast({ tone: 'error', message: 'No se pudo actualizar el evento.' });
    }
  };

  const remove = async (event: CalendarEvent) => {
    try {
      await deleteCalendarEvent(event.id);
      setEvents((list) => list.filter((x) => x.id !== event.id));
    } catch {
      toast({ tone: 'error', message: 'No se pudo eliminar el evento.' });
    }
  };

  const withEvents = new Set(events.map((e) => e.date));
  const here = plan ? locateDate(plan, selected) : null;
  const dayEvents = events.filter((e) => e.date === selected).sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button aria-label="Mes anterior" className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-fg" onClick={() => shift(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold capitalize">
          {MONTHS[cursor.month]} {cursor.year}
        </span>
        <button aria-label="Mes siguiente" className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-fg" onClick={() => shift(1)}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1 font-medium text-muted">
            {d}
          </span>
        ))}
        {cells.map((date, i) =>
          date ? (
            <button
              key={date}
              aria-label={date}
              aria-pressed={date === selected}
              onClick={() => setSelected(date)}
              className={`relative rounded-lg py-1.5 transition-colors hover:bg-surface-2 ${date === today ? 'font-bold text-accent' : ''}`}
              style={date === selected ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' } : undefined}
            >
              {Number(date.slice(8))}
              {withEvents.has(date) && <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current opacity-70" />}
              {plan && (
                <span
                  data-phase-day={locateDate(plan, date)?.phase?.id ?? ''}
                  aria-hidden
                  className="absolute inset-x-1 bottom-0 h-0.5 rounded-full"
                  style={{ backgroundColor: locateDate(plan, date)?.phase?.color ?? 'transparent' }}
                />
              )}
            </button>
          ) : (
            <span key={`blank-${i}`} />
          ),
        )}
      </div>

      {plan ? <PlanDay plan={plan} date={selected} position={here} /> : (
        <p className="text-xs text-muted">Fija el inicio del plan en la franja de fases para verlo aquí.</p>
      )}

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{selected === today ? 'Hoy' : selected}</p>
        {dayEvents.length === 0 && <p className="text-xs text-muted">Sin eventos este día.</p>}
        {dayEvents.map((event) => (
          <div key={event.id} className="group flex items-center gap-2 rounded-lg border border-border px-2 py-1.5">
            <button aria-label={event.completed ? `Marcar pendiente ${event.title}` : `Completar ${event.title}`} aria-pressed={!!event.completed} className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border" style={event.completed ? { backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' } : undefined} onClick={() => toggle(event)}>
              {event.completed && <Check className="h-3 w-3" />}
            </button>
            <span className={`flex-1 truncate text-sm ${event.completed ? 'text-muted line-through' : ''}`}>{event.title}</span>
            {event.time && <span className="iv-tabular text-xs text-muted">{event.time}</span>}
            <button aria-label={`Eliminar ${event.title}`} className="text-muted opacity-0 hover:text-fg group-hover:opacity-100 focus:opacity-100" onClick={() => remove(event)}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <form onSubmit={add} className="flex gap-1.5">
          <Input className="min-w-0 flex-1 py-1.5" aria-label="Nuevo evento" placeholder="Nuevo evento" maxLength={120} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <Input className="w-24 py-1.5" aria-label="Hora" type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} />
          <Button type="submit" size="sm" aria-label="Añadir evento" disabled={!draft.title.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

/** Qué toca un día según el plan: fase, semana, día del ciclo, sus bloques y los ejercicios con las series de esa semana. */
function PlanDay({ plan, date, position }: { plan: PlanAnchorWithBlocks; date: string; position: ReturnType<typeof locateDate> }) {
  if (!position) {
    return (
      <p className="rounded-xl bg-surface-2 px-3 py-2 text-xs text-muted">
        {date < plan.planStart ? `Antes del inicio del plan (empieza el ${formatShort(plan.planStart)}).` : 'Después de las 52 semanas del plan.'}
      </p>
    );
  }
  const { phase, weekInPhase, cycleDay } = position;
  const blocks = blocksOnCycleDay(plan.blocks, cycleDay);
  const week = phase && weekInPhase !== null ? exerciseSetsInWeek(phase, weekInPhase, 3) : null;

  return (
    <section aria-label="Plan del día" className="flex flex-col gap-2 rounded-xl border border-border p-2.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: phase?.color ?? 'var(--border-strong)' }} />
          {phase ? `${phase.name} · semana ${weekInPhase! + 1} de ${phase.weeks}` : 'Sin fase esta semana'}
        </span>
        <span className="iv-tabular text-muted">Día {cycleDay + 1} del ciclo</span>
      </div>
      {week && (
        <p className="text-[11px] text-muted">
          Carga {week.loadPct}%{week.deload ? ' · semana de descarga' : ''}
        </p>
      )}
      {blocks.length === 0 && <p className="text-xs text-muted">Nada planificado este día del ciclo.</p>}
      {blocks.map((b) => (
        <div key={b.id}>
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: b.color }} />
            {b.label || 'Sin nombre'}
          </p>
          {b.exercises.length > 0 && (
            <ul className="mt-1 flex flex-col gap-0.5 pl-4 text-xs text-muted">
              {b.exercises.map((e, i) => (
                <li key={`${e.exerciseId}-${i}`} className="flex justify-between gap-2">
                  <span className="truncate">{e.name}</span>
                  <span className="iv-tabular shrink-0">
                    {phase && weekInPhase !== null ? exerciseSetsInWeek(phase, weekInPhase, e.sets).sets : e.sets}×{e.reps}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}
