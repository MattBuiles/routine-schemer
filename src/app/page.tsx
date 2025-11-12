'use client';

import React, { useEffect, useState } from 'react';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';
import SupabaseAuthForm from '@/components/auth/SupabaseAuthForm';
import DashboardComplete from '@/components/DashboardComplete';
import DashboardPlanOverview from '@/components/DashboardPlanOverview';
import { Toaster } from 'react-hot-toast';
import { LayoutGrid, Layers } from 'lucide-react';
import viewConfig from '@/config/viewConfig';

const VIEW_PREFERENCE_KEY = 'routine-schemer-view-preference';

export default function Home() {
  const { user, loading, initialize } = useSupabaseAuth();
  const [usePlanningView, setUsePlanningView] = useState(viewConfig.defaultToPlanningView);

  useEffect(() => {
    initialize();
    
    // Cargar preferencia guardada si está habilitado
    if (viewConfig.rememberViewPreference && typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem(VIEW_PREFERENCE_KEY);
      if (savedPreference !== null) {
        setUsePlanningView(savedPreference === 'true');
      }
    }
  }, [initialize]);

  const handleToggleView = () => {
    const newValue = !usePlanningView;
    setUsePlanningView(newValue);
    
    // Guardar preferencia si está habilitado
    if (viewConfig.rememberViewPreference && typeof window !== 'undefined') {
      localStorage.setItem(VIEW_PREFERENCE_KEY, String(newValue));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Routine Schemer...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen relative">
        {user ? (
          <>
            {/* Toggle Button - Solo visible cuando hay usuario y está habilitado */}
            {viewConfig.showViewToggle && (
              <div className="fixed top-4 right-4 z-50">
                <button
                  onClick={handleToggleView}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                  title={usePlanningView ? 'Cambiar a vista tradicional' : 'Cambiar a vista de planificación'}
                >
                  {usePlanningView ? (
                    <>
                      <LayoutGrid className="w-5 h-5" />
                      <span className="hidden sm:inline">Vista Tradicional</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-5 h-5" />
                      <span className="hidden sm:inline">Vista de Planificación</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Render del dashboard según la vista seleccionada */}
            {usePlanningView ? <DashboardPlanOverview /> : <DashboardComplete />}
          </>
        ) : (
          <SupabaseAuthForm />
        )}
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
}
