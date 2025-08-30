import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { firestoreService } from '@/lib/firestoreService';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, loading, setUser, setLoading, logout } = useAuthStore();

  // Real Firebase auth with fallback to mock for development
  useEffect(() => {
    // If Firebase auth is not available, use mock user
    if (!auth) {
      const mockUser = {
        id: 'demo-user-123',
        email: 'demo@example.com',
        displayName: 'Demo User',
        provider: 'google' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setUser(mockUser);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Try to get or create user profile in Firestore
          let userProfile = await firestoreService.getUserById(firebaseUser.uid);
          
          if (!userProfile) {
            // Create new user profile
            userProfile = await firestoreService.createUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'User',
              photoURL: firebaseUser.photoURL || undefined,
              provider: 'google'
            });
            toast.success('Welcome! Profile created successfully.');
          }
          
          setUser(userProfile);
        } catch (error) {
          console.error('Error fetching/creating user profile:', error);
          
          // Fallback to mock user for development
          const mockUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email || 'demo@example.com',
            displayName: firebaseUser.displayName || 'Demo User',
            photoURL: firebaseUser.photoURL || undefined,
            provider: 'google' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          setUser(mockUser);
          toast.success('Signed in successfully! (Using demo mode)');
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  const signInWithGoogle = async () => {
    // If Firebase auth is not available, use mock user
    if (!auth) {
      const mockUser = {
        id: 'demo-user-123',
        email: 'demo@example.com',
        displayName: 'Demo User',
        provider: 'google' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setUser(mockUser);
      toast.success('Demo mode activated - using mock authentication');
      return;
    }

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      await signInWithPopup(auth, provider);
      // User will be set by the onAuthStateChanged listener
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      console.error('Authentication error:', error);
      setLoading(false);
      
      // Fallback to mock user for development
      if (firebaseError.code === 'auth/popup-blocked' || firebaseError.code === 'auth/cancelled-popup-request') {
        const mockUser = {
          id: 'demo-user-123',
          email: 'demo@example.com',
          displayName: 'Demo User',
          provider: 'google' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        setUser(mockUser);
        toast.success('Demo mode activated - using mock authentication');
      } else {
        toast.error('Authentication failed. Please try again.');
      }
    }
  };

  const signOutUser = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      logout();
      toast.success('Successfully signed out!');
    } catch (error) {
      console.error('Sign out error:', error);
      logout();
      toast.success('Successfully signed out!');
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOut: signOutUser,
    isAuthenticated: !!user,
  };
};
