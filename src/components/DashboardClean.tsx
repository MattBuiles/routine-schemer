import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Tooltip } from '@/components/ui/tooltip';
import ExerciseLibrary from '@/components/routine/ExerciseLibrary';
import WorkoutCalendar from '@/components/routine/WorkoutCalendar';
import CreateProgram from '@/components/routine/CreateProgram';
import { useDashboardData } from '@/hooks/useDashboardData';
import { CalendarEvent, TrainingProgram } from '@/types';
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
  const { data: dashboardData } = useDashboardData();
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'exercises' | 'create-program'>('dashboard');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

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

  const handleProgramCreated = (program: TrainingProgram) => {
    console.log('Program created:', program);
    setCurrentView('dashboard');
  };

  // Program Categories Data
  const programCategories = [
    {
      title: 'Strength Programs',
      description: 'Powerlifting, Olympic lifting, strength development',
      icon: Dumbbell,
      color: 'text-red-400',
      bgGradient: 'from-red-500/20 to-orange-500/20',
      borderColor: 'hover:border-red-400/50',
      count: 3,
      totalExercises: 45,
      avgDuration: '12-16 weeks',
      tags: ['Powerlifting', 'Olympic', 'Strength']
    },
    {
      title: 'Hypertrophy Routines',
      description: 'Muscle building, bodybuilding programs',
      icon: Target,
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'hover:border-blue-400/50',
      count: 5,
      totalExercises: 67,
      avgDuration: '8-12 weeks',
      tags: ['Bodybuilding', 'Volume', 'Hypertrophy']
    },
    {
      title: 'Rehabilitation Plans',
      description: 'Recovery, injury rehabilitation programs',
      icon: Activity,
      color: 'text-green-400',
      bgGradient: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'hover:border-green-400/50',
      count: 2,
      totalExercises: 28,
      avgDuration: '6-10 weeks',
      tags: ['Recovery', 'Therapy', 'Mobility']
    },
    {
      title: 'Cardio Programs',
      description: 'HIIT, LISS, endurance training',
      icon: Zap,
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'hover:border-purple-400/50',
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
            availableSessions={[]}
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background with Particles */}
      <div className="absolute inset-0 gradient-animated"></div>
      <ParticleBackground />
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl float"></div>
      <div className="absolute bottom-40 left-20 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/5 rounded-full blur-3xl float" style={{animationDelay: '1s'}}></div>
      
      {/* Header */}
      <header className="relative z-10 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center pulse-glow">
                  <Dumbbell className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-luxury">Routine Schemer</h1>
                  <p className="text-sm text-gray-400">Professional Training Platform</p>
                </div>
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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-luxury mb-4">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Trainer'}!
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Design, organize and manage your training programs. Create structured routines, plan rehabilitation protocols, and build comprehensive fitness solutions.
          </p>
        </div>

        {/* Program Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {programCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Tooltip key={category.title} content={`${category.totalExercises} exercises • ${category.avgDuration} duration`}>
                <Card className={`premium-card group cursor-pointer hover-lift elastic-scale magnetic border-white/10 ${category.borderColor} hover:shadow-2xl`} style={{animationDelay: `${index * 0.1}s`}}>
                  <CardContent className="p-6">
                    {/* Header with Icon and Count */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-r ${category.bgGradient} group-hover:scale-110 transition-all duration-300`}>
                        <IconComponent className={`h-6 w-6 ${category.color} group-hover:drop-shadow-lg`} />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-luxury">{category.count}</div>
                        <div className="text-xs text-gray-500">programs</div>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div className="mb-4">
                      <h3 className="font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-xs mb-4">
                      <span className="text-gray-500">{category.totalExercises} exercises</span>
                      <span className="text-gray-500">{category.avgDuration}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {category.tags.map((tag, tagIndex) => (
                        <span 
                          key={tag}
                          className={`px-2 py-1 text-xs rounded-full bg-gradient-to-r ${category.bgGradient} ${category.color} border border-white/10`}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Active Programs */}
          <div className="lg:col-span-2">
            <Card className="premium-card">
              <CardHeader className="flex flex-row items-center justify-between p-8">
                <div>
                  <CardTitle className="text-2xl font-bold text-luxury mb-2">Active Programs</CardTitle>
                  <p className="text-gray-400">Manage your training programs and progression</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-400 border-gray-600 hover:border-gray-500"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button
                    onClick={() => handleViewChange('create-program')}
                    className="btn-premium"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Program
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                {activePrograms.length > 0 ? (
                  <div className="space-y-6">
                    {activePrograms.map((program, index) => (
                      <div
                        key={program.id}
                        className="premium-card p-6 hover:scale-[1.01] transition-all duration-300 group border border-white/10 hover:border-yellow-400/30"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        {/* Header with Title, Status and Actions */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                                {program.name}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                program.status === 'Active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                program.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                              }`}>
                                {program.status}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm">{program.description}</p>
                          </div>
                          
                          {/* Action Menu */}
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {program.progress > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-yellow-400 font-semibold">{program.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${program.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Program Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Type</div>
                            <div className="text-sm font-medium text-white">{program.type}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Duration</div>
                            <div className="text-sm font-medium text-white">{program.duration}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Sessions</div>
                            <div className="text-sm font-medium text-white">{program.completedSessions}/{program.totalSessions}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Intensity</div>
                            <div className={`text-sm font-medium ${
                              program.intensity === 'High' ? 'text-red-400' :
                              program.intensity === 'Moderate' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {program.intensity}
                            </div>
                          </div>
                        </div>

                        {/* Equipment and Main Lifts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-xs text-gray-500 mb-2">Equipment</div>
                            <div className="flex flex-wrap gap-1">
                              {program.equipment.map((item, i) => (
                                <span key={i} className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-md">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-2">Main Lifts</div>
                            <div className="flex flex-wrap gap-1">
                              {program.mainLifts.map((lift, i) => (
                                <span key={i} className="px-2 py-1 text-xs bg-yellow-400/10 text-yellow-400 rounded-md border border-yellow-400/20">
                                  {lift}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Footer with Next Session and Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center space-x-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400">
                              Next: <span className="text-white">{program.nextSession}</span>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {program.status === 'Active' ? (
                              <Button size="sm" className="bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 border border-yellow-400/30">
                                <Play className="h-4 w-4 mr-1" />
                                Start Session
                              </Button>
                            ) : program.status === 'Draft' ? (
                              <Button size="sm" className="bg-blue-400/20 text-blue-400 hover:bg-blue-400/30 border border-blue-400/30">
                                <Settings className="h-4 w-4 mr-1" />
                                Configure
                              </Button>
                            ) : (
                              <Button size="sm" className="bg-green-400/20 text-green-400 hover:bg-green-400/30 border border-green-400/30">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                View Progress
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Ready to Create Your First Program?
                    </h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      Start building comprehensive training programs tailored to your specific goals and requirements.
                    </p>
                    <Button onClick={() => handleViewChange('create-program')} className="btn-premium">
                      <Plus className="h-5 w-5 mr-2" />
                      Create Your First Program
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Program Templates */}
          <div>
            <Card className="premium-card">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-luxury flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-yellow-400" />
                      Program Templates
                    </CardTitle>
                    <p className="text-gray-400 text-sm">Ready-to-use training blueprints</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-gray-400 border-gray-600 hover:border-gray-500">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {programTemplates.length > 0 ? (
                  <div className="space-y-3">
                    {programTemplates.slice(0, 3).map((template, index) => (
                      <div
                        key={template.id}
                        className="premium-card p-4 hover:scale-[1.02] transition-all duration-300 cursor-pointer group border border-white/10 hover:border-yellow-400/30"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-bold text-white group-hover:text-yellow-400 transition-colors text-sm">
                                {template.name}
                              </h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                template.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                                template.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {template.difficulty}
                              </span>
                            </div>
                            <p className="text-gray-300 text-xs mb-2">{template.description}</p>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                          <div>
                            <div className="text-gray-500">Exercises</div>
                            <div className="text-white font-medium">{template.exercises}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Duration</div>
                            <div className="text-white font-medium">{template.duration}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Frequency</div>
                            <div className="text-white font-medium">{template.frequency}</div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <span className="text-xs text-gray-500">{template.category}</span>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-gray-400 hover:text-white text-xs h-7 px-2"
                            >
                              Preview
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 border border-yellow-400/30 text-xs h-7 px-3"
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
        <Card className="premium-card">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-bold text-luxury flex items-center">
              <Settings className="h-6 w-6 mr-3 text-yellow-400" />
              Program Management Center
            </CardTitle>
            <p className="text-gray-400">Design, organize and manage your training programs</p>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {/* Quick Actions Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Tooltip content="Create a new training program from scratch">
                <Button 
                  className="h-20 premium-card hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center space-y-2 text-white border-white/20 hover:border-yellow-400/50 group"
                  onClick={() => handleViewChange('create-program')}
                >
                  <Plus className="h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-sm">New Program</span>
                </Button>
              </Tooltip>
              <Tooltip content="Manage training schedules and planning">
                <Button 
                  className="h-20 premium-card hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center space-y-2 text-white border-white/20 hover:border-purple-400/50 group"
                  onClick={() => handleViewChange('calendar')}
                >
                  <Calendar className="h-6 w-6 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-sm">Training Calendar</span>
                </Button>
              </Tooltip>
              <Tooltip content="Browse exercise library and movements">
                <Button 
                  className="h-20 premium-card hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center space-y-2 text-white border-white/20 hover:border-pink-400/50 group"
                  onClick={() => handleViewChange('exercises')}
                >
                  <Dumbbell className="h-6 w-6 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-sm">Exercise Library</span>
                </Button>
              </Tooltip>
              <Tooltip content="Program templates and notes">
                <Button className="h-20 premium-card hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center space-y-2 text-white border-white/20 hover:border-blue-400/50 group">
                  <FileText className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-sm">Templates & Notes</span>
                </Button>
              </Tooltip>
            </div>

            {/* Advanced Tools */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Advanced Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="premium-card p-4 hover:scale-105 transition-all duration-300 cursor-pointer group border border-white/10 hover:border-green-400/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      <Activity className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-green-400 transition-colors">Rehabilitation Builder</h4>
                      <p className="text-xs text-gray-400">Create injury recovery programs</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-green-400 border-green-400/30 hover:bg-green-400/10">
                    Build Program
                  </Button>
                </div>

                <div className="premium-card p-4 hover:scale-105 transition-all duration-300 cursor-pointer group border border-white/10 hover:border-red-400/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 rounded-lg bg-red-500/20">
                      <Target className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-red-400 transition-colors">Strength Periodization</h4>
                      <p className="text-xs text-gray-400">Advanced programming tools</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-red-400 border-red-400/30 hover:bg-red-400/10">
                    Create Plan
                  </Button>
                </div>

                <div className="premium-card p-4 hover:scale-105 transition-all duration-300 cursor-pointer group border border-white/10 hover:border-purple-400/50">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Users className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-purple-400 transition-colors">Client Management</h4>
                      <p className="text-xs text-gray-400">Manage multiple clients</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-purple-400 border-purple-400/30 hover:bg-purple-400/10">
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
