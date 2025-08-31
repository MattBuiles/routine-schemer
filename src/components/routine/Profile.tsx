'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  User,
  Edit3,
  Camera,
  Target,
  Activity,
  TrendingUp,
  Weight,
  Heart,
  Crown,
  Check,
  X
} from 'lucide-react';
import { UserProfile, ActivityLevel, ExperienceLevel, TrainingGoal } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { firestoreService } from '@/lib/firestoreService';
import toast from 'react-hot-toast';

// Default profile template
const defaultProfileData = {
  age: 28,
  weight: 75.5,
  height: 178,
  bodyFat: 12.5,
  activityLevel: 'very_active' as const,
  goals: ['muscle_gain', 'strength'] as ('muscle_gain' | 'strength')[],
  experience: 'intermediate' as const,
  preferences: {
    theme: 'dark' as const,
    language: 'es' as const,
    notifications: {
      workoutReminders: true,
      habitReminders: true,
      progressUpdates: true,
      emailNotifications: false
    },
    defaultRestTime: 90,
    units: 'metric' as const,
    weekStartDay: 'monday' as const
  }
};

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
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'goals' | 'preferences'>('personal');

  // Load profile data from Firebase
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Try to get existing profile
        const profiles = await firestoreService.getUserProfilesByUserId(user.id);
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          // Create default profile if none exists
          const now = new Date();
          const defaultProfile: UserProfile = {
            id: `profile-${user.id}`,
            ...defaultProfileData,
            userId: user.id,
            createdAt: now,
            updatedAt: now,
          };
          setProfile(defaultProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fallback to default profile
        const now = new Date();
        setProfile({
          id: `profile-${user.id}`,
          ...defaultProfileData,
          userId: user.id,
          createdAt: now,
          updatedAt: now,
        });
        toast.error('Could not load profile data, using defaults');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!profile || !user) return;
    
    setIsSaving(true);
    try {
      // Check if profile exists
      const existingProfiles = await firestoreService.getUserProfilesByUserId(user.id);
      
      if (existingProfiles.length > 0) {
        // Update existing profile
        await firestoreService.updateUserProfile(profile.id, {
          ...profile,
          updatedAt: new Date()
        });
        toast.success('Profile updated successfully!');
      } else {
        // Create new profile
        const { createdAt, updatedAt, ...profileData } = profile;
        const newProfile = await firestoreService.createUserProfile(profileData);
        setProfile(newProfile);
        toast.success('Profile created successfully!');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Changes saved locally.');
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (!profile) return;
    setProfile(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };

  const handlePreferencesChange = (field: string, value: string | number) => {
    if (!profile) return;
    setProfile(prev => prev ? ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }) : null);
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    if (!profile) return;
    setProfile(prev => prev ? ({
      ...prev,
      preferences: {
        ...prev.preferences,
        notifications: {
          ...prev.preferences.notifications,
          [field]: value
        }
      }
    }) : null);
  };

  const toggleGoal = (goal: TrainingGoal) => {
    if (!profile) return;
    setProfile(prev => prev ? ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }) : null);
  };

  const calculateBMI = () => {
    if (!profile || !profile.weight || !profile.height) {
      return 'N/A';
    }
    const heightInMeters = profile.height / 100;
    return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Loading state
  if (isLoading || !profile) {
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
    <div className="relative z-10 p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-lg">
        {/* Enhanced Header */}
        <div className="card-modern">
          <div className="flex justify-between items-start">
            <div className="space-y-sm">
              <h1 className="typography-display-2 text-luxury">Mi Perfil</h1>
              <p className="typography-body text-secondary">Gestiona tu información personal y preferencias</p>
            </div>
            <div className="flex space-x-md">
              {isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="btn-secondary interactive-hover"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-primary interactive-scale"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Guardar
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="btn-luxury interactive-hover"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
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
