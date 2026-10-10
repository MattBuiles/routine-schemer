'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import {
  Menu,
  Plus,
  Calendar,
  Copy,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  Sparkles
} from 'lucide-react';
import { WeeklyGridCell } from './planner/WeeklyGridCell';
import { WorkoutLibrarySidebar } from './planner/WorkoutLibrarySidebar';
import { SessionConfigModal } from './planner/SessionConfigModal';
import { WeeklyStatsWidgets } from './planner/WeeklyStatsWidgets';
import { useDashboardData } from '@/hooks/useDashboardData';
import { ScheduledSession, WorkoutLibraryItem } from '@/types/weekly-planner';
import type { CalendarEvent } from '@/types';
import toast from 'react-hot-toast';
import { createCalendarEvent, deleteCalendarEvent, getCalendarEvents, updateCalendarEvent } from '@/app/actions/calendar';
import { eventToScheduledSession, templateToWorkoutSession } from '@/lib/plannerMapping';
import { calculateStreaks, getDateString } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const DAYS_OF_WEEK = [
  { name: 'Domingo', short: 'Dom', index: 0 },
  { name: 'Lunes', short: 'Lun', index: 1 },
  { name: 'Martes', short: 'Mar', index: 2 },
  { name: 'Miércoles', short: 'Mié', index: 3 },
  { name: 'Jueves', short: 'Jue', index: 4 },
  { name: 'Viernes', short: 'Vie', index: 5 },
  { name: 'Sábado', short: 'Sáb', index: 6 }
];

const TYPE_COLORS: Record<string, string> = {
  strength: '#ef4444',
  hypertrophy: '#3b82f6',
  power: '#f97316',
  endurance: '#22c55e',
  cardio: '#ec4899',
  conditioning: '#eab308',
  recovery: '#14b8a6',
};

