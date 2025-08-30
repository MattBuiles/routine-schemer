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
    <div className="settings-container">
      <div className="settings-background"></div>
      
      <div className="settings-main">
        {/* Header */}
        <div className="settings-header">
          <h1 className="settings-title">Configuración</h1>
          <p className="settings-subtitle">Personaliza tu experiencia en Routine Schemer</p>
          <div className="settings-divider"></div>
        </div>

        {/* Section Navigation */}
        <div className="settings-navigation">
          <button
            onClick={() => setActiveSection('general')}
            className={`settings-nav-item ${activeSection === 'general' ? 'active' : ''}`}
          >
            <SettingsIcon className="h-4 w-4" />
            General
          </button>
          <button
            onClick={() => setActiveSection('notifications')}
            className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
          >
            <Bell className="h-4 w-4" />
            Notificaciones
          </button>
          <button
            onClick={() => setActiveSection('privacy')}
            className={`settings-nav-item ${activeSection === 'privacy' ? 'active' : ''}`}
          >
            <Shield className="h-4 w-4" />
            Privacidad
          </button>
          <button
            onClick={() => setActiveSection('data')}
            className={`settings-nav-item ${activeSection === 'data' ? 'active' : ''}`}
          >
            <Database className="h-4 w-4" />
            Datos
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="settings-section">
              {/* Appearance */}
              <div className="settings-section-title">
                <Moon className="h-5 w-5" />
                Apariencia
              </div>
              <p className="settings-section-description">
                Personaliza la apariencia y el idioma de la aplicación
              </p>
              <div className="settings-grid">
                <div className="settings-item">
                  <div className="settings-item-header">
                    <div className="settings-item-info">
                      <div className="settings-item-title">Tema</div>
                      <div className="settings-item-description">Selecciona tu tema preferido</div>
                    </div>
                    <div className="settings-control">
                      <select
                        value={settings.theme}
                        onChange={(e) => handleSettingChange('theme', '', e.target.value)}
                        className="settings-select"
                      >
                        <option value="light">Claro</option>
                        <option value="dark">Oscuro</option>
                        <option value="auto">Automático</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="settings-item">
                  <div className="settings-item-header">
                    <div className="settings-item-info">
                      <div className="settings-item-title">Idioma</div>
                      <div className="settings-item-description">Idioma de la interfaz</div>
                    </div>
                    <div className="settings-control">
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', '', e.target.value)}
                        className="settings-select"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Units and Calendar */}
              <div className="settings-section-title">
                <Globe className="h-5 w-5" />
                Unidades y Calendario
              </div>
              <p className="settings-section-description">
                Configura las unidades de medida y preferencias de calendario
              </p>
              <div className="settings-grid">
                <div className="settings-item">
                  <div className="settings-item-header">
                    <div className="settings-item-info">
                      <div className="settings-item-title">Sistema de unidades</div>
                      <div className="settings-item-description">Métrico o imperial</div>
                    </div>
                    <div className="settings-control">
                      <select
                        value={settings.units}
                        onChange={(e) => handleSettingChange('units', '', e.target.value)}
                        className="settings-select"
                      >
                        <option value="metric">Métrico (kg, cm)</option>
                        <option value="imperial">Imperial (lb, ft)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="settings-item">
                  <div className="settings-item-header">
                    <div className="settings-item-info">
                      <div className="settings-item-title">Inicio de semana</div>
                      <div className="settings-item-description">Primer día de la semana</div>
                    </div>
                    <div className="settings-control">
                      <select
                        value={settings.weekStartDay}
                        onChange={(e) => handleSettingChange('weekStartDay', '', e.target.value)}
                        className="settings-select"
                      >
                        <option value="monday">Lunes</option>
                        <option value="sunday">Domingo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto Save */}
              <div className="settings-section-title">
                <Save className="h-5 w-5" />
                Guardado Automático
              </div>
              <p className="settings-section-description">
                Configura cómo se guardan tus datos automáticamente
              </p>
              <div className="settings-grid">
                <div className="settings-item">
                  <div className="settings-item-header">
                    <div className="settings-item-info">
                      <div className="settings-item-title">Guardado automático</div>
                      <div className="settings-item-description">Guarda automáticamente los cambios mientras trabajas</div>
                    </div>
                    <div className="settings-control">
                      <div 
                        className={`settings-toggle ${settings.autoSave ? 'active' : ''}`}
                        onClick={() => handleSettingChange('autoSave', '', !settings.autoSave)}
                      >
                        <div className="settings-toggle-handle"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="settings-item">
                  <div className="settings-item-header">
                    <div className="settings-item-info">
                      <div className="settings-item-title">Frecuencia de respaldo</div>
                      <div className="settings-item-description">Con qué frecuencia crear respaldos</div>
                    </div>
                    <div className="settings-control">
                      <select
                        value={settings.backupFrequency}
                        onChange={(e) => handleSettingChange('backupFrequency', '', e.target.value)}
                        className="settings-select"
                      >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Actions */}
          <div className="settings-actions">
            <button onClick={handleSaveSettings} className="settings-btn settings-btn-primary">
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
