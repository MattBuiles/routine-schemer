'use client';

import React, { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { Button, Field, Input, SegmentedControl, Textarea } from 'strata';

import {
  BLOCK_ICONS,
  MAX_EXERCISES,
  MAX_LOAD,
  MAX_SETS,
  MAX_ZONES,
  ZONE_SUGGESTIONS,
  type BlockTypeDef,
  type CycleBlock,
} from '@/lib/board/cycle';
import { getIcon } from './blockIcons';
import ExercisePicker, { exerciseName } from './ExercisePicker';

const SWATCHES = ['#dc2626', '#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#71717a', '#ec4899'];

interface BlockPanelProps {
  block: CycleBlock;
  types: BlockTypeDef[];
  onChange: (patch: Partial<CycleBlock>) => void;
  onChangeType: (type: BlockTypeDef) => void;
  onDelete: () => void;
  onSaveType: () => void;
  onClose: () => void;
}

const sectionTitle = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted';

/** Panel del bloque seleccionado: tipo, nombre, enfoque, carga, duración, color, icono y notas. */
export default function BlockPanel({ block, types, onChange, onChangeType, onDelete, onSaveType, onClose }: BlockPanelProps) {
  const [draftTag, setDraftTag] = useState('');
  const [picking, setPicking] = useState(false);

  const addTag = (raw: string) => {
    const tag = raw.trim().slice(0, 24);
    if (!tag || block.zones.some((f) => f.toLowerCase() === tag.toLowerCase()) || block.zones.length >= MAX_ZONES) return;
    onChange({ zones: [...block.zones, tag] });
    setDraftTag('');
  };

  const patchExercise = (index: number, patch: Partial<CycleBlock['exercises'][number]>) =>
    onChange({ exercises: block.exercises.map((e, i) => (i === index ? { ...e, ...patch } : e)) });

  const moveExercise = (index: number, delta: number) => {
    const next = [...block.exercises];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ exercises: next });
  };

  const suggestions = ZONE_SUGGESTIONS.filter((s) => !block.zones.some((f) => f.toLowerCase() === s.toLowerCase())).slice(0, 8);

  return (
    <aside
      aria-label="Propiedades del bloque"
      className="panel-in absolute bottom-4 right-4 top-16 z-10 flex w-80 flex-col rounded-2xl border border-border bg-surface/95 shadow-[var(--shadow-lg)] backdrop-blur"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-fg">Bloque</h2>
        <button aria-label="Cerrar panel" className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-fg" onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        <div>
          <span className={sectionTitle}>Enfoque</span>
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => {
              const Icon = getIcon(t.icon);
              const on = block.blockType === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChangeType(t)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${on ? 'border-transparent text-white' : 'border-border text-muted hover:text-fg'}`}
                  style={on ? { backgroundColor: t.color } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Nombre">
          <Input value={block.label} maxLength={60} placeholder="Ej. Empuje pesado" onChange={(e) => onChange({ label: e.target.value })} />
        </Field>

        <div>
          <span className={sectionTitle}>Zonas</span>
          {block.zones.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {block.zones.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2 py-1 text-xs font-medium text-accent">
                  {tag}
                  <button aria-label={`Quitar ${tag}`} onClick={() => onChange({ zones: block.zones.filter((f) => f !== tag) })}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <Input
            value={draftTag}
            maxLength={24}
            placeholder={block.zones.length >= MAX_ZONES ? 'Máximo alcanzado' : 'Añade una zona y pulsa Enter'}
            disabled={block.zones.length >= MAX_ZONES}
            onChange={(e) => setDraftTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(draftTag);
              }
            }}
          />
          {block.zones.length < MAX_ZONES && (
            <div className="mt-2 flex flex-wrap gap-1">
              {suggestions.map((s) => (
                <button key={s} type="button" onClick={() => addTag(s)} className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted hover:border-accent hover:text-accent">
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className={sectionTitle}>Ejercicios · {block.exercises.length}</span>
          <ol className="flex flex-col gap-2">
            {block.exercises.map((e, i) => (
              <li key={`${e.exerciseId}-${i}`} className="rounded-xl border border-border p-2">
                <div className="flex items-start gap-1">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium" title={e.name}>
                    {e.name}
                  </span>
                  <button aria-label={`Subir ${e.name}`} disabled={i === 0} className="rounded p-0.5 text-muted hover:text-fg disabled:opacity-30" onClick={() => moveExercise(i, -1)}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button aria-label={`Bajar ${e.name}`} disabled={i === block.exercises.length - 1} className="rounded p-0.5 text-muted hover:text-fg disabled:opacity-30" onClick={() => moveExercise(i, 1)}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button aria-label={`Quitar ${e.name}`} className="rounded p-0.5 text-muted hover:text-fg" onClick={() => onChange({ exercises: block.exercises.filter((_, j) => j !== i) })}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                  <Input aria-label={`Series de ${e.name}`} type="number" min={1} max={MAX_SETS} className="w-14 px-2 py-1" value={e.sets} onChange={(ev) => patchExercise(i, { sets: Math.min(MAX_SETS, Math.max(1, Number(ev.target.value) || 1)) })} />
                  ×
                  <Input aria-label={`Repeticiones de ${e.name}`} maxLength={12} className="w-20 px-2 py-1" value={e.reps} onChange={(ev) => patchExercise(i, { reps: ev.target.value })} />
                  <Input aria-label={`Notas de ${e.name}`} maxLength={200} placeholder="Notas" className="min-w-0 flex-1 px-2 py-1" value={e.notes} onChange={(ev) => patchExercise(i, { notes: ev.target.value })} />
                </div>
              </li>
            ))}
          </ol>
          <Button variant="secondary" size="sm" className="mt-2 w-full" disabled={block.exercises.length >= MAX_EXERCISES} onClick={() => setPicking(true)}>
            <Plus className="h-4 w-4" /> Añadir ejercicio
          </Button>
          <ExercisePicker
            open={picking}
            onClose={() => setPicking(false)}
            onPick={(exercise) => {
              onChange({ exercises: [...block.exercises, { exerciseId: exercise.id, name: exerciseName(exercise), sets: 3, reps: '8-12', notes: '' }] });
              setPicking(false);
            }}
          />
        </div>

        <div>
          <span className={sectionTitle}>Carga</span>
          <SegmentedControl
            label="Carga"
            value={String(block.load)}
            options={Array.from({ length: MAX_LOAD }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
            onChange={(v) => onChange({ load: Number(v) })}
          />
        </div>

        <div>
          <span className={sectionTitle}>Color</span>
          <div className="flex flex-wrap gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                aria-pressed={block.color === c}
                onClick={() => onChange({ color: c })}
                className="h-6 w-6 rounded-full ring-offset-2 ring-offset-surface transition-transform hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-accent"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <span className={sectionTitle}>Icono</span>
          <div className="grid grid-cols-6 gap-1.5">
            {BLOCK_ICONS.map((key) => {
              const Icon = getIcon(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`Icono ${key}`}
                  aria-pressed={block.icon === key}
                  onClick={() => onChange({ icon: key })}
                  className="flex h-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:text-fg aria-pressed:border-transparent"
                  style={block.icon === key ? { color: 'var(--accent-fg)', backgroundColor: 'var(--accent)' } : undefined}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        <Field label="Notas">
          <Textarea rows={3} maxLength={500} value={block.notes} placeholder="Ideas, recordatorios, criterio de este bloque…" onChange={(e) => onChange({ notes: e.target.value })} />
        </Field>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
        <Button variant="secondary" size="sm" onClick={onSaveType} disabled={!block.label.trim()}>
          Guardar como enfoque
        </Button>
        <Button variant="ghost" size="sm" aria-label="Eliminar bloque" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
