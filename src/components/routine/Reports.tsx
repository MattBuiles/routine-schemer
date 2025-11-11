'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Target, Activity, Award, Filter, Download } from 'lucide-react';

// Tipos para reportes
interface TrainingStats {
  totalSessions: number;
  totalVolume: number;
  averageIntensity: number;
  consistency: number;
  strongestArea: string;
  improvementRate: number;
}

interface VolumeData {
  date: string;
  volume: number;
  intensity: number;
}

const mockStats: TrainingStats = {
  totalSessions: 48,
  totalVolume: 156000,
  averageIntensity: 78,
  consistency: 92,
  strongestArea: 'Fuerza',
  improvementRate: 15.3
};

const mockVolumeData: VolumeData[] = [
  { date: '2024-01-15', volume: 12000, intensity: 75 },
  { date: '2024-01-22', volume: 14500, intensity: 78 },
  { date: '2024-01-29', volume: 13800, intensity: 76 },
  { date: '2024-02-05', volume: 15200, intensity: 80 },
  { date: '2024-02-12', volume: 16000, intensity: 82 },
  { date: '2024-02-19', volume: 15500, intensity: 81 }
];

export function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedFocus, setSelectedFocus] = useState<string>('all');

  const maxVolume = Math.max(...mockVolumeData.map(d => d.volume));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-purple-400">
            Análisis y Reportes
          </h1>
          <p className="text-gray-400 text-lg">Visualiza tu progreso y tendencias</p>
          <div className="h-1 w-32 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mt-4"></div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-400 mb-2">Período</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-400 mb-2">Enfoque</label>
            <select
              value={selectedFocus}
              onChange={(e) => setSelectedFocus(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">Todos</option>
              <option value="strength">Fuerza</option>
              <option value="hypertrophy">Hipertrofia</option>
              <option value="endurance">Resistencia</option>
              <option value="technique">Técnica</option>
            </select>
          </div>

          <button className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-violet-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2 self-end">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-sm text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +12%
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{mockStats.totalSessions}</div>
            <div className="text-sm text-gray-400">Sesiones completadas</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-violet-500/20 rounded-xl">
                <Target className="h-6 w-6 text-violet-400" />
              </div>
              <div className="text-sm text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                +{mockStats.improvementRate}%
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {(mockStats.totalVolume / 1000).toFixed(0)}k
            </div>
            <div className="text-sm text-gray-400">Volumen total (kg)</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <BarChart3 className="h-6 w-6 text-orange-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{mockStats.averageIntensity}%</div>
            <div className="text-sm text-gray-400">Intensidad promedio</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Award className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{mockStats.consistency}%</div>
            <div className="text-sm text-gray-400">Consistencia</div>
          </div>
        </div>

        {/* Volume Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Volumen Semanal</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-400">Volumen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                <span className="text-gray-400">Intensidad</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {mockVolumeData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{new Date(data.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                  <span>{(data.volume / 1000).toFixed(1)}k kg</span>
                </div>
                <div className="flex gap-2">
                  {/* Volume bar */}
                  <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500"
                      style={{ width: `${(data.volume / maxVolume) * 100}%` }}
                    ></div>
                  </div>
                  {/* Intensity indicator */}
                  <div className="w-16 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-violet-400">{data.intensity}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Áreas de Enfoque</h3>
            <div className="space-y-4">
              {[
                { name: 'Fuerza', value: 85, color: 'from-red-500 to-orange-500' },
                { name: 'Hipertrofia', value: 70, color: 'from-blue-500 to-violet-500' },
                { name: 'Resistencia', value: 60, color: 'from-emerald-500 to-teal-500' },
                { name: 'Técnica', value: 50, color: 'from-violet-500 to-purple-500' }
              ].map((area) => (
                <div key={area.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">{area.name}</span>
                    <span className="text-white font-semibold">{area.value}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${area.color} rounded-full transition-all duration-500`}
                      style={{ width: `${area.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Resumen del Período</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Área más trabajada</div>
                  <div className="text-lg font-bold text-white">{mockStats.strongestArea}</div>
                </div>
                <Award className="h-8 w-8 text-orange-400" />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Tasa de mejora</div>
                  <div className="text-lg font-bold text-emerald-400">+{mockStats.improvementRate}%</div>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Próximo objetivo</div>
                  <div className="text-lg font-bold text-white">170k kg volumen</div>
                </div>
                <Target className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
