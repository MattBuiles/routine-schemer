'use client';

import React, { useRef, useState } from 'react';

import { GRID, moveRect, resizeRect, type Rect, type ResizeHandle } from '@/lib/board/geometry';
import { useCanvasZoom } from './Canvas';

interface BlockProps {
  rect: Rect;
  color: string;
  selected: boolean;
  label: string;
  /** Contenido del bloque; por defecto, su etiqueta. */
  content?: React.ReactNode;
  onSelect: () => void;
  onGestureStart: () => void;
  onRectChange: (rect: Rect) => void;
  onGestureEnd: () => void;
  onDelete?: () => void;
  /** Paso de las flechas al mover (horizontal y vertical); por defecto, la cuadrícula. */
  keyStep?: { x: number; y: number };
  /** Margen visual en px: el bloque se pinta más pequeño que su rectángulo lógico para que dos contiguos no se toquen. */
  inset?: number;
  /** El alto es fijo: solo se puede cambiar el ancho (asas laterales, y Mayús+flechas horizontales). */
  widthOnly?: boolean;
}

interface Gesture {
  pointerId: number;
  mode: 'move' | ResizeHandle;
  startX: number;
  startY: number;
  origin: Rect;
}

const HANDLES: { handle: ResizeHandle; className: string }[] = [
  { handle: 'w', className: 'left-0 top-2 bottom-2 w-2 cursor-ew-resize' },
  { handle: 'e', className: 'right-0 top-2 bottom-2 w-2 cursor-ew-resize' },
  { handle: 's', className: 'bottom-0 left-2 right-2 h-2 cursor-ns-resize' },
  { handle: 'se', className: 'bottom-0 right-0 h-4 w-4 cursor-nwse-resize' },
];

export default function Block({
  rect,
  color,
  selected,
  label,
  content,
  onSelect,
  onGestureStart,
  onRectChange,
  onGestureEnd,
  onDelete,
  keyStep = { x: GRID, y: GRID },
  inset = 0,
  widthOnly = false,
}: BlockProps) {
  const zoom = useCanvasZoom();
  const gesture = useRef<Gesture | null>(null);
  const [dragging, setDragging] = useState(false);

  const begin = (mode: Gesture['mode']) => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    gesture.current = { pointerId: e.pointerId, mode, startX: e.clientX, startY: e.clientY, origin: rect };
    setDragging(true);
    onSelect();
    onGestureStart();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.pointerId !== e.pointerId) return;
    const dx = (e.clientX - g.startX) / zoom;
    const dy = (e.clientY - g.startY) / zoom;
    onRectChange(g.mode === 'move' ? moveRect(g.origin, dx, dy) : resizeRect(g.origin, g.mode, dx, dy));
  };

  const end = (e: React.PointerEvent) => {
    if (gesture.current?.pointerId !== e.pointerId) return;
    gesture.current = null;
    setDragging(false);
    onGestureEnd();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (dir) {
      e.preventDefault();
      onGestureStart();
      // Con Mayús se redimensiona: el alto cambia de una en una cuadrícula y el ancho de un paso horizontal.
      onRectChange(
        e.shiftKey
          ? resizeRect(rect, 'se', dir[0] * keyStep.x, widthOnly ? 0 : dir[1] * GRID)
          : moveRect(rect, dir[0] * keyStep.x, dir[1] * keyStep.y),
      );
      onGestureEnd();
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && onDelete) {
      e.preventDefault();
      onDelete();
    }
  };

  return (
    <div
      role="group"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onFocus={onSelect}
      onPointerDown={begin('move')}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      className={`block-in absolute rounded-xl border-2 text-white outline-none transition-[box-shadow,transform] duration-150 motion-reduce:transition-none ${
        dragging ? 'z-20 scale-[1.03] cursor-grabbing shadow-2xl' : 'cursor-grab shadow-md hover:shadow-lg'
      } ${selected ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg' : ''}`}
      style={{ left: rect.x + inset, top: rect.y + inset, width: rect.w - inset * 2, height: rect.h - inset * 2, backgroundColor: color, borderColor: color }}
    >
      <div className="pointer-events-none h-full w-full overflow-hidden p-2 text-sm font-semibold">{content ?? label}</div>
      {selected &&
        HANDLES.filter(({ handle }) => !widthOnly || handle === 'w' || handle === 'e').map(({ handle, className }) => (
          <div
            key={handle}
            data-handle={handle}
            className={`absolute ${className}`}
            onPointerDown={begin(handle)}
            onPointerMove={onPointerMove}
            onPointerUp={end}
            onPointerCancel={end}
          >
            {handle === 'se' && <span className="absolute bottom-1 right-1 h-2 w-2 rounded-sm bg-white/90" />}
          </div>
        ))}
    </div>
  );
}
