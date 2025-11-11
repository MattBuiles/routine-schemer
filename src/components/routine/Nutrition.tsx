'use client';

import React, { useState } from 'react';
import { Apple, Plus, Calendar, Target, TrendingUp, Edit3, Trash2, BookOpen } from 'lucide-react';

// Tipos para nutrición
interface MealPlan {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  meals: Meal[];
  dailyCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  createdAt: Date;
}

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time?: string;
  notes?: string;
}

const sampleMealPlans: MealPlan[] = [
  {
    id: '1',
    name: 'Plan de Volumen - Fase 1',
    description: 'Plan alto en calorías para ganancia muscular',
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    dailyCalories: 3200,
    protein: 180,
    carbs: 400,
    fats: 90,
    meals: [],
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Plan de Definición',
    description: 'Déficit calórico controlado para pérdida de grasa',
    startDate: '2024-03-16',
    dailyCalories: 2400,
    protein: 160,
    carbs: 220,
    fats: 70,
    meals: [],
    createdAt: new Date('2024-03-16')
  }
];

export function Nutrition() {
  const [mealPlans, setMealPlans] = useState(sampleMealPlans);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
            Nutrición
          </h1>
          <p className="text-gray-400 text-lg">Registra y planifica tu alimentación</p>
          <div className="h-1 w-32 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-4"></div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Apple className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">3,200</div>
            <div className="text-sm text-gray-400">Calorías/día</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">180g</div>
            <div className="text-sm text-gray-400">Proteína/día</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">400g</div>
            <div className="text-sm text-gray-400">Carbohidratos/día</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-violet-500/20 rounded-xl">
                <Calendar className="h-6 w-6 text-violet-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{mealPlans.length}</div>
            <div className="text-sm text-gray-400">Planes activos</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end mb-6">
          <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nuevo Plan de Alimentación
          </button>
        </div>

        {/* Meal Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealPlans.map((plan) => (
            <div
              key={plan.id}
              className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">{plan.description}</p>
                  )}
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-lg font-bold text-blue-400 mb-1">{plan.protein}g</div>
                  <div className="text-xs text-gray-400">Proteína</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-lg font-bold text-orange-400 mb-1">{plan.carbs}g</div>
                  <div className="text-xs text-gray-400">Carbos</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-lg font-bold text-violet-400 mb-1">{plan.fats}g</div>
                  <div className="text-xs text-gray-400">Grasas</div>
                </div>
              </div>

              {/* Calories */}
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl">
                <div className="text-2xl font-bold text-white mb-1">{plan.dailyCalories} kcal</div>
                <div className="text-xs text-gray-400">Calorías diarias</div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                <Calendar className="h-4 w-4" />
                <span>{new Date(plan.startDate).toLocaleDateString('es-ES')}</span>
                {plan.endDate && (
                  <>
                    <span>→</span>
                    <span>{new Date(plan.endDate).toLocaleDateString('es-ES')}</span>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Ver Detalles
                </button>
                <button className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                  <Edit3 className="h-4 w-4" />
                </button>
                <button className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mealPlans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <Apple className="w-20 h-20 text-gray-600 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">No hay planes de alimentación</h3>
            <p className="text-gray-400 text-center max-w-md mb-8">
              Crea tu primer plan de alimentación para comenzar a registrar y organizar tu nutrición.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Crear Primer Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Nutrition;
