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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
          Mis Rutinas
        </h1>
        <p className="text-gray-400 text-lg">
          Gestiona y organiza tus programas de entrenamiento personalizados
        </p>
        <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full mt-4"></div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar rutinas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-xl"
            />
          </div>

          <button 
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2 backdrop-blur-xl"
            onClick={() => setSelectedFilter(selectedFilter === 'all' ? 'active' : selectedFilter === 'active' ? 'inactive' : 'all')}
          >
            <Filter className="h-4 w-4" />
            {selectedFilter === 'all' ? 'Todas' : selectedFilter === 'active' ? 'Activas' : 'Inactivas'}
          </button>
        </div>

        <button
          onClick={onCreateNew}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2 justify-center"
        >
          <Plus className="h-5 w-5" />
          Nueva Rutina
        </button>
      </div>

      {/* Routines Grid */}
      {filteredRoutines.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutines.map((routine) => (
            <div 
              key={routine.id} 
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{routine.name}</h3>
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    routine.isActive 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {routine.isActive ? 'Activa' : 'Inactiva'}
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                {routine.description || 'Sin descripción disponible'}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{routine.stats?.sessions || 0}</div>
                  <div className="text-xs text-gray-400">Sesiones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{routine.stats?.avgDuration || 0}m</div>
                  <div className="text-xs text-gray-400">Duración</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{routine.duration}w</div>
                  <div className="text-xs text-gray-400">Programa</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {getSplitLabel(routine.split)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(routine.difficulty)}`}>
                  {routine.difficulty === 'beginner' ? 'Principiante' : 
                   routine.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                </span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="h-4 w-4" />
                  Iniciar
                </button>
                
                <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <Edit3 className="h-4 w-4" />
                </button>
                
                <button 
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  onClick={() => handleDuplicate(routine)}
                >
                  <Copy className="h-4 w-4" />
                </button>
                
                <button 
                  className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"
                  onClick={() => handleDelete(routine.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <Dumbbell className="w-20 h-20 text-gray-600 mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">
            {searchTerm || selectedFilter !== 'all' ? 'No se encontraron rutinas' : '¡Crea tu primera rutina!'}
          </h3>
          <p className="text-gray-400 text-center max-w-md mb-8">
            {searchTerm || selectedFilter !== 'all' 
              ? 'Intenta ajustar tus filtros de búsqueda para encontrar las rutinas que buscas.'
              : 'Comienza tu viaje de entrenamiento creando una rutina personalizada que se adapte a tus objetivos.'
            }
          </p>
          {(!searchTerm && selectedFilter === 'all') && (
            <button 
              onClick={onCreateNew} 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Crear Primera Rutina
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MyRoutines;
