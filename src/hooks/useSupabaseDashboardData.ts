import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabaseService';
import { useSupabaseAuth } from '@/store/supabaseAuthStore';
import { 
  UserProfile, 
  TrainingProgram, 
  CalendarEvent, 
  Habit,
  HabitRecord,
  Note,
  WorkoutSession 
} from '@/types';

interface DashboardData {
  userProfile: UserProfile | null;
  programs: TrainingProgram[];
  recentSessions: WorkoutSession[];
  upcomingEvents: CalendarEvent[];
  habits: Habit[];
  habitRecords: HabitRecord[];
  notes: Note[];
  stats: {
    totalWorkouts: number;
    weeklyWorkouts: number;
    monthlyWorkouts: number;
    currentStreak: number;
  };
}

export function useSupabaseDashboardData() {
  const { user } = useSupabaseAuth();
  const [data, setData] = useState<DashboardData>({
    userProfile: null,
    programs: [],
    recentSessions: [],
    upcomingEvents: [],
    habits: [],
    habitRecords: [],
    notes: [],
    stats: {
      totalWorkouts: 0,
      weeklyWorkouts: 0,
      monthlyWorkouts: 0,
      currentStreak: 0,
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
        const [
          userProfile,
          programs,
          recentSessions,
          upcomingEvents,
          habits,
          notes,
        ] = await Promise.all([
          supabaseService.getUserProfile(user.id),
          supabaseService.getTrainingProgramsByUserId(user.id),
          supabaseService.getWorkoutSessionsByUserId(user.id),
          supabaseService.getCalendarEventsByUserId(
            user.id,
            new Date().toISOString().split('T')[0],
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          ),
          supabaseService.getHabitsByUserId(user.id),
          supabaseService.getNotesByUserId(user.id),
        ]);

        // Get habit records for active habits
        const habitRecords = habits.length > 0
          ? await Promise.all(
              habits.map(habit =>
                supabaseService.getHabitRecords(
                  habit.id,
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  new Date().toISOString().split('T')[0]
                )
              )
            ).then(records => records.flat())
          : [];

        // Calculate stats
        const completedEvents = upcomingEvents.filter(e => e.completed && e.type === 'workout');
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const weeklyWorkouts = completedEvents.filter(
          e => new Date(e.date) >= weekAgo
        ).length;

        const monthlyWorkouts = completedEvents.filter(
          e => new Date(e.date) >= monthAgo
        ).length;

        // Calculate current streak
        let currentStreak = 0;
        const sortedEvents = [...upcomingEvents]
          .filter(e => e.completed && e.type === 'workout')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const event of sortedEvents) {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);

          const diffDays = Math.floor(
            (currentDate.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 0 || diffDays === 1) {
            currentStreak++;
            currentDate = eventDate;
          } else {
            break;
          }
        }

        if (isMounted) {
          setData({
            userProfile,
            programs,
            recentSessions: recentSessions.slice(0, 5),
            upcomingEvents,
            habits,
            habitRecords,
            notes,
            stats: {
              totalWorkouts: completedEvents.length,
              weeklyWorkouts,
              monthlyWorkouts,
              currentStreak,
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

    // Set up real-time subscriptions (optional)
    const eventsSubscription = supabaseService.subscribeToCalendarEvents(
      user.id,
      (events) => {
        if (isMounted) {
          setData(prev => ({ ...prev, upcomingEvents: events }));
        }
      }
    );

    const sessionsSubscription = supabaseService.subscribeToWorkoutSessions(
      user.id,
      (sessions) => {
        if (isMounted) {
          setData(prev => ({ ...prev, recentSessions: sessions.slice(0, 5) }));
        }
      }
    );

    return () => {
      isMounted = false;
      eventsSubscription.unsubscribe();
      sessionsSubscription.unsubscribe();
    };
  }, [user]);

  const refreshData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const programs = await supabaseService.getTrainingProgramsByUserId(user.id);
      setData(prev => ({ ...prev, programs }));
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
