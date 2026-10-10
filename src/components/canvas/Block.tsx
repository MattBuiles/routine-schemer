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
}

interface Gesture {
  pointerId: number;
  mode: 'move' | ResizeHandle;
  startX: number;
  startY: number;
  origin: Rect;
}

const HANDLES: { handle: ResizeHandle; className: string }[] = [
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
    const step = { ArrowLeft: [-GRID, 0], ArrowRight: [GRID, 0], ArrowUp: [0, -GRID], ArrowDown: [0, GRID] }[e.key];
    if (step) {
      e.preventDefault();
      onGestureStart();
      onRectChange(e.shiftKey ? resizeRect(rect, 'se', step[0], step[1]) : moveRect(rect, step[0], step[1]));
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
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, backgroundColor: color, borderColor: color }}
    >
      <div className="pointer-events-none h-full w-full overflow-hidden p-2 text-sm font-semibold">{content ?? label}</div>
      {selected &&
        HANDLES.map(({ handle, className }) => (
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
