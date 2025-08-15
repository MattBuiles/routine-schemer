'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
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
          where('userId', '==', user.id),
          orderBy('updatedAt', 'desc')
        );
        const routinesSnap = await getDocs(routinesQuery);
        const allRoutines = routinesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TrainingProgram[];
        const activeRoutines = allRoutines.filter(routine => routine.isActive);

        // Fetch recent sessions (from this week)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const sessionsQuery = query(
          collection(db, 'workoutSessions'),
          where('userId', '==', user.id),
          where('completedAt', '>=', oneWeekAgo),
          orderBy('completedAt', 'desc')
        );
        const sessionsSnap = await getDocs(sessionsQuery);
        const weekSessions = sessionsSnap.docs.length;

        // Fetch habits
        const habitsQuery = query(
          collection(db, 'habits'),
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc')
        );
        const habitsSnap = await getDocs(habitsQuery);
        const allHabits = habitsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Habit[];
        const activeHabits = allHabits.filter(habit => habit.isActive);
        const favoriteHabits = allHabits.filter(habit => habit.isFavorite).slice(0, 3);

        // Fetch notes
        const notesQuery = query(
          collection(db, 'notes'),
          where('userId', '==', user.id),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const notesSnap = await getDocs(notesQuery);
        const recentNotes = notesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Note[];

        // Fetch calendar events (next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const eventsQuery = query(
          collection(db, 'calendarEvents'),
          where('userId', '==', user.id),
          where('date', '>=', new Date().toISOString().split('T')[0]),
          orderBy('date', 'asc')
        );
        const eventsSnap = await getDocs(eventsQuery);
        const upcomingEvents = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CalendarEvent[];

        // Calculate streak and completion rate
        const totalSessionsQuery = query(
          collection(db, 'workoutSessions'),
          where('userId', '==', user.id),
          orderBy('completedAt', 'desc')
        );
        const totalSessionsSnap = await getDocs(totalSessionsQuery);
        const totalSessions = totalSessionsSnap.docs.length;

        // Calculate current streak
        let currentStreak = 0;
        const today = new Date();
        const checkDate = new Date(today);
        
        const sortedSessions = totalSessionsSnap.docs
          .map(doc => doc.data().completedAt.toDate())
          .sort((a, b) => b.getTime() - a.getTime());

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
          where('userId', '==', user.id),
          where('completedAt', '>=', thisMonth),
          orderBy('completedAt', 'desc')
        );
        const monthlySessionsSnap = await getDocs(monthlySessionsQuery);
        const monthlySessions = monthlySessionsSnap.docs.length;
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
