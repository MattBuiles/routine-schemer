'use client';

import React, { useState } from 'react';
import { 
  Plus,
  Search,
  Filter,
  Edit3,
  Copy,
  Trash2,
  Dumbbell,
  Play,
  Loader2
} from 'lucide-react';
import { Program } from '@/types/program';
import { useDashboardData } from '@/hooks/useDashboardData';
import { deleteProgram, duplicateProgram, updateProgram } from '@/app/actions/programs';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { LogSessionModal } from './LogSessionModal';

interface MyRoutinesProps {
  onCreateNew: () => void;
  onEditProgram?: (program: Program) => void;
}

export function MyRoutines({ onCreateNew, onEditProgram }: MyRoutinesProps) {
  const { user } = useAuth();
  const { programs, loading, refreshData } = useDashboardData();
  const [searchTerm, setSearchTerm] = useState('');
  const [loggingProgram, setLoggingProgram] = useState<Program | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredRoutines = programs.filter((routine) => {
    const matchesSearch = routine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         routine.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'active' && routine.isActive) ||
                         (selectedFilter === 'inactive' && !routine.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const handleDuplicate = async (routine: Program) => {
    if (!user) {
      toast.error('Debes iniciar sesión para duplicar un programa');
      return;
    }

    try {
      toast.loading('Duplicando programa...', { id: 'duplicate' });
      await duplicateProgram(routine.id);
      await refreshData();
      toast.success(`Programa "${routine.name}" duplicado exitosamente`, { id: 'duplicate' });
    } catch (err) {
      console.error('Error duplicating program:', err);
      toast.error('Error al duplicar el programa', { id: 'duplicate' });
    }
  };

  const handleDelete = async (routineId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta rutina? Esta acción no se puede deshacer.')) {
      try {
        toast.loading('Eliminando programa...', { id: 'delete' });
        await deleteProgram(routineId);
        await refreshData();
        toast.success('Programa eliminado exitosamente', { id: 'delete' });
      } catch (err) {
        console.error('Error deleting program:', err);
        toast.error('Error al eliminar el programa', { id: 'delete' });
      }
    }
  };

  const handleActivate = async (routine: Program) => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    try {
      toast.loading(routine.isActive ? 'Desactivando programa...' : 'Activando programa...', { id: 'activate' });
      
      // Si se está activando, desactivar todos los demás primero
      if (!routine.isActive) {
        const activePrograms = programs.filter(p => p.isActive && p.id !== routine.id);
        for (const prog of activePrograms) {
          await updateProgram(prog.id, { isActive: false });
        }
      }
      
      await updateProgram(routine.id, { isActive: !routine.isActive });
      await refreshData();
      toast.success(routine.isActive ? 'Programa desactivado' : 'Programa activado exitosamente', { id: 'activate' });
    } catch (err) {
      console.error('Error activating program:', err);
      toast.error('Error al cambiar estado del programa', { id: 'activate' });
    }
  };

  const handleEdit = (routine: Program) => {
    if (onEditProgram) {
      onEditProgram(routine);
    } else {
      toast('Función de edición en desarrollo', { icon: '🚧' });
    }
  };

  const handleStartSession = (routine: Program) => {
    if (!routine.isActive) {
      toast.error('Debes activar este programa primero');
      return;
    }
    setLoggingProgram(routine);
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

  const activePrograms = programs.filter(p => p.isActive).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando rutinas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
              Mis Rutinas
            </h1>
            <p className="text-gray-400 text-lg">
              Gestiona y organiza tus programas de entrenamiento personalizados
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{programs.length}</div>
            <div className="text-sm text-gray-400">Programas</div>
            {activePrograms > 0 && (
              <div className="mt-2 inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {activePrograms} Activo{activePrograms > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full"></div>
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
              className={`group bg-white/5 backdrop-blur-xl border rounded-2xl p-6 hover:bg-white/10 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ${
                routine.isActive 
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30' 
                  : 'border-white/10 hover:shadow-blue-500/20'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{routine.name}</h3>
                  <button
                    onClick={() => handleActivate(routine)}
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${
                      routine.isActive 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 hover:bg-gray-500/30'
                    }`}
                  >
                    {routine.isActive ? '✓ Activa' : 'Activar'}
                  </button>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                {routine.description || 'Sin descripción disponible'}
              </p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{routine.sessionsPerWeek}</div>
                  <div className="text-xs text-gray-400">x Semana</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{routine.mesocycles?.length || 0}</div>
                  <div className="text-xs text-gray-400">Mesociclos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{routine.totalWeeks}w</div>
                  <div className="text-xs text-gray-400">Semanas</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {getSplitLabel(routine.splitType)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(routine.difficulty)}`}>
                  {routine.difficulty === 'beginner' ? 'Principiante' : 
                   routine.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                </span>
              </div>

              <div className="flex gap-2">
                <button 
                  className={`flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-2 ${
                    !routine.isActive ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleStartSession(routine)}
                  disabled={!routine.isActive}
                >
                  <Play className="h-4 w-4" />
                  Registrar Sesión
                </button>
                
                <button 
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  onClick={() => handleEdit(routine)}
                  title="Editar programa"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                
                <button 
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                  onClick={() => handleDuplicate(routine)}
                  title="Duplicar programa"
                >
                  <Copy className="h-4 w-4" />
                </button>
                
                <button 
                  className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all"
                  onClick={() => handleDelete(routine.id)}
                  title="Eliminar programa"
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

      {loggingProgram && (
        <LogSessionModal
          program={loggingProgram}
          onClose={() => setLoggingProgram(null)}
          onLogged={() => toast.success('Sesión registrada')}
        />
      )}
    </div>
  );
}

export default MyRoutines;
