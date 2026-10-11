'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info, Plus, Search } from 'lucide-react';
import { Input, Modal, Select, Skeleton, useToast } from 'strata';

import { getExercise, searchExercises, type ExerciseDetail, type ExerciseSummary } from '@/app/actions/exercises';
import { EQUIPMENT, EQUIPMENT_LABELS, MUSCLES, MUSCLE_LABELS } from '@/lib/exercises/search';

interface ExercisePickerProps {
  open: boolean;
  onClose: () => void;
  onPick: (exercise: ExerciseSummary) => void;
}

const PAGE = 30;
const DEBOUNCE_MS = 250;

/** Nombre en español si existe; si no, el original en inglés. */
export const exerciseName = (e: Pick<ExerciseSummary, 'nameEn' | 'nameEs'>) => e.nameEs ?? e.nameEn;

/** Buscador de la biblioteca: texto, músculo y equipamiento; clic en un resultado lo añade al bloque. */
export default function ExercisePicker({ open, onClose, onPick }: ExercisePickerProps) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [items, setItems] = useState<ExerciseSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ExerciseDetail | null>(null);

  // Cada vez que se abre empieza limpio: los filtros de la vez anterior confunden.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setMuscle('');
    setEquipment('');
    setDetail(null);
  }, [open]);

  // Nueva búsqueda al cambiar los filtros (con debounce para el texto); la respuesta vieja se descarta.
  useEffect(() => {
    if (!open) return;
    let stale = false;
    setLoading(true);
    const timer = setTimeout(() => {
      searchExercises({ query, muscle: muscle || null, equipment: equipment || null, limit: PAGE })
        .then((result) => {
          if (stale) return;
          setItems(result.items);
          setTotal(result.total);
        })
        .catch(() => !stale && toast({ tone: 'error', message: 'No se pudo buscar en la biblioteca.' }))
        .finally(() => !stale && setLoading(false));
    }, DEBOUNCE_MS);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [open, query, muscle, equipment, toast]);

  const loadMore = async () => {
    try {
      const result = await searchExercises({ query, muscle: muscle || null, equipment: equipment || null, limit: PAGE, offset: items.length });
      setItems((list) => [...list, ...result.items]);
      setTotal(result.total);
    } catch {
      toast({ tone: 'error', message: 'No se pudieron cargar más ejercicios.' });
    }
  };

  const showDetail = async (id: string) => {
    try {
      setDetail(await getExercise(id));
    } catch {
      toast({ tone: 'error', message: 'No se pudo cargar el ejercicio.' });
    }
  };

  // Se pinta en <body>: el panel que lo contiene tiene filtros y transformaciones que atraparían a un `fixed`.
  if (typeof document === 'undefined') return null;
  return createPortal(
    <Modal open={open} onClose={onClose} title="Añadir ejercicio" className="flex max-h-[85vh] max-w-2xl flex-col">
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input autoFocus aria-label="Buscar ejercicio" className="py-2 pl-9" placeholder="Buscar (press, sentadilla, curl…)" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select aria-label="Músculo" className="py-2 sm:w-40" value={muscle} onChange={(e) => setMuscle(e.target.value)}>
          <option value="">Todos los músculos</option>
          {MUSCLES.map((m) => (
            <option key={m} value={m}>
              {MUSCLE_LABELS[m]}
            </option>
          ))}
        </Select>
        <Select aria-label="Equipamiento" className="py-2 sm:w-40" value={equipment} onChange={(e) => setEquipment(e.target.value)}>
          <option value="">Todo el equipo</option>
          {EQUIPMENT.map((q) => (
            <option key={q} value={q}>
              {EQUIPMENT_LABELS[q]}
            </option>
          ))}
        </Select>
      </div>

      <p className="mt-2 text-xs text-muted" role="status">
        {loading ? 'Buscando…' : `${total} ${total === 1 ? 'ejercicio' : 'ejercicios'}`}
      </p>

      <ul className="mt-2 min-h-0 flex-1 overflow-y-auto" aria-label="Resultados">
        {loading && items.length === 0 && <Skeleton className="h-16 w-full" />}
        {items.map((e) => (
          <li key={e.id} className="flex items-center gap-3 border-b border-border py-2">
            {e.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- imágenes externas (CDN de la fuente); sin optimizador
              <img src={e.image} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-lg bg-surface-2 object-cover" />
            ) : (
              <span className="h-12 w-12 shrink-0 rounded-lg bg-surface-2" aria-hidden />
            )}
            <button className="min-w-0 flex-1 text-left" onClick={() => onPick(e)} aria-label={`Añadir ${exerciseName(e)}`}>
              <span className="block truncate text-sm font-medium">{exerciseName(e)}</span>
              <span className="block truncate text-xs text-muted">
                {[...e.primaryMuscles.map((m) => MUSCLE_LABELS[m] ?? m), ...e.equipment.map((q) => EQUIPMENT_LABELS[q] ?? q)].join(' · ') || '—'}
              </span>
            </button>
            <button aria-label={`Ver detalle de ${exerciseName(e)}`} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg" onClick={() => showDetail(e.id)}>
              <Info className="h-4 w-4" />
            </button>
            <button aria-label={`Añadir ${exerciseName(e)} al bloque`} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg" onClick={() => onPick(e)}>
              <Plus className="h-4 w-4" />
            </button>
          </li>
        ))}
        {!loading && items.length === 0 && <li className="py-8 text-center text-sm text-muted">Sin resultados. Prueba con otro nombre o quita un filtro.</li>}
        {items.length < total && (
          <li className="py-3 text-center">
            <button className="text-sm text-accent hover:underline" onClick={loadMore}>
              Cargar más ({total - items.length})
            </button>
          </li>
        )}
      </ul>

      {detail && (
        <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-border bg-surface-2 p-3 text-xs" aria-label="Detalle del ejercicio">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold">{exerciseName(detail)}</h3>
            <button className="text-muted hover:text-fg" onClick={() => setDetail(null)}>
              Cerrar
            </button>
          </div>
          <p className="mt-1 whitespace-pre-line text-muted">{(detail.instructionsEs ?? detail.instructionsEn) || 'Sin instrucciones.'}</p>
        </div>
      )}

      <p className="mt-3 text-[11px] text-muted">
        Datos de{' '}
        <a className="underline" href="https://github.com/yuhonas/free-exercise-db" target="_blank" rel="noreferrer">
          free-exercise-db
        </a>{' '}
        (dominio público) y{' '}
        <a className="underline" href="https://wger.de" target="_blank" rel="noreferrer">
          wger
        </a>{' '}
        (CC-BY-SA){detail?.attribution ? ` · autores de este ejercicio: ${detail.attribution}` : ''}.
      </p>
    </Modal>,
    document.body,
  );
}
