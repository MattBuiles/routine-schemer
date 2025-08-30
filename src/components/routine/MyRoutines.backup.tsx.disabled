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
  MoreVertical,
  Dumbbell
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
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    isActive: true,
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
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    isActive: false,
    stats: {
      sessions: 24,
      avgDuration: 45,
      lastUsed: '2024-01-18'
    }
  },
  {
    id: '3',
    userId: 'user1',
    name: 'Movilidad y Recuperación',
    description: 'Sesiones de estiramiento dinámico y movilidad articular para atletas',
    mesocycles: [],
    split: 'custom',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-19'),
    isActive: true,
    stats: {
      sessions: 15,
      avgDuration: 30,
      lastUsed: '2024-01-19'
    }
  },
  {
    id: '4',
    userId: 'user1',
    name: 'Fuerza Powerlifting',
    description: 'Programa especializado en los tres levantamientos básicos del powerlifting',
    mesocycles: [],
    split: 'upper_lower',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-15'),
    isActive: false,
    stats: {
      sessions: 48,
      avgDuration: 90,
      lastUsed: '2024-01-15'
    }
  }
];

const splitTypeLabels = {
  full_body: 'Cuerpo Completo',
  upper_lower: 'Tren Superior/Inferior',
  push_pull_legs: 'Empuje/Tirón/Piernas',
  body_part: 'Por Grupos Musculares',
  custom: 'Personalizado'
};

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

  const handleToggleActive = (routineId: string) => {
    setRoutines(prev => prev.map(routine => 
      routine.id === routineId 
        ? { ...routine, isActive: !routine.isActive }
        : routine
    ));
  };

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

  return (
    <div className="relative z-10 p-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutines.map((routine) => (
            <div key={routine.id} className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-purple-600/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm"></div>
              <Card className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${routine.isActive 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {routine.isActive ? 'Activa' : 'Inactiva'}
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 capitalize">
                        {routine.split.replace('_', ' ')}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                      {routine.name}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                      {routine.description || 'Sin descripción disponible'}
                    </p>
                  </div>
                  
                  {/* Menu */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center justify-center mb-2">
                      <Calendar className="h-4 w-4 text-purple-400" />
                    </div>
                    <p className="text-lg font-bold text-white">{routine.stats?.sessions || 0}</p>
                    <p className="text-xs text-gray-400">Sesiones</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="h-4 w-4 text-orange-400" />
                    </div>
                    <p className="text-lg font-bold text-white">{routine.stats?.avgDuration || 0}m</p>
                    <p className="text-xs text-gray-400">Duración</p>
                  </div>
                </div>

                {/* Last Used */}
                <div className="mb-6">
                  <p className="text-xs text-gray-400 mb-1">Última sesión</p>
                  <p className="text-sm text-gray-300">{routine.stats?.lastUsed || 'Nunca'}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 text-sm py-2"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar
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
                    <h3 className="text-lg font-semibold text-white">{routine.name}</h3>
                    {routine.isActive && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                        Activa
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{routine.description}</p>
                </div>
                
                {/* Menu */}
                <div className="relative group">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 glass border border-white/20 rounded-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <button className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDuplicate(routine)}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicar
                    </button>
                    <button 
                      onClick={() => handleToggleActive(routine.id)}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                    >
                      <Target className="h-4 w-4" />
                      {routine.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <hr className="my-2 border-white/10" />
                    <button 
                      onClick={() => handleDelete(routine.id)}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>

              {/* Split Type */}
              <div className="mb-4">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                  {splitTypeLabels[routine.split]}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Sesiones</p>
                  <p className="text-lg font-semibold text-white">{routine.stats.sessions}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Duración</p>
                  <p className="text-lg font-semibold text-white">{routine.stats.avgDuration}min</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400">Última</p>
                  <p className="text-lg font-semibold text-white">
                    {new Date(routine.stats.lastUsed).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1 glass hover:bg-white/10 text-white border border-white/20">
                  <Calendar className="h-4 w-4 mr-2" />
                  Programar
                </Button>
                <Button variant="ghost" className="flex-1 glass hover:bg-white/10 text-white border border-white/20">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredRoutines.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || selectedFilter !== 'all' ? 'No se encontraron rutinas' : 'No tienes rutinas aún'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Intenta cambiar los filtros de búsqueda'
                : 'Crea tu primera rutina para comenzar a planificar tus entrenamientos'
              }
            </p>
            {(!searchTerm && selectedFilter === 'all') && (
              <Button
                onClick={onCreateNew}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
              >
                <Plus className="h-4 w-4 mr-2" />
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
