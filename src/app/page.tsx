'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import GoogleAuthForm from '@/components/auth/GoogleAuthForm';
import DashboardComplete from '@/components/DashboardComplete';
import { Toaster } from 'react-hot-toast';
import { autoInitializeIfNeeded } from '@/lib/initializeFirebase';

export default function Home() {
  const { user, loading } = useAuth();

  // Auto-initialize Firebase data when app loads
  useEffect(() => {
    autoInitializeIfNeeded();
  }, []);

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
        {user ? <DashboardComplete /> : <GoogleAuthForm />}
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
