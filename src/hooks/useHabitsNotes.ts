import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { firestoreHabitsNotesService } from '@/lib/firestoreHabitsNotesService';
import { Habit, Note } from '@/types';
import toast from 'react-hot-toast';

export const useHabitsNotes = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHabitsAndNotes = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const [habitsData, notesData] = await Promise.all([
        firestoreHabitsNotesService.getHabitsByUserId(user.id),
        firestoreHabitsNotesService.getNotesByUserId(user.id)
      ]);
      setHabits(habitsData);
      setNotes(notesData);
    } catch (err) {
      setError('Failed to load habits and notes');
      console.error('Error loading habits and notes:', err);
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load habits and notes on user change
  useEffect(() => {
    if (user) {
      loadHabitsAndNotes();
    } else {
      setHabits([]);
      setNotes([]);
    }
  }, [user, loadHabitsAndNotes]);

  // Habit methods
  const createHabit = async (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast.error('You must be logged in to create habits');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const newHabit = await firestoreHabitsNotesService.createHabit({
        ...habit,
        userId: user.id,
      });
      setHabits(prev => [newHabit, ...prev]);
      toast.success('Habit created successfully!');
      return newHabit;
    } catch (err) {
      setError('Failed to create habit');
      console.error('Error creating habit:', err);
      toast.error('Failed to create habit');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    if (!user) {
      toast.error('You must be logged in to update habits');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await firestoreHabitsNotesService.updateHabit(habitId, updates);
      setHabits(prev => prev.map(habit => 
        habit.id === habitId ? { ...habit, ...updates, updatedAt: new Date() } : habit
      ));
      toast.success('Habit updated successfully!');
    } catch (err) {
      setError('Failed to update habit');
      console.error('Error updating habit:', err);
      toast.error('Failed to update habit');
    } finally {
      setLoading(false);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete habits');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await firestoreHabitsNotesService.deleteHabit(habitId);
      setHabits(prev => prev.filter(habit => habit.id !== habitId));
      toast.success('Habit deleted successfully!');
    } catch (err) {
      setError('Failed to delete habit');
      console.error('Error deleting habit:', err);
      toast.error('Failed to delete habit');
    } finally {
      setLoading(false);
    }
  };

  const markHabitComplete = async (habitId: string, date: Date) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await firestoreHabitsNotesService.markHabitComplete(habitId, date);
      // Update local state
      setHabits(prev => prev.map(habit => {
        if (habit.id === habitId) {
          const dateStr = date.toISOString().split('T')[0];
          const completedDates = habit.completedDates || [];
          if (!completedDates.includes(dateStr)) {
            return { ...habit, completedDates: [...completedDates, dateStr] };
          }
        }
        return habit;
      }));
      toast.success('Habit marked as complete!');
    } catch (err) {
      console.error('Error marking habit complete:', err);
      toast.error('Failed to mark habit complete');
    }
  };

  const unmarkHabitComplete = async (habitId: string, date: Date) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    try {
      await firestoreHabitsNotesService.unmarkHabitComplete(habitId, date);
      // Update local state
      setHabits(prev => prev.map(habit => {
        if (habit.id === habitId) {
          const dateStr = date.toISOString().split('T')[0];
          const completedDates = habit.completedDates || [];
          return { ...habit, completedDates: completedDates.filter((d: string) => d !== dateStr) };
        }
        return habit;
      }));
      toast.success('Habit unmarked!');
    } catch (err) {
      console.error('Error unmarking habit complete:', err);
      toast.error('Failed to unmark habit');
    }
  };

  // Note methods
  const createNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast.error('You must be logged in to create notes');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const newNote = await firestoreHabitsNotesService.createNote({
        ...note,
        userId: user.id,
      });
      setNotes(prev => [newNote, ...prev]);
      toast.success('Note created successfully!');
      return newNote;
    } catch (err) {
      setError('Failed to create note');
      console.error('Error creating note:', err);
      toast.error('Failed to create note');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    if (!user) {
      toast.error('You must be logged in to update notes');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await firestoreHabitsNotesService.updateNote(noteId, updates);
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, ...updates, updatedAt: new Date() } : note
      ));
      toast.success('Note updated successfully!');
    } catch (err) {
      setError('Failed to update note');
      console.error('Error updating note:', err);
      toast.error('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete notes');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await firestoreHabitsNotesService.deleteNote(noteId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully!');
    } catch (err) {
      setError('Failed to delete note');
      console.error('Error deleting note:', err);
      toast.error('Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  const searchNotes = async (searchTerm: string) => {
    if (!user) return [];

    try {
      return await firestoreHabitsNotesService.searchNotes(user.id, searchTerm);
    } catch (err) {
      console.error('Error searching notes:', err);
      toast.error('Failed to search notes');
      return [];
    }
  };

  const getNotesByTag = async (tag: string) => {
    if (!user) return [];

    try {
      return await firestoreHabitsNotesService.getNotesByTag(user.id, tag);
    } catch (err) {
      console.error('Error getting notes by tag:', err);
      toast.error('Failed to get notes by tag');
      return [];
    }
  };

  return {
    habits,
    notes,
    loading,
    error,
    loadHabitsAndNotes,
    createHabit,
    updateHabit,
    deleteHabit,
    markHabitComplete,
    unmarkHabitComplete,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    getNotesByTag,
  };
};
