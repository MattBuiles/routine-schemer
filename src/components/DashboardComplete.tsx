'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation, NavigationView } from '@/components/ui/navigation';
import DashboardHome from '@/components/DashboardHome';
import { MyRoutines } from '@/components/routine/MyRoutines';
import CreateProgram from '@/components/routine/CreateProgram';
import ExerciseLibrary from '@/components/routine/ExerciseLibrary';
import WorkoutCalendar from '@/components/routine/WorkoutCalendar';
import { HabitsAndNotes } from '@/components/routine/HabitsAndNotes';
import { History } from '@/components/routine/History';
import { Profile } from '@/components/routine/Profile';
import { Settings } from '@/components/routine/Settings';
import { useDashboardData } from '@/hooks/useDashboardData';
import { CalendarEvent } from '@/types';
import { toast } from 'react-hot-toast';

export default function DashboardComplete() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<NavigationView>('dashboard');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const handleViewChange = (view: NavigationView) => {
    setCurrentView(view);
    const viewNames = {
      'dashboard': 'Dashboard',
      'my-routines': 'Mis Rutinas',
      'create-routine': 'Crear Rutina',
      'calendar': 'Calendario',
      'exercises': 'Biblioteca de Ejercicios',
      'habits-notes': 'Hábitos y Notas',
      'history': 'Historial',
      'profile': 'Perfil',
      'settings': 'Configuración'
    };
    toast.success(`Cambiado a ${viewNames[view]}`);
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
    setCurrentView('my-routines');
    toast.success('Programa creado exitosamente');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardHome onViewChange={handleViewChange} />;
      
      case 'my-routines':
        return <MyRoutines onCreateNew={() => setCurrentView('create-routine')} />;
      
      case 'create-routine':
        return (
          <CreateProgram 
            onProgramCreated={handleProgramCreated} 
            onCancel={() => setCurrentView('my-routines')}
          />
        );
      
      case 'calendar':
        return (
          <WorkoutCalendar
            events={calendarEvents}
            onEventAdd={handleAddCalendarEvent}
            onEventUpdate={handleUpdateCalendarEvent}
            onEventDelete={handleDeleteCalendarEvent}
            availableSessions={[]}
          />
        );
      
      case 'exercises':
        return <ExerciseLibrary />;
      
      case 'habits-notes':
        return <HabitsAndNotes />;
      
      case 'history':
        return <History />;
      
      case 'profile':
        return <Profile />;
      
      case 'settings':
        return <Settings />;
      
      default:
        return <DashboardHome onViewChange={handleViewChange} />;
    }
  };

  return (
    <div className="min-h-screen gradient-background">
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
        userName={user?.displayName}
        onSignOut={signOut}
      />
      <main className="relative z-10">
        {renderCurrentView()}
      </main>
    </div>
  );
}
