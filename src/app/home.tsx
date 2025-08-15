'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/auth/AuthForm';
import Dashboard from '@/components/Dashboard';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const { user, loading } = useAuth();

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
        {user ? <Dashboard /> : <AuthForm />}
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
