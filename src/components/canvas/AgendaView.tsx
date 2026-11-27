'use client';

import React, { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';

import { addDays } from '@/lib/board/plan';
import { mondayOf, planToday, type PlanInput } from '@/lib/board/today';

import { getIcon } from './blockIcons';

const LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Fecha local AAAA-MM-DD (no la UTC: de noche en América ya sería mañana). */
export const localIso = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Vista de móvil: la semana arriba y, para el día elegido, qué toca en cada ciclo con sus ejercicios. El tablero no se lee en una pantalla
 * estrecha; aquí sí. Tocar un bloque lo abre para editarlo.
 */
export default function AgendaView({ plan, today = localIso(), onOpenBlock, onShowBoard }: { plan: PlanInput; today?: string; onOpenBlock: (id: string) => void; onShowBoard: () => void }) {
  const [date, setDate] = useState(today);
  const [monday, setMonday] = useState(() => mondayOf(today));
  const day = planToday(plan, date);
  const cycles = day.cycles.filter((c) => c.blocks.length > 0);
  const go = (weeks: number) => {
    const next = addDays(monday, weeks * 7);
    setMonday(next);
    setDate(addDays(next, (new Date(`${date}T00:00:00Z`).getUTCDay() + 6) % 7));
  };

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-bg px-4 pb-28 pt-4" aria-label="Agenda">
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <div className="flex items-center justify-between gap-2 pr-14">
          <h1 className="font-serif text-2xl font-bold text-fg">Tu semana</h1>
          <button type="button" onClick={onShowBoard} className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-fg">
            <LayoutDashboard className="h-4 w-4" /> Tablero
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button type="button" aria-label="Semana anterior" className="rounded-lg px-2 py-3 text-lg text-muted" onClick={() => go(-1)}>‹</button>
          <div className="grid flex-1 grid-cols-7 gap-1">
            {LETTERS.map((letter, i) => {
              const iso = addDays(monday, i);
              const on = iso === date;
              return (
                <button
                  key={iso}
                  type="button"
                  aria-pressed={on}
                  aria-label={iso}
                  onClick={() => setDate(iso)}
                  className={`flex flex-col items-center rounded-xl border py-2 text-xs ${on ? 'border-accent bg-accent text-[color:var(--iv-bg)]' : 'border-border bg-surface text-muted'}`}
                >
                  <span>{letter}</span>
                  <span className={`text-base font-semibold ${!on && iso === today ? 'text-accent' : ''}`}>{Number(iso.slice(8))}</span>
                </button>
              );
            })}
          </div>
          <button type="button" aria-label="Semana siguiente" className="rounded-lg px-2 py-3 text-lg text-muted" onClick={() => go(1)}>›</button>
        </div>

        {day.status === 'no-plan' && <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">Fija la fecha de inicio del plan en el tablero para ver aquí qué toca cada día.</p>}
        {day.status === 'before-start' && <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">El plan aún no ha empezado en esta fecha.</p>}
        {day.status === 'ok' && (
          <p className="text-sm text-muted">
            Semana {(day.planWeek ?? 0) + 1} de {day.planWeeks}{day.phase ? ` · ${day.phase.name}${day.phase.deload ? ' (descarga)' : ''}` : ''}
          </p>
        )}
        {day.status === 'ok' && cycles.length === 0 && <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted">Día de descanso.</p>}

        {cycles.map((c) => (
          <section key={c.id} className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{c.name} · día {c.cycleDay + 1} de {c.days}</h2>
            {c.blocks.map((b) => {
              const Icon = getIcon(b.icon);
              return (
                <button key={b.id} type="button" onClick={() => onOpenBlock(b.id)} className="overflow-hidden rounded-2xl border border-border bg-surface text-left">
                  <span className="flex items-center gap-3 border-l-4 p-3" style={{ borderColor: b.color }}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: b.color }}><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-fg">{b.label}</span>
                      <span className="block truncate text-xs text-muted">{[b.subtype, ...b.zones].filter(Boolean).join(' · ')}</span>
                    </span>
                  </span>
                  {b.exercises.length > 0 && (
                    <span className="block border-t border-border px-4 py-2">
                      {b.exercises.map((e, i) => (
                        <span key={e.exerciseId + i} className="flex items-baseline justify-between gap-3 py-1 text-sm">
                          <span className="text-fg">{e.name}</span>
                          <span className="shrink-0 tabular-nums text-muted">{e.sets} × {e.reps}</span>
                        </span>
                      ))}
                    </span>
                  )}
                  {b.notes && <span className="block border-t border-border px-4 py-2 text-xs text-muted">{b.notes}</span>}
                </button>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
