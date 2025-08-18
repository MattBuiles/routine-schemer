'use client';

import { MyRoutines } from './MyRoutines';
import CreateProgram from './CreateProgram';
import { useRoutineNavigation } from '@/hooks/useRoutineNavigation';

export function RoutineManager() {
  const { currentView, navigateToList, navigateToCreate } = useRoutineNavigation();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'create':
        return <CreateProgram onBack={navigateToList} />;
      case 'list':
      default:
        return <MyRoutines onCreateNew={navigateToCreate} />;
    }
  };

  return (
    <div className="w-full">
      {renderCurrentView()}
    </div>
  );
}

export default RoutineManager;
