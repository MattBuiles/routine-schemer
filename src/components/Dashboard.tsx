import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
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
  Zap,
  Activity,
  FileText
} from 'lucide-react';
import '@/styles/dashboard.css';

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
      title: 'Strength',
      description: 'Powerlifting and strength development',
      icon: Dumbbell,
      iconColor: 'text-gray-300',
      iconBg: 'bg-gradient-to-br from-gray-500/10 to-gray-600/10',
      borderColor: 'border-gray-500/20 hover:border-gray-400/30',
      shadowColor: 'hover:shadow-gray-500/10',
    },
    {
      title: 'Hypertrophy',
      description: 'Muscle building and development',
      icon: Target,
      iconColor: 'text-gray-300',
      iconBg: 'bg-gradient-to-br from-gray-500/10 to-gray-600/10',
      borderColor: 'border-gray-500/20 hover:border-gray-400/30',
      shadowColor: 'hover:shadow-gray-500/10',
    },
    {
      title: 'Rehabilitation',
      description: 'Recovery and injury prevention',
      icon: Activity,
      iconColor: 'text-gray-300',
      iconBg: 'bg-gradient-to-br from-gray-500/10 to-gray-600/10',
      borderColor: 'border-gray-500/20 hover:border-gray-400/30',
      shadowColor: 'hover:shadow-gray-500/10',
    },
    {
      title: 'Conditioning',
      description: 'Cardiovascular and endurance training',
      icon: Zap,
      iconColor: 'text-gray-300',
      iconBg: 'bg-gradient-to-br from-gray-500/10 to-gray-600/10',
      borderColor: 'border-gray-500/20 hover:border-gray-400/30',
      shadowColor: 'hover:shadow-gray-500/10',
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
    <div className="dashboard-container">
      {/* Professional Background */}
      <div className="dashboard-background"></div>
      
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">
              <div className="dashboard-logo-icon-inner"></div>
            </div>
            <h1 className="dashboard-title">ROUTINE SCHEMER</h1>
          </div>

          <div className="dashboard-user-section">
            <div className="dashboard-user-info">
              <div className="dashboard-user-avatar">
                {(user?.displayName || 'T')[0].toUpperCase()}
              </div>
              <div className="dashboard-user-details">
                <h3>{user?.displayName || 'Professional Trainer'}</h3>
                <p>Training Professional</p>
              </div>
            </div>
            <button onClick={signOut} className="dashboard-signout-btn">
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Welcome Section */}
        <div className="dashboard-welcome-section">
          <h2 className="dashboard-welcome-title">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Professional'}
          </h2>
          <p className="dashboard-welcome-subtitle">
            Design and manage your training programs with precision
          </p>
          <div className="dashboard-divider"></div>
        </div>

        {/* Program Categories */}
        <div className="dashboard-categories-section">
          <h3 className="dashboard-section-title">Training Specializations</h3>
          <div className="dashboard-categories-grid">
            {programCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div key={category.title} className="dashboard-category-card">
                  <div className="dashboard-category-icon">
                    <IconComponent size={28} color="#94a3b8" />
                  </div>
                  <h4 className="dashboard-category-title">{category.title}</h4>
                  <p className="dashboard-category-description">{category.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-quick-actions">
          <h3 className="dashboard-quick-actions-title">Professional Tools</h3>
          <div className="dashboard-actions-grid">
            <button 
              onClick={() => handleViewChange('create-program')}
              className="dashboard-action-btn"
            >
              <div className="dashboard-action-icon">
                <Plus size={20} color="#94a3b8" />
              </div>
              <span className="dashboard-action-label">New Program</span>
            </button>
            <button 
              onClick={() => handleViewChange('calendar')}
              className="dashboard-action-btn"
            >
              <div className="dashboard-action-icon">
                <Calendar size={20} color="#94a3b8" />
              </div>
              <span className="dashboard-action-label">Training Calendar</span>
            </button>
            <button 
              onClick={() => handleViewChange('exercises')}
              className="dashboard-action-btn"
            >
              <div className="dashboard-action-icon">
                <Dumbbell size={20} color="#94a3b8" />
              </div>
              <span className="dashboard-action-label">Exercise Library</span>
            </button>
            <button className="dashboard-action-btn">
              <div className="dashboard-action-icon">
                <FileText size={20} color="#94a3b8" />
              </div>
              <span className="dashboard-action-label">Templates</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
