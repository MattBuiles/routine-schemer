'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { supabaseService } from '@/lib/supabaseService';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from the URL
        const { data, error } = await supabase.auth.exchangeCodeForSession(
          window.location.search
        );

        if (error) throw error;

        // Verificar si el usuario tiene perfil, si no, crearlo
        if (data?.user) {
          const profile = await supabaseService.getUserProfile(data.user.id);
          if (!profile) {
            // Crear perfil automáticamente
            await supabaseService.updateUserProfile(data.user.id, {
              age: 25,
              weight: 70,
              height: 175,
              preferences: {
                theme: 'dark',
                language: 'es',
                units: 'metric',
                weekStartDay: 'monday',
                defaultRestTime: 90,
                notifications: {
                  workoutReminders: true,
                  habitReminders: true,
                  progressUpdates: true,
                  emailNotifications: false
                }
              }
            });
          }
        }

        // Redirect to home on success
        router.push('/');
      } catch (error) {
        console.error('Error during auth callback:', error);
        router.push('/');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Autenticando...</p>
      </div>
    </div>
  );
}
