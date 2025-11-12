'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  WeeklySplit,
  SessionTemplate,
  DayOfWeek,
  DAY_LABELS,
  SESSION_TYPE_COLORS,
} from '@/types/program';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

interface WeeklySplitDesignerProps {
  split: WeeklySplit;
  availableSessions: SessionTemplate[];
  onUpdateSplit: (split: WeeklySplit) => void;
  onCreateSession?: () => void;
  readonly?: boolean;
}

const DAYS_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export function WeeklySplitDesigner({
  split,
  availableSessions,
  onUpdateSplit,
  onCreateSession,
  readonly = false,
}: WeeklySplitDesignerProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (readonly) return;
    if (!result.destination) return;

    const { source, destination } = result;

    // Dragging from session library to a day
    if (source.droppableId === 'session-library') {
      const sessionId = result.draggableId;
      const targetDay = destination.droppableId as DayOfWeek;

      const updatedDays = split.days.map((day) => {
        if (day.dayOfWeek === targetDay) {
          return {
            ...day,
            sessionTemplateId: sessionId,
            sessionTemplate: availableSessions.find((s) => s.id === sessionId),
            isRestDay: false,
          };
        }
        return day;
      });

      onUpdateSplit({
        ...split,
        days: updatedDays,
        totalSessionsPerWeek: updatedDays.filter((d) => !d.isRestDay).length,
      });
    }

    // Moving between days
    if (DAYS_ORDER.includes(source.droppableId as DayOfWeek)) {
      const sourceDay = source.droppableId as DayOfWeek;
      const targetDay = destination.droppableId as DayOfWeek;

      const sourceDayData = split.days.find((d) => d.dayOfWeek === sourceDay);
      if (!sourceDayData) return;

      const updatedDays = split.days.map((day) => {
        if (day.dayOfWeek === targetDay) {
          return {
            ...day,
            sessionTemplateId: sourceDayData.sessionTemplateId,
            sessionTemplate: sourceDayData.sessionTemplate,
            isRestDay: false,
          };
        }
        if (day.dayOfWeek === sourceDay) {
          return {
            ...day,
            sessionTemplateId: null,
            sessionTemplate: undefined,
            isRestDay: true,
          };
        }
        return day;
      });

      onUpdateSplit({
        ...split,
        days: updatedDays,
      });
    }
  };

  const handleToggleRestDay = (dayOfWeek: DayOfWeek) => {
    if (readonly) return;

    const updatedDays = split.days.map((day) => {
      if (day.dayOfWeek === dayOfWeek) {
        return {
          ...day,
          sessionTemplateId: null,
          sessionTemplate: undefined,
          isRestDay: !day.isRestDay,
        };
      }
      return day;
    });

    onUpdateSplit({
      ...split,
      days: updatedDays,
      totalSessionsPerWeek: updatedDays.filter((d) => !d.isRestDay).length,
    });
  };

  const handleClearDay = (dayOfWeek: DayOfWeek) => {
    if (readonly) return;
    handleToggleRestDay(dayOfWeek);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white">Semana Modelo</h3>
            <p className="text-gray-400 mt-1">
              {split.totalSessionsPerWeek} sesiones por semana · {split.type.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>

        {/* Weekly Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {DAYS_ORDER.map((dayOfWeek, index) => {
            const dayData = split.days.find((d) => d.dayOfWeek === dayOfWeek);
            if (!dayData) return null;

            const session = dayData.sessionTemplate;
            const isSelected = selectedDay === dayOfWeek;

            return (
              <Droppable key={dayOfWeek} droppableId={dayOfWeek}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`relative min-h-[200px] rounded-2xl border-2 transition-all ${
                      snapshot.isDraggingOver
                        ? 'border-blue-500 bg-blue-500/10 scale-105'
                        : isSelected
                        ? 'border-violet-500 bg-violet-500/5'
                        : 'border-white/10 bg-white/5'
                    } ${!readonly ? 'hover:border-white/30' : ''}`}
                    onClick={() => setSelectedDay(dayOfWeek)}
                  >
                    {/* Day header */}
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white text-lg">
                            {DAY_LABELS[dayOfWeek]}
                          </h4>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">
                            Día {index + 1}
                          </p>
                        </div>
                        {!readonly && session && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearDay(dayOfWeek);
                            }}
                            className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Session content or rest day */}
                    <div className="p-4">
                      {dayData.isRestDay || !session ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">😴</span>
                          </div>
                          <p className="text-gray-500 text-sm font-semibold">Descanso</p>
                          {!readonly && (
                            <p className="text-gray-600 text-xs mt-2">
                              Arrastra una sesión aquí
                            </p>
                          )}
                        </div>
                      ) : (
                        <Draggable draggableId={session.id} index={0} isDragDisabled={readonly}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`rounded-xl p-4 transition-all ${
                                snapshot.isDragging ? 'opacity-50' : ''
                              }`}
                              style={{
                                ...provided.draggableProps.style,
                                background: `linear-gradient(135deg, ${SESSION_TYPE_COLORS[session.type]}30, ${SESSION_TYPE_COLORS[session.type]}10)`,
                                border: `2px solid ${SESSION_TYPE_COLORS[session.type]}50`,
                              }}
                            >
                              {!readonly && (
                                <div
                                  {...provided.dragHandleProps}
                                  className="flex justify-center mb-2 cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="w-5 h-5 text-gray-500" />
                                </div>
                              )}

                              <h5 className="font-bold text-white text-sm mb-2">
                                {session.name}
                              </h5>

                              <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide"
                                    style={{
                                      backgroundColor: `${SESSION_TYPE_COLORS[session.type]}40`,
                                      color: SESSION_TYPE_COLORS[session.type],
                                    }}
                                  >
                                    {session.type}
                                  </span>
                                  <span className="text-gray-500">
                                    ~{session.estimatedDurationMinutes}min
                                  </span>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                  {session.focus.slice(0, 3).map((muscle) => (
                                    <span
                                      key={muscle}
                                      className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-gray-400"
                                    >
                                      {muscle}
                                    </span>
                                  ))}
                                  {session.focus.length > 3 && (
                                    <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-gray-400">
                                      +{session.focus.length - 3}
                                    </span>
                                  )}
                                </div>

                                <div className="text-gray-500">
                                  {session.exercises.length} ejercicios
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      )}
                    </div>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>

        {/* Session Library */}
        {!readonly && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Biblioteca de Sesiones</h4>
              {onCreateSession && (
                <button
                  onClick={onCreateSession}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 text-white rounded-xl font-semibold transition-all flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Sesión
                </button>
              )}
            </div>

            <Droppable droppableId="session-library" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-3 overflow-x-auto pb-4"
                >
                  {availableSessions.map((session, index) => (
                    <Draggable
                      key={session.id}
                      draggableId={session.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`min-w-[200px] rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all ${
                            snapshot.isDragging ? 'opacity-50 scale-105' : ''
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                            background: `linear-gradient(135deg, ${SESSION_TYPE_COLORS[session.type]}30, ${SESSION_TYPE_COLORS[session.type]}10)`,
                            border: `2px solid ${SESSION_TYPE_COLORS[session.type]}50`,
                          }}
                        >
                          <div className="flex items-center justify-center mb-2">
                            <GripVertical className="w-5 h-5 text-gray-500" />
                          </div>

                          <h5 className="font-bold text-white text-sm mb-2 text-center">
                            {session.name}
                          </h5>

                          <div className="space-y-1 text-xs text-center">
                            <div
                              className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide inline-block"
                              style={{
                                backgroundColor: `${SESSION_TYPE_COLORS[session.type]}40`,
                                color: SESSION_TYPE_COLORS[session.type],
                              }}
                            >
                              {session.type}
                            </div>
                            <div className="text-gray-500">
                              {session.exercises.length} ejercicios
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
