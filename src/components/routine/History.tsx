'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp,
  Target,
  Clock,
  Dumbbell,
  Filter,
  Search,
  Download,
  BarChart3,
  Activity,
  CheckCircle,
  Trash2,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CalendarEvent } from '@/types';
import { deleteCalendarEvent, getCalendarEvents } from '@/app/actions/calendar';
import { calculateStreaks, getDateString } from '@/lib/utils';

const workoutTypeLabels = {
  strength: 'Fuerza',
  hypertrophy: 'Hipertrofia',
  endurance: 'Resistencia',
  power: 'Potencia',
  flexibility: 'Flexibilidad',
  cardio: 'Cardio',
  recovery: 'Recuperación',
  mobility: 'Movilidad',
  stretching: 'Estiramientos',
  conditioning: 'Acondicionamiento'
};

export function History() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        // Get events from the last 6 months
        
        const from = new Date();
        from.setMonth(from.getMonth() - 6);
        setEvents(await getCalendarEvents({ from: getDateString(from) }));
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [user]);

  const today = getDateString(new Date());
  const workouts = events.filter(e => e.type === 'workout');
  const completedEvents = workouts.filter(e => e.completed);
  // Tasa de éxito: completadas sobre las sesiones de entreno que ya tocaban (hasta hoy).
  const dueWorkouts = workouts.filter(e => e.date <= today);
  const sessionMinutes = (e: CalendarEvent) => e.actualDuration ?? e.duration ?? 0;
  const totalTime = completedEvents.reduce((sum, e) => sum + sessionMinutes(e), 0);
  const streaks = calculateStreaks(completedEvents.map(e => e.date), today);

  const statistics = {
    totalSessions: completedEvents.length,
    sessionsThisMonth: completedEvents.filter(e => e.date.slice(0, 7) === today.slice(0, 7)).length,
    totalTime,
    avgDuration: completedEvents.length > 0 ? Math.round(totalTime / completedEvents.length) : 0,
    currentStreak: streaks.current,
    bestStreak: streaks.best,
    completionRate: dueWorkouts.length > 0 ? Math.round((completedEvents.length / dueWorkouts.length) * 100) : null,
  };

  const handleDelete = async (event: CalendarEvent) => {
    if (!confirm(`¿Eliminar la sesión "${event.title}" del ${event.date}?`)) return;
    try {
      await deleteCalendarEvent(event.id);
      setEvents(prev => prev.filter(e => e.id !== event.id));
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(completedEvents, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSessions = completedEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedWorkoutType === 'all' || selectedWorkoutType === 'workout';
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
            Historial
          </h1>
          <p className="text-gray-400 text-lg">Analiza tu progreso y estadísticas de entrenamiento</p>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full mt-4"></div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">Total Sesiones</p>
                <p className="text-4xl font-bold text-white mb-1">{statistics.totalSessions}</p>
                <p className="text-xs text-emerald-400">+{statistics.sessionsThisMonth} este mes</p>
              </div>
              <div className="p-4 bg-blue-500/20 rounded-full">
                <Target className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">Tiempo Total</p>
                <p className="text-4xl font-bold text-white mb-1">{Math.round(statistics.totalTime / 60)}h</p>
                <p className="text-xs text-gray-400">{statistics.totalTime % 60}min</p>
              </div>
              <div className="p-4 bg-violet-500/20 rounded-full">
                <Clock className="h-8 w-8 text-violet-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">Racha Actual</p>
                <p className="text-4xl font-bold text-white mb-1">{statistics.currentStreak}</p>
                <p className="text-xs text-orange-400">días consecutivos</p>
              </div>
              <div className="p-4 bg-emerald-500/20 rounded-full">
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-2">Tasa de Éxito</p>
                <p className="text-4xl font-bold text-white mb-1">{statistics.completionRate === null ? '—' : `${statistics.completionRate}%`}</p>
                <p className="text-xs text-emerald-400">sesiones completadas</p>
              </div>
              <div className="p-4 bg-emerald-500/20 rounded-full">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Progress */}
          <Card className="glass border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Progreso Mensual</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-gray-400">Gráficos disponibles próximamente</p>
              </div>
            </div>
          </Card>

          {/* Workout Type Distribution */}
          <Card className="glass border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Estadísticas</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">Total de sesiones completadas</p>
              <p className="text-4xl font-bold text-white">{completedEvents.length}</p>
            </div>
          </Card>
        </div>

        {/* Sessions History */}
        <Card className="glass border-white/20 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 sm:mb-0">Sesiones Recientes</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar sesiones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 glass rounded-lg text-white placeholder-gray-400 border border-white/20 focus:border-white/40 focus:outline-none w-full sm:w-64"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedWorkoutType}
                  onChange={(e) => setSelectedWorkoutType(e.target.value)}
                  className="pl-10 pr-8 py-2 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none appearance-none bg-transparent"
                >
                  <option value="all" className="bg-gray-800">Todos los tipos</option>
                  {Object.entries(workoutTypeLabels).map(([key, label]) => (
                    <option key={key} value={key} className="bg-gray-800">{label}</option>
                  ))}
                </select>
              </div>

              {/* Export */}
              <Button variant="ghost" onClick={handleExport} disabled={completedEvents.length === 0} className="glass hover:bg-white/10 text-white border border-white/20">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {filteredSessions.map((event) => (
              <div key={event.id} className="glass border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Date */}
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs text-gray-400">
                        {new Date(`${event.date}T00:00:00`).toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
                      </p>
                      <p className="text-lg font-bold text-white">
                        {new Date(`${event.date}T00:00:00`).getDate()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(`${event.date}T00:00:00`).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                      </p>
                    </div>

                    {/* Session Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-semibold">{event.title}</h4>
                        <span 
                          className="px-2 py-1 text-xs rounded-full border border-blue-400/40"
                          style={{ 
                            backgroundColor: '#3b82f620',
                            color: '#3b82f6'
                          }}
                        >
                          {event.type}
                        </span>
                        {event.completed && (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        )}
                      </div>
                      
                      {event.notes && (
                        <p className="text-sm text-gray-400 line-clamp-1">{event.notes}</p>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="text-right min-w-[80px]">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{sessionMinutes(event)}min</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(event)} title="Eliminar sesión" className="glass hover:bg-white/10 text-red-400 border border-red-500/20">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredSessions.length === 0 && (
            <div className="text-center py-12">
              <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm || selectedWorkoutType !== 'all' ? 'No se encontraron sesiones' : 'No hay sesiones registradas'}
              </h3>
              <p className="text-gray-400">
                {searchTerm || selectedWorkoutType !== 'all'
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Las sesiones completadas aparecerán aquí'
                }
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default History;
