import { supabase } from './supabase';
import { 
  TrainingProgram, 
  WorkoutSession, 
  CalendarEvent, 
  UserProfile,
  Habit,
  HabitRecord,
  Note,
  Exercise,
  WorkoutExercise,
  Mesocycle,
  Microcycle
} from '@/types';

export class SupabaseService {
  // ============================================
  // USER PROFILES
  // ============================================
  
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*, user_goals(goal)')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      userId: data.id,
      age: data.age ?? undefined,
      weight: data.weight ?? undefined,
      height: data.height ?? undefined,
      bodyFat: data.body_fat ?? undefined,
      activityLevel: data.activity_level || 'moderately_active',
      goals: (data.user_goals as any[])?.map((g: any) => g.goal) || [],
      experience: data.experience || 'beginner',
      preferences: data.preferences as any,
      weeklyGoal: data.weekly_goal ?? undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        age: updates.age,
        weight: updates.weight,
        height: updates.height,
        body_fat: updates.bodyFat,
        activity_level: updates.activityLevel,
        experience: updates.experience,
        weekly_goal: updates.weeklyGoal,
        preferences: updates.preferences as any,
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }

    // Update goals if provided
    if (updates.goals) {
      // Delete existing goals
      await supabase.from('user_goals').delete().eq('user_id', userId);
      
      // Insert new goals
      const goalsToInsert = updates.goals.map(goal => ({
        user_id: userId,
        goal,
      }));
      
      if (goalsToInsert.length > 0) {
        await supabase.from('user_goals').insert(goalsToInsert);
      }
    }
  }

  // ============================================
  // TRAINING PROGRAMS
  // ============================================
  
  async createTrainingProgram(program: Omit<TrainingProgram, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrainingProgram> {
    const { data, error } = await supabase
      .from('training_programs')
      .insert({
        user_id: program.userId,
        name: program.name,
        description: program.description,
        split: program.split,
        goal: program.goal,
        duration: program.duration,
        sessions_per_week: program.sessionsPerWeek,
        estimated_duration: program.estimatedDuration,
        difficulty: program.difficulty,
        is_public: program.isPublic,
        is_active: program.isActive,
        tags: program.tags,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating training program:', error);
      throw error;
    }

    return this.mapDbToTrainingProgram(data);
  }

  async getTrainingProgramsByUserId(userId: string): Promise<TrainingProgram[]> {
    const { data, error } = await supabase
      .from('training_programs')
      .select(`
        *,
        workout_sessions(
          *,
          workout_exercises(
            *,
            exercises(*)
          )
        ),
        mesocycles(
          *,
          microcycles(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching training programs:', error);
      throw error;
    }

    return data.map(this.mapDbToTrainingProgram);
  }

  async updateTrainingProgram(programId: string, updates: Partial<TrainingProgram>): Promise<void> {
    const { error } = await supabase
      .from('training_programs')
      .update({
        name: updates.name,
        description: updates.description,
        split: updates.split,
        goal: updates.goal,
        duration: updates.duration,
        sessions_per_week: updates.sessionsPerWeek,
        estimated_duration: updates.estimatedDuration,
        difficulty: updates.difficulty,
        is_public: updates.isPublic,
        is_active: updates.isActive,
        tags: updates.tags,
      })
      .eq('id', programId);

    if (error) {
      console.error('Error updating training program:', error);
      throw error;
    }
  }

  async deleteTrainingProgram(programId: string): Promise<void> {
    const { error } = await supabase
      .from('training_programs')
      .delete()
      .eq('id', programId);

    if (error) {
      console.error('Error deleting training program:', error);
      throw error;
    }
  }

  // ============================================
  // WORKOUT SESSIONS
  // ============================================
  
  async createWorkoutSession(session: Omit<WorkoutSession, 'id' | 'createdAt' | 'updatedAt'>, programId?: string): Promise<WorkoutSession> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        program_id: programId,
        user_id: (await supabase.auth.getUser()).data.user?.id!,
        name: session.name,
        type: session.type,
        estimated_duration: session.estimatedDuration,
        notes: session.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workout session:', error);
      throw error;
    }

    // Insert exercises
    if (session.exercises && session.exercises.length > 0) {
      const exercisesToInsert = session.exercises.map((ex, index) => ({
        session_id: data.id,
        exercise_id: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        rest_time: ex.restTime,
        notes: ex.notes,
        order_index: index,
      }));

      await supabase.from('workout_exercises').insert(exercisesToInsert);
    }

    return this.getWorkoutSessionById(data.id);
  }

  async getWorkoutSessionById(sessionId: string): Promise<WorkoutSession> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_exercises(
          *,
          exercises(*)
        )
      `)
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching workout session:', error);
      throw error;
    }

    return this.mapDbToWorkoutSession(data);
  }

  async getWorkoutSessionsByUserId(userId: string): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_exercises(
          *,
          exercises(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workout sessions:', error);
      throw error;
    }

    return data.map((session) => this.mapDbToWorkoutSession(session));
  }

  async updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<void> {
    const { error } = await supabase
      .from('workout_sessions')
      .update({
        name: updates.name,
        type: updates.type,
        estimated_duration: updates.estimatedDuration,
        notes: updates.notes,
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating workout session:', error);
      throw error;
    }
  }

  async deleteWorkoutSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting workout session:', error);
      throw error;
    }
  }

  // ============================================
  // CALENDAR EVENTS
  // ============================================
  
  async createCalendarEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalendarEvent> {
    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: event.userId,
        date: event.date,
        time: event.time,
        title: event.title,
        type: event.type,
        duration: event.duration,
        description: event.description,
        session_id: event.sessionId,
        completed: event.completed ?? false,
        actual_duration: event.actualDuration,
        notes: event.notes,
        category: event.category,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }

    return this.mapDbToCalendarEvent(data);
  }

  async getCalendarEventsByUserId(userId: string, startDate?: string, endDate?: string): Promise<CalendarEvent[]> {
    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        workout_sessions(
          *,
          workout_exercises(
            *,
            exercises(*)
          )
        )
      `)
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }

    return data.map(this.mapDbToCalendarEvent);
  }

  async updateCalendarEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .update({
        date: updates.date,
        time: updates.time,
        title: updates.title,
        type: updates.type,
        duration: updates.duration,
        description: updates.description,
        completed: updates.completed,
        actual_duration: updates.actualDuration,
        notes: updates.notes,
        category: updates.category,
      })
      .eq('id', eventId);

    if (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  async deleteCalendarEvent(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // ============================================
  // HABITS
  // ============================================
  
  async createHabit(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: habit.userId,
        name: habit.name,
        description: habit.description,
        type: habit.type,
        target: habit.target,
        unit: habit.unit,
        color: habit.color,
        icon: habit.icon,
        is_active: habit.isActive,
        is_favorite: habit.isFavorite ?? false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating habit:', error);
      throw error;
    }

    return this.mapDbToHabit(data);
  }

  async getHabitsByUserId(userId: string): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching habits:', error);
      throw error;
    }

    return data.map(this.mapDbToHabit);
  }

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .update({
        name: updates.name,
        description: updates.description,
        type: updates.type,
        target: updates.target,
        unit: updates.unit,
        color: updates.color,
        icon: updates.icon,
        is_active: updates.isActive,
        is_favorite: updates.isFavorite,
      })
      .eq('id', habitId);

    if (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  }

  async deleteHabit(habitId: string): Promise<void> {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);

    if (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }

  // ============================================
  // HABIT RECORDS
  // ============================================
  
  async createHabitRecord(record: Omit<HabitRecord, 'id' | 'createdAt'>): Promise<HabitRecord> {
    const { data, error } = await supabase
      .from('habit_records')
      .insert({
        habit_id: record.habitId,
        user_id: record.userId,
        date: record.date,
        value: record.value,
        notes: record.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating habit record:', error);
      throw error;
    }

    return this.mapDbToHabitRecord(data);
  }

  async getHabitRecords(habitId: string, startDate?: string, endDate?: string): Promise<HabitRecord[]> {
    let query = supabase
      .from('habit_records')
      .select('*')
      .eq('habit_id', habitId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Error fetching habit records:', error);
      throw error;
    }

    return data.map(this.mapDbToHabitRecord);
  }

  async updateHabitRecord(recordId: string, updates: Partial<HabitRecord>): Promise<void> {
    const { error } = await supabase
      .from('habit_records')
      .update({
        value: updates.value,
        notes: updates.notes,
      })
      .eq('id', recordId);

    if (error) {
      console.error('Error updating habit record:', error);
      throw error;
    }
  }

  // ============================================
  // NOTES
  // ============================================
  
  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: note.userId,
        title: note.title,
        content: note.content,
        type: note.type,
        tags: note.tags,
        workout_session_id: note.workoutSessionId,
        is_pinned: note.isPinned,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }

    return this.mapDbToNote(data);
  }

  async getNotesByUserId(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }

    return data.map(this.mapDbToNote);
  }

  async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .update({
        title: updates.title,
        content: updates.content,
        type: updates.type,
        tags: updates.tags,
        is_pinned: updates.isPinned,
      })
      .eq('id', noteId);

    if (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  // ============================================
  // EXERCISES
  // ============================================
  
  async getExercises(filters?: { bodyPart?: string; equipment?: string; target?: string; search?: string }): Promise<Exercise[]> {
    let query = supabase.from('exercises').select('*');

    if (filters?.bodyPart) {
      query = query.eq('body_part', filters.bodyPart);
    }
    if (filters?.equipment) {
      query = query.eq('equipment', filters.equipment);
    }
    if (filters?.target) {
      query = query.eq('target', filters.target);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }

    return data.map(this.mapDbToExercise);
  }

  async getExerciseById(exerciseId: string): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (error) {
      console.error('Error fetching exercise:', error);
      return null;
    }

    return this.mapDbToExercise(data);
  }

  // ============================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================
  
  subscribeToCalendarEvents(userId: string, callback: (events: CalendarEvent[]) => void) {
    return supabase
      .channel('calendar_events')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const events = await this.getCalendarEventsByUserId(userId);
          callback(events);
        }
      )
      .subscribe();
  }

  subscribeToWorkoutSessions(userId: string, callback: (sessions: WorkoutSession[]) => void) {
    return supabase
      .channel('workout_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workout_sessions',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          const sessions = await this.getWorkoutSessionsByUserId(userId);
          callback(sessions);
        }
      )
      .subscribe();
  }

  // ============================================
  // HELPER MAPPING FUNCTIONS
  // ============================================
  
  private mapDbToTrainingProgram(data: any): TrainingProgram {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      split: data.split,
      goal: data.goal,
      duration: data.duration,
      sessionsPerWeek: data.sessions_per_week,
      estimatedDuration: data.estimated_duration,
      difficulty: data.difficulty,
      isPublic: data.is_public,
      isActive: data.is_active,
      tags: data.tags || [],
      workoutSessions: data.workout_sessions?.map((ws: any) => this.mapDbToWorkoutSession(ws)) || [],
      mesocycles: data.mesocycles?.map((m: any) => this.mapDbToMesocycle(m)) || [],
      microcycles: data.mesocycles?.flatMap((m: any) => m.microcycles?.map((mc: any) => this.mapDbToMicrocycle(mc)) || []) || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapDbToWorkoutSession(data: any): WorkoutSession {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      exercises: data.workout_exercises?.map((we: any) => ({
        id: we.id,
        exerciseId: we.exercise_id,
        exercise: we.exercises ? {
          id: we.exercises.id,
          name: we.exercises.name,
          bodyPart: we.exercises.body_part,
          equipment: we.exercises.equipment,
          target: we.exercises.target,
          instructions: we.exercises.instructions || [],
          gifUrl: we.exercises.gif_url,
          secondaryMuscles: we.exercises.secondary_muscles || [],
        } : {} as Exercise,
        sets: we.sets,
        reps: we.reps,
        weight: we.weight,
        restTime: we.rest_time,
        notes: we.notes,
        order: we.order_index,
      })) || [],
      estimatedDuration: data.estimated_duration,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapDbToCalendarEvent(data: any): CalendarEvent {
    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      time: data.time,
      title: data.title,
      type: data.type,
      duration: data.duration,
      description: data.description,
      sessionId: data.session_id,
      session: data.workout_sessions ? this.mapDbToWorkoutSession(data.workout_sessions) : undefined,
      completed: data.completed,
      actualDuration: data.actual_duration,
      notes: data.notes,
      category: data.category,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapDbToHabit(data: any): Habit {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      type: data.type,
      target: data.target,
      unit: data.unit,
      color: data.color,
      icon: data.icon,
      isActive: data.is_active,
      isFavorite: data.is_favorite,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapDbToHabitRecord(data: any): HabitRecord {
    return {
      id: data.id,
      habitId: data.habit_id,
      userId: data.user_id,
      date: data.date,
      value: data.value,
      notes: data.notes,
      createdAt: new Date(data.created_at),
    };
  }

  private mapDbToNote(data: any): Note {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      content: data.content,
      type: data.type,
      tags: data.tags || [],
      workoutSessionId: data.workout_session_id,
      isPinned: data.is_pinned,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapDbToExercise(data: any): Exercise {
    return {
      id: data.id,
      name: data.name,
      bodyPart: data.body_part,
      equipment: data.equipment,
      target: data.target,
      instructions: data.instructions || [],
      gifUrl: data.gif_url,
      secondaryMuscles: data.secondary_muscles || [],
    };
  }

  private mapDbToMesocycle(data: any): Mesocycle {
    return {
      id: data.id,
      name: data.name,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      goal: data.goal,
      notes: data.notes,
      microcycles: data.microcycles?.map(this.mapDbToMicrocycle) || [],
    };
  }

  private mapDbToMicrocycle(data: any): Microcycle {
    return {
      id: data.id,
      name: data.name,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      sessions: {}, // Will be populated from microcycle_sessions if needed
      notes: data.notes,
    };
  }
}

export const supabaseService = new SupabaseService();
