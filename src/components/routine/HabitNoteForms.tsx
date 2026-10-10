'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createHabit, updateHabit } from '@/app/actions/habits';
import { createNote, updateNote } from '@/app/actions/notes';
import type { Habit, HabitType, Note, NoteType } from '@/types';

const fieldClass =
  'w-full px-3 py-2 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none bg-transparent';
const optionClass = 'bg-gray-800';

// Color e icono se derivan del tipo al crear; las claves de icono coinciden con `habitIcons`.
const habitPresets: Record<HabitType, { label: string; icon: string; color: string; target: number; unit: string }> = {
  water_intake: { label: 'Hidratación', icon: 'Droplets', color: '#3b82f6', target: 8, unit: 'vasos' },
  sleep: { label: 'Sueño', icon: 'Moon', color: '#8b5cf6', target: 8, unit: 'horas' },
  nutrition: { label: 'Nutrición', icon: 'Utensils', color: '#22c55e', target: 3, unit: 'comidas' },
  supplements: { label: 'Suplementos', icon: 'Pill', color: '#f59e0b', target: 1, unit: 'dosis' },
  meditation: { label: 'Meditación', icon: 'Brain', color: '#ec4899', target: 10, unit: 'minutos' },
  steps: { label: 'Pasos', icon: 'Activity', color: '#14b8a6', target: 10000, unit: 'pasos' },
  weight: { label: 'Peso', icon: 'Heart', color: '#ef4444', target: 70, unit: 'kg' },
  custom: { label: 'Personalizado', icon: 'Heart', color: '#64748b', target: 1, unit: 'veces' },
};

const noteTypeLabels: Record<NoteType, string> = {
  general: 'General',
  workout: 'Entrenamiento',
  nutrition: 'Nutrición',
  progress: 'Progreso',
  idea: 'Idea',
  reminder: 'Recordatorio',
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label={title}
        className="w-full max-w-md rounded-2xl border border-white/20 bg-slate-900 p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-semibold text-white">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-gray-300">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function FormActions({ saving, onClose }: { saving: boolean; onClose: () => void }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button type="button" variant="ghost" onClick={onClose} className="text-gray-300">
        Cancelar
      </Button>
      <Button type="submit" disabled={saving} className="bg-gradient-to-r from-green-500 to-blue-600 text-white border-0">
        {saving ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  );
}

export function HabitFormModal({ habit, onClose, onSaved }: { habit?: Habit; onClose: () => void; onSaved: (habit: Habit) => void }) {
  const [name, setName] = useState(habit?.name ?? '');
  const [type, setType] = useState<HabitType>(habit?.type ?? 'water_intake');
  const [target, setTarget] = useState(String(habit?.target ?? habitPresets.water_intake.target));
  const [unit, setUnit] = useState(habit?.unit ?? habitPresets.water_intake.unit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeType = (next: HabitType) => {
    setType(next);
    // Al crear, el tipo propone objetivo y unidad; al editar se respetan los valores actuales.
    if (!habit) {
      setTarget(String(habitPresets[next].target));
      setUnit(habitPresets[next].unit);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNumber = Number(target);
    if (!name.trim() || !unit.trim() || !(targetNumber > 0)) {
      setError('Nombre, unidad y un objetivo mayor que 0 son obligatorios');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const fields = { name: name.trim(), type, target: targetNumber, unit: unit.trim() };
      if (habit) {
        await updateHabit(habit.id, fields);
        onSaved({ ...habit, ...fields, updatedAt: new Date() });
      } else {
        onSaved(await createHabit({ ...fields, icon: habitPresets[type].icon, color: habitPresets[type].color }));
      }
      onClose();
    } catch (err) {
      console.error('Error saving habit:', err);
      setError('No se pudo guardar el hábito');
      setSaving(false);
    }
  };

  return (
    <Modal title={habit ? 'Editar hábito' : 'Nuevo hábito'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre">
          <input className={fieldClass} value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Beber agua" autoFocus />
        </Field>
        <Field label="Tipo">
          <select className={fieldClass} value={type} onChange={e => changeType(e.target.value as HabitType)}>
            {Object.entries(habitPresets).map(([key, preset]) => (
              <option key={key} value={key} className={optionClass}>{preset.label}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Objetivo diario">
            <input className={fieldClass} type="number" min="0" step="any" value={target} onChange={e => setTarget(e.target.value)} />
          </Field>
          <Field label="Unidad">
            <input className={fieldClass} value={unit} onChange={e => setUnit(e.target.value)} />
          </Field>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <FormActions saving={saving} onClose={onClose} />
      </form>
    </Modal>
  );
}

export function NoteFormModal({ note, onClose, onSaved }: { note?: Note; onClose: () => void; onSaved: (note: Note) => void }) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [type, setType] = useState<NoteType>(note?.type ?? 'general');
  const [tags, setTags] = useState(note?.tags.join(', ') ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('El título y el contenido son obligatorios');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const fields = {
        title: title.trim(),
        content: content.trim(),
        type,
        tags: tags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(Boolean),
      };
      if (note) {
        await updateNote(note.id, fields);
        onSaved({ ...note, ...fields, updatedAt: new Date() });
      } else {
        onSaved(await createNote(fields));
      }
      onClose();
    } catch (err) {
      console.error('Error saving note:', err);
      setError('No se pudo guardar la nota');
      setSaving(false);
    }
  };

  return (
    <Modal title={note ? 'Editar nota' : 'Nueva nota'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Título">
          <input className={fieldClass} value={title} onChange={e => setTitle(e.target.value)} autoFocus />
        </Field>
        <Field label="Tipo">
          <select className={fieldClass} value={type} onChange={e => setType(e.target.value as NoteType)}>
            {Object.entries(noteTypeLabels).map(([key, label]) => (
              <option key={key} value={key} className={optionClass}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Contenido">
          <textarea className={fieldClass} rows={4} value={content} onChange={e => setContent(e.target.value)} />
        </Field>
        <Field label="Etiquetas (separadas por comas)">
          <input className={fieldClass} value={tags} onChange={e => setTags(e.target.value)} placeholder="pecho, técnica" />
        </Field>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <FormActions saving={saving} onClose={onClose} />
      </form>
    </Modal>
  );
}
