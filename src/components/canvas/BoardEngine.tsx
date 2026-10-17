'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ListChecks, Plus, Redo2, StickyNote, Undo2, type LucideIcon } from 'lucide-react';
import { Alert, Skeleton, ThemeToggle, useConfirm, useToast } from 'strata';

import { authClient } from '@/lib/auth/client';

import { createBlockType, deleteBlockType, getBoard, saveCycles, saveWidgets, savePhases, type CustomBlockType } from '@/app/actions/board';
import {
  CYCLE_FOOT_H,
  MAX_CYCLES,
  blockFromType,
  blocksBeyond,
  cellAt,
  cycleHeight,
  cycleTops,
  findFreeSlot,
  stackBlocks,
  resizeCycle,
  resolveTypes,
  type BlockTypeDef,
  type CycleBlock,
  type CycleDef,
} from '@/lib/board/cycle';
import { commit, commitFrom, createHistory, redo, replace, undo, type History } from '@/lib/board/history';
import type { Rect } from '@/lib/board/geometry';
import {
  PHASE_TYPES,
  nextFreeStart,
  phaseFromType,
  phasesBeyond,
  resizePhase,
  resizePlan,
  type Phase,
  type PhaseTypeDef,
} from '@/lib/board/phases';
import { WIDGET_INFO, WIDGET_TYPES, defaultWidgetRect, type BoardWidget, type WidgetType } from '@/lib/board/widgets';
import BlockPanel from './BlockPanel';
import Canvas, { type CanvasApi } from './Canvas';
import CycleZone, { ZONE_ORIGIN, type DropPreview } from './CycleZone';
import Palette from './Palette';
import PhasePanel from './PhasePanel';
import PhaseStrip from './PhaseStrip';
import WidgetFrame from './WidgetFrame';
import CalendarWidget, { type PlanAnchorWithBlocks } from './widgets/CalendarWidget';
import HabitsWidget from './widgets/HabitsWidget';
import NotesWidget from './widgets/NotesWidget';

interface BoardState {
  cycles: CycleDef[];
  blocks: CycleBlock[];
  widgets: BoardWidget[];
  phases: Phase[];
  /** Fecha en la que empieza la semana 1 del plan (ancla las fases al calendario). */
  planStart: string | null;
  planWeeks: number;
}

const WIDGET_ICONS: Record<WidgetType, LucideIcon> = { habits: ListChecks, notes: StickyNote, calendar: CalendarDays };
const WIDGET_BODIES: Record<WidgetType, (plan: PlanAnchorWithBlocks | null) => React.ReactElement> = {
  habits: () => <HabitsWidget />,
  notes: () => <NotesWidget />,
  calendar: (plan) => <CalendarWidget plan={plan} />,
};
// La franja de fases va sobre la zona del ciclo y los widgets nacen bajo ella.
const STRIP_ORIGIN = { x: ZONE_ORIGIN.x, y: ZONE_ORIGIN.y - 150 };

/** Bloques de un ciclo con los de ese ciclo sustituidos por `next` (los de los demás ciclos no cambian). */
const withCycleBlocks = (blocks: CycleBlock[], cycleId: string, next: CycleBlock[]) => [...blocks.filter((b) => b.cycleId !== cycleId), ...next];

