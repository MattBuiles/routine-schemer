'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Field, Input, SegmentedControl } from 'strata';

import { MAX_LOAD, type CycleBlock } from '@/lib/board/cycle';

const SWATCHES = ['#dc2626', '#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#71717a', '#ec4899'];

interface BlockPanelProps {
  block: CycleBlock;
  onChange: (patch: Partial<CycleBlock>) => void;
  onDelete: () => void;
  onSaveType: () => void;
}

/** Panel flotante mínimo del bloque seleccionado: nombre, color, carga y tipo propio. */
export default function BlockPanel({ block, onChange, onDelete, onSaveType }: BlockPanelProps) {
  return (
    <div
      aria-label="Propiedades del bloque"
      className="absolute bottom-4 left-4 w-72 space-y-3 rounded-xl border border-border bg-surface/95 p-4 shadow-[var(--shadow-lg)] backdrop-blur"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Field label="Nombre">
        <Input value={block.label} maxLength={60} placeholder="Ej. Empuje pesado" onChange={(e) => onChange({ label: e.target.value })} />
      </Field>
      <div>
        <span className="text-sm font-medium text-fg">Carga</span>
        <SegmentedControl
          label="Carga"
          className="mt-1"
          value={String(block.load)}
          options={Array.from({ length: MAX_LOAD }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
          onChange={(v) => onChange({ load: Number(v) })}
        />
      </div>
      <div>
        <span className="text-sm font-medium text-fg">Color</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              aria-pressed={block.color === c}
              onClick={() => onChange({ color: c })}
              className="h-6 w-6 rounded-full ring-offset-2 ring-offset-surface aria-pressed:ring-2 aria-pressed:ring-accent"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button variant="secondary" size="sm" onClick={onSaveType} disabled={!block.label.trim()}>
          Guardar como tipo
        </Button>
        <Button variant="ghost" size="sm" aria-label="Eliminar bloque" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
