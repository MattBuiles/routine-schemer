'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrainingProgram, CalendarEvent, Habit, Note, UserProfile } from '@/types';

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

// Temporary interface for session data
interface SessionData {
  completedAt?: {
    toDate(): Date;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  todaySchedule: TodaySchedule[];
  upcomingEvents: CalendarEvent[];
  activeRoutines: TrainingProgram[];
  favoriteHabits: Habit[];
  recentNotes: Note[];
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useDashboardData() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: {
      totalRoutines: 0,
      activeRoutines: 0,
      totalSessions: 0,
      weekSessions: 0,
      currentStreak: 0,
      weeklyGoal: 5,
      completionRate: 0,
      totalHabits: 0,
      activeHabits: 0,
      totalNotes: 0,
      monthlyProgress: 0
    },
    recentActivity: [],
    todaySchedule: [],
    upcomingEvents: [],
    activeRoutines: [],
    favoriteHabits: [],
    recentNotes: [],
    userProfile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user?.id) {
      setDashboardData(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));

        // Fetch user profile
        const userProfileRef = doc(db, 'users', user.id);
        const userProfileSnap = await getDoc(userProfileRef);
        const userProfile = userProfileSnap.exists() ? userProfileSnap.data() as UserProfile : null;

        // Fetch routines
        const routinesQuery = query(
          collection(db, 'routines'),
          where('userId', '==', user.id)
        );
        const routinesSnap = await getDocs(routinesQuery);
        const allRoutines = routinesSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() })) as TrainingProgram[];
        // Sort by updatedAt on client side
        allRoutines.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        const activeRoutines = allRoutines.filter(routine => routine.isActive);

        // Fetch recent sessions (from this week)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const sessionsQuery = query(
          collection(db, 'workoutSessions'),
          where('userId', '==', user.id)
        );
        const sessionsSnap = await getDocs(sessionsQuery);
        
        // Filter by week on client side
        const weekSessionsData = sessionsSnap.docs
          .filter(doc => {
            const data = doc.data() as SessionData;
            return data.completedAt && data.completedAt.toDate() >= oneWeekAgo;
          });
        const weekSessions = weekSessionsData.length;

        // Fetch habits
        const habitsQuery = query(
          collection(db, 'habits'),
          where('userId', '==', user.id)
        );
        const habitsSnap = await getDocs(habitsQuery);
        const allHabits = habitsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Habit[];
        // Sort by createdAt on client side
        allHabits.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const activeHabits = allHabits.filter(habit => habit.isActive);
        const favoriteHabits = allHabits.filter(habit => habit.isFavorite).slice(0, 3);

        // Fetch notes
        const notesQuery = query(
          collection(db, 'notes'),
          where('userId', '==', user.id)
        );
        const notesSnap = await getDocs(notesQuery);
        const allNotes = notesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Note[];
        // Sort and limit on client side
        allNotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const recentNotes = allNotes.slice(0, 5);

        // Fetch calendar events (next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const todayStr = new Date().toISOString().split('T')[0];
        
        const eventsQuery = query(
          collection(db, 'calendarEvents'),
          where('userId', '==', user.id)
        );
        const eventsSnap = await getDocs(eventsQuery);
        
        // Filter and sort by date on client side
        const allEvents = eventsSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() })) as CalendarEvent[];
        
        const filteredEvents = allEvents.filter(event => event.date >= todayStr);
        filteredEvents.sort((a, b) => a.date.localeCompare(b.date));
        const upcomingEvents = filteredEvents;

        // Calculate total sessions
        const totalSessionsQuery = query(
          collection(db, 'workoutSessions'),
          where('userId', '==', user.id)
        );
        const totalSessionsSnap = await getDocs(totalSessionsQuery);
        const totalSessions = totalSessionsSnap.docs.length;

        // Sort sessions by completedAt for streak calculation
        const totalSessionsData = totalSessionsSnap.docs
          .map(doc => doc.data())
          .filter((session: unknown) => (session as SessionData).completedAt)
          .map((session: unknown) => (session as SessionData).completedAt!.toDate())
          .sort((a: Date, b: Date) => b.getTime() - a.getTime());

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date();
        const checkDate = new Date(today);
        
        const sortedSessions = totalSessionsData;

        for (let i = 0; i < sortedSessions.length; i++) {
          const sessionDate = new Date(sortedSessions[i]);
          sessionDate.setHours(0, 0, 0, 0);
          checkDate.setHours(0, 0, 0, 0);

          if (sessionDate.getTime() === checkDate.getTime()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        // Calculate completion rate
        const weeklyGoal = userProfile?.weeklyGoal || 5; // Default to 5 sessions per week
        const completionRate = weeklyGoal > 0 ? Math.round((weekSessions / weeklyGoal) * 100) : 0;

        // Generate recent activity
        const recentActivity: RecentActivity[] = [];
        
        // Add recent sessions
        sessionsSnap.docs.slice(0, 3).forEach(doc => {
          const session = doc.data();
          recentActivity.push({
            id: doc.id,
            type: 'session',
            action: 'Completó sesión',
            item: session.routineName || 'Entrenamiento',
            timestamp: session.completedAt.toDate(),
            icon: 'CheckCircle'
          });
        });

        // Add recent routines
        allRoutines.slice(0, 2).forEach(routine => {
          recentActivity.push({
            id: routine.id,
            type: 'routine',
            action: routine.isActive ? 'Activó rutina' : 'Creó rutina',
            item: routine.name,
            timestamp: routine.updatedAt,
            icon: routine.isActive ? 'Play' : 'Plus'
          });
        });

        // Add recent notes
        recentNotes.slice(0, 2).forEach(note => {
          recentActivity.push({
            id: note.id,
            type: 'note',
            action: 'Agregó nota',
            item: note.title,
            timestamp: note.createdAt,
            icon: 'FileText'
          });
        });

        // Sort recent activity by timestamp
        recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Generate today's schedule
        const todaySchedule: TodaySchedule[] = [];
        const todayEvents = upcomingEvents.filter(event => {
          const eventDate = new Date(event.date);
          const today = new Date();
          return eventDate.toDateString() === today.toDateString();
        });

        todayEvents.forEach(event => {
          todaySchedule.push({
            id: event.id,
            time: event.time || '00:00',
            title: event.title,
            type: event.type as 'routine' | 'habit' | 'note',
            duration: event.duration,
            completed: event.completed || false,
            isNext: false
          });
        });

        // Mark next upcoming event
        const nextEvent = todaySchedule
          .filter(event => !event.completed)
          .sort((a, b) => a.time.localeCompare(b.time))[0];
        
        if (nextEvent) {
          nextEvent.isNext = true;
        }

        // Calculate monthly progress
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const monthlySessionsQuery = query(
          collection(db, 'workoutSessions'),
          where('userId', '==', user.id)
        );
        const monthlySessionsSnap = await getDocs(monthlySessionsQuery);
        
        // Filter by month on client side
        const monthlySessions = monthlySessionsSnap.docs
          .map(doc => doc.data())
          .filter((session: unknown) => {
            const s = session as SessionData;
            return s.completedAt && s.completedAt.toDate() >= thisMonth;
          }).length;
        const daysInMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0).getDate();
        const monthlyGoal = Math.round((weeklyGoal * daysInMonth) / 7);
        const monthlyProgress = monthlyGoal > 0 ? Math.round((monthlySessions / monthlyGoal) * 100) : 0;

        setDashboardData({
          stats: {
            totalRoutines: allRoutines.length,
            activeRoutines: activeRoutines.length,
            totalSessions,
            weekSessions,
            currentStreak,
            weeklyGoal,
            completionRate,
            totalHabits: allHabits.length,
            activeHabits: activeHabits.length,
            totalNotes: recentNotes.length,
            monthlyProgress
          },
          recentActivity: recentActivity.slice(0, 8),
          todaySchedule,
          upcomingEvents: upcomingEvents.slice(0, 5),
          activeRoutines: activeRoutines.slice(0, 4),
          favoriteHabits,
          recentNotes,
          userProfile,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar los datos del dashboard'
        }));
      }
    };

    fetchDashboardData();

    // Set up real-time listeners for key collections
    const unsubscribeRoutines = onSnapshot(
      query(collection(db, 'routines'), where('userId', '==', user.id)),
      () => fetchDashboardData()
    );

    const unsubscribeHabits = onSnapshot(
      query(collection(db, 'habits'), where('userId', '==', user.id)),
      () => fetchDashboardData()
    );

    return () => {
      unsubscribeRoutines();
      unsubscribeHabits();
    };
  }, [user?.id]);

  return dashboardData;
}
