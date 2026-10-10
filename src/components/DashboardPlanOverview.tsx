'use client';

/**
 * ROUTINE SCHEMER - PLAN OVERVIEW HUB
 * 
 * "Esto es un plano arquitectónico, no un diario de entrenamiento."
 * 
 * Dashboard rediseñado para PLANIFICACIÓN ESTRUCTURAL, no logging.
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { Program } from '@/types/program';
import { Navigation, NavigationView } from '@/components/ui/navigation';
import { MyRoutines } from '@/components/routine/MyRoutines';
import CreateProgram from '@/components/routine/CreateProgram';
import { Profile } from '@/components/routine/Profile';
import { HabitsAndNotes } from '@/components/routine/HabitsAndNotes';
import { History } from '@/components/routine/History';
import { Settings } from '@/components/routine/Settings';
import { MesocycleTimeline } from '@/components/planner/MesocycleTimeline';
import { WeeklySplitDesigner } from '@/components/planner/WeeklySplitDesigner';
import {
  Target,
  BarChart3,
  Edit3,
  Plus,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardComplete() {
  const { user, signOut } = useAuth();
  const { programs } = useDashboardData();
  const [currentView, setCurrentView] = useState<NavigationView>('dashboard');
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  
  // Seleccionar el primer programa activo o el primer programa disponible
  const currentProgram = programs.find(p => p.isActive) || programs[0];
  
  // Datos derivados del programa actual
  const timelineItems = currentProgram?.mesocycles?.map((m, index) => {
    // Calcular startWeek basado en mesociclos anteriores
    const previousWeeks = currentProgram.mesocycles
      .slice(0, index)
      .reduce((sum, prev) => sum + prev.durationWeeks, 0);
    
    return {
      ...m,
      startWeek: previousWeeks + 1,
      endWeek: previousWeeks + m.durationWeeks
    };
  }) || [];
  const sessionTemplates = currentProgram?.sessionTemplates || [];
  const weeklySplit = currentProgram?.weeklySplits?.[0] || null;

  const handleViewChange = (view: NavigationView) => {
    setEditingProgram(null);
    setCurrentView(view);
  };

  const handleMesocycleClick = (mesocycleId: string) => {
    console.log('Ver mesociclo:', mesocycleId);
    toast.success('Abriendo detalles del mesociclo...');
  };

  const handleAddMesocycle = () => {
    toast.success('Creando nuevo mesociclo...');
  };

  const handleCreateSession = () => {
    toast.success('Creando nueva sesión...');
  };

  const handleProgramCreated = () => {
    const wasEditing = editingProgram !== null;
    setEditingProgram(null);
    setCurrentView('programs');
    toast.success(wasEditing ? 'Programa actualizado exitosamente' : 'Programa creado exitosamente');
  };

  const PlanOverviewHub = () => {
    // Si no hay programa activo, mostrar call-to-action
    if (!currentProgram) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
          <div className="max-w-[1800px] mx-auto space-y-10">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600 p-1 shadow-2xl shadow-blue-500/20">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-fuchsia-500/20" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-[1.8rem] p-8 md:p-12">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                      <Layers className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-violet-100 bg-clip-text text-transparent leading-tight">
                        Centro de Diseño Estructural
                      </h1>
                      <p className="text-lg text-gray-300 font-medium">
                        Construye el blueprint completo de tu progreso 🏗️
                      </p>
                      <p className="text-sm text-gray-400 italic">
                        &ldquo;Esto es un plano arquitectónico, no un diario de entrenamiento&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty State */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-16 shadow-xl text-center">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl" />
              <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Target className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white">
                  No tienes programas activos
                </h2>
                <p className="text-xl text-gray-400">
                  Crea tu primer programa de entrenamiento estructurado para comenzar
                  a planificar tu progreso.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleViewChange('create-program')}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:scale-105 flex items-center gap-2"
                  >
                    <Plus className="w-6 h-6" />
                    Crear Primer Programa
                  </button>
                  <button
                    onClick={() => handleViewChange('programs')}
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20 flex items-center gap-2"
                  >
                    <Target className="w-6 h-6" />
                    Ver Todos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10">
        <div className="max-w-[1800px] mx-auto space-y-10">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600 p-1 shadow-2xl shadow-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-fuchsia-500/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-[1.8rem] p-8 md:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                    <Layers className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-violet-100 bg-clip-text text-transparent leading-tight">
                      Centro de Diseño Estructural
                    </h1>
                    <p className="text-lg text-gray-300 font-medium">
                      Construye el blueprint completo de tu progreso 🏗️
                    </p>
                    <p className="text-sm text-gray-400 italic">
                      &ldquo;Esto es un plano arquitectónico, no un diario de entrenamiento&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleViewChange('create-program')}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Nuevo Programa
                  </button>
                  <button
                    onClick={() => handleViewChange('programs')}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/20 flex items-center gap-2"
                  >
                    <Target className="w-5 h-5" />
                    Mis Programas
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Program Overview Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-8 shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {currentProgram.name}
                  </h2>
                  <p className="text-gray-400">{currentProgram.description}</p>
                </div>
                <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all">
                  <Edit3 className="w-5 h-5 text-gray-300" />
                </button>
              </div>

              {/* Program Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-500/30">
                  <p className="text-xs text-blue-300 uppercase tracking-wide mb-1">
                    Duración Total
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {currentProgram.totalWeeks} sem
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-violet-500/20 to-violet-600/10 rounded-xl border border-violet-500/30">
                  <p className="text-xs text-violet-300 uppercase tracking-wide mb-1">
                    Mesociclos
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {currentProgram.mesocycles.length}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-xl border border-emerald-500/30">
                  <p className="text-xs text-emerald-300 uppercase tracking-wide mb-1">
                    Sesiones/Sem
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {currentProgram.sessionsPerWeek}x
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-xl border border-orange-500/30">
                  <p className="text-xs text-orange-300 uppercase tracking-wide mb-1">
                    Split Type
                  </p>
                  <p className="text-lg font-bold text-white uppercase tracking-wide">
                    {currentProgram.splitType.replace('_', '/')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mesocycle Timeline */}
          {currentProgram && timelineItems.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-8 shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 blur-3xl" />
              <div className="relative z-10">
                <MesocycleTimeline
                  mesocycles={timelineItems}
                  totalWeeks={currentProgram.totalWeeks}
                  onMesocycleClick={handleMesocycleClick}
                  onAddMesocycle={handleAddMesocycle}
                />
              </div>
            </div>
          )}

          {/* Weekly Split Designer */}
          {currentProgram && weeklySplit && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-8 shadow-xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-3xl" />
              <div className="relative z-10">
                <WeeklySplitDesigner
                  split={weeklySplit}
                  availableSessions={sessionTemplates}
                  onUpdateSplit={() => toast('Edición de splits próximamente', { icon: 'ℹ️' })}
                  onCreateSession={handleCreateSession}
                />
              </div>
            </div>
          )}

          {/* Analytics Section - Coming Soon */}
          {currentProgram && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 p-12 shadow-xl text-center">
              <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 blur-3xl" />
              <div className="relative z-10 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white">
                  Analytics Avanzados
                </h3>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Análisis de volumen por grupo muscular, distribución de rangos de reps,
                  ratios de balance muscular y scores de recuperación próximamente.
                </p>
                <button
                  onClick={() => toast.success('Feature en desarrollo')}
                  className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:scale-105"
                >
                  Notificarme Cuando Esté Listo
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: Edit3,
                label: 'Editar Split Semanal',
                action: () => toast.success('Modo edición activado'),
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: Zap,
                label: 'Avanzar Mesociclo',
                action: handleAddMesocycle,
                gradient: 'from-violet-500 to-fuchsia-500',
              },
              {
                icon: Activity,
                label: 'Ver Programa Completo',
                action: () => handleViewChange('programs'),
                gradient: 'from-emerald-500 to-teal-500',
              },
            ].map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                className="group relative overflow-hidden rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-6 transition-all hover:scale-105"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                />
                <div className="relative z-10 text-center space-y-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mx-auto shadow-lg`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-white">{action.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <PlanOverviewHub />;
      case 'programs':
        return (
          <MyRoutines
          onCreateNew={() => handleViewChange('create-program')}
          onEditProgram={program => {
            setEditingProgram(program);
            setCurrentView('create-program');
          }}
        />
        );
      case 'create-program':
        return (
          <CreateProgram
            editingProgram={editingProgram ?? undefined}
            onProgramCreated={handleProgramCreated}
            onBack={() => handleViewChange('programs')}
          />
        );
      case 'habits':
        return <HabitsAndNotes />;
      case 'history':
        return <History />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <PlanOverviewHub />;
    }
  };

  return (
    <div className="min-h-screen gradient-background">
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
        userName={user?.email?.split('@')[0] || 'Arquitecto'}
        onSignOut={signOut}
      />
      <main className="relative z-10">{renderCurrentView()}</main>
    </div>
  );
}