/** Bajo todos los ciclos nacen los widgets nuevos. */
const widgetOrigin = (state: Pick<BoardState, 'cycles' | 'blocks'>) => {
  const tops = cycleTops(state.cycles, state.blocks);
  const last = state.cycles[state.cycles.length - 1];
  const bottom = tops[tops.length - 1] + cycleHeight(state.blocks.filter((b) => b.cycleId === last.id)) + CYCLE_FOOT_H;
  return { x: ZONE_ORIGIN.x, y: ZONE_ORIGIN.y + bottom + 80 };
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const SAVE_DELAY_MS = 800;
const STATUS_LABEL: Record<SaveStatus, string> = { idle: '', saving: 'Guardando…', saved: 'Guardado', error: 'Sin guardar' };

const snapshots = (state: BoardState) => ({
  cycle: JSON.stringify({ cycles: state.cycles, blocks: state.blocks }),
  widgets: JSON.stringify(state.widgets),
  phases: JSON.stringify({ phases: state.phases, planStart: state.planStart, planWeeks: state.planWeeks }),
});

/** Lienzo del ciclo de entrenamiento: carga, edita y guarda el tablero del usuario. */
export default function BoardEngine() {
  const toast = useToast();
  const confirm = useConfirm();
  const [history, setHistory] = useState<History<BoardState> | null>(null);
  const [customTypes, setCustomTypes] = useState<CustomBlockType[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const apiRef = useRef<CanvasApi | null>(null);
  const lastSaved = useRef({ cycle: '', widgets: '', phases: '' });
  const gestureBase = useRef<BoardState | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const saving = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    getBoard()
      .then((board) => {
        if (cancelled) return;
        const state = { cycles: board.cycles, blocks: board.blocks, widgets: board.widgets, phases: board.phases, planStart: board.planStart, planWeeks: board.planWeeks };
        lastSaved.current = snapshots(state);
        setHistory(createHistory(state));
        setCustomTypes(board.customTypes);
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const present = history?.present;
  const historyRef = useRef(history);
  historyRef.current = history;

  // Autoguardado con debounce; los guardados se encadenan para que nunca se crucen.
  useEffect(() => {
    if (!present) return;
    const snapshot = snapshots(present);
    const cycleChanged = snapshot.cycle !== lastSaved.current.cycle;
    const widgetsChanged = snapshot.widgets !== lastSaved.current.widgets;
    const phasesChanged = snapshot.phases !== lastSaved.current.phases;
    if (!cycleChanged && !widgetsChanged && !phasesChanged) return;
    const timer = setTimeout(() => {
      setStatus('saving');
      saving.current = saving.current
        .then(async () => {
          if (cycleChanged) {
            await saveCycles({ cycles: present.cycles, blocks: present.blocks });
            lastSaved.current = { ...lastSaved.current, cycle: snapshot.cycle };
          }
          if (widgetsChanged) {
            await saveWidgets(present.widgets);
            lastSaved.current = { ...lastSaved.current, widgets: snapshot.widgets };
          }
          if (phasesChanged) {
            await savePhases({ phases: present.phases, planStart: present.planStart, planWeeks: present.planWeeks });
            lastSaved.current = { ...lastSaved.current, phases: snapshot.phases };
          }
          setStatus('saved');
        })
        .catch(async () => {
          setStatus('error');
          const { data } = await authClient.getSession().catch(() => ({ data: null }));
          toast({
            tone: 'error',
            duration: 8000,
            message: data?.user
              ? 'No se pudo guardar el tablero. Se reintentará con el próximo cambio.'
              : 'Tu sesión caducó y los cambios no se guardan. Inicia sesión de nuevo (recarga la página).',
          });
        });
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [present, toast]);

  const update = useCallback((next: BoardState) => setHistory((h) => (h ? commit(h, next) : h)), []);

  const types = useMemo(() => resolveTypes(customTypes), [customTypes]);
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null);

  const addBlock = useCallback(
    (block: CycleBlock | null) => {
      if (!present) return;
      const stacked = block && stackBlocks(present.blocks.filter((b) => b.cycleId === block.cycleId), block);
      if (!block || !stacked) {
        toast({ tone: 'info', message: 'No queda hueco para otro bloque en ese día.' });
        return;
      }
      update({ ...present, blocks: withCycleBlocks(present.blocks, block.cycleId, stacked) });
      setSelectedId(block.id);
    },
    [present, toast, update],
  );

  // Los bloques nuevos de la paleta van al ciclo del bloque seleccionado y, si no hay, al primero.
  const onAddType = useCallback(
    (type: BlockTypeDef) => {
      if (!present) return;
      const cycle = present.cycles.find((c) => c.id === present.blocks.find((b) => b.id === selectedId)?.cycleId) ?? present.cycles[0];
      const slot = findFreeSlot(present.blocks.filter((b) => b.cycleId === cycle.id), cycle.days, 1, cycle.id);
      addBlock(slot ? blockFromType(type, crypto.randomUUID(), slot.dayStart, slot.lane, cycle.id) : null);
    },
    [addBlock, present, selectedId],
  );

  /** Ciclo, día y orden de inserción bajo un punto de la pantalla (null si no cae en ninguna zona). */
  const cellUnder = useCallback(
    (clientX: number, clientY: number) => {
      const world = apiRef.current?.toWorld(clientX, clientY);
      if (!world || !present) return null;
      const tops = cycleTops(present.cycles, present.blocks);
      for (const [i, cycle] of present.cycles.entries()) {
        const y = world.y - ZONE_ORIGIN.y - tops[i];
        if (y < 0 || y >= cycleHeight(present.blocks.filter((b) => b.cycleId === cycle.id))) continue;
        const cell = cellAt(world.x - ZONE_ORIGIN.x, y, cycle.days);
        return cell && { ...cell, cycleId: cycle.id };
      }
      return null;
    },
    [present],
  );

  const onDragMove = useCallback(
    (type: BlockTypeDef | null, clientX: number, clientY: number) => {
      const cell = type ? cellUnder(clientX, clientY) : null;
      if (!type || !cell || !present) return setDropPreview(null);
      // La vista previa muestra dónde caerá de verdad en la pila de ese día.
      const mine = present.blocks.filter((b) => b.cycleId === cell.cycleId);
      const landing = stackBlocks(mine, blockFromType(type, 'preview', cell.dayStart, cell.order, cell.cycleId))?.find((b) => b.id === 'preview');
      setDropPreview(landing ? { cycleId: cell.cycleId, dayStart: landing.dayStart, lane: landing.lane, color: type.color, label: type.label, icon: type.icon } : null);
    },
    [cellUnder, present],
  );

  const onDropType = useCallback(
    (type: BlockTypeDef, clientX: number, clientY: number) => {
      const cell = cellUnder(clientX, clientY);
      if (cell) addBlock(blockFromType(type, crypto.randomUUID(), cell.dayStart, cell.order, cell.cycleId));
    },
    [addBlock, cellUnder],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      if (!present) return;
      update({ ...present, blocks: present.blocks.filter((b) => b.id !== id) });
      setSelectedId(null);
    },
    [present, update],
  );

  const changeCycleDays = async (cycleId: string, days: number) => {
    if (!present) return;
    const mine = present.blocks.filter((b) => b.cycleId === cycleId);
    const removed = blocksBeyond(mine, days).filter((b) => b.dayStart >= days).length;
    if (removed > 0) {
      const ok = await confirm({
        title: 'Acortar el ciclo',
        message: `${removed === 1 ? 'Un bloque empieza' : `${removed} bloques empiezan`} después del día ${days} y se eliminará${removed === 1 ? '' : 'n'}.`,
        confirmLabel: 'Acortar',
      });
      if (!ok) return;
    }
    const next = resizeCycle(mine, days);
    update({
      ...present,
      cycles: present.cycles.map((c) => (c.id === cycleId ? { ...c, days: next.cycleDays } : c)),
      blocks: withCycleBlocks(present.blocks, cycleId, next.blocks),
    });
  };

  const addCycle = () => {
    if (!present) return;
    if (present.cycles.length >= MAX_CYCLES) {
      toast({ tone: 'info', message: `Puedes tener hasta ${MAX_CYCLES} ciclos.` });
      return;
    }
    update({ ...present, cycles: [...present.cycles, { id: crypto.randomUUID(), name: `Ciclo ${present.cycles.length + 1}`, days: 7 }] });
  };

  const renameCycle = (cycleId: string, name: string) => {
    if (!present) return;
    update({ ...present, cycles: present.cycles.map((c) => (c.id === cycleId ? { ...c, name } : c)) });
  };

  const deleteCycle = async (cycleId: string) => {
    if (!present || present.cycles.length <= 1) return;
    const cycle = present.cycles.find((c) => c.id === cycleId);
    if (!cycle) return;
    const count = present.blocks.filter((b) => b.cycleId === cycleId).length;
    const ok = await confirm({
      title: 'Eliminar el ciclo',
      message: `Se eliminará el ciclo «${cycle.name}»${count > 0 ? ` y ${count === 1 ? 'su bloque' : `sus ${count} bloques`}` : ''}.`,
      confirmLabel: 'Eliminar',
    });
    if (!ok) return;
    update({ ...present, cycles: present.cycles.filter((c) => c.id !== cycleId), blocks: present.blocks.filter((b) => b.cycleId !== cycleId) });
    if (present.blocks.find((b) => b.id === selectedId)?.cycleId === cycleId) setSelectedId(null);
  };

  const changePlanWeeks = async (weeks: number) => {
    if (!present) return;
    const removed = phasesBeyond(present.phases, weeks).filter((p) => p.startWeek >= weeks);
    if (removed.length > 0) {
      const ok = await confirm({
        title: 'Acortar el plan',
        message: `${removed.length === 1 ? 'Una fase empieza' : `${removed.length} fases empiezan`} después de la semana ${weeks} y se eliminará${removed.length === 1 ? '' : 'n'}.`,
        confirmLabel: 'Acortar',
      });
      if (!ok) return;
    }
    const next = resizePlan(present.phases, weeks);
    update({ ...present, ...next });
    if (selectedPhase && !next.phases.some((p) => p.id === selectedPhase)) setSelectedPhase(null);
  };

  const toggleWidget = (type: WidgetType) => {
    if (!present) return;
    const existing = present.widgets.find((w) => w.type === type);
    if (existing) {
      update({ ...present, widgets: present.widgets.filter((w) => w.id !== existing.id) });
      setSelectedWidget(null);
      return;
    }
    const widget: BoardWidget = { id: crypto.randomUUID(), type, ...defaultWidgetRect(type, present.widgets, widgetOrigin(present)) };
    update({ ...present, widgets: [...present.widgets, widget] });
    setSelectedWidget(widget.id);
    setSelectedId(null);
  };

  const onWidgetGestureStart = useCallback(() => {
    if (historyRef.current) gestureBase.current = historyRef.current.present;
  }, []);

  const onWidgetRect = useCallback((id: string, rect: Rect) => {
    setHistory((h) => (h ? replace(h, { ...h.present, widgets: h.present.widgets.map((w) => (w.id === id ? { ...w, ...rect } : w)) }) : h));
  }, []);

  const onWidgetGestureEnd = useCallback(() => {
    const base = gestureBase.current;
    gestureBase.current = null;
    if (base) setHistory((h) => (h ? commitFrom(h, base) : h));
  }, []);

  const selectedPhaseData = present?.phases.find((p) => p.id === selectedPhase) ?? null;

  const addPhase = (type: PhaseTypeDef, atWeek?: number) => {
    if (!present) return;
    const start = atWeek ?? nextFreeStart(present.phases, type.weeks, present.planWeeks) ?? nextFreeStart(present.phases, 1, present.planWeeks);
    if (start === null || start === undefined) {
      toast({ tone: 'info', message: `El plan ya ocupa las ${present.planWeeks} semanas. Alárgalo con el botón + para añadir más fases.` });
      return;
    }
    const phase = phaseFromType(type, crypto.randomUUID(), start, present.planWeeks);
    // Un hueco intermedio puede ser más corto que la fase por defecto: se recorta para no pisar a la siguiente.
    const next = present.phases.filter((p) => p.startWeek >= start).sort((a, b) => a.startWeek - b.startWeek)[0];
    const fits = { ...phase, weeks: Math.max(1, Math.min(phase.weeks, (next?.startWeek ?? present.planWeeks) - start)) };
    if (present.phases.some((p) => p.startWeek < start + fits.weeks && start < p.startWeek + p.weeks)) {
      toast({ tone: 'info', message: 'Ahí ya hay una fase.' });
      return;
    }
    update({ ...present, phases: [...present.phases, fits].sort((a, b) => a.startWeek - b.startWeek) });
    setSelectedPhase(fits.id);
    setSelectedId(null);
    setSelectedWidget(null);
  };

  const patchPhase = (patch: Partial<Phase>) => {
    if (!present || !selectedPhaseData) return;
    update({ ...present, phases: present.phases.map((p) => (p.id === selectedPhaseData.id ? { ...p, ...patch } : p)) });
  };

  const deletePhase = () => {
    if (!present || !selectedPhaseData) return;
    update({ ...present, phases: present.phases.filter((p) => p.id !== selectedPhaseData.id) });
    setSelectedPhase(null);
  };

  const selected = present?.blocks.find((b) => b.id === selectedId) ?? null;

  const patchSelected = (patch: Partial<CycleBlock>) => {
    if (!present || !selected) return;
    update({ ...present, blocks: present.blocks.map((b) => (b.id === selected.id ? { ...b, ...patch } : b)) });
  };

  // Cambiar de enfoque conserva lo que el usuario ya personalizó: el nombre solo se actualiza si seguía siendo el del tipo anterior.
  const changeType = (type: BlockTypeDef) => {
    if (!selected) return;
    const previous = types.find((t) => t.key === selected.blockType);
    const keepLabel = selected.label.trim() && selected.label !== previous?.label;
    patchSelected({ blockType: type.key, color: type.color, icon: type.icon, ...(keepLabel ? {} : { label: type.label }) });
  };

  const saveAsType = async () => {
    if (!selected) return;
    try {
      const created = await createBlockType({ name: selected.label, color: selected.color, icon: selected.icon });
      setCustomTypes((types) => [...types, created]);
      toast({ tone: 'success', message: `Enfoque «${created.name}» guardado en la paleta.` });
    } catch {
      toast({ tone: 'error', message: 'No se pudo guardar el enfoque.' });
    }
  };

  const removeCustomType = async (id: string) => {
    try {
      await deleteBlockType(id);
      setCustomTypes((types) => types.filter((t) => t.id !== id));
    } catch {
      toast({ tone: 'error', message: 'No se pudo eliminar el enfoque.' });
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
      if ((e.target as HTMLElement)?.closest('input, textarea')) return;
      e.preventDefault();
      setHistory((h) => (h ? (e.shiftKey ? redo(h) : undo(h)) : h));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (loadError) {
    return (
      <div className="mx-auto max-w-md p-8">
        <Alert tone="error">No se pudo cargar tu tablero. Recarga la página para reintentar.</Alert>
      </div>
    );
  }
  if (!history || !present) return <Skeleton className="h-screen w-full" />;

  const tops = cycleTops(present.cycles, present.blocks);
  const lastCycle = present.cycles[present.cycles.length - 1];
  const addCycleTop = tops[tops.length - 1] + cycleHeight(present.blocks.filter((b) => b.cycleId === lastCycle.id)) + CYCLE_FOOT_H + 8;

  // El calendario enseña el plan solo si tiene fecha de inicio.
  const plan: PlanAnchorWithBlocks | null = present.planStart
    ? { planStart: present.planStart, cycles: present.cycles, planWeeks: present.planWeeks, phases: present.phases, blocks: present.blocks }
    : null;

  return (
    <div className="relative h-screen w-full">
      <Canvas
        apiRef={apiRef}
        onBackgroundClick={() => {
          setSelectedId(null);
          setSelectedWidget(null);
          setSelectedPhase(null);
        }}
      >
        <PhaseStrip
          origin={STRIP_ORIGIN}
          phases={present.phases}
          planWeeks={present.planWeeks}
          onPlanWeeksChange={changePlanWeeks}
          selectedId={selectedPhase}
          onSelect={(id) => {
            setSelectedPhase(id);
            if (id) {
              setSelectedId(null);
              setSelectedWidget(null);
            }
          }}
          onPhasesChange={(phases) => update({ ...present, phases })}
          onCreateAt={(week) => addPhase(PHASE_TYPES[0], week)}
          planStart={present.planStart}
          onPlanStartChange={(planStart) => update({ ...present, planStart })}
        />
        {present.cycles.map((cycle, i) => (
          <CycleZone
            key={cycle.id}
            cycle={cycle}
            top={tops[i]}
            blocks={present.blocks.filter((b) => b.cycleId === cycle.id)}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              if (id) {
                setSelectedWidget(null);
                setSelectedPhase(null);
              }
            }}
            onBlocksChange={(next) => update({ ...present, blocks: withCycleBlocks(present.blocks, cycle.id, next) })}
            onDelete={deleteBlock}
            onCycleDaysChange={(days) => changeCycleDays(cycle.id, days)}
            onNameChange={(name) => renameCycle(cycle.id, name)}
            onDeleteCycle={present.cycles.length > 1 ? () => deleteCycle(cycle.id) : undefined}
            dropPreview={dropPreview}
            onCreateAt={(dayStart, lane) => addBlock(blockFromType(types.find((t) => t.key === 'free')!, crypto.randomUUID(), dayStart, lane, cycle.id))}
          />
        ))}
        {present.cycles.length < MAX_CYCLES && (
          <button
            type="button"
            className="absolute flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-dashed border-border bg-surface/70 px-3 py-2 text-sm text-muted hover:text-fg"
            style={{ left: ZONE_ORIGIN.x, top: ZONE_ORIGIN.y + addCycleTop }}
            onPointerDown={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onClick={addCycle}
          >
            <Plus className="h-4 w-4" />
            Añadir ciclo
          </button>
        )}
        {present.widgets.map((w) => {
          const Icon = WIDGET_ICONS[w.type];
          return (
            <WidgetFrame
              key={w.id}
              rect={w}
              title={WIDGET_INFO[w.type].title}
              icon={<Icon className="h-4 w-4" />}
              selected={w.id === selectedWidget}
              onSelect={() => {
                setSelectedWidget(w.id);
                setSelectedId(null);
                setSelectedPhase(null);
              }}
              onGestureStart={onWidgetGestureStart}
              onRectChange={(rect) => onWidgetRect(w.id, rect)}
              onGestureEnd={onWidgetGestureEnd}
              onClose={() => toggleWidget(w.type)}
            >
              {WIDGET_BODIES[w.type](plan)}
            </WidgetFrame>
          );
        })}
      </Canvas>

      <Palette types={types} onAdd={onAddType} onDragMove={onDragMove} onDropType={onDropType} onDeleteCustom={removeCustomType} phaseTypes={PHASE_TYPES} onAddPhase={addPhase} />

      <div className="absolute left-4 top-4 flex items-center gap-1 rounded-xl border border-border bg-surface/90 p-1 shadow-[var(--shadow)] backdrop-blur">
        <button aria-label="Deshacer" disabled={!history.past.length} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-40" onClick={() => setHistory((h) => (h ? undo(h) : h))}>
          <Undo2 className="h-4 w-4" />
        </button>
        <button aria-label="Rehacer" disabled={!history.future.length} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-40" onClick={() => setHistory((h) => (h ? redo(h) : h))}>
          <Redo2 className="h-4 w-4" />
        </button>
        <span role="status" className="min-w-20 px-2 text-xs text-muted">
          {STATUS_LABEL[status]}
        </span>
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        {WIDGET_TYPES.map((type) => {
          const Icon = WIDGET_ICONS[type];
          const on = present.widgets.some((w) => w.type === type);
          return (
            <button
              key={type}
              aria-label={`${on ? 'Quitar' : 'Añadir'} ${WIDGET_INFO[type].title}`}
              aria-pressed={on}
              title={WIDGET_INFO[type].title}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-fg aria-pressed:text-accent"
              onClick={() => toggleWidget(type)}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
      <ThemeToggle className="absolute right-4 top-4 z-20" />

      {selectedPhaseData && (
        <PhasePanel
          key={selectedPhaseData.id}
          phase={selectedPhaseData}
          planWeeks={present.planWeeks}
          exerciseSets={present.blocks.flatMap((b) => b.exercises.map((e) => e.sets))}
          onResize={(weeks) => update({ ...present, phases: resizePhase(present.phases, selectedPhaseData.id, weeks, present.planWeeks) })}
          onChange={patchPhase}
          onDelete={deletePhase}
          onClose={() => setSelectedPhase(null)}
        />
      )}

      {selected && (
        <BlockPanel
          key={selected.id}
          block={selected}
          types={types}
          onChange={patchSelected}
          onChangeType={changeType}
          onDelete={() => deleteBlock(selected.id)}
          onSaveType={saveAsType}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

