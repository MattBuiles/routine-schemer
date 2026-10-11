'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button, EmptyState, Input, Skeleton, useConfirm, useToast } from 'strata';

import { createHabit, deleteHabit, getHabitRecords, getHabits, setHabitRecord } from '@/app/actions/habits';
import { getDateString } from '@/lib/utils';
import type { Habit } from '@/types';

const MAX_VALUE = 10000;

/** Hábitos de hoy: contador con barra de progreso hacia el objetivo diario. */
export default function HabitsWidget() {
  const toast = useToast();
  const confirm = useConfirm();
  const today = getDateString(new Date());
  const [habits, setHabits] = useState<Habit[] | null>(null);
  const [values, setValues] = useState<Record<string, number>>({});
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', target: '1', unit: '' });

  const load = useCallback(async () => {
    try {
      const [list, records] = await Promise.all([getHabits(), getHabitRecords({ from: today, to: today })]);
      setHabits(list.filter((h) => h.isActive));
      setValues(Object.fromEntries(records.map((r) => [r.habitId, r.value])));
    } catch {
      toast({ tone: 'error', message: 'No se pudieron cargar los hábitos.' });
      setHabits([]);
    }
  }, [today, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const change = async (habit: Habit, delta: number) => {
    const previous = values[habit.id] ?? 0;
    const next = Math.min(MAX_VALUE, Math.max(0, previous + delta));
    if (next === previous) return;
    setValues((v) => ({ ...v, [habit.id]: next }));
    try {
      await setHabitRecord(habit.id, today, next);
    } catch {
      setValues((v) => ({ ...v, [habit.id]: previous }));
      toast({ tone: 'error', message: 'No se pudo guardar el registro.' });
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(draft.target);
    if (!draft.name.trim() || !(target > 0)) return;
    try {
      const created = await createHabit({ name: draft.name.trim(), type: 'custom', target, unit: draft.unit.trim() || 'veces', color: '#8b5cf6', icon: 'Target' });
      setHabits((list) => [...(list ?? []), created]);
      setDraft({ name: '', target: '1', unit: '' });
      setAdding(false);
    } catch {
      toast({ tone: 'error', message: 'No se pudo crear el hábito.' });
    }
  };

  const remove = async (habit: Habit) => {
    if (!(await confirm({ title: 'Eliminar hábito', message: `«${habit.name}» y sus registros se eliminarán.`, confirmLabel: 'Eliminar' }))) return;
    try {
      await deleteHabit(habit.id);
      setHabits((list) => (list ?? []).filter((h) => h.id !== habit.id));
    } catch {
      toast({ tone: 'error', message: 'No se pudo eliminar el hábito.' });
    }
  };

  if (!habits) return <Skeleton className="h-24 w-full" />;

  return (
    <div className="flex flex-col gap-3">
      {habits.length === 0 && !adding && <EmptyState title="Sin hábitos" description="Crea el primero para registrarlo cada día." />}
      {habits.map((h) => {
        const value = values[h.id] ?? 0;
        const pct = Math.min(100, Math.round((value / Math.max(1, h.target)) * 100));
        return (
          <div key={h.id} className="group rounded-xl border border-border p-2.5">
            <div className="flex items-center gap-2">
              <span className="flex-1 truncate text-sm font-medium">{h.name}</span>
              <button aria-label={`Eliminar ${h.name}`} className="text-muted opacity-0 hover:text-fg group-hover:opacity-100 focus:opacity-100" onClick={() => remove(h)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button aria-label={`Restar ${h.name}`} className="rounded-lg border border-border p-1 text-muted hover:text-fg" onClick={() => change(h, -1)}>
                <Minus className="h-3.5 w-3.5" />
              </button>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${h.name}: ${pct}%`}>
                <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? 'var(--positive)' : h.color }} />
              </div>
              <button aria-label={`Sumar ${h.name}`} className="rounded-lg border border-border p-1 text-muted hover:text-fg" onClick={() => change(h, 1)}>
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="iv-tabular mt-1 text-right text-xs text-muted">
              {value} / {h.target} {h.unit}
            </p>
          </div>
        );
      })}

      {adding ? (
        <form onSubmit={add} className="flex flex-col gap-2 rounded-xl border border-dashed border-border p-2.5">
          <Input className="py-1.5" aria-label="Nombre del hábito" placeholder="Nombre (ej. Agua)" maxLength={60} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <div className="flex gap-2">
            <Input className="w-20 py-1.5" aria-label="Objetivo diario" type="number" min={1} max={MAX_VALUE} value={draft.target} onChange={(e) => setDraft({ ...draft, target: e.target.value })} />
            <Input className="flex-1 py-1.5" aria-label="Unidad" placeholder="Unidad (vasos…)" maxLength={20} value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={!draft.name.trim()}>
              Crear
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" /> Nuevo hábito
        </Button>
      )}
    </div>
  );
}
