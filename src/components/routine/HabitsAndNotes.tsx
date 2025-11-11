'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus,
  Heart,
  Droplets,
  Moon,
  Utensils,
  Pill,
  Brain,
  Activity,
  Edit3,
  Trash2,
  CheckCircle,
  BookOpen,
  PinIcon,
  Search,
  Filter
} from 'lucide-react';
import { Habit, HabitRecord, Note, NoteType } from '@/types';

// Datos de ejemplo para hábitos
const sampleHabits: (Habit & { todayRecord?: HabitRecord })[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Hidratación',
    description: 'Mantener un consumo adecuado de agua durante el día',
    type: 'water_intake',
    target: 8,
    unit: 'vasos',
    color: '#3b82f6',
    icon: 'Droplets',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    todayRecord: {
      id: '1r',
      habitId: '1',
      userId: 'user1',
      date: '2024-01-20',
      value: 6,
      createdAt: new Date()
    }
  },
  {
    id: '2',
    userId: 'user1',
    name: 'Sueño',
    description: 'Dormir las horas necesarias para una buena recuperación',
    type: 'sleep',
    target: 8,
    unit: 'horas',
    color: '#8b5cf6',
    icon: 'Moon',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    todayRecord: {
      id: '2r',
      habitId: '2',
      userId: 'user1',
      date: '2024-01-20',
      value: 7.5,
      createdAt: new Date()
    }
  },
  {
    id: '3',
    userId: 'user1',
    name: 'Suplementos',
    description: 'Tomar suplementos según la planificación',
    type: 'supplements',
    target: 3,
    unit: 'dosis',
    color: '#10b981',
    icon: 'Pill',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true,
    todayRecord: {
      id: '3r',
      habitId: '3',
      userId: 'user1',
      date: '2024-01-20',
      value: 2,
      createdAt: new Date()
    }
  },
  {
    id: '4',
    userId: 'user1',
    name: 'Meditación',
    description: 'Práctica diaria de mindfulness y relajación',
    type: 'meditation',
    target: 15,
    unit: 'minutos',
    color: '#f59e0b',
    icon: 'Brain',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isActive: true
  }
];

// Datos de ejemplo para notas
const sampleNotes: Note[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Progreso en Press Banca',
    content: 'Logré incrementar 5kg en el press banca. La técnica mejoró considerablemente después de trabajar en la movilidad de hombros.',
    type: 'progress',
    tags: ['fuerza', 'press-banca', 'técnica'],
    workoutSessionId: 'session1',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    isPinned: true
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Plan Nutricional Semana 3',
    content: 'Ajustar las calorías para la siguiente fase. Incrementar proteínas en 20g y reducir carbohidratos en la cena.',
    type: 'nutrition',
    tags: ['nutrición', 'planificación', 'macros'],
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
    isPinned: false
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Ideas para Rutina de Movilidad',
    content: 'Incorporar más ejercicios de cadena posterior. Secuencia: cat-cow, hip circles, thoracic spine rotation.',
    type: 'idea',
    tags: ['movilidad', 'rutina', 'flexibilidad'],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    isPinned: false
  }
];

const habitIcons = {
  Droplets,
  Moon,
  Utensils,
  Pill,
  Brain,
  Activity,
  Heart
};

const noteTypeColors = {
  general: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  workout: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  nutrition: 'bg-green-500/10 text-green-400 border-green-500/20',
  progress: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  idea: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  reminder: 'bg-red-500/10 text-red-400 border-red-500/20'
};

const noteTypeLabels = {
  general: 'General',
  workout: 'Entrenamiento',
  nutrition: 'Nutrición',
  progress: 'Progreso',
  idea: 'Idea',
  reminder: 'Recordatorio'
};

