'use client';

import React from 'react';
import { 
  Home,
  Plus,
  User,
  Settings,
  LogOut,
  Target,
  Heart,
  BarChart3
} from 'lucide-react';

export type NavigationView = 
  | 'dashboard'
  | 'programs'
  | 'create-program'
  | 'habits'
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
    id: 'programs' as NavigationView,
    label: 'Programas',
    icon: Target,
    description: 'Programas de entrenamiento'
  },
  {
    id: 'create-program' as NavigationView,
    label: 'Crear Programa',
    icon: Plus,
    description: 'Nuevo programa'
  },
  {
    id: 'habits' as NavigationView,
    label: 'Hábitos y Notas',
    icon: Heart,
    description: 'Hábitos saludables y notas'
  },
  {
    id: 'history' as NavigationView,
    label: 'Historial',
    icon: BarChart3,
    description: 'Sesiones completadas'
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
    <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4 min-w-fit">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white">Routine Schemer</h1>
                <p className="text-xs text-gray-400">Planificación Estructural</p>
              </div>
            </div>
          </div>

          {/* Navigation Items - Horizontal Scroll */}
          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 min-w-max px-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`group relative px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden md:inline">{item.label}</span>
                    </div>
                    
                    {/* Tooltip on mobile */}
                    <div className="md:hidden absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3 min-w-fit">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{userName || 'Usuario'}</p>
              <p className="text-xs text-gray-400">Entrenador</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg">
              {(userName || 'U').charAt(0).toUpperCase()}
            </div>
            <button
              onClick={onSignOut}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
