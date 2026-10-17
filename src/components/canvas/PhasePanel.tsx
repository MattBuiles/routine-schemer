'use client';

import React, { useMemo } from 'react';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { Button, Field, Input, Switch } from 'strata';

import { PHASE_TYPES, phaseType, projectPhase, type Phase, type PhaseKind } from '@/lib/board/phases';

interface PhasePanelProps {
  /** Duración total del plan: una fase no puede alargarse más allá. */
  planWeeks: number;
  phase: Phase;
  /** Series de cada ejercicio del ciclo (base de la proyección). */
  exerciseSets: number[];
  /** Cambia la duración respetando a las fases vecinas; devuelve las semanas resultantes. */
  onResize: (weeks: number) => void;
  onChange: (patch: Partial<Phase>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const sectionTitle = 'mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted';
const signed = (n: number, unit = '%') => `${n > 0 ? '+' : ''}${n}${unit}`;

/** Panel de la fase seleccionada: tipo, duración, modificadores, rampa semanal y proyección semana a semana. */
export default function PhasePanel({ phase, planWeeks, exerciseSets, onResize, onChange, onDelete, onClose }: PhasePanelProps) {
  const projection = useMemo(() => projectPhase(phase, exerciseSets), [phase, exerciseSets]);
  const hasExercises = exerciseSets.length > 0;

  const changeKind = (kind: PhaseKind) => {
    const type = phaseType(kind);
    const keepName = phase.name.trim() && phase.name !== phaseType(phase.kind).label;
    onChange({
      kind,
      color: type.color,
      volumePct: type.volumePct,
      intensityPct: type.intensityPct,
      rampSets: type.rampSets,
      rampLoad: type.rampLoad,
      deloadLast: type.deloadLast && phase.weeks > 1,
      ...(keepName ? {} : { name: type.label }),
    });
  };

  return (
    <aside
      aria-label="Propiedades de la fase"
      className="panel-in absolute bottom-4 right-4 top-16 z-10 flex w-80 flex-col rounded-2xl border border-border bg-surface/95 shadow-[var(--shadow-lg)] backdrop-blur"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-fg">Fase</h2>
        <button aria-label="Cerrar panel" className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-fg" onClick={onClose}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        <div>
          <span className={sectionTitle}>Tipo</span>
          <div className="flex flex-wrap gap-1.5">
            {PHASE_TYPES.map((t) => (
              <button
                key={t.kind}
                type="button"
                aria-pressed={phase.kind === t.kind}
                onClick={() => changeKind(t.kind)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${phase.kind === t.kind ? 'border-transparent text-white' : 'border-border text-muted hover:text-fg'}`}
                style={phase.kind === t.kind ? { backgroundColor: t.color } : undefined}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted">{phaseType(phase.kind).hint}</p>
        </div>

        <Field label="Nombre">
          <Input value={phase.name} maxLength={40} onChange={(e) => onChange({ name: e.target.value })} />
        </Field>

        <div>
          <span className={sectionTitle}>Duración · {phase.weeks} {phase.weeks === 1 ? 'semana' : 'semanas'}</span>
          <div className="flex items-center gap-2">
            <button aria-label="Quitar una semana" disabled={phase.weeks <= 1} className="rounded-lg border border-border p-1.5 text-muted hover:text-fg disabled:opacity-40" onClick={() => onResize(phase.weeks - 1)}>
              <Minus className="h-4 w-4" />
            </button>
            <span className="iv-tabular w-10 text-center text-sm">{phase.weeks}</span>
            <button aria-label="Añadir una semana" disabled={phase.startWeek + phase.weeks >= planWeeks} className="rounded-lg border border-border p-1.5 text-muted hover:text-fg disabled:opacity-40" onClick={() => onResize(phase.weeks + 1)}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <span className={sectionTitle}>Volumen · {signed(phase.volumePct)}</span>
          <input type="range" aria-label="Ajuste de volumen" min={-60} max={60} step={5} value={phase.volumePct} onChange={(e) => onChange({ volumePct: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
        </div>

        <div>
          <span className={sectionTitle}>Intensidad · {signed(phase.intensityPct)}</span>
          <input type="range" aria-label="Ajuste de intensidad" min={-30} max={30} step={5} value={phase.intensityPct} onChange={(e) => onChange({ intensityPct: Number(e.target.value) })} className="w-full accent-[var(--accent)]" />
        </div>

        <div>
          <span className={sectionTitle}>Rampa semanal</span>
          <div className="flex items-center gap-3 text-xs text-muted">
            <label className="flex flex-1 flex-col gap-1">
              Series por ejercicio
              <Input type="number" aria-label="Series extra por semana" min={0} max={3} className="px-2 py-1" value={phase.rampSets} onChange={(e) => onChange({ rampSets: Math.min(3, Math.max(0, Number(e.target.value) || 0)) })} />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              Carga (% / semana)
              <Input type="number" aria-label="Carga extra por semana" min={-10} max={10} step={0.5} className="px-2 py-1" value={phase.rampLoad} onChange={(e) => onChange({ rampLoad: Math.min(10, Math.max(-10, Number(e.target.value) || 0)) })} />
            </label>
          </div>
          <Switch className="mt-3 text-sm" checked={phase.deloadLast} disabled={phase.weeks <= 1 || phase.kind === 'deload'} onChange={(e) => onChange({ deloadLast: e.target.checked })}>
            Última semana de descarga
          </Switch>
        </div>

        <div>
          <span className={sectionTitle}>Proyección</span>
          <table className="w-full text-xs" aria-label="Proyección semana a semana">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-1 font-medium">Sem. plan</th>
                <th className="py-1 font-medium">Series</th>
                <th className="py-1 font-medium">Carga</th>
              </tr>
            </thead>
            <tbody>
              {projection.map((w) => (
                <tr key={w.planWeek} className="border-t border-border">
                  <td className="iv-tabular py-1">
                    {w.planWeek}
                    {w.deload && <span className="ml-1 rounded bg-surface-2 px-1 text-[10px] text-muted">descarga</span>}
                  </td>
                  <td className="iv-tabular py-1">{hasExercises ? w.sets : '—'}</td>
                  <td className="iv-tabular py-1">{w.loadPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!hasExercises && <p className="mt-2 text-xs text-muted">Añade ejercicios a los bloques del ciclo para ver las series proyectadas.</p>}
        </div>
      </div>

      <div className="flex justify-end border-t border-border px-4 py-3">
        <Button variant="ghost" size="sm" aria-label="Eliminar fase" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );
}
