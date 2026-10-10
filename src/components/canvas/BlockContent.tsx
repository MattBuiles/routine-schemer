import React from 'react';
import { blockHeight, MAX_LOAD, type CycleBlock } from '@/lib/board/cycle';
import { getIcon } from './blockIcons';

/** Contenido de un bloque del ciclo; muestra más detalle cuanto más grande es. */
export default function BlockContent({ block }: { block: CycleBlock }) {
  const Icon = getIcon(block.icon);
  const roomy = blockHeight(block.load) >= 100;
  const wide = block.daySpan > 1;

  return (
    <div className="flex h-full flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <Icon className="h-4 w-4 shrink-0 opacity-90" />
        <span className="truncate">{block.label || 'Sin nombre'}</span>
      </div>
      {roomy && block.zones.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {block.zones.slice(0, wide ? 5 : 2).map((tag) => (
            <span key={tag} className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-medium leading-none">
              {tag}
            </span>
          ))}
          {block.zones.length > (wide ? 5 : 2) && <span className="text-[10px] opacity-80">+{block.zones.length - (wide ? 5 : 2)}</span>}
        </div>
      )}
      <div className="mt-auto flex items-center text-[10px] font-medium opacity-90">
        <span className="flex gap-0.5" aria-hidden>
          {Array.from({ length: MAX_LOAD }, (_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full bg-white ${i < block.load ? '' : 'opacity-30'}`} />
          ))}
        </span>
      </div>
    </div>
  );
}
