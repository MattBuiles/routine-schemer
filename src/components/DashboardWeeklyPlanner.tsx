'use client';

import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import {
  Menu,
  Plus,
  Calendar,
  Copy,
  Save,
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
import { useSupabaseDashboardData } from '@/hooks/useSupabaseDashboardData';
import { ScheduledSession, WorkoutLibraryItem, DayOfWeek } from '@/types/weekly-planner';
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

export function DashboardWeeklyPlanner() {
  const { programs, stats, loading } = useSupabaseDashboardData();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSession, setSelectedSession] = useState<ScheduledSession | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  
  // Mock scheduled sessions - replace with real data from Supabase
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledSession[]>([
    // Add your scheduled sessions here
  ]);

  // Transform programs into library items
  const workoutLibrary: WorkoutLibraryItem[] = programs.flatMap(program => 
    program.workoutSessions.map(session => ({
      id: session.id,
      session,
      isFavorite: false,
      useCount: 0
    }))
  );

  // Group sessions by day
  const sessionsByDay: Record<number, ScheduledSession[]> = {};
  DAYS_OF_WEEK.forEach(day => {
    sessionsByDay[day.index] = scheduledSessions.filter(s => s.dayOfWeek === day.index);
  });

  const handleDragEnd = useCallback((result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // Handle drag from library to calendar
    if (source.droppableId.startsWith('workout-') && destination.droppableId.startsWith('day-')) {
      const dayIndex = parseInt(destination.droppableId.split('-')[1]) as DayOfWeek;
      const workoutId = draggableId.replace('workout-', '');
      const workout = workoutLibrary.find(w => w.id === workoutId);

      if (workout) {
        const newSession: ScheduledSession = {
          id: `session-${Date.now()}`,
          workoutSession: workout.session,
          dayOfWeek: dayIndex,
          status: 'scheduled',
          progress: 0
        };

        setScheduledSessions(prev => [...prev, newSession]);
        setSelectedSession(newSession);
        setIsModalOpen(true);
      }
    }

    // Handle reordering within the same day
    if (source.droppableId === destination.droppableId && source.droppableId.startsWith('day-')) {
      const dayIndex = parseInt(source.droppableId.split('-')[1]);
      const daySessions = [...sessionsByDay[dayIndex]];
      const [removed] = daySessions.splice(source.index, 1);
      daySessions.splice(destination.index, 0, removed);

      setScheduledSessions(prev => {
        const newSessions = prev.filter(s => s.dayOfWeek !== dayIndex);
        return [...newSessions, ...daySessions];
      });
    }

    // Handle moving between days
    if (source.droppableId !== destination.droppableId && 
        source.droppableId.startsWith('day-') && 
        destination.droppableId.startsWith('day-')) {
      const sourceDayIndex = parseInt(source.droppableId.split('-')[1]);
      const destDayIndex = parseInt(destination.droppableId.split('-')[1]) as DayOfWeek;
      
      setScheduledSessions(prev => prev.map(session => 
        session.id === draggableId.replace('session-', '')
          ? { ...session, dayOfWeek: destDayIndex }
          : session
      ));
    }
  }, [workoutLibrary, sessionsByDay]);

  const handleSessionClick = (session: ScheduledSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleSaveSession = (updatedSession: ScheduledSession) => {
    setScheduledSessions(prev =>
      prev.map(s => s.id === updatedSession.id ? updatedSession : s)
    );
    // TODO: Save to Supabase
  };

  const handleDeleteSession = (sessionId: string) => {
    setScheduledSessions(prev => prev.filter(s => s.id !== sessionId));
    // TODO: Delete from Supabase
  };

  const handleSaveWeeklyPlan = () => {
    // TODO: Save entire week to Supabase
    console.log('Saving weekly plan...', scheduledSessions);
  };

  const handleDuplicateWeek = () => {
    // TODO: Duplicate current week's sessions
    console.log('Duplicating week...');
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  // Calculate stats for widgets
  const weeklyCompletion = scheduledSessions.length > 0
    ? (scheduledSessions.filter(s => s.status === 'completed').length / scheduledSessions.length) * 100
    : 0;

  const workoutDistribution = programs.reduce((acc: { type: string; count: number; color: string }[], program) => {
    program.workoutSessions.forEach(session => {
      const existing = acc.find(item => item.type === session.type);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ 
          type: session.type, 
          count: 1,
          color: '#3b82f6' // Add proper color mapping
        });
      }
    });
    return acc;
  }, []);

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

                  <Button
                    onClick={handleSaveWeeklyPlan}
                    className="bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Plan
                  </Button>
                </div>
              </div>

              {/* Stats Widgets */}
              <WeeklyStatsWidgets
                currentStreak={stats.currentStreak}
                weeklyCompletion={weeklyCompletion}
                totalVolume={5000} // Calculate from sessions
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
                      ${day.index === new Date().getDay()
                        ? 'bg-gradient-to-br from-blue-500 to-violet-500 text-white font-bold'
                        : 'bg-white/5 text-gray-400'
                      }
                    `}>
                      {new Date(currentWeekStart.getTime() + day.index * 24 * 60 * 60 * 1000).getDate()}
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
