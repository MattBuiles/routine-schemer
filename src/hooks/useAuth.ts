import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { firestoreService } from '@/lib/firestoreService';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, loading, setUser, setLoading, logout } = useAuthStore();

  // For development - bypass Firebase auth and set a mock user
  useEffect(() => {
    const mockUser = {
      id: 'demo-user-123',
      email: 'demo@example.com',
      displayName: 'Demo User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setUser(mockUser);
    setLoading(false);
  }, [setUser, setLoading]);

  const signInWithGoogle = async () => {
    // Mock sign in for development
    const mockUser = {
      id: 'demo-user-123',
      email: 'demo@example.com',
      displayName: 'Demo User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setUser(mockUser);
    setLoading(false);
    toast.success('Successfully signed in with Google!');
  };

  const signOutUser = async () => {
    logout();
    toast.success('Successfully signed out!');
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOut: signOutUser,
    isAuthenticated: !!user,
  };
};
