'use client';

import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { Button, Field, Input, SegmentedControl, Textarea } from 'strata';

import {
  BLOCK_ICONS,
  FOCUS_SUGGESTIONS,
  MAX_DURATION,
  MAX_FOCUS,
  MAX_LOAD,
  type BlockTypeDef,
  type CycleBlock,
} from '@/lib/board/cycle';
import { getIcon } from './blockIcons';

const SWATCHES = ['#dc2626', '#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#71717a', '#ec4899'];
const DURATIONS = [0, 30, 45, 60, 75, 90];

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

  const addTag = (raw: string) => {
    const tag = raw.trim().slice(0, 24);
    if (!tag || block.focus.some((f) => f.toLowerCase() === tag.toLowerCase()) || block.focus.length >= MAX_FOCUS) return;
    onChange({ focus: [...block.focus, tag] });
    setDraftTag('');
  };

  const suggestions = FOCUS_SUGGESTIONS.filter((s) => !block.focus.some((f) => f.toLowerCase() === s.toLowerCase())).slice(0, 8);

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
          <span className={sectionTitle}>Tipo</span>
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
          <span className={sectionTitle}>Enfoque</span>
          {block.focus.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {block.focus.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2 py-1 text-xs font-medium text-accent">
                  {tag}
                  <button aria-label={`Quitar ${tag}`} onClick={() => onChange({ focus: block.focus.filter((f) => f !== tag) })}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <Input
            value={draftTag}
            maxLength={24}
            placeholder={block.focus.length >= MAX_FOCUS ? 'Máximo alcanzado' : 'Añade un enfoque y pulsa Enter'}
            disabled={block.focus.length >= MAX_FOCUS}
            onChange={(e) => setDraftTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(draftTag);
              }
            }}
          />
          {block.focus.length < MAX_FOCUS && (
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
          <span className={sectionTitle}>Carga</span>
          <SegmentedControl
            label="Carga"
            value={String(block.load)}
            options={Array.from({ length: MAX_LOAD }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
            onChange={(v) => onChange({ load: Number(v) })}
          />
        </div>

        <div>
          <span className={sectionTitle}>Duración · {block.durationMinutes > 0 ? `${block.durationMinutes} min` : 'sin definir'}</span>
          <input
            type="range"
            aria-label="Duración en minutos"
            min={0}
            max={MAX_DURATION}
            step={5}
            value={block.durationMinutes}
            onChange={(e) => onChange({ durationMinutes: Number(e.target.value) })}
            className="w-full accent-[var(--accent)]"
          />
          <div className="mt-1 flex gap-1">
            {DURATIONS.map((d) => (
              <button key={d} type="button" onClick={() => onChange({ durationMinutes: d })} style={block.durationMinutes === d ? { color: 'var(--accent-fg)' } : undefined} className={`flex-1 rounded-md px-1 py-0.5 text-xs ${block.durationMinutes === d ? 'bg-accent' : 'bg-surface-2 text-muted hover:text-fg'}`}>
                {d === 0 ? '—' : d}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className={sectionTitle}>Color e icono</span>
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
          <div className="mt-3 flex flex-wrap gap-1">
            {BLOCK_ICONS.map((key) => {
              const Icon = getIcon(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`Icono ${key}`}
                  aria-pressed={block.icon === key}
                  onClick={() => onChange({ icon: key })}
                  className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-fg aria-pressed:bg-[var(--accent-soft)] aria-pressed:text-accent"
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
          Guardar como tipo
        </Button>
        <Button variant="ghost" size="sm" aria-label="Eliminar bloque" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
