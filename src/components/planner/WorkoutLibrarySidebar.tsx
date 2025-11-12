'use client';

import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Star,
  Dumbbell,
  Flame,
  Activity,
  Heart,
  Zap,
  Wind,
  ChevronDown,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';
import { WorkoutLibraryItem } from '@/types/weekly-planner';
import { WorkoutType } from '@/types';

interface WorkoutLibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  workouts: WorkoutLibraryItem[];
  onSessionSelect?: (workout: WorkoutLibraryItem) => void;
}

const workoutTypeConfig: Record<WorkoutType, { icon: any; color: string; label: string }> = {
  strength: { icon: Dumbbell, color: 'text-red-400', label: 'Fuerza' },
  hypertrophy: { icon: Dumbbell, color: 'text-blue-400', label: 'Hipertrofia' },
  power: { icon: Flame, color: 'text-orange-400', label: 'Potencia' },
  endurance: { icon: Activity, color: 'text-green-400', label: 'Resistencia' },
  cardio: { icon: Heart, color: 'text-pink-400', label: 'Cardio' },
  flexibility: { icon: Wind, color: 'text-purple-400', label: 'Flexibilidad' },
  mobility: { icon: Activity, color: 'text-indigo-400', label: 'Movilidad' },
  stretching: { icon: Wind, color: 'text-violet-400', label: 'Estiramiento' },
  recovery: { icon: Heart, color: 'text-teal-400', label: 'Recuperación' },
  conditioning: { icon: Zap, color: 'text-yellow-400', label: 'Acondicionamiento' }
};

const difficultyConfig = {
  beginner: { color: 'bg-green-500/20 text-green-400', label: 'Principiante' },
  intermediate: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Intermedio' },
  advanced: { color: 'bg-red-500/20 text-red-400', label: 'Avanzado' }
};

export function WorkoutLibrarySidebar({ 
  isOpen, 
  onClose, 
  workouts,
  onSessionSelect 
}: WorkoutLibrarySidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<WorkoutType | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['favorites']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const filteredWorkouts = workouts.filter(item => {
    const matchesSearch = item.session.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.session.type === selectedType;
    const matchesFavorite = !showFavoritesOnly || item.isFavorite;
    return matchesSearch && matchesType && matchesFavorite;
  });

  const favoriteWorkouts = filteredWorkouts.filter(w => w.isFavorite);
  const recentWorkouts = [...filteredWorkouts]
    .filter(w => w.lastUsed)
    .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
    .slice(0, 5);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900/95 backdrop-blur-2xl border-r border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-blue-400" />
                  Biblioteca
                </h2>
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar sesión..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/50 transition-colors"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${showFavoritesOnly 
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30' 
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  <Star className={`h-3.5 w-3.5 ${showFavoritesOnly ? 'fill-yellow-400' : ''}`} />
                  Favoritos
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Filter className="h-3.5 w-3.5" />
                  Filtros
                </button>
              </div>
            </div>

            {/* Workout List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Favorites Section */}
              {favoriteWorkouts.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('favorites')}
                    className="flex items-center justify-between w-full mb-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      Favoritos ({favoriteWorkouts.length})
                    </span>
                    {expandedSections.has('favorites') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.has('favorites') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2"
                      >
                        {favoriteWorkouts.map((item, index) => (
                          <WorkoutCard key={item.id} item={item} index={index} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Recent Section */}
              {recentWorkouts.length > 0 && (
                <div>
                  <button
                    onClick={() => toggleSection('recent')}
                    className="flex items-center justify-between w-full mb-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                  >
                    <span>Recientes ({recentWorkouts.length})</span>
                    {expandedSections.has('recent') ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedSections.has('recent') && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2"
                      >
                        {recentWorkouts.map((item, index) => (
                          <WorkoutCard key={item.id} item={item} index={index + 100} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* All Workouts Section */}
              <div>
                <button
                  onClick={() => toggleSection('all')}
                  className="flex items-center justify-between w-full mb-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  <span>Todas las sesiones ({filteredWorkouts.length})</span>
                  {expandedSections.has('all') ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedSections.has('all') && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2"
                    >
                      {filteredWorkouts.map((item, index) => (
                        <WorkoutCard key={item.id} item={item} index={index + 200} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function WorkoutCard({ item, index }: { item: WorkoutLibraryItem; index: number }) {
  const config = workoutTypeConfig[item.session.type];
  const Icon = config.icon;

  return (
    <Draggable draggableId={`workout-${item.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            group relative p-3 rounded-lg border cursor-grab active:cursor-grabbing
            bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20
            transition-all duration-200
            ${snapshot.isDragging ? 'shadow-2xl scale-105 rotate-2 bg-white/10' : ''}
          `}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-white/5 ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-white line-clamp-1">
                  {item.session.name}
                </h4>
                {item.isFavorite && (
                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>{item.session.estimatedDuration}min</span>
                <span>•</span>
                <span>{item.session.exercises.length} ejercicios</span>
              </div>
              <div className="mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyConfig[item.session.difficulty || 'beginner'].color}`}>
                  {difficultyConfig[item.session.difficulty || 'beginner'].label}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
