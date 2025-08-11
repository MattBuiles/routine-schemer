import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Counter } from '@/components/ui/counter';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Tooltip } from '@/components/ui/tooltip';
import ExerciseLibrary from '@/components/routine/ExerciseLibrary';
import WorkoutCalendar from '@/components/routine/WorkoutCalendar';
import CreateProgram from '@/components/routine/CreateProgram';
import { generateCurrentMonthEvents, sampleWorkoutSessions } from '@/lib/sampleData';
import { CalendarEvent, TrainingProgram } from '@/types';
import { 
  Calendar, 
  Dumbbell, 
  Target, 
  TrendingUp, 
  User, 
  LogOut,
  ArrowLeft,
  Plus,
  Crown,
  Award,
  Zap,
  Flame,
  Activity,
  BarChart3,
  Clock,
  Star
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

  const handleProgramCreated = (program: TrainingProgram) => {
    console.log('Program created:', program);
    // Here you would typically save to Firebase
    setCurrentView('dashboard');
  };

  const stats = [
    {
      title: 'Active Programs',
      value: 2,
      suffix: '',
      icon: Target,
      color: 'text-blue-400'
    },
    {
      title: 'Workouts This Week',
      value: 4,
      suffix: '',
      icon: Dumbbell,
      color: 'text-green-400'
    },
    {
      title: 'Total Sessions',
      value: 128,
      suffix: '',
      icon: TrendingUp,
      color: 'text-purple-400'
    },
    {
      title: 'Current Streak',
      value: 7,
      suffix: ' days',
      icon: Calendar,
      color: 'text-orange-400'
    }
  ];

  const recentPrograms = [
    {
      id: '1',
      name: 'Upper/Lower Split',
      description: ' 4-day strength focused program',
      lastWorkout: '2 days ago',
      progress: 75
    },
    {
      id: '2',
      name: 'Full Body Routine',
      description: '3-day beginner program',
      lastWorkout: '1 week ago',
      progress: 45
    }
  ];

  const upcomingWorkouts = [
    {
      id: '1',
      name: 'Upper Body Strength',
      date: 'Today',
      time: '6:00 PM',
      type: 'Strength'
    },
    {
      id: '2',
      name: 'Lower Body Hypertrophy',
      date: 'Tomorrow',
      time: '7:00 AM',
      type: 'Hypertrophy'
    },
    {
      id: '3',
      name: 'Push Day',
      date: 'Friday',
      time: '6:00 PM',
      type: 'Strength'
    }
  ];

  // Render different views based on current state
  if (currentView === 'exercises') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0 gradient-animated"></div>
        
        {/* Header */}
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
                  Back to Elite Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-luxury">Exercise Arsenal</h1>
                  <p className="text-sm text-gray-400">1000+ Elite Exercises</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 glass px-4 py-2 rounded-xl">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user?.displayName || 'Elite Member'}</p>
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
        {/* Premium Background */}
        <div className="absolute inset-0 gradient-animated"></div>
        
        {/* Header */}
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
                  Back to Elite Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-luxury">Elite Calendar</h1>
                  <p className="text-sm text-gray-400">Championship Schedule</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 glass px-4 py-2 rounded-xl">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user?.displayName || 'Elite Member'}</p>
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
        {/* Premium Background */}
        <div className="absolute inset-0 gradient-animated"></div>
        
        {/* Header */}
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
                  Back to Elite Dashboard
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-luxury">Elite Program Creator</h1>
                  <p className="text-sm text-gray-400">Build Championship Training</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 glass px-4 py-2 rounded-xl">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user?.displayName || 'Elite Member'}</p>
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

  // Default dashboard view
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
                  <p className="text-sm text-gray-400">Elite Fitness Platform</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 glass px-4 py-2 rounded-xl">
                <Crown className="h-5 w-5 text-yellow-400" />
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user?.displayName || 'Elite Member'}</p>
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
            Welcome back, {user?.displayName?.split(' ')[0] || 'Champion'}!
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Your elite fitness journey continues. Today is the day to break new boundaries and achieve greatness.
          </p>
        </div>

        {/* Elite Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Tooltip key={stat.title} content={`Track your ${stat.title.toLowerCase()} progress`}>
                <Card className="card-premium card-glow group cursor-pointer hover-lift elastic-scale magnetic" style={{animationDelay: `${index * 0.1}s`}}>
                  <CardContent className="p-8 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-orange-500/20 group-hover:scale-110 transition-transform duration-300 neon-glow">
                        <IconComponent className={`h-8 w-8 ${stat.color} group-hover:drop-shadow-lg`} />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <div className="counter text-4xl font-black">
                      <Counter 
                        end={stat.value} 
                        duration={2000 + index * 300}
                        suffix={stat.suffix}
                      />
                    </div>
                  </CardContent>
                </Card>
              </Tooltip>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Elite Programs */}
          <div className="lg:col-span-2">
            <Card className="card-premium card-glow">
              <CardHeader className="flex flex-row items-center justify-between p-8">
                <div>
                  <CardTitle className="text-2xl font-bold text-luxury mb-2">Elite Programs</CardTitle>
                  <p className="text-gray-400">Your championship training arsenal</p>
                </div>
                <Button
                  onClick={() => handleViewChange('create-program')}
                  className="btn-premium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Program
                </Button>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                {recentPrograms.length > 0 ? (
                  <div className="space-y-6">
                    {recentPrograms.map((program, index) => (
                      <div
                        key={program.id}
                        className="glass p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                            {program.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-400">{program.lastWorkout}</span>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-4">{program.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Progress</span>
                            <span className="text-sm font-bold text-yellow-400">{program.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${program.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Ready to Build Your Empire?
                    </h3>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                      Create your first elite training program and start your journey to greatness
                    </p>
                    <Button onClick={() => handleViewChange('create-program')} className="btn-premium">
                      <Plus className="h-5 w-5 mr-2" />
                      Create Elite Program
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Elite Sessions */}
          <div>
            <Card className="card-premium card-glow">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-bold text-luxury">Elite Sessions</CardTitle>
                <p className="text-gray-400">Your championship schedule</p>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                {upcomingWorkouts.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingWorkouts.map((workout, index) => (
                      <div
                        key={workout.id}
                        className="glass p-4 rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-white group-hover:text-yellow-400 transition-colors">
                            {workout.name}
                          </h4>
                          <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-medium">
                            {workout.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{workout.date}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-300">{workout.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">No elite sessions scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Elite Command Center */}
        <Card className="card-premium card-glow">
          <CardHeader className="p-8">
            <CardTitle className="text-2xl font-bold text-luxury">Elite Command Center</CardTitle>
            <p className="text-gray-400">Your championship tools await</p>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Tooltip content="Create a new elite training program">
                <Button 
                  className="h-24 glass hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center space-y-3 text-white border-white/20 hover:border-yellow-400/50 group ripple elastic-scale hover-glow"
                  onClick={() => handleViewChange('create-program')}
                >
                  <Plus className="h-8 w-8 text-yellow-400 group-hover:scale-110 transition-transform neon-glow" />
                  <span className="font-medium">New Program</span>
                </Button>
              </Tooltip>
              <Tooltip content="View your elite training calendar">
                <Button 
                  className="h-24 glass hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center space-y-3 text-white border-white/20 hover:border-purple-400/50 group ripple elastic-scale hover-glow"
                  onClick={() => handleViewChange('calendar')}
                >
                  <Calendar className="h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform neon-glow" />
                  <span className="font-medium">Elite Calendar</span>
                </Button>
              </Tooltip>
              <Tooltip content="Access 1000+ premium exercises">
                <Button 
                  className="h-24 glass hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center space-y-3 text-white border-white/20 hover:border-pink-400/50 group ripple elastic-scale hover-glow"
                  onClick={() => handleViewChange('exercises')}
                >
                  <Dumbbell className="h-8 w-8 text-pink-400 group-hover:scale-110 transition-transform neon-glow" />
                  <span className="font-medium">Exercise Arsenal</span>
                </Button>
              </Tooltip>
              <Tooltip content="Track your championship progress">
                <Button className="h-24 glass hover:scale-105 transition-all duration-300 flex flex-col items-center justify-center space-y-3 text-white border-white/20 hover:border-blue-400/50 group ripple elastic-scale hover-glow">
                  <BarChart3 className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform neon-glow" />
                  <span className="font-medium">Elite Analytics</span>
                </Button>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
