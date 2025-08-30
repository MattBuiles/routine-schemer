'use client';

import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { AppSettings } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { firestoreService } from '@/lib/firestoreService';
import toast from 'react-hot-toast';

// Default settings that match the AppSettings interface
const createDefaultSettings = (userId: string): Omit<AppSettings, 'id' | 'createdAt' | 'updatedAt'> => ({
  userId,
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
    pushNotifications: true,
  },
  privacy: {
    shareData: false,
    analytics: true,
    crashReports: true,
  },
});

export function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'general' | 'notifications' | 'privacy' | 'data'>('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load settings from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const settingsArray = await firestoreService.getAppSettingsByUserId(user.id);
        if (settingsArray.length > 0) {
          setSettings(settingsArray[0]);
        } else {
          // Create default settings if none exist
          const defaultSettingsData = createDefaultSettings(user.id);
          setSettings({
            ...defaultSettingsData,
            id: 'temp-id',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to default settings
        const defaultSettingsData = createDefaultSettings(user.id);
        setSettings({
          ...defaultSettingsData,
          id: 'temp-id',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.error('Could not load settings, using defaults');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSettingChange = (section: keyof Omit<AppSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, key: string, value: string | number | boolean) => {
    if (!settings) return;
    setSettings(prev => prev ? ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section] as object, [key]: value }
        : value
    }) : null);
  };

  const handleSaveSettings = async () => {
    if (!settings || !user) return;
    
    setIsSaving(true);
    try {
      // Check if settings exist
      const existingSettings = await firestoreService.getAppSettingsByUserId(user.id);
      
      if (existingSettings.length > 0) {
        // Update existing settings
        await firestoreService.updateAppSettings(settings.id, {
          ...settings,
          updatedAt: new Date()
        });
        toast.success('Settings updated successfully!');
      } else {
        // Create new settings
        const { id, createdAt, updatedAt, ...settingsData } = settings;
        const newSettings = await firestoreService.createAppSettings(settingsData);
        setSettings(newSettings);
        toast.success('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Changes saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!user) return;
    
    const defaultSettingsData = createDefaultSettings(user.id);
    const resetSettings = {
      ...defaultSettingsData,
      id: settings?.id || 'temp-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSettings(resetSettings);
    setShowResetConfirm(false);
    toast.success('Settings reset to defaults');
  };

  const handleExportData = () => {
    if (!settings) return;
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `routine-schemer-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Settings exported successfully');
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          if (importedSettings && user) {
            setSettings({
              ...importedSettings,
              userId: user.id,
              id: settings?.id || 'temp-id',
              updatedAt: new Date(),
            });
            toast.success('Settings imported successfully');
          }
        } catch (error) {
          toast.error('Invalid settings file');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  // Loading state
  if (isLoading || !settings) {
    return (
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4 w-48"></div>
            <div className="h-4 bg-gray-700 rounded mb-8 w-64"></div>
            <div className="card-modern h-64 bg-gray-800/50"></div>
          </div>
        </div>
      </div>
    );
  }

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
