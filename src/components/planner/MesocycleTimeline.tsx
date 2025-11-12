'use client';

import React, { useState } from 'react';
import { MesocycleTimelineItem, PHASE_LABELS } from '@/types/program';
import { ChevronRight, Target, Calendar, TrendingUp, Plus } from 'lucide-react';

interface MesocycleTimelineProps {
  mesocycles: MesocycleTimelineItem[];
  totalWeeks: number;
  onMesocycleClick?: (mesocycleId: string) => void;
  onAddMesocycle?: () => void;
  currentWeek?: number;
}

export function MesocycleTimeline({
  mesocycles,
  totalWeeks,
  onMesocycleClick,
  onAddMesocycle,
  currentWeek
}: MesocycleTimelineProps) {
  const [hoveredMesocycle, setHoveredMesocycle] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calendar className="w-7 h-7 text-blue-400" />
            Timeline de Mesociclos
          </h3>
          <p className="text-gray-400 mt-1">
            {mesocycles.length} bloques · {totalWeeks} semanas totales
          </p>
        </div>
        {onAddMesocycle && (
          <button
            onClick={onAddMesocycle}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            Agregar Mesociclo
          </button>
        )}
      </div>

      {/* Timeline Grid */}
      <div className="relative">
        {/* Week markers */}
        <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-gray-500 mb-2">
          {Array.from({ length: Math.ceil(totalWeeks / 4) + 1 }).map((_, i) => (
            <div key={i} className="text-center">
              Sem {i * 4}
            </div>
          ))}
        </div>

        {/* Timeline bar */}
        <div className="mt-8 relative h-32 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: totalWeeks }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-white/5"
                style={{ minWidth: '1px' }}
              />
            ))}
          </div>

          {/* Mesocycle blocks */}
          <div className="absolute inset-0 flex">
            {mesocycles.map((meso) => {
              const widthPercent = (meso.durationWeeks / totalWeeks) * 100;
              const leftPercent = ((meso.startWeek - 1) / totalWeeks) * 100;
              const isHovered = hoveredMesocycle === meso.id;

              return (
                <div
                  key={meso.id}
                  className="absolute h-full cursor-pointer transition-all duration-300 group"
                  style={{
                    width: `${widthPercent}%`,
                    left: `${leftPercent}%`,
                  }}
                  onClick={() => onMesocycleClick?.(meso.id)}
                  onMouseEnter={() => setHoveredMesocycle(meso.id)}
                  onMouseLeave={() => setHoveredMesocycle(null)}
                >
                  {/* Block background */}
                  <div
                    className={`h-full rounded-xl m-1 transition-all duration-300 ${
                      isHovered ? 'scale-105 shadow-2xl' : 'shadow-lg'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${meso.color}dd, ${meso.color}88)`,
                      boxShadow: isHovered ? `0 20px 40px ${meso.color}40` : `0 8px 16px ${meso.color}30`,
                    }}
                  >
                    <div className="h-full flex flex-col justify-center px-4 py-2">
                      {/* Phase badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: meso.color }}
                        />
                        <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
                          {PHASE_LABELS[meso.phase]}
                        </span>
                      </div>

                      {/* Name */}
                      <h4 className="font-bold text-white text-sm mb-1 truncate">
                        {meso.name}
                      </h4>

                      {/* Duration */}
                      <p className="text-xs text-white/70">
                        {meso.durationWeeks} sem · Sem {meso.startWeek}-{meso.endWeek}
                      </p>

                      {/* Hover overlay with details */}
                      {isHovered && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl p-4 flex flex-col justify-center z-10 border-2 border-white/30">
                          <div className="space-y-2">
                            <h4 className="font-bold text-white text-lg">{meso.name}</h4>
                            <div className="flex items-center gap-2 text-sm">
                              <Target className="w-4 h-4 text-blue-400" />
                              <span className="text-gray-300">{meso.goal}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-violet-400" />
                              <span className="text-gray-300">
                                {meso.durationWeeks} semanas ({meso.startWeek} - {meso.endWeek})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="w-4 h-4 text-emerald-400" />
                              <span className="text-gray-300 capitalize">
                                Fase: {PHASE_LABELS[meso.phase]}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 text-xs text-blue-400 font-semibold flex items-center gap-1">
                            Click para detalles
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current week indicator (optional) */}
          {currentWeek && currentWeek <= totalWeeks && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-white/50 z-20"
              style={{
                left: `${((currentWeek - 0.5) / totalWeeks) * 100}%`,
              }}
            >
              <div className="absolute -top-2 -left-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mesocycle cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {mesocycles.map((meso) => (
          <div
            key={meso.id}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all cursor-pointer group"
            onClick={() => onMesocycleClick?.(meso.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${meso.color}, ${meso.color}cc)`,
                }}
              >
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: `${meso.color}30`,
                  color: meso.color,
                }}
              >
                {PHASE_LABELS[meso.phase]}
              </span>
            </div>

            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {meso.name}
            </h4>

            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
              {meso.goal}
            </p>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Semanas {meso.startWeek}-{meso.endWeek}</span>
              </div>
              <div className="text-blue-400 font-semibold">
                {meso.durationWeeks} sem
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
