import React from 'react';
import type { CycleBlock } from '@/lib/board/cycle';
import { getIcon } from './blockIcons';

/** Contenido de un bloque del ciclo; muestra más detalle cuanto más grande es. */
export default function BlockContent({ block }: { block: CycleBlock }) {
  const Icon = getIcon(block.icon);
  const wide = block.daySpan > 1;

  return (
    <div className="flex h-full flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <Icon className="h-4 w-4 shrink-0 opacity-90" />
        <span className="truncate">{block.label || 'Sin nombre'}</span>
      </div>
      {block.zones.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {block.zones.slice(0, wide ? 5 : 2).map((tag) => (
            <span key={tag} className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-medium leading-none">
              {tag}
            </span>
          ))}
          {block.zones.length > (wide ? 5 : 2) && <span className="text-[10px] opacity-80">+{block.zones.length - (wide ? 5 : 2)}</span>}
        </div>
      )}
      {block.exercises.length > 0 && (
        <span className="text-[10px] font-medium opacity-90">
          {block.exercises.length} {block.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
        </span>
      )}
    </div>
  );
}
