import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  Plus
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
      value: '2',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'Workouts This Week',
      value: '4',
      icon: Dumbbell,
      color: 'text-green-600'
    },
    {
      title: 'Total Sessions',
      value: '28',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Current Streak',
      value: '7 days',
      icon: Calendar,
      color: 'text-orange-600'
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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => handleViewChange('dashboard')}
                  className="flex items-center space-x-2 mr-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Exercise Library</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user?.displayName || user?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>
        <ExerciseLibrary />
      </div>
    );
  }

  if (currentView === 'calendar') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => handleViewChange('dashboard')}
                  className="flex items-center space-x-2 mr-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Workout Calendar</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user?.displayName || user?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>
        <WorkoutCalendar
          events={calendarEvents}
          onEventAdd={handleAddCalendarEvent}
          onEventUpdate={handleUpdateCalendarEvent}
          onEventDelete={handleDeleteCalendarEvent}
          availableSessions={sampleWorkoutSessions}
        />
      </div>
    );
  }

  if (currentView === 'create-program') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => handleViewChange('dashboard')}
                  className="flex items-center space-x-2 mr-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">Create Training Program</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{user?.displayName || user?.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>
        <CreateProgram
          onProgramCreated={handleProgramCreated}
          onCancel={() => handleViewChange('dashboard')}
        />
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Routine Schemer</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.displayName || user?.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Athlete'}!
          </h2>
          <p className="text-gray-600">
            Ready to crush your fitness goals? Let&apos;s get started with today&apos;s workout.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title} className="workout-card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <IconComponent className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Programs */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Programs</CardTitle>
                <Button
                  onClick={() => handleViewChange('create-program')}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Program</span>
                </Button>
              </CardHeader>
              <CardContent>
                {recentPrograms.length > 0 ? (
                  <div className="space-y-4">
                    {recentPrograms.map((program) => (
                      <div
                        key={program.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{program.name}</h3>
                          <span className="text-sm text-gray-500">{program.lastWorkout}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{program.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${program.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {program.progress}% complete
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No programs yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Create your first training program to get started
                    </p>
                    <Button onClick={() => handleViewChange('create-program')}>Create Program</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Workouts */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingWorkouts.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="border rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {workout.name}
                          </h4>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {workout.type}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{workout.date}</span>
                          <span>{workout.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">No upcoming workouts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleViewChange('create-program')}
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm">New Program</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleViewChange('calendar')}
                >
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">View Calendar</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleViewChange('exercises')}
                >
                  <Dumbbell className="h-6 w-6" />
                  <span className="text-sm">Exercise Library</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm">Progress</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
