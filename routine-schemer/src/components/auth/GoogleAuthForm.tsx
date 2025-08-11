import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dumbbell, Chrome, Star, Zap, Shield, Trophy } from 'lucide-react';

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

  const features = [
    { icon: Zap, text: "1000+ Premium Exercises", color: "text-yellow-400" },
    { icon: Trophy, text: "Elite Performance Tracking", color: "text-orange-400" },
    { icon: Shield, text: "Secure Cloud Sync", color: "text-purple-400" },
    { icon: Star, text: "Personalized AI Coaching", color: "text-pink-400" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-animated"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl float"></div>
      <div className="absolute top-40 right-32 w-24 h-24 bg-purple-400/20 rounded-full blur-xl float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-pink-400/20 rounded-full blur-xl float" style={{animationDelay: '2s'}}></div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 pulse-glow">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Dumbbell className="h-8 w-8 text-black" />
              </div>
            </div>
            <h1 className="text-5xl font-black text-luxury mb-3">
              Routine Schemer
            </h1>
            <p className="text-xl text-gray-300 font-medium">
              Elite Fitness Experience
            </p>
          </div>

          {/* Main Card */}
          <Card className="card-premium card-glow border-0 backdrop-blur-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-white mb-4">
                Join the Elite
              </CardTitle>
              <p className="text-gray-300 text-lg leading-relaxed">
                Transform your fitness journey with our premium platform designed for champions
              </p>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Google Sign In Button */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn-premium w-full h-14 text-lg font-bold relative group"
              >
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-black border-t-transparent"></div>
                    <span>Accessing Elite Platform...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Chrome className="h-6 w-6 text-black group-hover:scale-110 transition-transform" />
                    <span>Continue with Google</span>
                  </div>
                )}
              </Button>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="glass p-4 rounded-xl text-center group hover:scale-105 transition-all duration-300"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <feature.icon className={`h-6 w-6 ${feature.color} mx-auto mb-2 group-hover:scale-110 transition-transform`} />
                    <p className="text-sm font-medium text-gray-300">
                      {feature.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Premium Stats */}
              <div className="text-center space-y-4 pt-4 border-t border-gray-700/50">
                <div className="flex justify-center space-x-8">
                  <div className="text-center">
                    <div className="counter">1000+</div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Exercises</p>
                  </div>
                  <div className="text-center">
                    <div className="counter">50K+</div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Users</p>
                  </div>
                  <div className="text-center">
                    <div className="counter">99.9%</div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Uptime</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-2 text-sm text-gray-300">Rated by 10K+ athletes</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400 leading-relaxed">
              By continuing, you agree to our 
              <span className="text-yellow-400 hover:text-yellow-300 cursor-pointer"> Terms of Service </span>
              and 
              <span className="text-yellow-400 hover:text-yellow-300 cursor-pointer"> Privacy Policy</span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Secure • Encrypted • World-Class
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
