'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Dumbbell, Activity, Target } from 'lucide-react';

interface WeeklyStatsWidgetsProps {
  currentStreak: number;
  weeklyCompletion: number;
  totalSets: number;
  workoutDistribution: { type: string; count: number; color: string }[];
}

export function WeeklyStatsWidgets({
  currentStreak,
  weeklyCompletion,
  totalSets,
  workoutDistribution
}: WeeklyStatsWidgetsProps) {
  const completionPercentage = Math.round(weeklyCompletion);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Streak */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-orange-500/20 rounded-xl group-hover:scale-110 transition-transform">
            <Flame className="h-6 w-6 text-orange-400" />
          </div>
          <TrendingUp className="h-5 w-5 text-emerald-400" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">{currentStreak}</h3>
        <p className="text-sm text-gray-400">días consecutivos</p>
        <div className="mt-3 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((currentStreak / 30) * 100, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
          />
        </div>
      </motion.div>

      {/* Weekly Completion */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
            <Target className="h-6 w-6 text-blue-400" />
          </div>
          <div className="relative w-16 h-16">
            <svg className="transform -rotate-90 w-16 h-16">
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-white/10"
              />
              <motion.circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="text-blue-400"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{completionPercentage}%</span>
            </div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-1">Semana Actual</h3>
        <p className="text-sm text-gray-400">completada</p>
      </motion.div>

      {/* Total Volume */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
            <Dumbbell className="h-6 w-6 text-purple-400" />
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Proyectado</p>
          </div>
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">
          {totalSets}
        </h3>
        <p className="text-sm text-gray-400">series planificadas</p>
        <div className="mt-3 flex gap-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-8 rounded ${
                i < Math.floor(completionPercentage / 14.3)
                  ? 'bg-gradient-to-t from-purple-600 to-purple-400'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Workout Distribution */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform">
            <Activity className="h-6 w-6 text-emerald-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Distribución</h3>
        <div className="space-y-2">
          {workoutDistribution.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-400 flex-1">{item.type}</span>
              <span className="text-xs font-semibold text-white">{item.count}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
