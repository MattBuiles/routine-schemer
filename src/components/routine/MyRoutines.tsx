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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-luxury mb-2">Mis Rutinas</h1>
          <p className="text-gray-400">Gestiona y organiza tus programas de entrenamiento</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar rutinas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass rounded-lg text-white placeholder-gray-400 border border-white/20 focus:border-white/40 focus:outline-none"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="pl-10 pr-8 py-2 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none appearance-none bg-transparent"
              >
                <option value="all" className="bg-gray-800">Todas</option>
                <option value="active" className="bg-gray-800">Activas</option>
                <option value="inactive" className="bg-gray-800">Inactivas</option>
              </select>
            </div>
          </div>

          {/* Create Button */}
          <Button
            onClick={onCreateNew}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Rutina
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Rutinas</p>
                <p className="text-2xl font-bold text-white">{routines.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </Card>
          
          <Card className="glass border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Rutinas Activas</p>
                <p className="text-2xl font-bold text-white">{routines.filter(r => r.isActive).length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </Card>
          
          <Card className="glass border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Sesiones</p>
                <p className="text-2xl font-bold text-white">{routines.reduce((acc, r) => acc + r.stats.sessions, 0)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
          </Card>
          
          <Card className="glass border-white/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Duración Promedio</p>
                <p className="text-2xl font-bold text-white">
                  {Math.round(routines.reduce((acc, r) => acc + r.stats.avgDuration, 0) / routines.length)}min
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-400" />
            </div>
          </Card>
        </div>

        {/* Routines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutines.map((routine) => (
            <Card key={routine.id} className="glass border-white/20 p-6 hover:border-white/30 transition-all duration-200">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
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
