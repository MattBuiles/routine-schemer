import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { firestoreService } from '@/lib/firestoreService';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, loading, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Create user object from Firebase Auth data
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          setUser(userData);
          console.log('User data set:', userData);
          
          // Try to sync with Firestore in the background (non-blocking)
          setTimeout(async () => {
            try {
              const firestoreUser = await firestoreService.getUserById(firebaseUser.uid);
              
              if (!firestoreUser) {
                await firestoreService.createUser({
                  id: firebaseUser.uid,
                  email: firebaseUser.email!,
                  displayName: firebaseUser.displayName || undefined,
                });
                console.log('User created in Firestore');
              } else {
                console.log('User already exists in Firestore');
              }
            } catch (firestoreError) {
              console.warn('Firestore sync failed (background):', firestoreError);
            }
          }, 100);
          
        } catch (error) {
          console.error('Error processing user data:', error);
          toast.error('Error loading user data');
        }
      } else {
        setUser(null);
        console.log('User set to null');
      }
      
      setLoading(false);
      console.log('Loading set to false');
    });

    // Shorter timeout (3 seconds) just as a safety net
    const timeoutId = setTimeout(() => {
      console.warn('Auth loading timeout - forcing loading to false');
      setLoading(false);
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [setUser, setLoading]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle the rest
      
      toast.success('Successfully signed in with Google!');
    } catch (error: unknown) {
      console.error('Google sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      toast.error(errorMessage);
      setLoading(false); // Only set loading false on error
      throw error;
    }
    // Don't set loading false here - let onAuthStateChanged handle it
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      logout();
      toast.success('Successfully signed out!');
    } catch (error: unknown) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
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
