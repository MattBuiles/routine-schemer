import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'demo-user-123',
    email: 'demo@example.com',
    displayName: 'Demo User',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  loading: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null }),
}));
