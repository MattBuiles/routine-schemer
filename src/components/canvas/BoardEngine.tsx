'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Redo2, Trash2, Undo2 } from 'lucide-react';

import type { Rect } from '@/lib/board/geometry';
import { commit, commitFrom, createHistory, redo, replace, undo, type History } from '@/lib/board/history';
import Block from './Block';
import Canvas from './Canvas';

export interface EngineBlock extends Rect {
  id: string;
  label: string;
  color: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4'];

const INITIAL: EngineBlock[] = [
  { id: 'a', label: 'Empuje', color: COLORS[0], x: 80, y: 80, w: 160, h: 100 },
  { id: 'b', label: 'Tracción', color: COLORS[3], x: 280, y: 80, w: 160, h: 140 },
];

/** Lienzo con bloques arrastrables y redimensionables, con deshacer/rehacer. */
export default function BoardEngine() {
  const [history, setHistory] = useState<History<EngineBlock[]>>(() => createHistory(INITIAL));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const gestureBase = useRef<EngineBlock[] | null>(null);
  const blocks = history.present;

  const historyRef = useRef(history);
  historyRef.current = history;

  const onGestureStart = useCallback(() => {
    gestureBase.current = historyRef.current.present;
  }, []);

  const onGestureEnd = useCallback(() => {
    const base = gestureBase.current;
    gestureBase.current = null;
    if (base) setHistory((h) => commitFrom(h, base));
  }, []);

  const changeRect = (id: string, rect: Rect) =>
    setHistory((h) => replace(h, h.present.map((b) => (b.id === id ? { ...b, ...rect } : b))));

  const addBlock = () => {
    const n = blocks.length;
    const block: EngineBlock = {
      id: crypto.randomUUID(),
      label: `Bloque ${n + 1}`,
      color: COLORS[n % COLORS.length],
      x: 80 + (n % 5) * 40,
      y: 260 + (n % 5) * 40,
      w: 160,
      h: 100,
    };
    setHistory((h) => commit(h, [...h.present, block]));
    setSelectedId(block.id);
  };

  const deleteBlock = useCallback((id: string) => {
    setHistory((h) => commit(h, h.present.filter((b) => b.id !== id)));
    setSelectedId(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
      e.preventDefault();
      setHistory((h) => (e.shiftKey ? redo(h) : undo(h)));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative h-screen w-full">
      <Canvas onBackgroundClick={() => setSelectedId(null)}>
        {blocks.map((b) => (
          <Block
            key={b.id}
            rect={b}
            color={b.color}
            label={b.label}
            selected={b.id === selectedId}
            onSelect={() => setSelectedId(b.id)}
            onGestureStart={onGestureStart}
            onRectChange={(rect) => changeRect(b.id, rect)}
            onGestureEnd={onGestureEnd}
            onDelete={() => deleteBlock(b.id)}
          />
        ))}
      </Canvas>

      <div className="absolute left-4 top-4 flex items-center gap-1 rounded-xl border border-slate-200 bg-white/90 p-1 shadow-md backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <button aria-label="Añadir bloque" className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={addBlock}>
          <Plus className="h-4 w-4" /> Bloque
        </button>
        <button aria-label="Deshacer" disabled={!history.past.length} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800" onClick={() => setHistory(undo)}>
          <Undo2 className="h-4 w-4" />
        </button>
        <button aria-label="Rehacer" disabled={!history.future.length} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800" onClick={() => setHistory(redo)}>
          <Redo2 className="h-4 w-4" />
        </button>
        <button aria-label="Eliminar bloque" disabled={!selectedId} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800" onClick={() => selectedId && deleteBlock(selectedId)}>
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
