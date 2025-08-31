import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import ExerciseLibrary from '@/components/routine/ExerciseLibrary';
import WorkoutCalendar from '@/components/routine/WorkoutCalendar';
import RoutineManager from '@/components/routine/RoutineManager';
import { useDashboardData } from '@/hooks/useDashboardData';
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
  FileText,
  TrendingUp,
  List
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import '@/styles/dashboard.css';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { data: dashboardData, loading: dashboardLoading } = useDashboardData();
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar' | 'exercises' | 'routines'>('dashboard');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleViewChange = (view: 'dashboard' | 'calendar' | 'exercises' | 'routines') => {
    setCurrentView(view);
    const viewNames = {
      'dashboard': 'Dashboard',
      'calendar': 'Training Calendar',
      'exercises': 'Exercise Library',
      'routines': 'My Routines'
    };
    toast.success(`Switched to ${viewNames[view]}`);
  };

  const handleCategorySelect = (categoryTitle: string) => {
    if (selectedCategory === categoryTitle) {
      setSelectedCategory(null);
      toast(`Cleared ${categoryTitle} selection`);
    } else {
      setSelectedCategory(categoryTitle);
      toast.success(`Selected ${categoryTitle} programs`);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'my-routines':
        handleViewChange('routines');
        break;
      case 'new-program':
        handleViewChange('routines');
        break;
      case 'calendar':
        handleViewChange('calendar');
        break;
      case 'exercises':
        handleViewChange('exercises');
        break;
      case 'templates':
        toast('Templates feature coming soon!', { icon: '📝' });
        break;
    }
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

  // Recent activity data
  const recentActivity = [
    { action: 'Created program', item: 'Upper Body Strength', time: '2 hours ago', type: 'create' },
    { action: 'Completed session', item: 'Leg Day', time: '1 day ago', type: 'complete' },
    { action: 'Modified program', item: 'Cardio Intensive', time: '2 days ago', type: 'modify' },
    { action: 'Added exercise', item: 'Bulgarian Split Squats', time: '3 days ago', type: 'add' }
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

  if (currentView === 'routines') {
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
                  <h1 className="text-2xl font-bold text-luxury">My Routines</h1>
                  <p className="text-sm text-gray-400">Manage your training programs</p>
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
          <RoutineManager />
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
            {/* Quick Stats */}
            <div className="dashboard-stats-mini">
              <div className="dashboard-stat-mini">
                <span className="dashboard-stat-mini-number">24</span>
                <span className="dashboard-stat-mini-label">Programs</span>
              </div>
              <div className="dashboard-stat-mini">
                <span className="dashboard-stat-mini-number">156</span>
                <span className="dashboard-stat-mini-label">Sessions</span>
              </div>
            </div>

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
              const isSelected = selectedCategory === category.title;
              const categoryStats = {
                'Strength': { programs: 12, active: 3 },
                'Hypertrophy': { programs: 8, active: 2 },
                'Rehabilitation': { programs: 15, active: 4 },
                'Conditioning': { programs: 6, active: 1 }
              };
              
              return (
                <div 
                  key={category.title} 
                  className={`dashboard-category-card ${isSelected ? 'dashboard-category-card-selected' : ''}`}
                  onClick={() => handleCategorySelect(category.title)}
                >
                  <div className="dashboard-category-icon">
                    <IconComponent size={28} color="#94a3b8" />
                  </div>
                  <h4 className="dashboard-category-title">{category.title}</h4>
                  <p className="dashboard-category-description">{category.description}</p>
                  
                  {/* Category Statistics */}
                  <div className="dashboard-category-stats">
                    <div className="dashboard-category-stat">
                      <span className="dashboard-category-stat-number">
                        {categoryStats[category.title as keyof typeof categoryStats].programs}
                      </span>
                      <span className="dashboard-category-stat-label">Programs</span>
                    </div>
                    <div className="dashboard-category-stat">
                      <TrendingUp size={16} color="#10b981" />
                      <span className="dashboard-category-stat-label">
                        {categoryStats[category.title as keyof typeof categoryStats].active} Active
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-quick-actions">
          <h3 className="dashboard-quick-actions-title">Recent Activity</h3>
          <div className="dashboard-activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="dashboard-activity-item">
                <div className="dashboard-activity-icon">
                  {activity.type === 'create' && <Plus size={16} color="#10b981" />}
                  {activity.type === 'complete' && <Target size={16} color="#3b82f6" />}
                  {activity.type === 'modify' && <Activity size={16} color="#f59e0b" />}
                  {activity.type === 'add' && <Dumbbell size={16} color="#8b5cf6" />}
                </div>
                <div className="dashboard-activity-content">
                  <span className="dashboard-activity-action">{activity.action}</span>
                  <span className="dashboard-activity-item-name">{activity.item}</span>
                </div>
                <span className="dashboard-activity-time">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-quick-actions">
          <h3 className="dashboard-quick-actions-title">Professional Tools</h3>
          <div className="dashboard-actions-grid">
            <button 
              onClick={() => handleQuickAction('my-routines')}
              className="dashboard-action-btn"
            >
              <div className="dashboard-action-icon">
                <List size={20} color="#94a3b8" />
              </div>
              <span className="dashboard-action-label">My Routines</span>
            </button>
            <button 
              onClick={() => handleQuickAction('new-program')}
              className="dashboard-action-btn"
            >
              <div className="dashboard-action-icon">
                <Plus size={20} color="#94a3b8" />
              </div>
              <span className="dashboard-action-label">New Program</span>
            </button>
            <button 
              onClick={() => handleQuickAction('calendar')}
              className="dashboard-action-btn"
            >
              <div className="dashboard-action-icon">
                <Calendar size={20} color="#94a3b8" />
              </div>
              <span className="dashboard-action-label">Training Calendar</span>
            </button>
            <button 
              onClick={() => handleQuickAction('exercises')}
              className="dashboard-action-btn"
            >
              <div className="dashboard-action-icon">
                <Dumbbell size={20} color="#94a3b8" />
              </div>
              <span className="dashboard-action-label">Exercise Library</span>
            </button>
            <button 
              onClick={() => handleQuickAction('templates')}
              className="dashboard-action-btn"
            >
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
