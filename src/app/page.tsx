'use client';

import React, { useEffect } from 'react';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';
import SupabaseAuthForm from '@/components/auth/SupabaseAuthForm';
import DashboardComplete from '@/components/DashboardComplete';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const { user, loading, initialize } = useSupabaseAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

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
      <main className="min-h-screen">
        {user ? <DashboardComplete /> : <SupabaseAuthForm />}
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