export function HabitsAndNotes() {
  const [activeTab, setActiveTab] = useState<'habits' | 'notes'>('habits');
  const [habits, setHabits] = useState(sampleHabits);
  const [notes, setNotes] = useState(sampleNotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType | 'all'>('all');

  const updateHabitValue = (habitId: string, value: number) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { 
            ...habit, 
            todayRecord: {
              id: habit.todayRecord?.id || Math.random().toString(36).substr(2, 9),
              habitId,
              userId: 'user1',
              date: new Date().toISOString().split('T')[0],
              value,
              createdAt: new Date()
            }
          }
        : habit
    ));
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedNoteType === 'all' || note.type === selectedNoteType;
    return matchesSearch && matchesType;
  });

  const toggleNotePinned = (noteId: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
            Hábitos y Notas
          </h1>
          <p className="text-gray-400 text-lg">Seguimiento de hábitos saludables y notas personales</p>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full mt-4"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'habits'
                ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-xl'
            }`}
          >
            <Heart className="h-4 w-4" />
            Hábitos
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'notes'
                ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-xl'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Notas
          </button>
        </div>

        {/* Habits Tab */}
        {activeTab === 'habits' && (
          <div>
            {/* Habits Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="glass border-white/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Hábitos Activos</p>
                    <p className="text-2xl font-bold text-white">{habits.filter(h => h.isActive).length}</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-400" />
                </div>
              </Card>
              
              <Card className="glass border-white/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Completados Hoy</p>
                    <p className="text-2xl font-bold text-white">
                      {habits.filter(h => h.todayRecord && h.todayRecord.value >= h.target).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </Card>
              
              <Card className="glass border-white/20 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Progreso Promedio</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(
                        habits.reduce((acc, h) => 
                          acc + ((h.todayRecord?.value || 0) / h.target * 100), 0
                        ) / habits.length
                      )}%
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-400" />
                </div>
              </Card>
            </div>

            {/* Habits List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {habits.map((habit) => {
                const IconComponent = habitIcons[habit.icon as keyof typeof habitIcons] || Heart;
                const progress = ((habit.todayRecord?.value || 0) / habit.target) * 100;
                const isCompleted = (habit.todayRecord?.value || 0) >= habit.target;

                return (
                  <Card key={habit.id} className="glass border-white/20 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${habit.color}20` }}
                        >
                          <IconComponent 
                            className="h-6 w-6" 
                            style={{ color: habit.color }}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{habit.name}</h3>
                          <p className="text-sm text-gray-400">{habit.description}</p>
                        </div>
                      </div>
                      {isCompleted && (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">
                          {habit.todayRecord?.value || 0} / {habit.target} {habit.unit}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: habit.color
                          }}
                        />
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateHabitValue(habit.id, Math.max(0, (habit.todayRecord?.value || 0) - 1))}
                          className="glass hover:bg-white/10 text-white border border-white/20 w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        <span className="text-white font-semibold min-w-[2rem] text-center">
                          {habit.todayRecord?.value || 0}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateHabitValue(habit.id, (habit.todayRecord?.value || 0) + 1)}
                          className="glass hover:bg-white/10 text-white border border-white/20 w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="glass hover:bg-white/10 text-white border border-white/20">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="glass hover:bg-white/10 text-red-400 border border-red-500/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Add Habit Button */}
            <div className="mt-8 text-center">
              <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white border-0">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Hábito
              </Button>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div>
            {/* Notes Controls */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar notas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 glass rounded-lg text-white placeholder-gray-400 border border-white/20 focus:border-white/40 focus:outline-none"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={selectedNoteType}
                    onChange={(e) => setSelectedNoteType(e.target.value as NoteType | 'all')}
                    className="pl-10 pr-8 py-2 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none appearance-none bg-transparent"
                  >
                    <option value="all" className="bg-gray-800">Todas</option>
                    {Object.entries(noteTypeLabels).map(([key, label]) => (
                      <option key={key} value={key} className="bg-gray-800">{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Add Note Button */}
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Nota
              </Button>
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="glass border-white/20 p-6 hover:border-white/30 transition-all duration-200">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white line-clamp-1">{note.title}</h3>
                        {note.isPinned && (
                          <PinIcon className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full border ${noteTypeColors[note.type]}`}>
                          {noteTypeLabels[note.type]}
                        </span>
                        <span className="text-xs text-gray-400">
                          {note.createdAt.toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => toggleNotePinned(note.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <PinIcon className={`h-4 w-4 ${note.isPinned ? 'text-yellow-400' : 'text-gray-400'}`} />
                    </button>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-300 mb-4 line-clamp-3">{note.content}</p>

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {note.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-xs text-gray-400">
                      {note.updatedAt !== note.createdAt ? 'Editado' : 'Creado'} {note.updatedAt.toLocaleDateString('es-ES')}
                    </span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" className="glass hover:bg-white/10 text-white border border-white/20">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="glass hover:bg-white/10 text-red-400 border border-red-500/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm || selectedNoteType !== 'all' ? 'No se encontraron notas' : 'No tienes notas aún'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || selectedNoteType !== 'all'
                    ? 'Intenta cambiar los filtros de búsqueda'
                    : 'Crea tu primera nota para registrar ideas y observaciones'
                  }
                </p>
                {(!searchTerm && selectedNoteType === 'all') && (
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Nota
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HabitsAndNotes;
