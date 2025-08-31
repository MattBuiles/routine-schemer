'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { firestoreService } from '@/lib/firestoreService';
import { firestoreHabitsNotesService } from '@/lib/firestoreHabitsNotesService';
import { TrainingProgram, CalendarEvent, Habit, Note, UserProfile, WorkoutSession } from '@/types';

interface DashboardStats {
  totalRoutines: number;
  activeRoutines: number;
  totalSessions: number;
  weekSessions: number;
  currentStreak: number;
  weeklyGoal: number;
  completionRate: number;
  totalHabits: number;
  activeHabits: number;
  totalNotes: number;
  monthlyProgress: number;
}

interface RecentActivity {
  id: string;
  type: 'routine' | 'session' | 'habit' | 'note';
  action: string;
  item: string;
  timestamp: Date;
  icon: string;
}

interface TodaySchedule {
  id: string;
  time: string;
  title: string;
  type: 'routine' | 'habit' | 'note';
  duration?: number;
  completed: boolean;
  isNext?: boolean;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  todaySchedule: TodaySchedule[];
  favoriteHabits: Habit[];
  recentNotes: Note[];
  upcomingEvents: CalendarEvent[];
  userProfile: UserProfile | null;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get user profile
        const userProfiles = await firestoreService.getUserProfilesByUserId(user.id);
        const userProfile = userProfiles.length > 0 ? userProfiles[0] : null;

        // Fetch all data in parallel
        const [
          allRoutines,
          allHabits,
          allNotes,
          allSessions,
          allEvents
        ] = await Promise.all([
          firestoreService.getTrainingProgramsByUserId(user.id),
          firestoreHabitsNotesService.getHabitsByUserId(user.id),
          firestoreHabitsNotesService.getNotesByUserId(user.id),
          firestoreService.getWorkoutSessionsByUserId(user.id),
          firestoreService.getCalendarEventsByUserId(user.id)
        ]);

        // Process data
        const activeRoutines = allRoutines.filter((routine: TrainingProgram) => routine.isActive !== false);
        const activeHabits = allHabits.filter((habit: Habit) => habit.isActive);
        const favoriteHabits = allHabits.filter((habit: Habit) => habit.isFavorite).slice(0, 3);
        const recentNotes = allNotes.slice(0, 5);

        // Calculate week sessions
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weekSessions = allSessions.filter((session: WorkoutSession) => 
          session.completedAt && session.completedAt >= oneWeekAgo
        ).length;

        // Calculate current streak (consecutive workout days)
        const calculateStreak = (sessions: WorkoutSession[]): number => {
          if (sessions.length === 0) return 0;
          
          const sortedSessions = sessions
            .filter(s => s.completedAt)
            .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());

          let streak = 0;
          const today = new Date();
          today.setHours(23, 59, 59, 999);

          for (let i = 0; i < sortedSessions.length; i++) {
            const sessionDate = new Date(sortedSessions[i].completedAt!);
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - streak);
            expectedDate.setHours(0, 0, 0, 0);
            
            sessionDate.setHours(0, 0, 0, 0);

            if (sessionDate.getTime() === expectedDate.getTime()) {
              streak++;
            } else if (sessionDate.getTime() < expectedDate.getTime()) {
              break;
            }
          }

          return streak;
        };

        const currentStreak = calculateStreak(allSessions);

        // Calculate completion rate (this month)
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const monthSessions = allSessions.filter((session: WorkoutSession) => 
          session.completedAt && session.completedAt >= thisMonth
        );
        const daysInMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0).getDate();
        const completionRate = Math.round((monthSessions.length / daysInMonth) * 100);

        // Generate recent activity
        const recentActivity: RecentActivity[] = [];

        // Add routine activities
        allRoutines.slice(0, 3).forEach((routine: TrainingProgram) => {
          recentActivity.push({
            id: routine.id,
            type: 'routine',
            action: 'Created routine',
            item: routine.name,
            timestamp: routine.createdAt,
            icon: '🏋️'
          });
        });

        // Add habit activities
        activeHabits.slice(0, 2).forEach((habit: Habit) => {
          recentActivity.push({
            id: habit.id,
            type: 'habit',
            action: 'Added habit',
            item: habit.name,
            timestamp: habit.createdAt,
            icon: habit.icon || '✓'
          });
        });

        // Add note activities
        allNotes.slice(0, 2).forEach((note: Note) => {
          recentActivity.push({
            id: note.id,
            type: 'note',
            action: 'Created note',
            item: note.title,
            timestamp: note.createdAt,
            icon: '📝'
          });
        });

        // Sort by timestamp
        recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Generate today's schedule
        const todayStr = new Date().toISOString().split('T')[0];
        const todayEvents = allEvents.filter((event: CalendarEvent) => event.date === todayStr);

        const todaySchedule: TodaySchedule[] = todayEvents.map((event: CalendarEvent) => ({
          id: event.id,
          time: event.time || '00:00',
          title: event.title,
          type: event.type as 'routine' | 'habit' | 'note',
          duration: event.duration,
          completed: event.completed || false,
        }));

        // Sort by time
        todaySchedule.sort((a, b) => a.time.localeCompare(b.time));

        // Mark next incomplete item
        const nextIncomplete = todaySchedule.find(item => !item.completed);
        if (nextIncomplete) {
          nextIncomplete.isNext = true;
        }

        // Filter upcoming events (next 7 days, excluding today)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const upcomingEvents = allEvents.filter((event: CalendarEvent) => {
          const eventDate = new Date(event.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const nextWeekDate = new Date(nextWeek);
          nextWeekDate.setHours(23, 59, 59, 999);
          
          return eventDate > today && eventDate <= nextWeekDate;
        }).sort((a, b) => a.date.localeCompare(b.date));

        const stats: DashboardStats = {
          totalRoutines: allRoutines.length,
          activeRoutines: activeRoutines.length,
          totalSessions: allSessions.length,
          weekSessions,
          currentStreak,
          weeklyGoal: 5, // This could be user-configurable
          completionRate,
          totalHabits: allHabits.length,
          activeHabits: activeHabits.length,
          totalNotes: allNotes.length,
          monthlyProgress: completionRate,
        };

        setData({
          stats,
          recentActivity: recentActivity.slice(0, 10),
          todaySchedule,
          favoriteHabits,
          recentNotes,
          upcomingEvents,
          userProfile,
        });

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const refreshData = async () => {
    if (user) {
      setLoading(true);
      // Trigger a re-run of the useEffect by setting data to null
      setData(null);
    }
  };

  return {
    data,
    loading,
    error,
    refreshData,
  };
};
