'use client';

import React, { useEffect, useRef } from 'react';
import { GripHorizontal, X } from 'lucide-react';

import { GRID, moveRect, resizeRect, type Rect, type ResizeHandle } from '@/lib/board/geometry';
import { MAX_WIDGET, MIN_WIDGET } from '@/lib/board/widgets';
import { useCanvasZoom } from './Canvas';

interface WidgetFrameProps {
  rect: Rect;
  title: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
  onGestureStart: () => void;
  onRectChange: (rect: Rect) => void;
  onGestureEnd: () => void;
  onClose: () => void;
  children: React.ReactNode;
}

interface Gesture {
  pointerId: number;
  mode: 'move' | ResizeHandle;
  startX: number;
  startY: number;
  origin: Rect;
}

const clampSize = (rect: Rect): Rect => ({
  ...rect,
  w: Math.min(MAX_WIDGET.w, Math.max(MIN_WIDGET.w, rect.w)),
  h: Math.min(MAX_WIDGET.h, Math.max(MIN_WIDGET.h, rect.h)),
});

const HANDLES: { handle: ResizeHandle; className: string }[] = [
  { handle: 'e', className: 'right-0 top-10 bottom-4 w-2 cursor-ew-resize' },
  { handle: 's', className: 'bottom-0 left-4 right-4 h-2 cursor-ns-resize' },
  { handle: 'se', className: 'bottom-0 right-0 h-4 w-4 cursor-nwse-resize' },
];

/** Marco de un widget del tablero: se arrastra por la cabecera, se redimensiona por los bordes y su contenido es interactivo. */
export default function WidgetFrame({ rect, title, icon, selected, onSelect, onGestureStart, onRectChange, onGestureEnd, onClose, children }: WidgetFrameProps) {
  const zoom = useCanvasZoom();
  const gesture = useRef<Gesture | null>(null);
  const body = useRef<HTMLDivElement>(null);

  // El lienzo usa la rueda para desplazarse; si el contenido tiene scroll propio, la rueda debe moverlo a él.
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey && el.scrollHeight > el.clientHeight) e.stopPropagation();
    };
    el.addEventListener('wheel', onWheel);
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const begin = (mode: Gesture['mode']) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { pointerId: e.pointerId, mode, startX: e.clientX, startY: e.clientY, origin: rect };
    onSelect();
    onGestureStart();
  };

  const move = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    const dx = (e.clientX - g.startX) / zoom;
    const dy = (e.clientY - g.startY) / zoom;
    onRectChange(g.mode === 'move' ? moveRect(g.origin, dx, dy) : clampSize(resizeRect(g.origin, g.mode, dx, dy, GRID, 0)));
  };

  const end = (e: React.PointerEvent) => {
    if (gesture.current?.pointerId !== e.pointerId) return;
    gesture.current = null;
    onGestureEnd();
  };

  return (
    <section
      aria-label={title}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`block-in absolute flex flex-col overflow-hidden rounded-2xl border bg-surface text-fg shadow-[var(--shadow)] ${selected ? 'border-accent ring-2 ring-accent ring-offset-2 ring-offset-bg' : 'border-border'}`}
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
    >
      <header
        className="flex h-10 shrink-0 cursor-grab touch-none items-center gap-2 border-b border-border bg-surface-2 px-3 active:cursor-grabbing"
        onPointerDown={begin('move')}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <span className="text-muted">{icon}</span>
        <h3 className="flex-1 truncate text-sm font-semibold">{title}</h3>
        <GripHorizontal className="h-4 w-4 text-muted" aria-hidden />
        <button
          aria-label={`Cerrar ${title}`}
          className="rounded p-1 text-muted hover:text-fg"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </header>
      <div ref={body} className="min-h-0 flex-1 overflow-y-auto p-3">
        {children}
      </div>
      {HANDLES.map(({ handle, className }) => (
        <div key={handle} data-handle={handle} className={`absolute ${className}`} onPointerDown={begin(handle)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} />
      ))}
    </section>
  );
}
