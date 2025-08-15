'use client';

import React from 'react';
import { 
  Home,
  Calendar,
  Dumbbell,
  Plus,
  BookOpen,
  Heart,
  History,
  User,
  Settings,
  LogOut
} from 'lucide-react';

export type NavigationView = 
  | 'dashboard'
  | 'my-routines'
  | 'create-routine'
  | 'calendar'
  | 'exercises'
  | 'habits-notes'
  | 'history'
  | 'profile'
  | 'settings';

interface NavigationProps {
  currentView: NavigationView;
  onViewChange: (view: NavigationView) => void;
  userName?: string;
  onSignOut: () => void;
}

const navigationItems = [
  {
    id: 'dashboard' as NavigationView,
    label: 'Dashboard',
    icon: Home,
    description: 'Resumen general'
  },
  {
    id: 'my-routines' as NavigationView,
    label: 'Mis Rutinas',
    icon: Dumbbell,
    description: 'Rutinas creadas'
  },
  {
    id: 'create-routine' as NavigationView,
    label: 'Crear Rutina',
    icon: Plus,
    description: 'Nueva rutina'
  },
  {
    id: 'calendar' as NavigationView,
    label: 'Calendario',
    icon: Calendar,
    description: 'Planificación'
  },
  {
    id: 'exercises' as NavigationView,
    label: 'Ejercicios',
    icon: BookOpen,
    description: 'Biblioteca'
  },
  {
    id: 'habits-notes' as NavigationView,
    label: 'Hábitos y Notas',
    icon: Heart,
    description: 'Bienestar'
  },
  {
    id: 'history' as NavigationView,
    label: 'Historial',
    icon: History,
    description: 'Progreso'
  },
  {
    id: 'profile' as NavigationView,
    label: 'Perfil',
    icon: User,
    description: 'Datos personales'
  },
  {
    id: 'settings' as NavigationView,
    label: 'Configuración',
    icon: Settings,
    description: 'Ajustes'
  }
];

export function Navigation({ currentView, onViewChange, userName, onSignOut }: NavigationProps) {
  return (
    <div className="dashboard-header">
      <div className="dashboard-header-content">
        {/* Logo Section */}
        <div className="dashboard-logo">
          <div className="dashboard-logo-icon">
            <div className="dashboard-logo-icon-inner"></div>
          </div>
          <h1 className="dashboard-title">Routine Schemer</h1>
        </div>

        {/* User Section */}
        <div className="dashboard-user-section">
          {/* Quick Stats */}
          <div className="dashboard-stats-mini">
            <div className="dashboard-stat-mini">
              <div className="dashboard-stat-mini-number">5</div>
              <div className="dashboard-stat-mini-label">Rutinas</div>
            </div>
            <div className="dashboard-stat-mini">
              <div className="dashboard-stat-mini-number">3</div>
              <div className="dashboard-stat-mini-label">Semana</div>
            </div>
          </div>

          {/* User Info */}
          <div className="dashboard-user-info">
            <div className="dashboard-user-avatar">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="dashboard-user-details">
              <h3>{userName || 'Usuario'}</h3>
              <p>Atleta Premium</p>
            </div>
          </div>

          {/* Sign Out Button */}
          <button onClick={onSignOut} className="dashboard-signout-btn">
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div style={{ background: 'rgba(15, 23, 42, 0.9)', padding: '1rem 0', borderTop: '1px solid rgba(71, 85, 105, 0.2)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`dashboard-action-btn ${isActive ? 'dashboard-category-card-selected' : ''}`}
                  style={{ 
                    minWidth: '120px',
                    padding: '0.75rem 1rem',
                    background: isActive ? 'rgba(94, 234, 212, 0.15)' : 'rgba(71, 85, 105, 0.2)',
                    borderColor: isActive ? 'rgba(94, 234, 212, 0.5)' : 'rgba(71, 85, 105, 0.3)'
                  }}
                >
                  <div className="dashboard-action-icon" style={{ marginBottom: '0.5rem' }}>
                    <IconComponent className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="dashboard-action-label" style={{ fontSize: '0.75rem' }}>
                    {item.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navigation;
