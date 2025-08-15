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
    <div className="relative z-10 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-luxury mb-2">Configuración</h1>
          <p className="text-gray-400">Personaliza tu experiencia en Routine Schemer</p>
        </div>

        {/* Section Tabs */}
        <div className="flex space-x-1 glass rounded-lg p-1 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveSection('general')}
            className={`px-6 py-2 rounded-md transition-all duration-200 whitespace-nowrap ${
              activeSection === 'general'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <SettingsIcon className="h-4 w-4 inline mr-2" />
            General
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className={`px-6 py-2 rounded-md transition-all duration-200 whitespace-nowrap ${
              activeSection === 'notifications'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bell className="h-4 w-4 inline mr-2" />
            Notificaciones
          </button>
          <button
            onClick={() => setActiveSection('privacy')}
            className={`px-6 py-2 rounded-md transition-all duration-200 whitespace-nowrap ${
              activeSection === 'privacy'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Privacidad
          </button>
          <button
            onClick={() => setActiveSection('data')}
            className={`px-6 py-2 rounded-md transition-all duration-200 whitespace-nowrap ${
              activeSection === 'data'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Database className="h-4 w-4 inline mr-2" />
            Datos
          </button>
        </div>

        {/* General Settings */}
        {activeSection === 'general' && (
          <div className="space-y-6">
            {/* Appearance */}
            <Card className="glass border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Moon className="h-5 w-5 mr-2" />
                Apariencia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tema</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', '', e.target.value)}
                    className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none bg-transparent"
                  >
                    <option value="light" className="bg-gray-800">Claro</option>
                    <option value="dark" className="bg-gray-800">Oscuro</option>
                    <option value="auto" className="bg-gray-800">Automático</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Idioma</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', '', e.target.value)}
                    className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none bg-transparent"
                  >
                    <option value="es" className="bg-gray-800">Español</option>
                    <option value="en" className="bg-gray-800">English</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Units and Calendar */}
            <Card className="glass border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Unidades y Calendario
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Sistema de unidades</label>
                  <select
                    value={settings.units}
                    onChange={(e) => handleSettingChange('units', '', e.target.value)}
                    className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none bg-transparent"
                  >
                    <option value="metric" className="bg-gray-800">Métrico (kg, cm)</option>
                    <option value="imperial" className="bg-gray-800">Imperial (lb, ft)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Inicio de semana</label>
                  <select
                    value={settings.weekStartDay}
                    onChange={(e) => handleSettingChange('weekStartDay', '', e.target.value)}
                    className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none bg-transparent"
                  >
                    <option value="monday" className="bg-gray-800">Lunes</option>
                    <option value="sunday" className="bg-gray-800">Domingo</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Auto-save */}
            <Card className="glass border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Save className="h-5 w-5 mr-2" />
                Guardado Automático
              </h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-medium">Guardado automático</p>
                  <p className="text-sm text-gray-400">Guarda automáticamente los cambios mientras trabajas</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoSave', '', !settings.autoSave)}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer
                    ${settings.autoSave ? 'bg-blue-500' : 'bg-gray-600'}
                  `}
                >
                  <div
                    className={`
                      absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
                      ${settings.autoSave ? 'transform translate-x-7' : 'transform translate-x-1'}
                    `}
                  />
                </button>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Frecuencia de respaldo</label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleSettingChange('backupFrequency', '', e.target.value)}
                  className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none bg-transparent"
                >
                  <option value="daily" className="bg-gray-800">Diario</option>
                  <option value="weekly" className="bg-gray-800">Semanal</option>
                  <option value="manual" className="bg-gray-800">Manual</option>
                </select>
              </div>
            </Card>
          </div>
        )}

        {/* Notifications Settings */}
        {activeSection === 'notifications' && (
          <Card className="glass border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Configuración de Notificaciones
            </h3>
            <div className="space-y-6">
              {Object.entries(settings.notifications).map(([key, value]) => {
                const labels = {
                  workoutReminders: {
                    title: 'Recordatorios de entrenamiento',
                    description: 'Recibe notificaciones para tus sesiones programadas'
                  },
                  habitReminders: {
                    title: 'Recordatorios de hábitos',
                    description: 'Notificaciones para mantener tus hábitos saludables'
                  },
                  progressUpdates: {
                    title: 'Actualizaciones de progreso',
                    description: 'Resúmenes semanales y logros alcanzados'
                  },
                  emailNotifications: {
                    title: 'Notificaciones por email',
                    description: 'Recibe notificaciones importantes por correo electrónico'
                  },
                  pushNotifications: {
                    title: 'Notificaciones push',
                    description: 'Notificaciones en tiempo real en tu dispositivo'
                  }
                };
                
                const config = labels[key as keyof typeof labels];
                
                return (
                  <div key={key} className="flex items-center justify-between py-4 border-b border-white/10 last:border-b-0">
                    <div>
                      <p className="text-white font-medium">{config.title}</p>
                      <p className="text-sm text-gray-400">{config.description}</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('notifications', key, !value)}
                      className={`
                        relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer
                        ${value ? 'bg-blue-500' : 'bg-gray-600'}
                      `}
                    >
                      <div
                        className={`
                          absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
                          ${value ? 'transform translate-x-7' : 'transform translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Privacy Settings */}
        {activeSection === 'privacy' && (
          <Card className="glass border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Privacidad y Datos
            </h3>
            <div className="space-y-6">
              {Object.entries(settings.privacy).map(([key, value]) => {
                const labels = {
                  shareData: {
                    title: 'Compartir datos anónimos',
                    description: 'Ayuda a mejorar la aplicación compartiendo datos de uso anónimos'
                  },
                  analytics: {
                    title: 'Análisis de uso',
                    description: 'Permite recopilar estadísticas de uso para mejorar la experiencia'
                  },
                  crashReports: {
                    title: 'Reportes de errores',
                    description: 'Envía automáticamente reportes de errores para ayudar a solucionarlos'
                  }
                };
                
                const config = labels[key as keyof typeof labels];
                
                return (
                  <div key={key} className="flex items-center justify-between py-4 border-b border-white/10 last:border-b-0">
                    <div>
                      <p className="text-white font-medium">{config.title}</p>
                      <p className="text-sm text-gray-400">{config.description}</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('privacy', key, !value)}
                      className={`
                        relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer
                        ${value ? 'bg-blue-500' : 'bg-gray-600'}
                      `}
                    >
                      <div
                        className={`
                          absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200
                          ${value ? 'transform translate-x-7' : 'transform translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Data Management */}
        {activeSection === 'data' && (
          <div className="space-y-6">
            {/* Import/Export */}
            <Card className="glass border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Gestión de Datos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleExportData}
                  variant="ghost"
                  className="glass hover:bg-white/10 text-white border border-white/20 p-4 h-auto flex-col"
                >
                  <Download className="h-6 w-6 mb-2" />
                  <span className="font-medium">Exportar Datos</span>
                  <span className="text-xs text-gray-400 mt-1">Descarga una copia de tus datos</span>
                </Button>
                
                <Button
                  onClick={handleImportData}
                  variant="ghost"
                  className="glass hover:bg-white/10 text-white border border-white/20 p-4 h-auto flex-col"
                >
                  <Upload className="h-6 w-6 mb-2" />
                  <span className="font-medium">Importar Datos</span>
                  <span className="text-xs text-gray-400 mt-1">Restaura datos desde un archivo</span>
                </Button>
              </div>
            </Card>

            {/* Data Retention */}
            <Card className="glass border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Retención de Datos
              </h3>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Mantener datos por</label>
                <select
                  value={settings.dataRetention}
                  onChange={(e) => handleSettingChange('dataRetention', '', e.target.value)}
                  className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none bg-transparent"
                >
                  <option value="1year" className="bg-gray-800">1 año</option>
                  <option value="2years" className="bg-gray-800">2 años</option>
                  <option value="5years" className="bg-gray-800">5 años</option>
                  <option value="forever" className="bg-gray-800">Indefinidamente</option>
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  Los datos más antiguos serán eliminados automáticamente después del período seleccionado
                </p>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card className="glass border-red-500/20 p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Zona Peligrosa
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Restablecer configuración</p>
                    <p className="text-sm text-gray-400">Vuelve a los valores predeterminados</p>
                  </div>
                  <Button
                    onClick={() => setShowResetConfirm(true)}
                    variant="ghost"
                    className="border border-red-500/40 text-red-400 hover:bg-red-500/10"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restablecer
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Eliminar todos los datos</p>
                    <p className="text-sm text-gray-400">Esta acción no se puede deshacer</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="border border-red-500/40 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
          <div>
            {showResetConfirm && (
              <div className="flex items-center space-x-3">
                <span className="text-red-400 text-sm">¿Estás seguro?</span>
                <Button
                  onClick={handleResetSettings}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white border-0"
                >
                  Sí, restablecer
                </Button>
                <Button
                  onClick={() => setShowResetConfirm(false)}
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white border-0"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
