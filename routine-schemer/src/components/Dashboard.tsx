import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Tooltip } from '@/components/ui/tooltip';
import ExerciseLibrary from '@/components/routine/ExerciseLibrary';
import WorkoutCalendar from '@/components/routine/WorkoutCalendar';
import CreateProgram from '@/components/routine/CreateProgram';
import { generateCurrentMonthEvents, sampleWorkoutSessions } from '@/lib/sampleData';
import { CalendarEvent } from '@/types';
import { 
  Calendar, 
  Dumbbell, 
  Target, 
  LogOut,
  ArrowLeft,
  Plus,
  Crown,
  Award,
  Zap,
  Activity,
  Clock,
  MoreVertical,
  Edit,
  Copy,
  Play,
  Settings,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'exercises' | 'create-program'>('dashboard');
  const [calendarEvents, setCalendarEvents] = useState(generateCurrentMonthEvents());

  const handleViewChange = (view: 'dashboard' | 'calendar' | 'exercises' | 'create-program') => {
    setCurrentView(view);
  };

  const handleAddCalendarEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Math.random().toString(36).substr(2, 9)
    };
    setCalendarEvents(prev => [...prev, newEvent]);
  };

  const handleUpdateCalendarEvent = (event: CalendarEvent) => {
    setCalendarEvents(prev => prev.map(e => e.id === event.id ? event : e));
  };

  const handleDeleteCalendarEvent = (eventId: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const handleProgramCreated = () => {
    // Program successfully created, returning to dashboard
    setCurrentView('dashboard');
  };

  // Program Categories Data
  const programCategories = [
    {
      title: 'Strength Programs',
      description: 'Powerlifting, Olympic lifting, strength development',
      icon: Dumbbell,
      iconColor: 'text-red-300',
      iconBg: 'bg-gradient-to-br from-red-500/10 to-orange-500/10',
      borderColor: 'border-red-500/20 hover:border-red-400/40',
      shadowColor: 'hover:shadow-red-500/20',
      count: 3,
      totalExercises: 45,
      avgDuration: '12-16 weeks',
      tags: ['Powerlifting', 'Olympic', 'Strength']
    },
    {
      title: 'Hypertrophy Routines',
      description: 'Muscle building, bodybuilding programs',
      icon: Target,
      iconColor: 'text-blue-300',
      iconBg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
      borderColor: 'border-blue-500/20 hover:border-blue-400/40',
      shadowColor: 'hover:shadow-blue-500/20',
      count: 5,
      totalExercises: 67,
      avgDuration: '8-12 weeks',
      tags: ['Bodybuilding', 'Volume', 'Hypertrophy']
    },
    {
      title: 'Rehabilitation Plans',
      description: 'Recovery, injury rehabilitation programs',
      icon: Activity,
      iconColor: 'text-emerald-300',
      iconBg: 'bg-gradient-to-br from-emerald-500/10 to-green-500/10',
      borderColor: 'border-emerald-500/20 hover:border-emerald-400/40',
      shadowColor: 'hover:shadow-emerald-500/20',
      count: 2,
      totalExercises: 28,
      avgDuration: '6-10 weeks',
      tags: ['Recovery', 'Therapy', 'Mobility']
    },
    {
      title: 'Cardio Programs',
      description: 'HIIT, LISS, endurance training',
      icon: Zap,
      iconColor: 'text-purple-300',
      iconBg: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-500/20 hover:border-purple-400/40',
      shadowColor: 'hover:shadow-purple-500/20',
      count: 4,
      totalExercises: 32,
      avgDuration: '4-8 weeks',
      tags: ['HIIT', 'Cardio', 'Endurance']
    }
  ];

  // Active Programs Data
  const activePrograms = [
    {
      id: '1',
      name: 'Advanced Powerlifting Protocol',
      description: 'Strength-focused program with linear progression and periodization',
      type: 'Strength',
      duration: '12 weeks',
      status: 'Active',
      lastModified: '2 days ago',
      progress: 75,
      nextSession: 'Tomorrow, 6:00 PM',
      totalSessions: 48,
      completedSessions: 36,
      intensity: 'High',
      equipment: ['Barbell', 'Rack', 'Bench'],
      mainLifts: ['Squat', 'Bench Press', 'Deadlift']
    },
    {
      id: '2',
      name: 'Shoulder Rehabilitation Plan',
      description: 'Post-injury recovery and strengthening with mobility focus',
      type: 'Rehabilitation',
      duration: '8 weeks',
      status: 'In Progress',
      lastModified: '1 day ago',
      progress: 45,
      nextSession: 'Today, 2:00 PM',
      totalSessions: 24,
      completedSessions: 11,
      intensity: 'Low',
      equipment: ['Resistance Bands', 'Light Dumbbells'],
      mainLifts: ['External Rotation', 'Wall Slides', 'Band Pull-Aparts']
    },
    {
      id: '3',
      name: 'Hypertrophy Block - Upper Focus',
      description: 'Volume-based muscle building program targeting upper body development',
      type: 'Hypertrophy',
      duration: '16 weeks',
      status: 'Draft',
      lastModified: '1 week ago',
      progress: 0,
      nextSession: 'Not scheduled',
      totalSessions: 64,
      completedSessions: 0,
      intensity: 'Moderate',
      equipment: ['Dumbbells', 'Cable Machine', 'Bench'],
      mainLifts: ['Bench Press', 'Rows', 'Overhead Press']
    }
  ];

  // Program Templates Data
  const programTemplates = [
    {
      id: '1',
      name: 'Beginner Full Body',
      description: 'Complete starter program for new lifters',
      category: 'Strength',
      exercises: 12,
      duration: '8-12 weeks',
      difficulty: 'Beginner',
      frequency: '3x/week',
      equipment: ['Barbell', 'Dumbbells', 'Bench'],
      tags: ['Full Body', 'Beginner', 'Compound']
    },
    {
      id: '2',
      name: 'HIIT Cardio Circuits',
      description: 'High-intensity interval training for fat loss',
      category: 'Cardio',
      exercises: 8,
      duration: '4-6 weeks',
      difficulty: 'Intermediate',
      frequency: '4x/week',
      equipment: ['Bodyweight', 'Timer'],
      tags: ['HIIT', 'Fat Loss', 'Bodyweight']
    },
    {
      id: '3',
      name: 'Knee Injury Prevention',
      description: 'Preventive strengthening protocol for knee health',
      category: 'Prevention',
      exercises: 15,
      duration: '6-8 weeks',
      difficulty: 'Beginner',
      frequency: '3x/week',
      equipment: ['Resistance Bands', 'Stability Ball'],
      tags: ['Prevention', 'Knee Health', 'Rehab']
    }
  ];

  // Different Views
  if (currentView === 'exercises') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 gradient-animated"></div>
        <header className="relative z-10 glass border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => handleViewChange('dashboard')}
                  className="glass hover:bg-white/10 text-white border-white/20 hover:border-white/40"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-luxury">Exercise Library</h1>
                  <p className="text-sm text-gray-400">Browse exercises and movements</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 glass px-4 py-2 rounded-xl">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user?.displayName || 'Trainer'}</p>
                    <p className="text-xs text-gray-400">Premium Access</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="glass hover:bg-white/10 text-white border-white/20 hover:border-white/40"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className="relative z-10">
          <ExerciseLibrary />
        </div>
      </div>
    );
  }

  if (currentView === 'calendar') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 gradient-animated"></div>
        <header className="relative z-10 glass border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => handleViewChange('dashboard')}
                  className="glass hover:bg-white/10 text-white border-white/20 hover:border-white/40"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-luxury">Training Calendar</h1>
                  <p className="text-sm text-gray-400">Schedule and plan your sessions</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 glass px-4 py-2 rounded-xl">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user?.displayName || 'Trainer'}</p>
                    <p className="text-xs text-gray-400">Premium Access</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="glass hover:bg-white/10 text-white border-white/20 hover:border-white/40"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className="relative z-10">
          <WorkoutCalendar
            events={calendarEvents}
            onEventAdd={handleAddCalendarEvent}
            onEventUpdate={handleUpdateCalendarEvent}
            onEventDelete={handleDeleteCalendarEvent}
            availableSessions={sampleWorkoutSessions}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'create-program') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 gradient-animated"></div>
        <header className="relative z-10 glass border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => handleViewChange('dashboard')}
                  className="glass hover:bg-white/10 text-white border-white/20 hover:border-white/40"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-luxury">Create Program</h1>
                  <p className="text-sm text-gray-400">Design your training program</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 glass px-4 py-2 rounded-xl">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user?.displayName || 'Trainer'}</p>
                    <p className="text-xs text-gray-400">Premium Access</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={signOut}
                  className="glass hover:bg-white/10 text-white border-white/20 hover:border-white/40"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>
        <div className="relative z-10">
          <CreateProgram 
            onProgramCreated={handleProgramCreated} 
            onCancel={() => handleViewChange('dashboard')}
          />
        </div>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Premium Background with Particles */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-purple-950/10 to-orange-950/20"></div>
      <ParticleBackground />
      
      {/* Subtle Floating Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-gray-900/30 border-b border-white/5 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Dumbbell className="h-7 w-7 text-white drop-shadow-sm" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Routine Schemer
                  </h1>
                  <p className="text-sm text-gray-400 font-medium">Professional Training Platform</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10 shadow-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{user?.displayName || 'Professional Trainer'}</p>
                  <p className="text-xs text-yellow-400 font-medium">Premium Access</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={signOut}
                className="bg-gray-800/50 hover:bg-gray-700/50 text-white border border-white/10 hover:border-white/20 px-6 py-3 rounded-xl transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Welcome Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm px-6 py-2 rounded-full border border-yellow-500/20 mb-6">
            <Award className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-300">Professional Dashboard</span>
          </div>
          <h2 className="text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Welcome back, 
            </span>
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              {user?.displayName?.split(' ')[0] || 'Trainer'}!
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Design, organize and manage your training programs with precision. 
            <br />
            <span className="text-gray-400">Create structured routines, plan rehabilitation protocols, and build comprehensive fitness solutions.</span>
          </p>
        </div>

        {/* Program Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {programCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Tooltip key={category.title} content={`${category.totalExercises} exercises • ${category.avgDuration} duration`}>
                <Card className={`
                  bg-gradient-to-br from-gray-900/50 to-gray-800/30 
                  backdrop-blur-xl border ${category.borderColor} 
                  group cursor-pointer 
                  hover:scale-105 hover:shadow-2xl ${category.shadowColor}
                  transition-all duration-500 ease-out
                  rounded-2xl overflow-hidden
                `} style={{animationDelay: `${index * 0.1}s`}}>
                  <CardContent className="p-8">
                    {/* Header with Icon and Count */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`
                        p-4 rounded-2xl ${category.iconBg} 
                        border border-white/5
                        group-hover:scale-110 group-hover:rotate-6
                        transition-all duration-500 ease-out
                        shadow-lg
                      `}>
                        <IconComponent className={`h-7 w-7 ${category.iconColor} drop-shadow-sm`} />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                          {category.count}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">programs</div>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors duration-300">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-sm mb-6 p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-gray-300 font-medium">{category.totalExercises} exercises</span>
                      <span className="text-gray-300 font-medium">{category.avgDuration}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {category.tags.map((tag, tagIndex) => (
                        <span 
                          key={tag}
                          className={`
                            px-3 py-1.5 text-xs font-medium rounded-full 
                            ${category.iconBg} ${category.iconColor} 
                            border border-white/10 backdrop-blur-sm
                            hover:scale-105 transition-transform duration-200
                          `}
                          style={{animationDelay: `${(index * 0.1) + (tagIndex * 0.05)}s`}}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Tooltip>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          {/* Active Programs */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between p-10">
                <div>
                  <CardTitle className="text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
                    Active Programs
                  </CardTitle>
                  <p className="text-gray-400 text-lg">Manage your training programs and progression</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-800/50 text-gray-300 border-gray-600/50 hover:border-gray-500 hover:bg-gray-700/50 rounded-xl px-4 py-2"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button
                    onClick={() => handleViewChange('create-program')}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Program
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                {activePrograms.length > 0 ? (
                  <div className="space-y-8">
                    {activePrograms.map((program, index) => (
                      <div
                        key={program.id}
                        className="bg-gradient-to-br from-gray-800/30 to-gray-700/20 backdrop-blur-sm p-8 rounded-2xl border border-white/5 hover:border-white/10 hover:scale-[1.02] transition-all duration-500 group shadow-lg hover:shadow-2xl"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        {/* Header with Title, Status and Actions */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <h3 className="text-2xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">
                                {program.name}
                              </h3>
                              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                program.status === 'Active' ? 'bg-green-500/20 text-green-300 border border-green-500/40' :
                                program.status === 'In Progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                                'bg-gray-500/20 text-gray-300 border border-gray-500/40'
                              }`}>
                                {program.status}
                              </span>
                            </div>
                            <p className="text-gray-300 text-base leading-relaxed">{program.description}</p>
                          </div>
                          
                          {/* Action Menu */}
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-2">
                              <Edit className="h-5 w-5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-2">
                              <Copy className="h-5 w-5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-2">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {program.progress > 0 && (
                          <div className="mb-8">
                            <div className="flex items-center justify-between text-sm mb-3">
                              <span className="text-gray-300 font-medium">Progress</span>
                              <span className="text-yellow-400 font-bold text-lg">{program.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-800/60 rounded-full h-3 overflow-hidden border border-gray-700/50">
                              <div
                                className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                                style={{ width: `${program.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Program Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-sm text-gray-400 mb-2">Type</div>
                            <div className="text-lg font-semibold text-white">{program.type}</div>
                          </div>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-sm text-gray-400 mb-2">Duration</div>
                            <div className="text-lg font-semibold text-white">{program.duration}</div>
                          </div>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-sm text-gray-400 mb-2">Sessions</div>
                            <div className="text-lg font-semibold text-white">{program.completedSessions}/{program.totalSessions}</div>
                          </div>
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <div className="text-sm text-gray-400 mb-2">Intensity</div>
                            <div className={`text-lg font-semibold ${
                              program.intensity === 'High' ? 'text-red-400' :
                              program.intensity === 'Moderate' ? 'text-yellow-400' :
                              'text-emerald-400'
                            }`}>
                              {program.intensity}
                            </div>
                          </div>
                        </div>

                        {/* Equipment and Main Lifts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <div className="text-sm text-gray-400 mb-3 font-medium">Equipment</div>
                            <div className="flex flex-wrap gap-2">
                              {program.equipment.map((item, i) => (
                                <span key={i} className="px-4 py-2 text-sm bg-gray-700/30 text-gray-200 rounded-lg border border-gray-600/30 font-medium">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-400 mb-3 font-medium">Main Lifts</div>
                            <div className="flex flex-wrap gap-2">
                              {program.mainLifts.map((lift, i) => (
                                <span key={i} className="px-4 py-2 text-sm bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 rounded-lg border border-yellow-500/30 font-medium">
                                  {lift}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Footer with Next Session and Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-white/10">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                              <Clock className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm text-gray-400">Next Session</div>
                              <div className="text-base font-semibold text-white">{program.nextSession}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {program.status === 'Active' ? (
                              <Button size="sm" className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/40 px-6 py-2 rounded-xl font-semibold">
                                <Play className="h-4 w-4 mr-2" />
                                Start Session
                              </Button>
                            ) : program.status === 'Draft' ? (
                              <Button size="sm" className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 hover:from-blue-500/30 hover:to-cyan-500/30 border border-blue-500/40 px-6 py-2 rounded-xl font-semibold">
                                <Settings className="h-4 w-4 mr-2" />
                                Configure
                              </Button>
                            ) : (
                              <Button size="sm" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/40 px-6 py-2 rounded-xl font-semibold">
                                <TrendingUp className="h-4 w-4 mr-2" />
                                View Progress
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="mb-8">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-yellow-500/30 mb-6">
                        <Award className="h-12 w-12 text-yellow-300" />
                      </div>
                      <h3 className="text-3xl font-bold text-white mb-4">
                        Ready to Create Your First Program?
                      </h3>
                      <p className="text-gray-300 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
                        Start building comprehensive training programs tailored to your specific goals and requirements. 
                        Design structured routines with professional precision.
                      </p>
                      <Button 
                        onClick={() => handleViewChange('create-program')} 
                        className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-lg"
                      >
                        <Plus className="h-6 w-6 mr-3" />
                        Create Your First Program
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Program Templates */}
          <div>
            <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
              <CardHeader className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 mr-3">
                        <FileText className="h-6 w-6 text-blue-300" />
                      </div>
                      Templates
                    </CardTitle>
                    <p className="text-gray-400 text-base">Ready-to-use training blueprints</p>
                  </div>
                  <Button size="sm" variant="outline" className="bg-gray-800/50 text-gray-300 border-gray-600/50 hover:border-gray-500 hover:bg-gray-700/50 rounded-xl px-4 py-2">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                {programTemplates.length > 0 ? (
                  <div className="space-y-4">
                    {programTemplates.slice(0, 3).map((template, index) => (
                      <div
                        key={template.id}
                        className="bg-gradient-to-br from-gray-800/30 to-gray-700/20 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-white/10 hover:scale-[1.02] transition-all duration-500 cursor-pointer group shadow-lg hover:shadow-2xl"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-bold text-white group-hover:text-yellow-300 transition-colors text-lg">
                                {template.name}
                              </h4>
                              <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                                template.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300 border border-green-500/40' :
                                template.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                                'bg-red-500/20 text-red-300 border border-red-500/40'
                              }`}>
                                {template.difficulty}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{template.description}</p>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                            <div className="text-xs text-gray-400 mb-1">Exercises</div>
                            <div className="text-white font-bold text-lg">{template.exercises}</div>
                          </div>
                          <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                            <div className="text-xs text-gray-400 mb-1">Duration</div>
                            <div className="text-white font-bold text-lg">{template.duration}</div>
                          </div>
                          <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                            <div className="text-xs text-gray-400 mb-1">Frequency</div>
                            <div className="text-white font-bold text-lg">{template.frequency}</div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {template.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-3 py-1.5 text-sm bg-gray-700/30 text-gray-200 rounded-lg border border-gray-600/30 font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                            <span className="text-sm text-gray-300 font-medium">{template.category}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-gray-300 hover:text-white hover:bg-white/10 text-sm px-4 py-2 rounded-lg"
                            >
                              Preview
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/40 text-sm px-4 py-2 rounded-lg font-semibold"
                            >
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">No templates available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Program Management Center */}
        <Card className="bg-gradient-to-br from-gray-900/40 to-gray-800/20 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
          <CardHeader className="p-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                <Settings className="h-8 w-8 text-yellow-300" />
              </div>
              <div>
                <CardTitle className="text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Management Center
                </CardTitle>
                <p className="text-gray-400 text-lg">Design, organize and manage your training programs</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            {/* Quick Actions Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <Tooltip content="Create a new training program from scratch">
                <Button 
                  className="h-24 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 hover:scale-105 transition-all duration-500 flex flex-col items-center justify-center space-y-3 text-white border border-yellow-500/20 hover:border-yellow-400/40 group rounded-2xl shadow-lg hover:shadow-2xl"
                  onClick={() => handleViewChange('create-program')}
                >
                  <div className="p-2 rounded-xl bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                    <Plus className="h-6 w-6 text-yellow-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-semibold text-sm">New Program</span>
                </Button>
              </Tooltip>
              <Tooltip content="Manage training schedules and planning">
                <Button 
                  className="h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 hover:scale-105 transition-all duration-500 flex flex-col items-center justify-center space-y-3 text-white border border-purple-500/20 hover:border-purple-400/40 group rounded-2xl shadow-lg hover:shadow-2xl"
                  onClick={() => handleViewChange('calendar')}
                >
                  <div className="p-2 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                    <Calendar className="h-6 w-6 text-purple-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-semibold text-sm">Training Calendar</span>
                </Button>
              </Tooltip>
              <Tooltip content="Browse exercise library and movements">
                <Button 
                  className="h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 hover:scale-105 transition-all duration-500 flex flex-col items-center justify-center space-y-3 text-white border border-blue-500/20 hover:border-blue-400/40 group rounded-2xl shadow-lg hover:shadow-2xl"
                  onClick={() => handleViewChange('exercises')}
                >
                  <div className="p-2 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                    <Dumbbell className="h-6 w-6 text-blue-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-semibold text-sm">Exercise Library</span>
                </Button>
              </Tooltip>
              <Tooltip content="Program templates and notes">
                <Button className="h-24 bg-gradient-to-br from-emerald-500/10 to-green-500/10 hover:from-emerald-500/20 hover:to-green-500/20 hover:scale-105 transition-all duration-500 flex flex-col items-center justify-center space-y-3 text-white border border-emerald-500/20 hover:border-emerald-400/40 group rounded-2xl shadow-lg hover:shadow-2xl">
                  <div className="p-2 rounded-xl bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
                    <FileText className="h-6 w-6 text-emerald-300 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-semibold text-sm">Templates & Notes</span>
                </Button>
              </Tooltip>
            </div>

            {/* Advanced Tools */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-6">Advanced Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm p-6 rounded-2xl border border-emerald-500/20 hover:border-emerald-400/40 hover:scale-105 transition-all duration-500 cursor-pointer group shadow-lg hover:shadow-2xl">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 group-hover:bg-emerald-500/30 transition-colors">
                      <Activity className="h-6 w-6 text-emerald-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors mb-2">Rehabilitation Builder</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">Create comprehensive injury recovery and rehabilitation programs</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400/40 rounded-xl py-3 font-semibold">
                    Build Program
                  </Button>
                </div>

                <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm p-6 rounded-2xl border border-red-500/20 hover:border-red-400/40 hover:scale-105 transition-all duration-500 cursor-pointer group shadow-lg hover:shadow-2xl">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 group-hover:bg-red-500/30 transition-colors">
                      <Target className="h-6 w-6 text-red-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white group-hover:text-red-300 transition-colors mb-2">Strength Periodization</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">Advanced programming and periodization tools for strength development</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20 hover:border-red-400/40 rounded-xl py-3 font-semibold">
                    Create Plan
                  </Button>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 hover:scale-105 transition-all duration-500 cursor-pointer group shadow-lg hover:shadow-2xl">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30 group-hover:bg-purple-500/30 transition-colors">
                      <Users className="h-6 w-6 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors mb-2">Client Management</h4>
                      <p className="text-sm text-gray-300 leading-relaxed">Manage multiple clients with personalized training programs</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400/40 rounded-xl py-3 font-semibold">
                    Manage Clients
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
