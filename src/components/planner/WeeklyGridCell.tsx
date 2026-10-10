'use client';

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Play, 
  XCircle,
  Dumbbell,
  Flame,
  Activity
} from 'lucide-react';
import { ScheduledSession, SessionStatus } from '@/types/weekly-planner';
import { WorkoutType } from '@/types';

interface WeeklyGridCellProps {
  dayIndex: number;
  timeSlot?: string;
  sessions: ScheduledSession[];
  onSessionClick: (session: ScheduledSession) => void;
}

const statusConfig: Record<SessionStatus, { 
  color: string; 
  bgColor: string; 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}> = {
  scheduled: {
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-400/30',
    icon: Clock,
    label: 'Programado'
  },
  in_progress: {
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-400/30',
    icon: Play,
    label: 'En curso'
  },
  completed: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-400/30',
    icon: CheckCircle2,
    label: 'Completado'
  },
  skipped: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10 border-gray-400/30',
    icon: XCircle,
    label: 'Saltado'
  }
};

const workoutTypeIcons: Record<WorkoutType, React.ComponentType<{ className?: string }>> = {
  strength: Dumbbell,
  hypertrophy: Dumbbell,
  power: Flame,
  endurance: Activity,
  cardio: Activity,
  flexibility: Activity,
  mobility: Activity,
  stretching: Activity,
  recovery: Activity,
  conditioning: Activity
};

export function WeeklyGridCell({ dayIndex, timeSlot, sessions, onSessionClick }: WeeklyGridCellProps) {
  const droppableId = `day-${dayIndex}${timeSlot ? `-${timeSlot}` : ''}`;

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`
            min-h-[120px] p-3 rounded-xl border-2 border-dashed
            transition-all duration-300
            ${snapshot.isDraggingOver 
              ? 'border-blue-400/60 bg-blue-500/5 scale-[1.02]' 
              : 'border-white/10 bg-white/[0.02]'
            }
            ${sessions.length === 0 ? 'hover:border-white/20 hover:bg-white/[0.04]' : ''}
          `}
          whileHover={{ scale: sessions.length === 0 ? 1.01 : 1 }}
        >
          <AnimatePresence>
            {sessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center"
              >
                <p className="text-xs text-gray-500 text-center">
                  Arrastra aquí
                </p>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session, index) => {
                  const StatusIcon = statusConfig[session.status].icon;
                  const WorkoutIcon = workoutTypeIcons[session.workoutSession.type];
                  
                  return (
                    <Draggable
                      key={session.id}
                      draggableId={session.id}
                      index={index}
                    >
                      {(provided, snapshot) => {
                        // onDragStart nativo choca con el de framer-motion
                        const dragHandleProps = { ...provided.dragHandleProps } as Record<string, unknown>;
                        delete dragHandleProps.onDragStart;
                        return (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...dragHandleProps}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => onSessionClick(session)}
                          className={`
                            relative group cursor-pointer rounded-lg p-3 border
                            backdrop-blur-xl
                            ${statusConfig[session.status].bgColor}
                            ${snapshot.isDragging ? 'shadow-2xl scale-105 rotate-2' : 'hover:scale-[1.02]'}
                            transition-all duration-200
                          `}
                          whileHover={{ y: -2 }}
                        >
                          {/* Progress bar */}
                          {session.progress !== undefined && session.progress > 0 && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 rounded-t-lg overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-violet-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${session.progress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          )}

                          {/* Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <WorkoutIcon className={`h-4 w-4 ${statusConfig[session.status].color}`} />
                              <h4 className="text-sm font-semibold text-white line-clamp-1">
                                {session.workoutSession.name}
                              </h4>
                            </div>
                            <StatusIcon className={`h-3.5 w-3.5 ${statusConfig[session.status].color}`} />
                          </div>

                          {/* Details */}
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {session.startTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{session.startTime}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              <span>{session.workoutSession.estimatedDuration}min</span>
                            </div>
                          </div>

                          {/* Hover tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-white/20 rounded-lg text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            <p className="font-semibold mb-1">{session.workoutSession.name}</p>
                            <p className="text-gray-400">
                              {session.workoutSession.exercises.length} ejercicios • {session.workoutSession.estimatedDuration}min
                            </p>
                            {session.notes && (
                              <p className="text-gray-500 mt-1 italic">{session.notes}</p>
                            )}
                          </div>
                        </motion.div>
                        );
                      }}
                    </Draggable>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
          {provided.placeholder}
        </motion.div>
      )}
    </Droppable>
  );
}
