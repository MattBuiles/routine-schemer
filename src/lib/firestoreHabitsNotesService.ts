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
import { Habit, Note } from '@/types';

export class FirestoreHabitsNotesService {
  // Habits Management
  async createHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Habit> {
    const now = new Date();
    const habitData = {
      ...habit,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, 'habits'), habitData);
    return {
      ...habit,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getHabitsByUserId(userId: string): Promise<Habit[]> {
    try {
      // TEMPORARY: Return empty array until indexes are fully propagated
      console.warn('getHabitsByUserId: Temporarily disabled until Firebase indexes propagate');
      return [];
      
      /* Original query - re-enable after indexes propagate:
      const q = query(
        collection(db, 'habits'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20) // Limit to 20 habits to avoid quota issues
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Habit;
      });
      */
    } catch (error) {
      console.error('Error fetching habits:', error);
      return [];
    }
  }

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    const docRef = doc(db, 'habits', habitId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  async deleteHabit(habitId: string): Promise<void> {
    const docRef = doc(db, 'habits', habitId);
    await deleteDoc(docRef);
  }

  async markHabitComplete(habitId: string, date: Date): Promise<void> {
    try {
      const docRef = doc(db, 'habits', habitId);
      const habitDoc = await getDoc(docRef);
      
      if (habitDoc.exists()) {
        const habitData = habitDoc.data();
        const completedDates = habitData.completedDates || [];
        const dateStr = date.toISOString().split('T')[0];
        
        if (!completedDates.includes(dateStr)) {
          completedDates.push(dateStr);
          await updateDoc(docRef, {
            completedDates,
            updatedAt: Timestamp.fromDate(new Date()),
          });
        }
      }
    } catch (error) {
      console.error('Error marking habit as complete:', error);
      throw error;
    }
  }

  async unmarkHabitComplete(habitId: string, date: Date): Promise<void> {
    try {
      const docRef = doc(db, 'habits', habitId);
      const habitDoc = await getDoc(docRef);
      
      if (habitDoc.exists()) {
        const habitData = habitDoc.data();
        const completedDates = habitData.completedDates || [];
        const dateStr = date.toISOString().split('T')[0];
        
        const updatedDates = completedDates.filter((d: string) => d !== dateStr);
        await updateDoc(docRef, {
          completedDates: updatedDates,
          updatedAt: Timestamp.fromDate(new Date()),
        });
      }
    } catch (error) {
      console.error('Error unmarking habit complete:', error);
      throw error;
    }
  }

  // Listen to real-time updates for habits
  onHabitsChange(userId: string, callback: (habits: Habit[]) => void) {
    // TEMPORARY: Disabled to prevent quota exceeded errors
    console.warn('onHabitsChange: Temporarily disabled until Firebase indexes propagate');
    callback([]); // Return empty array immediately
    return () => {}; // Return empty unsubscribe function
    
    /* Original listener - re-enable after indexes propagate:
    const q = query(
      collection(db, 'habits'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20) // Limit to 20 habits to avoid quota issues
    );

    return onSnapshot(q, (querySnapshot) => {
      const habits = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Habit;
      });
      callback(habits);
    });
    */
  }

  // Notes Management
  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const now = new Date();
    const noteData = {
      ...note,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const docRef = await addDoc(collection(db, 'notes'), noteData);
    return {
      ...note,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };
  }

  async getNotesByUserId(userId: string): Promise<Note[]> {
    try {
      // TEMPORARY: Return empty array until indexes are fully propagated
      console.warn('getNotesByUserId: Temporarily disabled until Firebase indexes propagate');
      return [];
      
      /* Original query - re-enable after indexes propagate:
      const q = query(
        collection(db, 'notes'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(30) // Limit to 30 notes to avoid quota issues
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Note;
      });
      */
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  }

  async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
    const docRef = doc(db, 'notes', noteId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }

  async deleteNote(noteId: string): Promise<void> {
    const docRef = doc(db, 'notes', noteId);
    await deleteDoc(docRef);
  }

  // Listen to real-time updates for notes
  onNotesChange(userId: string, callback: (notes: Note[]) => void) {
    // TEMPORARY: Disabled to prevent quota exceeded errors
    console.warn('onNotesChange: Temporarily disabled until Firebase indexes propagate');
    callback([]); // Return empty array immediately
    return () => {}; // Return empty unsubscribe function
    
    /* Original listener - re-enable after indexes propagate:
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(30) // Limit to 30 notes to avoid quota issues
    );

    return onSnapshot(q, (querySnapshot) => {
      const notes = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Note;
      });
      callback(notes);
    });
    */
  }

  // Search notes
  async searchNotes(userId: string, searchTerm: string): Promise<Note[]> {
    try {
      const notes = await this.getNotesByUserId(userId);
      return notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  }

  // Get notes by category/tag
  async getNotesByTag(userId: string, tag: string): Promise<Note[]> {
    try {
      const notes = await this.getNotesByUserId(userId);
      return notes.filter(note =>
        note.tags && note.tags.includes(tag)
      );
    } catch (error) {
      console.error('Error fetching notes by tag:', error);
      return [];
    }
  }
}

export const firestoreHabitsNotesService = new FirestoreHabitsNotesService();
