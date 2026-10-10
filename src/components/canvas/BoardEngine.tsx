'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Redo2, Undo2 } from 'lucide-react';
import { Alert, Skeleton, ThemeToggle, useConfirm, useToast } from 'strata';

import { createBlockType, deleteBlockType, getBoard, saveCycle, type CustomBlockType } from '@/app/actions/board';
import {
  DAY_W,
  DEFAULT_BLOCK_TYPES,
  HEADER_H,
  LANE_H,
  MAX_LANES,
  blocksBeyond,
  findFreeSlot,
  placeBlock,
  resizeCycle,
  type CycleBlock,
} from '@/lib/board/cycle';
import { commit, createHistory, redo, undo, type History } from '@/lib/board/history';
import BlockPanel from './BlockPanel';
import Canvas, { type CanvasApi } from './Canvas';
import CycleZone, { ZONE_ORIGIN } from './CycleZone';
import Palette, { type PaletteType } from './Palette';

interface CycleState {
  cycleDays: number;
  blocks: CycleBlock[];
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const SAVE_DELAY_MS = 800;
const STATUS_LABEL: Record<SaveStatus, string> = { idle: '', saving: 'Guardando…', saved: 'Guardado', error: 'Sin guardar' };

/** Lienzo del ciclo de entrenamiento: carga, edita y guarda el tablero del usuario. */
export default function BoardEngine() {
  const toast = useToast();
  const confirm = useConfirm();
  const [history, setHistory] = useState<History<CycleState> | null>(null);
  const [customTypes, setCustomTypes] = useState<CustomBlockType[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const apiRef = useRef<CanvasApi | null>(null);
  const lastSaved = useRef('');
  const saving = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    getBoard()
      .then((board) => {
        if (cancelled) return;
        const state = { cycleDays: board.cycleDays, blocks: board.blocks };
        lastSaved.current = JSON.stringify(state);
        setHistory(createHistory(state));
        setCustomTypes(board.customTypes);
      })
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const present = history?.present;

  // Autoguardado con debounce; los guardados se encadenan para que nunca se crucen.
  useEffect(() => {
    if (!present) return;
    const snapshot = JSON.stringify(present);
    if (snapshot === lastSaved.current) return;
    const timer = setTimeout(() => {
      setStatus('saving');
      saving.current = saving.current
        .then(() => saveCycle(present))
        .then(() => {
          lastSaved.current = snapshot;
          setStatus('saved');
        })
        .catch(() => {
          setStatus('error');
          toast({ tone: 'error', message: 'No se pudo guardar el ciclo. Se reintentará con el próximo cambio.' });
        });
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [present, toast]);

  const update = useCallback((next: CycleState) => setHistory((h) => (h ? commit(h, next) : h)), []);

  const typeByKey = useMemo(() => {
    const map = new Map<string, { label: string; color: string }>();
    DEFAULT_BLOCK_TYPES.forEach((t) => map.set(t.key, t));
    return map;
  }, []);

  const makeBlock = useCallback(
    (type: PaletteType, dayStart: number, lane: number): CycleBlock => ({
      id: crypto.randomUUID(),
      label: type.label,
      color: type.color,
      blockType: type.key,
      dayStart,
      daySpan: 1,
      lane,
      load: type.key === 'rest' ? 1 : 3,
    }),
    [],
  );

  const addBlock = useCallback(
    (block: CycleBlock | null) => {
      if (!present) return;
      const placed = block && placeBlock(present.blocks, block);
      if (!placed) {
        toast({ tone: 'info', message: 'No queda hueco para otro bloque en ese día.' });
        return;
      }
      update({ ...present, blocks: [...present.blocks, placed] });
      setSelectedId(placed.id);
    },
    [present, toast, update],
  );

  const onAddType = useCallback(
    (type: PaletteType) => {
      if (!present) return;
      const slot = findFreeSlot(present.blocks, present.cycleDays);
      addBlock(slot ? makeBlock(type, slot.dayStart, slot.lane) : null);
    },
    [addBlock, makeBlock, present],
  );

  const onDropType = useCallback(
    (type: PaletteType, clientX: number, clientY: number) => {
      const world = apiRef.current?.toWorld(clientX, clientY);
      if (!world || !present) return;
      const x = world.x - ZONE_ORIGIN.x;
      const y = world.y - ZONE_ORIGIN.y - HEADER_H;
      if (x < 0 || y < 0 || x >= present.cycleDays * DAY_W || y >= MAX_LANES * LANE_H) return;
      addBlock(makeBlock(type, Math.floor(x / DAY_W), Math.floor(y / LANE_H)));
    },
    [addBlock, makeBlock, present],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      if (!present) return;
      update({ ...present, blocks: present.blocks.filter((b) => b.id !== id) });
      setSelectedId(null);
    },
    [present, update],
  );

  const changeCycleDays = async (days: number) => {
    if (!present) return;
    const lost = blocksBeyond(present.blocks, days);
    const removed = lost.filter((b) => b.dayStart >= days).length;
    if (removed > 0) {
      const ok = await confirm({
        title: 'Acortar el ciclo',
        message: `${removed === 1 ? 'Un bloque empieza' : `${removed} bloques empiezan`} después del día ${days} y se eliminará${removed === 1 ? '' : 'n'}.`,
        confirmLabel: 'Acortar',
      });
      if (!ok) return;
    }
    update(resizeCycle(present.blocks, days));
  };

  const selected = present?.blocks.find((b) => b.id === selectedId) ?? null;

  const patchSelected = (patch: Partial<CycleBlock>) => {
    if (!present || !selected) return;
    update({ ...present, blocks: present.blocks.map((b) => (b.id === selected.id ? { ...b, ...patch } : b)) });
  };

  const saveAsType = async () => {
    if (!selected) return;
    try {
      const created = await createBlockType({ name: selected.label, color: selected.color });
      setCustomTypes((types) => [...types, created]);
      toast({ tone: 'success', message: `Tipo «${created.name}» guardado en la paleta.` });
    } catch {
      toast({ tone: 'error', message: 'No se pudo guardar el tipo.' });
    }
  };

  const removeCustomType = async (id: string) => {
    try {
      await deleteBlockType(id);
      setCustomTypes((types) => types.filter((t) => t.id !== id));
    } catch {
      toast({ tone: 'error', message: 'No se pudo eliminar el tipo.' });
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

  const palette: PaletteType[] = customTypes.map((t) => ({ key: `custom:${t.id}`, label: t.name, color: t.color, customId: t.id }));

  return (
    <div className="relative h-screen w-full">
      <Canvas apiRef={apiRef} onBackgroundClick={() => setSelectedId(null)}>
        <CycleZone
          cycleDays={present.cycleDays}
          blocks={present.blocks}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onBlocksChange={(blocks) => update({ ...present, blocks })}
          onDelete={deleteBlock}
          onCycleDaysChange={changeCycleDays}
          onCreateAt={(dayStart, lane) => addBlock(makeBlock({ key: 'free', ...typeByKey.get('free')! }, dayStart, lane))}
        />
      </Canvas>

      <Palette customTypes={palette} onAdd={onAddType} onDropType={onDropType} onDeleteCustom={removeCustomType} />

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
      </div>
      <ThemeToggle className="absolute right-4 top-4" />

      {selected && <BlockPanel block={selected} onChange={patchSelected} onDelete={() => deleteBlock(selected.id)} onSaveType={saveAsType} />}
    </div>
  );
}

