'use client';

import React, { useState } from 'react';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';
import { useSupabaseDashboardData } from '@/hooks/useSupabaseDashboardData';
import { Navigation, NavigationView } from '@/components/ui/navigation';
import { MyRoutines } from '@/components/routine/MyRoutines';
import CreateProgram from '@/components/routine/CreateProgram';
import ExerciseLibrary from '@/components/routine/ExerciseLibrary';
import WorkoutCalendar from '@/components/routine/WorkoutCalendar';
import { HabitsAndNotes } from '@/components/routine/HabitsAndNotes';
import { History } from '@/components/routine/History';
import { Profile } from '@/components/routine/Profile';
import { Settings } from '@/components/routine/Settings';
import { Nutrition } from '@/components/routine/Nutrition';
import { Reports } from '@/components/routine/Reports';
import { generateCurrentMonthEvents, sampleWorkoutSessions } from '@/lib/sampleData';
import { CalendarEvent } from '@/types';
import { toast } from 'react-hot-toast';
import { Plus, Calendar, Target, TrendingUp, Loader2, Activity, Heart, BookOpen, Zap, CheckCircle } from 'lucide-react';

export default function DashboardComplete() {
  const { user, signOut } = useSupabaseAuth();
  const [currentView, setCurrentView] = useState<NavigationView>('dashboard');
  const [calendarEvents, setCalendarEvents] = useState(generateCurrentMonthEvents());

  const handleViewChange = (view: NavigationView) => {
    setCurrentView(view);
  };

  const handleAddCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const handleUpdateCalendarEvent = (event: CalendarEvent) => {
    setCalendarEvents(prev => prev.map(e => e.id === event.id ? event : e));
  };

  const handleDeleteCalendarEvent = (eventId: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleProgramCreated = () => {
    setCurrentView('programs');
    toast.success('Programa creado exitosamente');
  };

  const DashboardHome = () => {
    const { stats, programs, upcomingEvents, habits, recentSessions, loading, error } = useSupabaseDashboardData();

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 w-20 h-20 animate-ping bg-blue-500/20 rounded-full" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-white">Cargando Dashboard</p>
              <p className="text-gray-400">Preparando tu experiencia fitness...</p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
          <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-2xl border border-red-500/30 rounded-3xl p-10 max-w-md text-center shadow-2xl shadow-red-500/10">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500/30 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
              <Activity className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Error al cargar datos</h3>
            <p className="text-gray-400 leading-relaxed">{error.message}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
        <div className="max-w-[1600px] mx-auto space-y-10">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600 p-1 shadow-2xl shadow-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-fuchsia-500/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-[1.8rem] p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                    <Activity className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-violet-100 bg-clip-text text-transparent leading-tight">
                      ¡Bienvenido de vuelta!
                    </h1>
                    <p className="text-lg text-gray-300 font-medium">Organiza y documenta tu entrenamiento �</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleViewChange('reports')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
                  >
                    Ver Análisis
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-white">Acciones Rápidas</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Plus, label: 'Nuevo Programa', view: 'create-program' as NavigationView, gradient: 'from-blue-500 to-cyan-500', emoji: '💪', shadow: 'shadow-blue-500/20' },
                { icon: Calendar, label: 'Planificación', view: 'planning' as NavigationView, gradient: 'from-violet-500 to-fuchsia-500', emoji: '📅', shadow: 'shadow-violet-500/20' },
                { icon: BookOpen, label: 'Nutrición', view: 'nutrition' as NavigationView, gradient: 'from-emerald-500 to-teal-500', emoji: '�', shadow: 'shadow-emerald-500/20' },
                { icon: TrendingUp, label: 'Análisis', view: 'reports' as NavigationView, gradient: 'from-orange-500 to-rose-500', emoji: '📊', shadow: 'shadow-orange-500/20' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleViewChange(action.view)}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-6 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] shadow-xl ${action.shadow} hover:shadow-2xl`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-500`} />
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${action.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                        <action.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-4xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{action.emoji}</span>
                    </div>
                    <p className="text-white font-bold text-lg text-left group-hover:translate-x-1 transition-transform duration-500">{action.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold text-white">Resumen General</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Activity, label: 'Total Entrenamientos', value: stats.totalWorkouts, gradient: 'from-blue-500 to-cyan-500', bgGradient: 'from-blue-500/20 to-cyan-500/20', ring: 'ring-blue-500/30' },
                { icon: TrendingUp, label: 'Esta Semana', value: stats.weeklyWorkouts, gradient: 'from-emerald-500 to-teal-500', bgGradient: 'from-emerald-500/20 to-teal-500/20', ring: 'ring-emerald-500/30' },
                { icon: Calendar, label: 'Este Mes', value: stats.monthlyWorkouts, gradient: 'from-violet-500 to-fuchsia-500', bgGradient: 'from-violet-500/20 to-fuchsia-500/20', ring: 'ring-violet-500/30' },
                { icon: Heart, label: 'Racha Actual', value: `${stats.currentStreak}d`, gradient: 'from-orange-500 to-rose-500', bgGradient: 'from-orange-500/20 to-rose-500/20', ring: 'ring-orange-500/30' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-white/20 p-7 transition-all duration-500 hover:scale-[1.03] ring-2 ${stat.ring} hover:ring-4 shadow-xl hover:shadow-2xl`}
                >
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${stat.bgGradient} opacity-30 blur-3xl group-hover:opacity-50 group-hover:scale-110 transition-all duration-700`} />
                  <div className={`absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr ${stat.bgGradient} opacity-20 blur-2xl group-hover:opacity-40 transition-all duration-700`} />
                  
                  <div className="relative z-10 space-y-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <stat.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-sm font-semibold uppercase tracking-wide">{stat.label}</p>
                      <p className="text-5xl font-black text-white group-hover:scale-105 transition-transform duration-500 inline-block">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Programs & Events Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Programs */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Target className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Mis Programas</h2>
                </div>
                <button
                  onClick={() => handleViewChange('programs')}
                  className="group flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-all duration-300 hover:gap-3"
                >
                  Ver todos
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              <div className="space-y-4">
                {programs.length === 0 ? (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-10 text-center shadow-xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-3xl" />
                    <div className="relative z-10 space-y-5">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                        <Plus className="w-10 h-10 text-blue-400" strokeWidth={2.5} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-300 text-lg font-semibold">No tienes programas creados aún</p>
                        <p className="text-gray-500 text-sm">Comienza tu viaje fitness creando tu primer programa</p>
                      </div>
                      <button
                        onClick={() => handleViewChange('create-program')}
                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                      >
                        Crear mi primer programa
                      </button>
                    </div>
                  </div>
                ) : (
                  programs.slice(0, 3).map((program) => (
                    <div
                      key={program.id}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-white/20 p-6 transition-all duration-500 hover:scale-[1.02] shadow-lg hover:shadow-xl cursor-pointer"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                      
                      <div className="relative z-10 space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-bold text-xl text-white group-hover:text-blue-300 transition-colors">{program.name}</h3>
                          <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{program.description}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 px-4 py-2 rounded-full border border-blue-500/30 font-semibold backdrop-blur-sm">
                            {program.sessionsPerWeek}x semana
                          </span>
                          <span className="text-xs bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 px-4 py-2 rounded-full border border-violet-500/30 font-semibold backdrop-blur-sm">
                            {program.duration} semanas
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <Calendar className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Próximos Eventos</h2>
                </div>
                <button
                  onClick={() => handleViewChange('planning')}
                  className="group flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-all duration-300 hover:gap-3"
                >
                  Ver calendario
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 hover:border-white/20 p-5 transition-all duration-500 hover:scale-[1.02] shadow-lg hover:shadow-xl cursor-pointer"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                      
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          <Calendar className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-bold text-lg text-white truncate group-hover:text-violet-300 transition-colors">{event.title}</p>
                          <p className="text-sm text-gray-400 font-medium">
                            {new Date(event.date).toLocaleDateString('es-ES', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long' 
                            })}
                          </p>
                        </div>
                        {event.completed && (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 border border-emerald-500/50 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                            <CheckCircle className="w-6 h-6 text-emerald-400" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-10 text-center shadow-xl">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 blur-3xl" />
                    <div className="relative z-10 space-y-5">
                      <div className="w-20 h-20 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-violet-500/20">
                        <Calendar className="w-10 h-10 text-violet-400" strokeWidth={2.5} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-300 text-lg font-semibold">No tienes eventos programados</p>
                        <p className="text-gray-500 text-sm">Organiza tu entrenamiento con el calendario</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nutrition & Exercise Summary */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Nutrition Summary */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Nutrición</h2>
                </div>
                <button
                  onClick={() => handleViewChange('nutrition')}
                  className="group flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-semibold transition-all duration-300 hover:gap-3"
                >
                  Ver detalles
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Nutrition Stats */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-3xl" />
                  
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-white">Plan Actual</h3>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30">
                        Activo
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-gray-400 text-xs mb-1">Calorías/día</p>
                        <p className="text-2xl font-bold text-white">3,200</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-gray-400 text-xs mb-1">Proteína/día</p>
                        <p className="text-2xl font-bold text-blue-400">180g</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-gray-400 text-xs mb-1">Carbohidratos</p>
                        <p className="text-2xl font-bold text-orange-400">400g</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-gray-400 text-xs mb-1">Grasas</p>
                        <p className="text-2xl font-bold text-violet-400">90g</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/30">
                      <span className="text-sm text-gray-300">Planes guardados</span>
                      <span className="text-2xl font-bold text-emerald-400">2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Training Focus Summary */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Target className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Enfoque de Entrenamiento</h2>
                </div>
                <button
                  onClick={() => handleViewChange('programs')}
                  className="group flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-semibold transition-all duration-300 hover:gap-3"
                >
                  Ver programas
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Training Focus Stats */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 blur-3xl" />
                  
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-xl font-bold text-white">Distribución Semanal</h3>
                    
                    <div className="space-y-3">
                      {programs.length > 0 ? (
                        (() => {
                          // Calcular distribución de tipos de entrenamiento
                          const typeCount: { [key: string]: number } = {};
                          programs.forEach(program => {
                            program.workoutSessions?.forEach(session => {
                              const type = session.type;
                              typeCount[type] = (typeCount[type] || 0) + 1;
                            });
                          });

                          const trainingTypes = [
                            { name: 'Fuerza', key: 'strength', color: 'from-blue-500 to-cyan-500', icon: '💪' },
                            { name: 'Hipertrofia', key: 'hypertrophy', color: 'from-emerald-500 to-teal-500', icon: '🏋️' },
                            { name: 'Resistencia', key: 'endurance', color: 'from-violet-500 to-fuchsia-500', icon: '🏃' },
                            { name: 'Cardio', key: 'cardio', color: 'from-orange-500 to-rose-500', icon: '❤️' }
                          ];

                          const totalSessions = programs.reduce((sum, p) => sum + p.sessionsPerWeek, 0);

                          return (
                            <>
                              {trainingTypes.map((type, i) => {
                                const count = typeCount[type.key] || 0;
                                if (count === 0 && i > 1) return null; // Solo mostrar los principales
                                return (
                                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                      <span className="text-2xl">{type.icon}</span>
                                      <div>
                                        <p className="text-gray-300 font-medium group-hover:text-white transition-colors">{type.name}</p>
                                        <div className={`h-1 w-16 bg-gradient-to-r ${type.color} rounded-full mt-1`}></div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-2xl font-bold text-white">{count}</span>
                                      <p className="text-xs text-gray-400">sesiones</p>
                                    </div>
                                  </div>
                                );
                              })}
                              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-rose-500/10 rounded-xl border border-orange-500/30">
                                <span className="text-sm text-gray-300">Total sesiones/semana</span>
                                <span className="text-2xl font-bold text-orange-400">{totalSessions}</span>
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        <>
                          {[
                            { name: 'Push (Empuje)', sessions: 2, color: 'from-blue-500 to-cyan-500', icon: '💪' },
                            { name: 'Pull (Jalón)', sessions: 2, color: 'from-emerald-500 to-teal-500', icon: '🏋️' },
                            { name: 'Legs (Piernas)', sessions: 1, color: 'from-violet-500 to-fuchsia-500', icon: '🦵' },
                            { name: 'Cardio', sessions: 1, color: 'from-orange-500 to-rose-500', icon: '🏃' }
                          ].map((focus, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{focus.icon}</span>
                                <div>
                                  <p className="text-gray-300 font-medium group-hover:text-white transition-colors">{focus.name}</p>
                                  <div className={`h-1 w-16 bg-gradient-to-r ${focus.color} rounded-full mt-1`}></div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-bold text-white">{focus.sessions}</span>
                                <p className="text-xs text-gray-400">x semana</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-rose-500/10 rounded-xl border border-orange-500/30">
                            <span className="text-sm text-gray-300">Total sesiones/semana</span>
                            <span className="text-2xl font-bold text-orange-400">6</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Records & Analysis */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Records Summary */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Registro de Actividad</h2>
                </div>
                <button
                  onClick={() => handleViewChange('records')}
                  className="group flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-all duration-300 hover:gap-3"
                >
                  Ver historial
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Recent Sessions */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-3xl" />
                  
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-xl font-bold text-white">Últimas Sesiones</h3>
                    
                    <div className="space-y-3">
                      {recentSessions && recentSessions.length > 0 ? (
                        recentSessions.slice(0, 3).map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg">
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-semibold group-hover:text-blue-300 transition-colors">{session.name}</p>
                                <p className="text-xs text-gray-400">
                                  {session.type} • {session.estimatedDuration} min
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-400 text-sm">No hay sesiones registradas aún</p>
                          <p className="text-gray-500 text-xs mt-1">Comienza a registrar tus entrenamientos</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-xl border border-blue-500/30">
                      <span className="text-sm text-gray-300">Sesiones registradas</span>
                      <span className="text-2xl font-bold text-blue-400">{stats.totalWorkouts}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">Análisis y Progreso</h2>
                </div>
                <button
                  onClick={() => handleViewChange('reports')}
                  className="group flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-semibold transition-all duration-300 hover:gap-3"
                >
                  Ver reportes
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Analysis Stats */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-6 shadow-xl">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 blur-3xl" />
                  
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-xl font-bold text-white">Resumen del Mes</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-gray-400 text-xs mb-1">Entrenamientos</p>
                        <p className="text-2xl font-bold text-white">{stats.monthlyWorkouts}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          <span className="text-xs text-emerald-400">Este mes</span>
                        </div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-gray-400 text-xs mb-1">Esta Semana</p>
                        <p className="text-2xl font-bold text-violet-400">{stats.weeklyWorkouts}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3 text-emerald-400" />
                          <span className="text-xs text-emerald-400">Activo</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-400 font-medium">Progreso</p>
                      {programs.length > 0 ? (
                        programs.slice(0, 2).map((program, i) => {
                          const progress = Math.min(100, Math.round((stats.weeklyWorkouts / program.sessionsPerWeek) * 100));
                          const colors = [
                            'from-red-500 to-orange-500',
                            'from-blue-500 to-violet-500',
                            'from-emerald-500 to-teal-500'
                          ];
                          return (
                            <div key={program.id}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-300 truncate max-w-[150px]">{program.name}</span>
                                <span className="text-white font-semibold">{progress}%</span>
                              </div>
                              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full transition-all duration-500`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-300">Fuerza</span>
                              <span className="text-white font-semibold">0%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: '0%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-300">Hipertrofia</span>
                              <span className="text-white font-semibold">0%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500" style={{ width: '0%' }}></div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-500/30">
                      <span className="text-sm text-gray-300">Racha Actual</span>
                      <span className="text-2xl font-bold text-violet-400">{stats.currentStreak}d</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardHome />;
      case 'programs':
        return <MyRoutines onCreateNew={() => setCurrentView('create-program')} />;
      case 'create-program':
        return <CreateProgram onProgramCreated={handleProgramCreated} onCancel={() => setCurrentView('programs')} />;
      case 'planning':
        return <WorkoutCalendar events={calendarEvents} onEventAdd={handleAddCalendarEvent} onEventUpdate={handleUpdateCalendarEvent} onEventDelete={handleDeleteCalendarEvent} availableSessions={sampleWorkoutSessions} />;
      case 'exercises':
        return <ExerciseLibrary />;
      case 'nutrition':
        return <Nutrition />;
      case 'records':
        return <History />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen gradient-background">
      <Navigation currentView={currentView} onViewChange={handleViewChange} userName={user?.email?.split('@')[0] || 'Usuario'} onSignOut={signOut} />
      <main className="relative z-10">{renderCurrentView()}</main>
    </div>
  );
}
