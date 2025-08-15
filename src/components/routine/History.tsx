'use client';

import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';

// Interface para datos de sesión completada
interface CompletedSession {
  id: string;
  date: string;
  sessionId: string;
  session: {
    id: string;
    name: string;
    type: 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'flexibility' | 'cardio' | 'recovery' | 'mobility' | 'stretching' | 'conditioning';
    exercises: never[];
    estimatedDuration: number;
    createdAt: Date;
    updatedAt: Date;
  };
  completed: boolean;
  actualDuration: number;
  notes?: string;
}

// Datos de ejemplo para historial
const sampleHistoryData = {
  completedSessions: [
    {
      id: '1',
      date: '2024-01-20',
      session: {
        id: 's1',
        name: 'Push Day - Hipertrofia',
        type: 'hypertrophy' as const,
        exercises: [],
        estimatedDuration: 75,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      completed: true,
      actualDuration: 80,
      notes: 'Excelente sesión, incrementé peso en press banca'
    },
    {
      id: '2',
      date: '2024-01-19',
      session: {
        id: 's2',
        name: 'Cardio HIIT',
        type: 'cardio' as const,
        exercises: [],
        estimatedDuration: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      completed: true,
      actualDuration: 35,
      notes: 'Muy intenso, buena quema'
    },
    {
      id: '3',
      date: '2024-01-18',
      session: {
        id: 's3',
        name: 'Pull Day - Fuerza',
        type: 'strength' as const,
        exercises: [],
        estimatedDuration: 90,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      completed: true,
      actualDuration: 85,
      notes: 'Nuevo PR en peso muerto: 180kg'
    },
    {
      id: '4',
      date: '2024-01-17',
      session: {
        id: 's4',
        name: 'Movilidad y Recuperación',
        type: 'mobility' as const,
        exercises: [],
        estimatedDuration: 45,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      completed: true,
      actualDuration: 40,
      notes: 'Sesión relajante, mejoró flexibilidad'
    },
    {
      id: '5',
      date: '2024-01-16',
      session: {
        id: 's5',
        name: 'Leg Day - Hipertrofia',
        type: 'hypertrophy' as const,
        exercises: [],
        estimatedDuration: 85,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      completed: true,
      actualDuration: 90,
      notes: 'Sesión muy demandante, sentadillas pesadas'
    }
  ] as CompletedSession[],
  
  statistics: {
    totalSessions: 156,
    totalTime: 11700, // minutos
    avgDuration: 75,
    currentStreak: 5,
    bestStreak: 21,
    favoriteWorkoutType: 'hypertrophy' as const,
    completionRate: 94
  },

  monthlyProgress: [
    { month: 'Dic 2023', sessions: 20, avgDuration: 72 },
    { month: 'Ene 2024', sessions: 24, avgDuration: 75 },
    { month: 'Feb 2024', sessions: 22, avgDuration: 73 },
    { month: 'Mar 2024', sessions: 26, avgDuration: 78 }
  ],

  workoutTypeDistribution: [
    { type: 'hypertrophy', count: 65, percentage: 42 },
    { type: 'strength', count: 31, percentage: 20 },
    { type: 'cardio', count: 25, percentage: 16 },
    { type: 'mobility', count: 20, percentage: 13 },
    { type: 'conditioning', count: 15, percentage: 9 }
  ]
};

const workoutTypeColors = {
  strength: '#ef4444',
  hypertrophy: '#3b82f6',
  endurance: '#10b981',
  power: '#f59e0b',
  flexibility: '#8b5cf6',
  cardio: '#f97316',
  recovery: '#6b7280',
  mobility: '#6366f1',
  stretching: '#ec4899',
  conditioning: '#14b8a6'
};

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('all');

  const { completedSessions, statistics, monthlyProgress, workoutTypeDistribution } = sampleHistoryData;

  const filteredSessions = completedSessions.filter(session => {
    const matchesSearch = session.session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedWorkoutType === 'all' || session.session.type === selectedWorkoutType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="relative z-10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-luxury mb-2">Historial</h1>
          <p className="text-gray-400">Analiza tu progreso y estadísticas de entrenamiento</p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="glass border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Sesiones</p>
                <p className="text-3xl font-bold text-white">{statistics.totalSessions}</p>
                <p className="text-xs text-green-400">+8 este mes</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </Card>

          <Card className="glass border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tiempo Total</p>
                <p className="text-3xl font-bold text-white">{Math.round(statistics.totalTime / 60)}h</p>
                <p className="text-xs text-gray-400">{statistics.totalTime % 60}min</p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </Card>

          <Card className="glass border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Racha Actual</p>
                <p className="text-3xl font-bold text-white">{statistics.currentStreak}</p>
                <p className="text-xs text-orange-400">días consecutivos</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </Card>

          <Card className="glass border-white/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Tasa de Éxito</p>
                <p className="text-3xl font-bold text-white">{statistics.completionRate}%</p>
                <p className="text-xs text-green-400">sesiones completadas</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </Card>
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
              {monthlyProgress.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 w-20">{month.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(month.sessions / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-white font-semibold w-16 text-right">
                    {month.sessions} sesiones
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Workout Type Distribution */}
          <Card className="glass border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Distribución por Tipo</h3>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {workoutTypeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: workoutTypeColors[item.type as keyof typeof workoutTypeColors] }}
                    />
                    <span className="text-sm text-gray-400">
                      {workoutTypeLabels[item.type as keyof typeof workoutTypeLabels]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-white">{item.count}</span>
                    <span className="text-xs text-gray-400">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
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
              <Button variant="ghost" className="glass hover:bg-white/10 text-white border border-white/20">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div key={session.id} className="glass border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Date */}
                    <div className="text-center min-w-[60px]">
                      <p className="text-xs text-gray-400">
                        {new Date(session.date).toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
                      </p>
                      <p className="text-lg font-bold text-white">
                        {new Date(session.date).getDate()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(session.date).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                      </p>
                    </div>

                    {/* Session Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-semibold">{session.session.name}</h4>
                        <span 
                          className="px-2 py-1 text-xs rounded-full border"
                          style={{ 
                            backgroundColor: `${workoutTypeColors[session.session.type as keyof typeof workoutTypeColors]}20`,
                            color: workoutTypeColors[session.session.type as keyof typeof workoutTypeColors],
                            borderColor: `${workoutTypeColors[session.session.type as keyof typeof workoutTypeColors]}40`
                          }}
                        >
                          {workoutTypeLabels[session.session.type as keyof typeof workoutTypeLabels]}
                        </span>
                        {session.completed && (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        )}
                      </div>
                      
                      {session.notes && (
                        <p className="text-sm text-gray-400 line-clamp-1">{session.notes}</p>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="text-right min-w-[80px]">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{session.actualDuration}min</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" className="glass hover:bg-white/10 text-white border border-white/20">
                      <Eye className="h-4 w-4" />
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
