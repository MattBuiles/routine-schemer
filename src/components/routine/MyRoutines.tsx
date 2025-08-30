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
    <div className="my-routines-container">
      <div className="my-routines-background"></div>
      
      {/* Header */}
      <div className="my-routines-header">
        <h1 className="my-routines-title">
          Mis Rutinas
        </h1>
        <p className="my-routines-subtitle">
          Gestiona y organiza tus programas de entrenamiento personalizados
        </p>
        <div className="my-routines-divider"></div>
      </div>

      {/* Controls */}
      <div className="my-routines-toolbar">
        <div className="my-routines-search-section">
          <div className="my-routines-search-container">
            <Search className="my-routines-search-icon" />
            <input
              type="text"
              placeholder="Buscar rutinas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="my-routines-search-input"
            />
          </div>

          <button 
            className="my-routines-filters-btn"
            onClick={() => setSelectedFilter(selectedFilter === 'all' ? 'active' : selectedFilter === 'active' ? 'inactive' : 'all')}
          >
            <Filter className="h-4 w-4" />
            {selectedFilter === 'all' ? 'Todas' : selectedFilter === 'active' ? 'Activas' : 'Inactivas'}
          </button>
        </div>

        <div className="my-routines-actions">
          <button
            onClick={onCreateNew}
            className="my-routines-create-btn"
          >
            <Plus className="h-5 w-5" />
            Nueva Rutina
          </button>
        </div>
      </div>

      {/* Routines Grid */}
      {filteredRoutines.length > 0 ? (
        <div className="my-routines-grid">
          {filteredRoutines.map((routine) => (
            <div key={routine.id} className="my-routines-card">
              <div className="my-routines-card-header">
                <div>
                  <h3 className="my-routines-card-title">{routine.name}</h3>
                  <div className={`my-routines-card-status ${routine.isActive ? 'active' : 'inactive'}`}>
                    {routine.isActive ? 'Activa' : 'Inactiva'}
                  </div>
                </div>
              </div>

              <p className="my-routines-card-description">
                {routine.description || 'Sin descripción disponible'}
              </p>

              <div className="my-routines-card-stats">
                <div className="my-routines-stat-item">
                  <div className="my-routines-stat-value">{routine.stats?.sessions || 0}</div>
                  <div className="my-routines-stat-label">Sesiones</div>
                </div>
                <div className="my-routines-stat-item">
                  <div className="my-routines-stat-value">{routine.stats?.avgDuration || 0}m</div>
                  <div className="my-routines-stat-label">Duración</div>
                </div>
                <div className="my-routines-stat-item">
                  <div className="my-routines-stat-value">{routine.duration}w</div>
                  <div className="my-routines-stat-label">Programa</div>
                </div>
              </div>

              <div className="my-routines-card-tags">
                <span className="my-routines-tag">{getSplitLabel(routine.split)}</span>
                <span className="my-routines-tag">
                  {routine.difficulty === 'beginner' ? 'Principiante' : 
                   routine.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                </span>
              </div>

              <div className="my-routines-card-actions">
                <button className="my-routines-play-btn">
                  <Play className="h-4 w-4" />
                  Iniciar
                </button>
                
                <div className="my-routines-action-buttons">
                  <button className="my-routines-action-btn">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  
                  <button className="my-routines-action-btn" onClick={() => handleDuplicate(routine)}>
                    <Copy className="h-4 w-4" />
                  </button>
                  
                  <button className="my-routines-action-btn danger" onClick={() => handleDelete(routine.id)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="my-routines-empty-state">
          <Dumbbell className="my-routines-empty-icon" />
          <h3 className="my-routines-empty-title">
            {searchTerm || selectedFilter !== 'all' ? 'No se encontraron rutinas' : '¡Crea tu primera rutina!'}
          </h3>
          <p className="my-routines-empty-description">
            {searchTerm || selectedFilter !== 'all' 
              ? 'Intenta ajustar tus filtros de búsqueda para encontrar las rutinas que buscas.'
              : 'Comienza tu viaje de entrenamiento creando una rutina personalizada que se adapte a tus objetivos.'
            }
          </p>
          {(!searchTerm && selectedFilter === 'all') && (
            <button onClick={onCreateNew} className="my-routines-empty-cta">
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
