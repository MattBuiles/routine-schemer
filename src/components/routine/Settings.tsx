'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Settings as SettingsIcon,
  Shield,
  Download,
  Upload,
  Trash2,
  Bell,
  Moon,
  Globe,
  Database,
  Key,
  AlertTriangle,
  Save,
  RotateCcw
} from 'lucide-react';

interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  weekStartDay: 'monday' | 'sunday';
  units: 'metric' | 'imperial';
  autoSave: boolean;
  backupFrequency: 'daily' | 'weekly' | 'manual';
  dataRetention: '1year' | '2years' | '5years' | 'forever';
  notifications: {
    workoutReminders: boolean;
    habitReminders: boolean;
    progressUpdates: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  privacy: {
    shareData: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'es',
  weekStartDay: 'monday',
  units: 'metric',
  autoSave: true,
  backupFrequency: 'weekly',
  dataRetention: '2years',
  notifications: {
    workoutReminders: true,
    habitReminders: true,
    progressUpdates: true,
    emailNotifications: false,
    pushNotifications: true
  },
  privacy: {
    shareData: false,
    analytics: true,
    crashReports: true
  }
};

export function Settings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [activeSection, setActiveSection] = useState<'general' | 'notifications' | 'privacy' | 'data'>('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSettingChange = (section: keyof AppSettings, key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section] as object, [key]: value }
        : value
    }));
  };

  const handleSaveSettings = () => {
    // Aquí iría la lógica para guardar en Firebase/localStorage
    console.log('Guardando configuración:', settings);
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    setShowResetConfirm(false);
  };

  const handleExportData = () => {
    // Lógica para exportar datos
    console.log('Exportando datos...');
  };

  const handleImportData = () => {
    // Lógica para importar datos
    console.log('Importando datos...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
            Configuración
          </h1>
          <p className="text-gray-400 text-lg">Personaliza tu experiencia en Routine Schemer</p>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full mt-4"></div>
        </div>

        {/* Section Navigation */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setActiveSection('general')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeSection === 'general'
                ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-xl'
            }`}
          >
            <SettingsIcon className="h-4 w-4" />
            General
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeSection === 'notifications'
                ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-xl'
            }`}
          >
            <Bell className="h-4 w-4" />
            Notificaciones
          </button>
          <button
            onClick={() => setActiveSection('privacy')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeSection === 'privacy'
                ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-xl'
            }`}
          >
            <Shield className="h-4 w-4" />
            Privacidad
          </button>
          <button
            onClick={() => setActiveSection('data')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
              activeSection === 'data'
                ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 backdrop-blur-xl'
            }`}
          >
            <Database className="h-4 w-4" />
            Datos
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="space-y-6">
              {/* Appearance */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-violet-500/20 rounded-lg">
                    <Moon className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Apariencia</h3>
                    <p className="text-sm text-gray-400">Personaliza la apariencia y el idioma de la aplicación</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <div className="text-white font-medium mb-1">Tema</div>
                      <div className="text-sm text-gray-400">Selecciona tu tema preferido</div>
                    </div>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', '', e.target.value)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Oscuro</option>
                      <option value="auto">Automático</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <div className="text-white font-medium mb-1">Idioma</div>
                      <div className="text-sm text-gray-400">Idioma de la interfaz</div>
                    </div>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', '', e.target.value)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Units and Calendar */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Unidades y Calendario</h3>
                    <p className="text-sm text-gray-400">Configura las unidades de medida y preferencias de calendario</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <div className="text-white font-medium mb-1">Sistema de unidades</div>
                      <div className="text-sm text-gray-400">Métrico o imperial</div>
                    </div>
                    <select
                      value={settings.units}
                      onChange={(e) => handleSettingChange('units', '', e.target.value)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="metric">Métrico (kg, cm)</option>
                      <option value="imperial">Imperial (lb, ft)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <div className="text-white font-medium mb-1">Inicio de semana</div>
                      <div className="text-sm text-gray-400">Primer día de la semana</div>
                    </div>
                    <select
                      value={settings.weekStartDay}
                      onChange={(e) => handleSettingChange('weekStartDay', '', e.target.value)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="monday">Lunes</option>
                      <option value="sunday">Domingo</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Actions */}
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={handleSaveSettings} 
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
