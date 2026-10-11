'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Button, Input, useToast } from 'strata';

import { createCalendarEvent, deleteCalendarEvent, getCalendarEvents, updateCalendarEvent } from '@/app/actions/calendar';
import { getDateString } from '@/lib/utils';
import type { CalendarEvent } from '@/types';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Casillas del mes (lunes primero): `null` rellena los huecos antes del día 1. */
function monthCells(year: number, month: number): (string | null)[] {
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => getDateString(new Date(year, month, i + 1)))];
}

/** Calendario mensual con eventos del día seleccionado. */
export default function CalendarWidget() {
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
            </button>
          ) : (
            <span key={`blank-${i}`} />
          ),
        )}
      </div>

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
