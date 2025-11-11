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
    <div className="sticky top-0 z-50 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-white/10 backdrop-blur-xl shadow-xl">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Routine Schemer</h1>
              <p className="text-xs text-gray-400">Professional Training</p>
            </div>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold text-white">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-white">{userName || 'Usuario'}</p>
                <p className="text-xs text-gray-400">Atleta Premium</p>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 rounded-xl transition-all duration-300 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/50 shadow-lg shadow-blue-500/20'
                    : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  <IconComponent className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} strokeWidth={2} />
                </div>
                <span className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Navigation;
