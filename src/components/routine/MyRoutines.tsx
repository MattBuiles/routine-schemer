'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus,
  Search,
  Filter,
  Edit3,
  Copy,
  Trash2,
  Calendar,
  Target,
  Clock,
  TrendingUp,
  Dumbbell,
  Play
} from 'lucide-react';
import { TrainingProgram } from '@/types';

interface MyRoutinesProps {
  onCreateNew: () => void;
}

// Datos de ejemplo para rutinas
const sampleRoutines: (TrainingProgram & { stats: { sessions: number; avgDuration: number; lastUsed: string; }})[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Hipertrofia Avanzada',
    description: 'Programa de 12 semanas enfocado en ganancia muscular con periodización ondulante',
    mesocycles: [],
    split: 'push_pull_legs',
    goal: 'muscle_gain',
    duration: 12,
    sessionsPerWeek: 6,
    estimatedDuration: 75,
    difficulty: 'advanced',
    isPublic: false,
    isActive: true,
    tags: ['muscle_gain', 'push_pull_legs', 'advanced'],
    workoutSessions: [],
    microcycles: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    stats: {
      sessions: 36,
      avgDuration: 75,
      lastUsed: '2024-01-20'
    }
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Acondicionamiento Funcional',
    description: 'Rutina de alta intensidad para mejorar resistencia cardiovascular y fuerza funcional',
    mesocycles: [],
    split: 'full_body',
    goal: 'endurance',
    duration: 8,
    sessionsPerWeek: 4,
    estimatedDuration: 45,
    difficulty: 'intermediate',
    isPublic: true,
    isActive: false,
    tags: ['endurance', 'full_body', 'intermediate'],
    workoutSessions: [],
    microcycles: [],
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2023-12-05'),
    stats: {
      sessions: 24,
      avgDuration: 45,
      lastUsed: '2023-12-05'
    }
  },
  {
    id: '3',
    userId: 'user1',
    name: 'Fuerza Básica 5x5',
    description: 'Programa de iniciación enfocado en desarrollar fuerza base con ejercicios compuestos',
    mesocycles: [],
    split: 'full_body',
    goal: 'strength',
    duration: 16,
    sessionsPerWeek: 3,
    estimatedDuration: 60,
    difficulty: 'beginner',
    isPublic: false,
    isActive: true,
    tags: ['strength', 'full_body', 'beginner'],
    workoutSessions: [],
    microcycles: [],
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2024-01-15'),
    stats: {
      sessions: 48,
      avgDuration: 60,
      lastUsed: '2024-01-15'
    }
  }
];

export function MyRoutines({ onCreateNew }: MyRoutinesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [routines, setRoutines] = useState(sampleRoutines);

  const filteredRoutines = routines.filter(routine => {
    const matchesSearch = routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         routine.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'active' && routine.isActive) ||
                         (selectedFilter === 'inactive' && !routine.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleDuplicate = (routine: TrainingProgram & { stats: { sessions: number; avgDuration: number; lastUsed: string; }}) => {
    const newRoutine = {
      ...routine,
      id: Math.random().toString(36).substr(2, 9),
      name: `${routine.name} (Copia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: false
    };
    setRoutines(prev => [newRoutine, ...prev]);
  };

  const handleDelete = (routineId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta rutina? Esta acción no se puede deshacer.')) {
      setRoutines(prev => prev.filter(routine => routine.id !== routineId));
    }
  };

  const getSplitLabel = (split: string) => {
    const labels = {
      'full_body': 'Cuerpo Completo',
      'upper_lower': 'Tren Superior/Inferior', 
      'push_pull_legs': 'Push/Pull/Piernas',
      'body_part': 'División por Grupos',
      'custom': 'Personalizado'
    };
    return labels[split as keyof typeof labels] || split;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      'beginner': 'bg-green-500/20 text-green-400 border-green-500/30',
      'intermediate': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'advanced': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Mis Rutinas
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur opacity-75"></div>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Gestiona y organiza tus programas de entrenamiento personalizados
          </p>
        </div>

        {/* Controls */}
        <div className="mb-8 flex flex-col lg:flex-row gap-6 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar rutinas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white placeholder-gray-400 border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all"
              />
            </div>

            {/* Filter */}
            <div className="relative min-w-[140px]">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="w-full pl-12 pr-10 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white border border-white/20 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 appearance-none transition-all cursor-pointer"
              >
                <option value="all" className="bg-gray-800 text-white">Todas</option>
                <option value="active" className="bg-gray-800 text-white">Activas</option>
                <option value="inactive" className="bg-gray-800 text-white">Inactivas</option>
              </select>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <Button
            onClick={onCreateNew}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Rutina
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Dumbbell className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">{routines.length}</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">Total Rutinas</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Target className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-white">{routines.filter(r => r.isActive).length}</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">Activas</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">
                {Math.round(routines.reduce((acc, r) => acc + (r.stats?.sessions || 0), 0) / routines.length) || 0}
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium">Sesiones Promedio</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-white">
                {Math.round(routines.reduce((acc, r) => acc + (r.stats?.avgDuration || 0), 0) / routines.length) || 0}m
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium">Duración Promedio</p>
          </div>
        </div>

        {/* Routines Grid */}
        {filteredRoutines.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutines.map((routine) => (
              <div key={routine.id} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm"></div>
                <Card className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${routine.isActive 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {routine.isActive ? 'Activa' : 'Inactiva'}
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          {getSplitLabel(routine.split)}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(routine.difficulty)}`}>
                          {routine.difficulty === 'beginner' ? 'Principiante' : 
                           routine.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-1">
                        {routine.name}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                        {routine.description || 'Sin descripción disponible'}
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center justify-center mb-1">
                        <Calendar className="h-4 w-4 text-purple-400" />
                      </div>
                      <p className="text-sm font-bold text-white">{routine.stats?.sessions || 0}</p>
                      <p className="text-xs text-gray-400">Sesiones</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="h-4 w-4 text-orange-400" />
                      </div>
                      <p className="text-sm font-bold text-white">{routine.stats?.avgDuration || 0}m</p>
                      <p className="text-xs text-gray-400">Duración</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                      </div>
                      <p className="text-sm font-bold text-white">{routine.duration}w</p>
                      <p className="text-xs text-gray-400">Programa</p>
                    </div>
                  </div>

                  {/* Last Used */}
                  <div className="mb-6 p-3 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-xs text-gray-400 mb-1">Última sesión</p>
                    <p className="text-sm text-gray-300">{routine.stats?.lastUsed || 'Nunca utilizada'}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 text-sm py-2.5"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/40"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/40"
                      onClick={() => handleDuplicate(routine)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
                      onClick={() => handleDelete(routine.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                <Dumbbell className="h-12 w-12 text-blue-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {searchTerm || selectedFilter !== 'all' ? 'No se encontraron rutinas' : '¡Crea tu primera rutina!'}
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Intenta ajustar tus filtros de búsqueda para encontrar las rutinas que buscas.'
                : 'Comienza tu viaje de entrenamiento creando una rutina personalizada que se adapte a tus objetivos.'
              }
            </p>
            {(!searchTerm && selectedFilter === 'all') && (
              <Button
                onClick={onCreateNew}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-3"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear Primera Rutina
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRoutines;