/** Domingo de la semana que contiene `date` (los índices de día del planificador van de 0=domingo a 6=sábado). */
const startOfWeek = (date: Date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - start.getDay());
  return start;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export function DashboardWeeklyPlanner() {
  const { programs, loading } = useDashboardData();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSession, setSelectedSession] = useState<ScheduledSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date()));
  const [weekEvents, setWeekEvents] = useState<CalendarEvent[]>([]);
  const [recentEvents, setRecentEvents] = useState<CalendarEvent[]>([]);

  // La biblioteca sale de las plantillas del programa activo (o del más reciente si no hay ninguno activo).
  const currentProgram = programs.find(p => p.isActive) || programs[0];
  const templates = currentProgram?.sessionTemplates;
  const templatesById = useMemo(() => new Map((templates ?? []).map(t => [t.id, t])), [templates]);
  const workoutLibrary: WorkoutLibraryItem[] = useMemo(
    () => (templates ?? []).map(t => ({ id: t.id, session: templateToWorkoutSession(t), isFavorite: false, useCount: 0 })),
    [templates]
  );

  const weekStartString = getDateString(currentWeekStart);
  const weekEndString = getDateString(addDays(currentWeekStart, 6));

  const loadEvents = useCallback(async () => {
    try {
      // Semana visible + los últimos 60 días para calcular la racha.
      const streakFrom = getDateString(addDays(new Date(), -60));
      const events = await getCalendarEvents({ from: streakFrom < weekStartString ? streakFrom : weekStartString, to: weekEndString });
      setWeekEvents(events.filter(e => e.type === 'workout' && e.date >= weekStartString && e.date <= weekEndString));
      setRecentEvents(events.filter(e => e.type === 'workout' && e.completed));
    } catch (err) {
      console.error('Error loading planner events:', err);
      toast.error('No se pudo cargar la semana');
    }
  }, [weekStartString, weekEndString]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const scheduledSessions = useMemo(
    () => weekEvents.map(event => eventToScheduledSession(event, templatesById)),
    [weekEvents, templatesById]
  );

  const sessionsByDay: Record<number, ScheduledSession[]> = {};
  DAYS_OF_WEEK.forEach(day => {
    sessionsByDay[day.index] = scheduledSessions
      .filter(s => s.dayOfWeek === day.index)
      .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
  });

  const dateForDay = (dayIndex: number) => getDateString(addDays(currentWeekStart, dayIndex));

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    try {
      // Biblioteca -> día: crea la sesión planificada
      if (source.droppableId.startsWith('workout-') && destination.droppableId.startsWith('day-')) {
        const dayIndex = parseInt(destination.droppableId.split('-')[1]);
        const workout = workoutLibrary.find(w => w.id === draggableId.replace('workout-', ''));
        if (!workout) return;

        const created = await createCalendarEvent({
          date: dateForDay(dayIndex),
          title: workout.session.name,
          type: 'workout',
          category: 'workout',
          completed: false,
          sessionId: workout.session.id,
          duration: workout.session.estimatedDuration,
        });
        setWeekEvents(prev => [...prev, created]);
        setSelectedSession(eventToScheduledSession(created, templatesById));
        setIsModalOpen(true);
        return;
      }

      // Día -> otro día: cambia la fecha del evento
      if (
        source.droppableId !== destination.droppableId &&
        source.droppableId.startsWith('day-') &&
        destination.droppableId.startsWith('day-')
      ) {
        const eventId = draggableId.replace('session-', '');
        const date = dateForDay(parseInt(destination.droppableId.split('-')[1]));
        await updateCalendarEvent(eventId, { date });
        setWeekEvents(prev => prev.map(e => (e.id === eventId ? { ...e, date } : e)));
      }
      // El orden dentro de un mismo día lo da la hora de inicio, no el arrastre.
    } catch (err) {
      console.error('Error updating planner:', err);
      toast.error('No se pudo guardar el cambio');
      loadEvents();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutLibrary, templatesById, currentWeekStart, loadEvents]);

  const handleSessionClick = (session: ScheduledSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleSaveSession = async (updated: ScheduledSession) => {
    const changes = { time: updated.startTime, notes: updated.notes || undefined, completed: updated.status === 'completed' };
    try {
      await updateCalendarEvent(updated.id, changes);
      setWeekEvents(prev => prev.map(e => (e.id === updated.id ? { ...e, ...changes } : e)));
      loadEvents();
    } catch (err) {
      console.error('Error saving session:', err);
      toast.error('No se pudo guardar la sesión');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteCalendarEvent(sessionId);
      setWeekEvents(prev => prev.filter(e => e.id !== sessionId));
      loadEvents();
    } catch (err) {
      console.error('Error deleting session:', err);
      toast.error('No se pudo eliminar la sesión');
    }
  };

  const handleDuplicateWeek = async () => {
    if (weekEvents.length === 0) {
      toast.error('Esta semana no tiene sesiones que duplicar');
      return;
    }
    try {
      await Promise.all(
        weekEvents.map(e =>
          createCalendarEvent({
            date: getDateString(addDays(new Date(`${e.date}T00:00:00`), 7)),
            time: e.time,
            title: e.title,
            type: 'workout',
            category: 'workout',
            completed: false,
            sessionId: e.sessionId,
            duration: e.duration,
          })
        )
      );
      setCurrentWeekStart(prev => addDays(prev, 7));
      toast.success('Semana duplicada en la siguiente');
    } catch (err) {
      console.error('Error duplicating week:', err);
      toast.error('No se pudo duplicar la semana');
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  // Estadísticas de la semana visible
  const weeklyCompletion = scheduledSessions.length > 0
    ? (scheduledSessions.filter(s => s.status === 'completed').length / scheduledSessions.length) * 100
    : 0;
  const currentStreak = calculateStreaks(recentEvents.map(e => e.date)).current;
  const totalSets = scheduledSessions.reduce(
    (sum, s) => sum + s.workoutSession.exercises.reduce((acc, e) => acc + e.sets, 0),
    0
  );
  const workoutDistribution = Object.entries(
    scheduledSessions.reduce<Record<string, number>>((acc, s) => {
      acc[s.workoutSession.type] = (acc[s.workoutSession.type] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([type, count]) => ({ type, count, color: TYPE_COLORS[type] ?? '#3b82f6' }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-400/30 border-t-blue-400 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-400">Cargando planificador...</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Sidebar */}
        <WorkoutLibrarySidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          workouts={workoutLibrary}
        />

        {/* Main Content */}
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-80' : 'ml-0'}`}>
          {/* Top Bar */}
          <div className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Menu className="h-5 w-5 text-gray-400" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-blue-400" />
                      Planificador Semanal
                    </h1>
                    <p className="text-sm text-gray-400">
                      Organiza tu semana de entrenamiento con drag & drop
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Toggle */}
                  <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'list'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  <Button
                    onClick={handleDuplicateWeek}
                    variant="ghost"
                    className="border border-white/10"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar Semana
                  </Button>
                </div>
              </div>

              {/* Stats Widgets */}
              <WeeklyStatsWidgets
                currentStreak={currentStreak}
                weeklyCompletion={weeklyCompletion}
                totalSets={totalSets}
                workoutDistribution={workoutDistribution}
              />
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Week Navigator */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              </button>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold text-white">
                  {currentWeekStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h2>
                <p className="text-sm text-gray-400">
                  Semana del {currentWeekStart.toLocaleDateString('es-ES')}
                </p>
              </div>

              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {/* Weekly Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.index} className="space-y-3">
                  {/* Day Header */}
                  <div className="text-center">
                    <h3 className="text-sm font-semibold text-white mb-1">
                      {day.short}
                    </h3>
                    <div className={`
                      w-10 h-10 mx-auto rounded-full flex items-center justify-center
                      ${dateForDay(day.index) === getDateString(new Date())
                        ? 'bg-gradient-to-br from-blue-500 to-violet-500 text-white font-bold'
                        : 'bg-white/5 text-gray-400'
                      }
                    `}>
                      {addDays(currentWeekStart, day.index).getDate()}
                    </div>
                  </div>

                  {/* Day Cell */}
                  <WeeklyGridCell
                    dayIndex={day.index}
                    sessions={sessionsByDay[day.index] || []}
                    onSessionClick={handleSessionClick}
                  />
                </div>
              ))}
            </div>

            {/* Empty State */}
            {scheduledSessions.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 text-center"
              >
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Tu semana está vacía
                </h3>
                <p className="text-gray-400 mb-6">
                  Arrastra sesiones desde la biblioteca para comenzar a planificar
                </p>
                <Button
                  onClick={() => setIsSidebarOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-violet-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Abrir Biblioteca
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Session Config Modal */}
        <SessionConfigModal
          key={selectedSession?.id ?? 'none'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          session={selectedSession}
          onSave={handleSaveSession}
          onDelete={handleDeleteSession}
        />
      </div>
    </DragDropContext>
  );
}
