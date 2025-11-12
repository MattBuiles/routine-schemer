'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  User,
  Edit3,
  Save,
  Camera,
  Target,
  Activity,
  TrendingUp,
  Weight,
  Heart,
  Crown,
  Loader2
} from 'lucide-react';
import { UserProfile, ActivityLevel, ExperienceLevel, TrainingGoal } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { supabaseService } from '@/lib/supabaseService';

const activityLevelLabels = {
  sedentary: 'Sedentario',
  lightly_active: 'Ligeramente activo',
  moderately_active: 'Moderadamente activo',
  very_active: 'Muy activo',
  extremely_active: 'Extremadamente activo'
};

const experienceLevelLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  expert: 'Experto'
};

const trainingGoalLabels = {
  muscle_gain: 'Ganancia muscular',
  strength: 'Fuerza',
  fat_loss: 'Pérdida de grasa',
  endurance: 'Resistencia',
  general_fitness: 'Fitness general',
  sport_specific: 'Deportivo específico'
};

export function Profile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'goals' | 'preferences'>('personal');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userProfile = await supabaseService.getUserProfile(user.id);
        setProfile(userProfile || {
          id: user.id,
          userId: user.id,
          age: 25,
          weight: 70,
          height: 170,
          activityLevel: 'moderately_active',
          goals: ['muscle_gain'],
          experience: 'beginner',
          preferences: {
            theme: 'dark',
            language: 'es',
            notifications: {
              workoutReminders: true,
              habitReminders: true,
              progressUpdates: true,
              emailNotifications: false
            },
            defaultRestTime: 90,
            units: 'metric',
            weekStartDay: 'monday'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    
    try {
      await supabaseService.updateUserProfile(user.id, profile);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferencesChange = (field: string, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [field]: value
        }
      }
    }));
  };

  const toggleGoal = (goal: TrainingGoal) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const calculateBMI = () => {
    if (profile?.weight && profile?.height) {
      const heightInMeters = profile.height / 100;
      return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No se pudo cargar el perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                Mi Perfil
              </h1>
              <p className="text-gray-400 text-lg">Gestiona tu información personal y preferencias</p>
              <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full mt-4"></div>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Guardar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar Perfil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="glass border-white/20 p-6 mb-8">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                U
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-bold text-white">Usuario Premium</h2>
                <Crown className="h-6 w-6 text-yellow-400" />
              </div>
              <p className="text-gray-400 mb-4">Miembro desde enero 2024</p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400">BMI</p>
                  <p className="text-lg font-semibold text-white">{calculateBMI()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Experiencia</p>
                  <p className="text-lg font-semibold text-white">
                    {experienceLevelLabels[profile.experience]}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Actividad</p>
                  <p className="text-lg font-semibold text-white">
                    {activityLevelLabels[profile.activityLevel]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section Tabs */}
        <div className="flex space-x-1 glass rounded-lg p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveSection('personal')}
            className={`px-6 py-2 rounded-md transition-all duration-200 ${
              activeSection === 'personal'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Datos Personales
          </button>
          <button
            onClick={() => setActiveSection('goals')}
            className={`px-6 py-2 rounded-md transition-all duration-200 ${
              activeSection === 'goals'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Target className="h-4 w-4 inline mr-2" />
            Objetivos
          </button>
          <button
            onClick={() => setActiveSection('preferences')}
            className={`px-6 py-2 rounded-md transition-all duration-200 ${
              activeSection === 'preferences'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Preferencias
          </button>
        </div>

        {/* Personal Data Section */}
        {activeSection === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Physical Stats */}
            <Card className="glass border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Weight className="h-5 w-5 mr-2" />
                Datos Físicos
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Edad</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={profile.age || ''}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                      className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">{profile.age} años</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Peso (kg)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={profile.weight || ''}
                      onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
                      className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">{profile.weight} kg</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Altura (cm)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={profile.height || ''}
                      onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                      className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">{profile.height} cm</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Grasa corporal (%)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.1"
                      value={profile.bodyFat || ''}
                      onChange={(e) => handleInputChange('bodyFat', parseFloat(e.target.value))}
                      className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">{profile.bodyFat}%</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Experience & Activity */}
            <Card className="glass border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Experiencia y Actividad
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nivel de experiencia</label>
                  {isEditing ? (
                    <select
                      value={profile.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value as ExperienceLevel)}
                      className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none bg-transparent"
                    >
                      {Object.entries(experienceLevelLabels).map(([key, label]) => (
                        <option key={key} value={key} className="bg-gray-800">{label}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white">{experienceLevelLabels[profile.experience]}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nivel de actividad</label>
                  {isEditing ? (
                    <select
                      value={profile.activityLevel}
                      onChange={(e) => handleInputChange('activityLevel', e.target.value as ActivityLevel)}
                      className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none bg-transparent"
                    >
                      {Object.entries(activityLevelLabels).map(([key, label]) => (
                        <option key={key} value={key} className="bg-gray-800">{label}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-white">{activityLevelLabels[profile.activityLevel]}</p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Goals Section */}
        {activeSection === 'goals' && (
          <Card className="glass border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Objetivos de Entrenamiento
            </h3>
            <p className="text-gray-400 mb-6">Selecciona tus objetivos principales (puedes elegir varios)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(trainingGoalLabels).map(([key, label]) => {
                const isSelected = profile.goals.includes(key as TrainingGoal);
                return (
                  <button
                    key={key}
                    onClick={() => isEditing && toggleGoal(key as TrainingGoal)}
                    disabled={!isEditing}
                    className={`
                      p-4 rounded-lg border transition-all duration-200 text-left
                      ${isSelected 
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' 
                        : 'glass border-white/20 text-gray-300 hover:border-white/30'
                      }
                      ${isEditing ? 'cursor-pointer' : 'cursor-default'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{label}</span>
                      {isSelected && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Preferences Section */}
        {activeSection === 'preferences' && (
          <div className="space-y-6">
            {/* General Preferences */}
            <Card className="glass border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Preferencias Generales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Sistema de unidades</label>
                  {isEditing ? (
                    <select
                      value={profile.preferences.units}
                      onChange={(e) => handlePreferencesChange('units', e.target.value)}
                      className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none bg-transparent"
                    >
                      <option value="metric" className="bg-gray-800">Métrico (kg, cm)</option>
                      <option value="imperial" className="bg-gray-800">Imperial (lb, ft)</option>
                    </select>
                  ) : (
                    <p className="text-white">{profile.preferences.units === 'metric' ? 'Métrico' : 'Imperial'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Descanso por defecto (segundos)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={profile.preferences.defaultRestTime}
                      onChange={(e) => handlePreferencesChange('defaultRestTime', parseInt(e.target.value))}
                      className="w-full p-3 glass rounded-lg text-white border border-white/20 focus:border-white/40 focus:outline-none"
                    />
                  ) : (
                    <p className="text-white">{profile.preferences.defaultRestTime} segundos</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="glass border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Notificaciones
              </h3>
              <div className="space-y-4">
                {Object.entries(profile.preferences.notifications).map(([key, value]) => {
                  const labels = {
                    workoutReminders: 'Recordatorios de entrenamiento',
                    habitReminders: 'Recordatorios de hábitos',
                    progressUpdates: 'Actualizaciones de progreso',
                    emailNotifications: 'Notificaciones por email'
                  };
                  
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-white">{labels[key as keyof typeof labels]}</span>
                      <button
                        onClick={() => isEditing && handleNotificationChange(key, !value)}
                        disabled={!isEditing}
                        className={`
                          relative w-12 h-6 rounded-full transition-colors duration-200
                          ${value ? 'bg-blue-500' : 'bg-gray-600'}
                          ${isEditing ? 'cursor-pointer' : 'cursor-default'}
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
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
