'use client';

import React from 'react';
import { NavigationView } from '@/components/ui/navigation';
import { useDashboardData } from '@/hooks/useDashboardData';
import { 
  Plus,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Heart,
  BookOpen,
  Activity,
  CheckCircle,
  Zap,
  Loader2
} from 'lucide-react';

interface DashboardHomeProps {
  onViewChange: (view: NavigationView) => void;
}

function DashboardHome({ onViewChange }: DashboardHomeProps) {
  const { stats, recentActivity, todaySchedule, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-lg">Cargando datos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-2">Error al cargar los datos</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = stats.weeklyGoal > 0 ? (stats.weekSessions / stats.weeklyGoal) * 100 : 0;

  return (
    <div className="dashboard-main">
      {/* Welcome Section */}
      <div className="dashboard-welcome-section">
        <h1 className="dashboard-welcome-title">¡Bienvenido de vuelta!</h1>
        <p className="dashboard-welcome-subtitle">Continúa con tu progreso hacia tus objetivos de fitness</p>
        <div className="dashboard-divider"></div>
      </div>

      {/* Stats Overview */}
      <div className="dashboard-categories-grid">
        <div className="dashboard-category-card">
          <div className="dashboard-category-icon">
            <Target className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="dashboard-category-title">Rutinas Activas</h3>
          <div className="dashboard-category-stats">
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">{stats.activeRoutines}</span>
              <span className="dashboard-category-stat-label">Activas</span>
            </div>
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">{stats.totalRoutines}</span>
              <span className="dashboard-category-stat-label">Total</span>
            </div>
          </div>
        </div>

        <div className="dashboard-category-card">
          <div className="dashboard-category-icon">
            <Calendar className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="dashboard-category-title">Esta Semana</h3>
          <div className="dashboard-category-stats">
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">{stats.weekSessions}</span>
              <span className="dashboard-category-stat-label">Sesiones</span>
            </div>
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">{stats.weeklyGoal}</span>
              <span className="dashboard-category-stat-label">Meta</span>
            </div>
          </div>
        </div>

        <div className="dashboard-category-card">
          <div className="dashboard-category-icon">
            <TrendingUp className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="dashboard-category-title">Racha Actual</h3>
          <div className="dashboard-category-stats">
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">{stats.currentStreak}</span>
              <span className="dashboard-category-stat-label">Días</span>
            </div>
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">🔥</span>
              <span className="dashboard-category-stat-label">Activo</span>
            </div>
          </div>
        </div>

        <div className="dashboard-category-card">
          <div className="dashboard-category-icon">
            <CheckCircle className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="dashboard-category-title">Cumplimiento</h3>
          <div className="dashboard-category-stats">
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">{stats.completionRate}%</span>
              <span className="dashboard-category-stat-label">Éxito</span>
            </div>
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">{stats.totalSessions}</span>
              <span className="dashboard-category-stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="dashboard-quick-actions">
        <h2 className="dashboard-quick-actions-title">Acciones Rápidas</h2>
        <div className="dashboard-actions-grid">
          <button
            onClick={() => onViewChange('create-routine')}
            className="dashboard-action-btn"
          >
            <div className="dashboard-action-icon">
              <Plus className="h-6 w-6 text-slate-300" />
            </div>
            <div className="dashboard-action-label">Crear Rutina</div>
            <div className="text-xs text-slate-400">Nueva rutina</div>
          </button>
          <button
            onClick={() => onViewChange('calendar')}
            className="dashboard-action-btn"
          >
            <div className="dashboard-action-icon">
              <Calendar className="h-6 w-6 text-slate-300" />
            </div>
            <div className="dashboard-action-label">Ver Calendario</div>
            <div className="text-xs text-slate-400">Planificar semana</div>
          </button>
          <button
            onClick={() => onViewChange('exercises')}
            className="dashboard-action-btn"
          >
            <div className="dashboard-action-icon">
              <BookOpen className="h-6 w-6 text-slate-300" />
            </div>
            <div className="dashboard-action-label">Ejercicios</div>
            <div className="text-xs text-slate-400">Explorar biblioteca</div>
          </button>
          <button className="dashboard-action-btn">
            <div className="dashboard-action-icon">
              <Zap className="h-6 w-6 text-slate-300" />
            </div>
            <div className="dashboard-action-label">Entrenar Ahora</div>
            <div className="text-xs text-slate-400">Comenzar sesión rápida</div>
          </button>
        </div>
      </div>

      {/* Progress and Activity Section */}
      <div className="dashboard-categories-grid">
        {/* Progress Section */}
        <div className="dashboard-category-card dashboard-category-card-selected">
          <div className="dashboard-category-icon">
            <TrendingUp className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="dashboard-category-title">Progreso Semanal</h3>
          <p className="dashboard-category-description mb-4">
            {stats.weekSessions} / {stats.weeklyGoal} sesiones completadas
          </p>
          <div className="w-full bg-slate-600/30 rounded-full h-2 mb-4">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="dashboard-category-stats">
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">{Math.round(progressPercentage)}%</span>
              <span className="dashboard-category-stat-label">Completado</span>
            </div>
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">{stats.weeklyGoal - stats.weekSessions}</span>
              <span className="dashboard-category-stat-label">Restantes</span>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="dashboard-category-card">
          <div className="dashboard-category-icon">
            <Clock className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="dashboard-category-title">Programación de Hoy</h3>
          <div className="space-y-3 mt-4">
            {todaySchedule.map((session) => (
              <div 
                key={session.id}
                className={`dashboard-activity-item ${session.isNext ? 'border-emerald-500/40 bg-emerald-500/5' : ''}`}
              >
                <div className="dashboard-activity-icon">
                  <Clock className="h-4 w-4 text-slate-300" />
                </div>
                <div className="dashboard-activity-content">
                  <div className="dashboard-activity-action">{session.title}</div>
                  <div className="dashboard-activity-item-name">{session.duration} min</div>
                </div>
                <div className="dashboard-activity-time">
                  {session.completed ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : session.isNext ? (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  ) : (
                    <span className="text-xs">{session.time}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="dashboard-category-card lg:col-span-2">
            <div className="dashboard-category-icon">
              <Activity className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="dashboard-category-title">Actividad Reciente</h3>
            <div className="dashboard-activity-list mt-4">
              {recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="dashboard-activity-item">
                  <div className="dashboard-activity-icon">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="dashboard-activity-content">
                    <div className="dashboard-activity-action">
                      {activity.action} <span className="text-white">{activity.item}</span>
                    </div>
                    <div className="dashboard-activity-item-name">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when no activity */}
        {recentActivity.length === 0 && (
          <div className="dashboard-category-card lg:col-span-2">
            <div className="dashboard-category-icon">
              <Activity className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="dashboard-category-title">Actividad Reciente</h3>
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-400">¡Comienza tu journey fitness!</p>
              <p className="text-sm text-slate-500 mt-1">Tu actividad aparecerá aquí</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardHome;
