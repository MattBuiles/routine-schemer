import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { TrainingProgram, WorkoutSession, CalendarEvent, User, UserProfile, AppSettings } from '@/types';

export class FirestoreService {
  // Users Collection
  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const userData = {
      ...user,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, 'users'), userData);
    return {
      ...user,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getUserById(userId: string): Promise<User | null> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        email: data.email,
        displayName: data.displayName,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    }
    return null;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  // User Profiles Collection
  async createUserProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const now = new Date();
    const profileData = {
      ...profile,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, 'userProfiles'), profileData);
    return {
      ...profile,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getUserProfilesByUserId(userId: string): Promise<UserProfile[]> {
    const q = query(
      collection(db, 'userProfiles'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        age: data.age,
        weight: data.weight,
        height: data.height,
        bodyFat: data.bodyFat,
        activityLevel: data.activityLevel,
        goals: data.goals,
        experience: data.experience,
        preferences: data.preferences,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  }

  async updateUserProfile(profileId: string, updates: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, 'userProfiles', profileId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  async deleteUserProfile(profileId: string): Promise<void> {
    const docRef = doc(db, 'userProfiles', profileId);
    await deleteDoc(docRef);
  }

  // Listen to real-time updates for user profiles
  onUserProfilesChange(userId: string, callback: (profiles: UserProfile[]) => void) {
    const q = query(
      collection(db, 'userProfiles'),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const profiles = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          age: data.age,
          weight: data.weight,
          height: data.height,
          bodyFat: data.bodyFat,
          activityLevel: data.activityLevel,
          goals: data.goals,
          experience: data.experience,
          preferences: data.preferences,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as UserProfile;
      });
      callback(profiles);
    });
  }

  // App Settings Collection (for user-specific settings)
  async createAppSettings(settings: Omit<AppSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppSettings> {
    const now = new Date();
    const settingsData = {
      ...settings,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, 'appSettings'), settingsData);
    return {
      ...settings,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getAppSettingsByUserId(userId: string): Promise<AppSettings[]> {
    const q = query(
      collection(db, 'appSettings'),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        theme: data.theme,
        language: data.language,
        weekStartDay: data.weekStartDay,
        units: data.units,
        autoSave: data.autoSave,
        backupFrequency: data.backupFrequency,
        dataRetention: data.dataRetention,
        notifications: data.notifications,
        privacy: data.privacy,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  }

  async updateAppSettings(settingsId: string, updates: Partial<AppSettings>): Promise<void> {
    const docRef = doc(db, 'appSettings', settingsId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  async deleteAppSettings(settingsId: string): Promise<void> {
    const docRef = doc(db, 'appSettings', settingsId);
    await deleteDoc(docRef);
  }

  // Listen to real-time updates for app settings
  onAppSettingsChange(userId: string, callback: (settings: AppSettings[]) => void) {
    const q = query(
      collection(db, 'appSettings'),
      where('userId', '==', userId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const settings = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          theme: data.theme,
          language: data.language,
          weekStartDay: data.weekStartDay,
          units: data.units,
          autoSave: data.autoSave,
          backupFrequency: data.backupFrequency,
          dataRetention: data.dataRetention,
          notifications: data.notifications,
          privacy: data.privacy,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as AppSettings;
      });
      callback(settings);
    });
  }
  async createTrainingProgram(program: Omit<TrainingProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrainingProgram> {
    const now = new Date();
    const programData = {
      ...program,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, 'trainingPrograms'), programData);
    return {
      ...program,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getTrainingProgramsByUserId(userId: string): Promise<TrainingProgram[]> {
    const q = query(
      collection(db, 'trainingPrograms'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as TrainingProgram[];
  }

  async updateTrainingProgram(programId: string, updates: Partial<TrainingProgram>): Promise<void> {
    const docRef = doc(db, 'trainingPrograms', programId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  async deleteTrainingProgram(programId: string): Promise<void> {
    const docRef = doc(db, 'trainingPrograms', programId);
    await deleteDoc(docRef);
  }

  // Listen to real-time updates for training programs
  onTrainingProgramsChange(userId: string, callback: (programs: TrainingProgram[]) => void) {
    const q = query(
      collection(db, 'trainingPrograms'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const programs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      })) as TrainingProgram[];
      callback(programs);
    });
  }

  // Workout Sessions Collection
  async createWorkoutSession(session: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutSession> {
    const now = new Date();
    const sessionData = {
      ...session,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, 'workoutSessions'), sessionData);
    return {
      ...session,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getWorkoutSessionById(sessionId: string): Promise<WorkoutSession | null> {
    const docRef = doc(db, 'workoutSessions', sessionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        completedAt: data.completedAt ? data.completedAt.toDate() : undefined,
      } as WorkoutSession;
    }
    return null;
  }

  async getWorkoutSessionsByUserId(userId: string): Promise<WorkoutSession[]> {
    try {
      // TEMPORARY: Return empty array until indexes are fully propagated
      // This prevents quota exceeded errors
      console.warn('getWorkoutSessionsByUserId: Temporarily disabled until Firebase indexes propagate');
      return [];
      
      /* Original query - re-enable after indexes propagate:
      const q = query(
        collection(db, 'workoutSessions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10) // Limit to 10 most recent sessions to avoid quota issues
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          completedAt: data.completedAt ? data.completedAt.toDate() : undefined,
        } as WorkoutSession;
      });
      */
    } catch (error) {
      console.error('Error fetching workout sessions:', error);
      return [];
    }
  }

  async updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<void> {
    const docRef = doc(db, 'workoutSessions', sessionId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  async deleteWorkoutSession(sessionId: string): Promise<void> {
    const docRef = doc(db, 'workoutSessions', sessionId);
    await deleteDoc(docRef);
  }

  // Calendar Events Collection
  async createCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const docRef = await addDoc(collection(db, 'calendarEvents'), event);
    return {
      ...event,
      id: docRef.id,
    };
  }

  async getCalendarEventsByUserId(userId: string): Promise<CalendarEvent[]> {
    const q = query(
      collection(db, 'calendarEvents'),
      where('userId', '==', userId),
      orderBy('date', 'asc'),
      limit(50) // Limit to 50 events to avoid quota issues
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CalendarEvent[];
  }

  async updateCalendarEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void> {
    const docRef = doc(db, 'calendarEvents', eventId);
    await updateDoc(docRef, updates);
  }

  async deleteCalendarEvent(eventId: string): Promise<void> {
    const docRef = doc(db, 'calendarEvents', eventId);
    await deleteDoc(docRef);
  }

  // Listen to real-time updates for calendar events
  onCalendarEventsChange(userId: string, callback: (events: CalendarEvent[]) => void) {
    const q = query(
      collection(db, 'calendarEvents'),
      where('userId', '==', userId),
      orderBy('date', 'asc'),
      limit(50) // Limit to 50 events to avoid quota issues
    );

    return onSnapshot(q, (querySnapshot) => {
      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CalendarEvent[];
      callback(events);
    });
  }
}

export const firestoreService = new FirestoreService();
