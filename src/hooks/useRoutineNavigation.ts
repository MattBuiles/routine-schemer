'use client';

import { useState } from 'react';

export type RoutineView = 'list' | 'create' | 'edit' | 'details';

export function useRoutineNavigation() {
  const [currentView, setCurrentView] = useState<RoutineView>('list');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string | null>(null);

  const navigateToList = () => {
    setCurrentView('list');
    setSelectedRoutineId(null);
  };

  const navigateToCreate = () => {
    setCurrentView('create');
    setSelectedRoutineId(null);
  };

  const navigateToEdit = (routineId: string) => {
    setCurrentView('edit');
    setSelectedRoutineId(routineId);
  };

  const navigateToDetails = (routineId: string) => {
    setCurrentView('details');
    setSelectedRoutineId(routineId);
  };

  return {
    currentView,
    selectedRoutineId,
    navigateToList,
    navigateToCreate,
    navigateToEdit,
    navigateToDetails
  };
}
