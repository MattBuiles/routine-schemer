'use client';

import { useState } from 'react';
import { MyRoutines } from './MyRoutines';
import CreateProgram from './CreateProgram';
import { useRoutineNavigation } from '@/hooks/useRoutineNavigation';
import { Program } from '@/types/program';

export function RoutineManager() {
  const { currentView, navigateToList, navigateToCreate } = useRoutineNavigation();
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    navigateToCreate();
  };

  const handleBackFromEdit = () => {
    setEditingProgram(null);
    navigateToList();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
        return (
          <CreateProgram 
            onBack={handleBackFromEdit} 
            editingProgram={editingProgram}
            onProgramCreated={() => {
              setEditingProgram(null);
            }}
          />
        );
      case 'list':
      default:
        return (
          <MyRoutines 
            onCreateNew={() => {
              setEditingProgram(null);
              navigateToCreate();
            }}
            onEditProgram={handleEdit}
          />
        );
    }
  };

  return (
    <div className="w-full">
      {renderCurrentView()}
    </div>
  );
}

export default RoutineManager;
