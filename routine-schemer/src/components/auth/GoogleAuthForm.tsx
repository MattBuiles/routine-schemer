import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dumbbell, Chrome } from 'lucide-react';

export default function GoogleAuthForm() {
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Dumbbell className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Routine Schemer
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Your personal fitness companion
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Welcome to your fitness journey
              </h2>
              <p className="text-gray-600">
                Create, track, and achieve your fitness goals with personalized workout routines.
              </p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 text-lg font-medium bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
              variant="outline"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Chrome className="h-5 w-5 text-blue-600" />
                  <span>Continue with Google</span>
                </div>
              )}
            </Button>

            <div className="text-center text-sm text-gray-500 space-y-2">
              <p>Secure authentication powered by Google</p>
              <p>• Create unlimited workout programs</p>
              <p>• Access 1000+ exercise database</p>
              <p>• Track your fitness progress</p>
              <p>• Plan workouts with calendar</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
