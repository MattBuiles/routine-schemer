'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createCalendarEvent } from '@/app/actions/calendar';
import { getDateString } from '@/lib/utils';
import type { DayOfWeek, Program } from '@/types/program';

const WEEKDAYS: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const fieldClass =
  'w-full px-3 py-2 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none bg-transparent';

/** Sesión que toca hoy según el split semanal del programa; si no hay, la primera plantilla. */
function defaultTemplateId(program: Program, date: Date) {
  const day = program.weeklySplits[0]?.days.find(d => d.dayOfWeek === WEEKDAYS[date.getDay()]);
  return day?.sessionTemplateId ?? program.sessionTemplates[0]?.id ?? '';
}

export function LogSessionModal({ program, onClose, onLogged }: { program: Program; onClose: () => void; onLogged: () => void }) {
  const now = new Date();
  const [templateId, setTemplateId] = useState(defaultTemplateId(program, now));
  const [date, setDate] = useState(getDateString(now));
  const template = program.sessionTemplates.find(t => t.id === templateId);
  const [minutes, setMinutes] = useState(String(template?.estimatedDurationMinutes ?? 60));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeTemplate = (id: string) => {
    setTemplateId(id);
    const next = program.sessionTemplates.find(t => t.id === id);
    if (next) setMinutes(String(next.estimatedDurationMinutes));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actualDuration = Number(minutes);
    if (!template || !date || !(actualDuration > 0)) {
      setError('Elige una sesión, una fecha y una duración mayor que 0');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createCalendarEvent({
        date,
        title: template.name,
        type: 'workout',
        category: 'workout',
        completed: true,
        sessionId: template.id,
        duration: template.estimatedDurationMinutes,
        actualDuration,
        notes: notes.trim() || undefined,
      });
      onLogged();
      onClose();
    } catch (err) {
      console.error('Error logging session:', err);
      setError('No se pudo registrar la sesión');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Registrar sesión"
        className="w-full max-w-md rounded-2xl border border-white/20 bg-slate-900 p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="mb-1 text-xl font-semibold text-white">Registrar sesión</h2>
        <p className="mb-4 text-sm text-gray-400">{program.name}</p>

        {program.sessionTemplates.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-300">Este programa no tiene sesiones definidas. Edítalo para añadir alguna.</p>
            <div className="flex justify-end">
              <Button variant="ghost" onClick={onClose} className="text-gray-300">Cerrar</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm text-gray-300">
              <span className="mb-1 block">Sesión</span>
              <select className={fieldClass} value={templateId} onChange={e => changeTemplate(e.target.value)}>
                {program.sessionTemplates.map(t => (
                  <option key={t.id} value={t.id} className="bg-gray-800">{t.name}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm text-gray-300">
                <span className="mb-1 block">Fecha</span>
                <input className={fieldClass} type="date" value={date} max={getDateString(new Date())} onChange={e => setDate(e.target.value)} />
              </label>
              <label className="block text-sm text-gray-300">
                <span className="mb-1 block">Duración real (min)</span>
                <input className={fieldClass} type="number" min="1" value={minutes} onChange={e => setMinutes(e.target.value)} />
              </label>
            </div>
            <label className="block text-sm text-gray-300">
              <span className="mb-1 block">Notas (opcional)</span>
              <textarea className={fieldClass} rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose} className="text-gray-300">Cancelar</Button>
              <Button type="submit" disabled={saving} className="bg-gradient-to-r from-green-500 to-blue-600 text-white border-0">
                {saving ? 'Guardando...' : 'Registrar'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
