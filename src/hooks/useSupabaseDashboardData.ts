import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabaseService';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';
import type { Program } from '@/types/program';

interface DashboardData {
  userProfile: unknown | null;
  programs: Program[];
  stats: {
    totalPrograms: number;
    activePrograms: number;
    totalWeeks: number;
  };
}

export function useSupabaseDashboardData() {
  const { user } = useSupabaseAuth();
  const [data, setData] = useState<DashboardData>({
    userProfile: null,
    programs: [],
    stats: {
      totalPrograms: 0,
      activePrograms: 0,
      totalWeeks: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Parallel data fetching for better performance
        const [userProfile, programs] = await Promise.all([
          supabaseService.getUserProfile(user.id),
          supabaseService.getProgramsByUser(user.id),
        ]);

        // Calculate stats
        const activePrograms = programs.filter(p => p.isActive).length;
        const totalWeeks = programs.reduce((sum, p) => {
          // Calculate total weeks from mesocycles
          const programWeeks = p.mesocycles?.reduce(
            (mSum, m) => mSum + m.durationWeeks,
            0
          ) || 0;
          return sum + programWeeks;
        }, 0);

        if (isMounted) {
          setData({
            userProfile,
            programs,
            stats: {
              totalPrograms: programs.length,
              activePrograms,
              totalWeeks,
            },
          });
          setError(null);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const refreshData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const programs = await supabaseService.getProgramsByUser(user.id);
      
      const activePrograms = programs.filter(p => p.isActive).length;
      const totalWeeks = programs.reduce((sum, p) => {
        const programWeeks = p.mesocycles?.reduce(
          (mSum, m) => mSum + m.durationWeeks,
          0
        ) || 0;
        return sum + programWeeks;
      }, 0);

      setData(prev => ({
        ...prev,
        programs,
        stats: {
          totalPrograms: programs.length,
          activePrograms,
          totalWeeks,
        },
      }));
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    ...data,
    loading,
    error,
    refreshData,
  };
}
