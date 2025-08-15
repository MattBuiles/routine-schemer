'use client';

import React from 'react';
import { NavigationView } from '@/components/ui/navigation';
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
  Zap
} from 'lucide-react';

interface DashboardHomeProps {
  onViewChange: (view: NavigationView) => void;
}

// Datos de ejemplo para el dashboard
const dashboardStats = {
  totalRoutines: 12,
  activeRoutines: 3,
  totalSessions: 156,
  weekSessions: 4,
  currentStreak: 5,
  weeklyGoal: 5,
  completionRate: 94
};

const recentActivity = [
  { 
    action: 'Completó', 
    item: 'Push Day - Hipertrofia', 
    time: '2 horas', 
    type: 'complete', 
    icon: CheckCircle, 
    color: 'text-green-400' 
  },
  { 
    action: 'Creó rutina', 
    item: 'Movilidad Matutina', 
    time: '1 día', 
    type: 'create', 
    icon: Plus, 
    color: 'text-blue-400' 
  },
  { 
    action: 'Hábito registrado', 
    item: 'Hidratación: 8/8 vasos', 
    time: '5 horas', 
    type: 'habit', 
    icon: Heart, 
    color: 'text-pink-400' 
  },
  { 
    action: 'Modificó', 
    item: 'Leg Day - Fuerza', 
    time: '2 días', 
    type: 'modify', 
    icon: Target, 
    color: 'text-orange-400' 
  }
];

const quickActions = [
  {
    id: 'new-session',
    title: 'Entrenar Ahora',
    description: 'Comenzar sesión rápida',
    icon: Zap,
    view: 'exercises' as NavigationView
  },
  {
    id: 'calendar',
    title: 'Ver Calendario',
    description: 'Planificar semana',
    icon: Calendar,
    view: 'calendar' as NavigationView
  },
  {
    id: 'exercises',
    title: 'Ejercicios',
    description: 'Explorar biblioteca',
    icon: BookOpen,
    view: 'exercises' as NavigationView
  },
  {
    id: 'create',
    title: 'Crear Rutina',
    description: 'Nueva rutina',
    icon: Plus,
    view: 'create-routine' as NavigationView
  }
];

const todaySchedule = [
  {
    id: '1',
    time: '07:00',
    title: 'Movilidad Matutina',
    type: 'mobility',
    duration: 15,
    completed: true
  },
  {
    id: '2',
    time: '18:00',
    title: 'Push Day - Hipertrofia',
    type: 'hypertrophy',
    duration: 75,
    completed: false,
    isNext: true
  },
  {
    id: '3',
    time: '21:00',
    title: 'Estiramientos',
    type: 'stretching',
    duration: 20,
    completed: false
  }
];

export function DashboardHome({ onViewChange }: DashboardHomeProps) {
  const progressPercentage = (dashboardStats.weekSessions / dashboardStats.weeklyGoal) * 100;

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
              <span className="dashboard-category-stat-number">{dashboardStats.activeRoutines}</span>
              <span className="dashboard-category-stat-label">Activas</span>
            </div>
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">{dashboardStats.totalRoutines}</span>
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
              <span className="dashboard-category-stat-number">{dashboardStats.weekSessions}</span>
              <span className="dashboard-category-stat-label">Sesiones</span>
            </div>
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">{dashboardStats.weeklyGoal}</span>
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
              <span className="dashboard-category-stat-number">{dashboardStats.currentStreak}</span>
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
              <span className="dashboard-category-stat-number">{dashboardStats.completionRate}%</span>
              <span className="dashboard-category-stat-label">Éxito</span>
            </div>
            <div className="dashboard-category-stat">
              <span className="dashboard-category-stat-number">{dashboardStats.totalSessions}</span>
              <span className="dashboard-category-stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="dashboard-quick-actions">
        <h2 className="dashboard-quick-actions-title">Acciones Rápidas</h2>
        <div className="dashboard-actions-grid">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => action.view && onViewChange(action.view)}
                className="dashboard-action-btn"
              >
                <div className="dashboard-action-icon">
                  <IconComponent className="h-6 w-6 text-slate-300" />
                </div>
                <div className="dashboard-action-label">{action.title}</div>
                <div className="text-xs text-slate-400">{action.description}</div>
              </button>
            );
          })}
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
            {dashboardStats.weekSessions} / {dashboardStats.weeklyGoal} sesiones completadas
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
              <span className="dashboard-category-stat-number">{dashboardStats.weeklyGoal - dashboardStats.weekSessions}</span>
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
        <div className="dashboard-category-card lg:col-span-2">
          <div className="dashboard-category-icon">
            <Activity className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="dashboard-category-title">Actividad Reciente</h3>
          <div className="dashboard-activity-list mt-4">
            {recentActivity.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <div key={index} className="dashboard-activity-item">
                  <div className="dashboard-activity-icon">
                    <IconComponent className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="dashboard-activity-content">
                    <div className="dashboard-activity-action">
                      {activity.action} <span className="text-white">{activity.item}</span>
                    </div>
                    <div className="dashboard-activity-item-name">hace {activity.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
