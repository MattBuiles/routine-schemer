'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Minus, Plus, Maximize2 } from 'lucide-react';

import { DEFAULT_VIEWPORT, GRID, panBy, sanitizeViewport, screenToWorld, zoomAt, type Viewport } from '@/lib/board/geometry';

const VIEWPORT_KEY = 'routine-schemer-viewport';

const CanvasContext = createContext<{ zoom: number }>({ zoom: 1 });
export const useCanvasZoom = () => useContext(CanvasContext).zoom;

function loadViewport(): Viewport {
  try {
    const raw = localStorage.getItem(VIEWPORT_KEY);
    return raw ? sanitizeViewport(JSON.parse(raw)) : DEFAULT_VIEWPORT;
  } catch {
    return DEFAULT_VIEWPORT;
  }
}

export interface CanvasApi {
  /** Convierte coordenadas de pantalla (clientX/Y) a coordenadas del lienzo. */
  toWorld: (clientX: number, clientY: number) => { x: number; y: number };
}

interface CanvasProps {
  children: React.ReactNode;
  onBackgroundClick?: () => void;
  apiRef?: React.MutableRefObject<CanvasApi | null>;
}

export default function Canvas({ children, onBackgroundClick, apiRef }: CanvasProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState<Viewport>(DEFAULT_VIEWPORT);
  const vpRef = useRef(vp);
  vpRef.current = vp;
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const moved = useRef(false);

  useEffect(() => {
    setVp(loadViewport());
  }, []);

  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      toWorld: (clientX, clientY) => {
        const box = ref.current!.getBoundingClientRect();
        return screenToWorld(vpRef.current, clientX - box.left, clientY - box.top);
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(VIEWPORT_KEY, JSON.stringify(vp));
      } catch {
        /* sin almacenamiento: el viewport simplemente no se recuerda */
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [vp]);

  const local = useCallback((clientX: number, clientY: number) => {
    const box = ref.current!.getBoundingClientRect();
    return { x: clientX - box.left, y: clientY - box.top };
  }, []);

  // El listener de la rueda debe ser no pasivo para poder impedir el zoom del navegador.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        const p = local(e.clientX, e.clientY);
        setVp((v) => zoomAt(v, p.x, p.y, v.zoom * Math.exp(-e.deltaY * 0.01)));
      } else {
        setVp((v) => panBy(v, -e.deltaX, -e.deltaY));
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [local]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.canvasBg) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, local(e.clientX, e.clientY));
    moved.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const next = local(e.clientX, e.clientY);
    const others = [...pointers.current.entries()].filter(([id]) => id !== e.pointerId);
    if (others.length === 1) {
      // Pellizco: el zoom sigue la variación de distancia entre los dos dedos.
      const other = others[0][1];
      const before = Math.hypot(prev.x - other.x, prev.y - other.y);
      const after = Math.hypot(next.x - other.x, next.y - other.y);
      if (before > 0) {
        const cx = (next.x + other.x) / 2;
        const cy = (next.y + other.y) / 2;
        setVp((v) => zoomAt(v, cx, cy, v.zoom * (after / before)));
      }
    } else {
      setVp((v) => panBy(v, next.x - prev.x, next.y - prev.y));
    }
    if (Math.hypot(next.x - prev.x, next.y - prev.y) > 0) moved.current = true;
    pointers.current.set(e.pointerId, next);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.delete(e.pointerId)) return;
    if (!moved.current && pointers.current.size === 0) onBackgroundClick?.();
  };

  const zoomBy = (factor: number) => {
    const box = ref.current!.getBoundingClientRect();
    setVp((v) => zoomAt(v, box.width / 2, box.height / 2, v.zoom * factor));
  };

  return (
    <div
      ref={ref}
      data-canvas-bg
      className="relative h-full w-full overflow-hidden touch-none select-none bg-bg cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: 'radial-gradient(circle, var(--border-strong) 1px, transparent 1px)',
        backgroundSize: `${GRID * vp.zoom}px ${GRID * vp.zoom}px`,
        backgroundPosition: `${vp.x}px ${vp.y}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})` }}
      >
        <CanvasContext.Provider value={{ zoom: vp.zoom }}>{children}</CanvasContext.Provider>
      </div>

      <div
        className="absolute bottom-4 right-4 flex items-center gap-1 rounded-xl border border-border bg-surface/90 p-1 shadow-[var(--shadow)] backdrop-blur"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button aria-label="Alejar" className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg" onClick={() => zoomBy(1 / 1.2)}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="iv-tabular w-12 text-center font-mono text-xs text-muted">{Math.round(vp.zoom * 100)}%</span>
        <button aria-label="Acercar" className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg" onClick={() => zoomBy(1.2)}>
          <Plus className="h-4 w-4" />
        </button>
        <button aria-label="Restablecer vista" className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg" onClick={() => setVp(DEFAULT_VIEWPORT)}>
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
