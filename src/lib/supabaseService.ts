import { supabase } from './supabase';
import { 
  UserProfile,
  Exercise,
} from '@/types';
import { 
  Program,
  SessionTemplate,
  SessionExercise,
  WeeklySplit,
  WeeklySplitDay,
  Mesocycle,
  MesocycleWeek,
  ProgressionRule,
  PhaseType,
  SessionType,
  SplitType,
  DayOfWeek
} from '@/types/program';

// ============================================
// TYPE MAPPERS (DB <-> App)
// ============================================

function mapDbProgram(dbData: any): Program {
  return {
    id: dbData.id,
    userId: dbData.user_id,
    name: dbData.name,
    description: dbData.description,
    splitType: dbData.split_type,
    totalWeeks: dbData.total_weeks,
    sessionsPerWeek: dbData.sessions_per_week,
    mesocycles: [],
    sessionTemplates: [],
    weeklySplits: [],
    progressionRules: [],
    isActive: dbData.is_active,
    isTemplate: dbData.is_template,
    tags: dbData.tags || [],
    difficulty: dbData.difficulty || 'intermediate',
    createdAt: new Date(dbData.created_at),
    updatedAt: new Date(dbData.updated_at),
  };
}

function mapDbSessionTemplate(dbData: any): SessionTemplate {
  return {
    id: dbData.id,
    name: dbData.name,
    type: dbData.type,
    focus: dbData.focus || [],
    exercises: [],
    estimatedDurationMinutes: dbData.estimated_duration_minutes || 60,
    estimatedVolume: dbData.estimated_volume || 0,
    color: dbData.color || '#3b82f6',
    icon: dbData.icon,
    notes: dbData.notes,
    tags: dbData.tags || [],
    createdAt: new Date(dbData.created_at),
    updatedAt: new Date(dbData.updated_at),
  };
}

function mapDbSessionExercise(dbData: any): SessionExercise {
  return {
    id: dbData.id,
    exerciseId: dbData.exercise_id || '',
    exerciseName: dbData.exercise_name,
    sets: dbData.sets,
    reps: dbData.reps,
    intensityPercent: dbData.intensity_percent,
    tempo: dbData.tempo,
    restSeconds: dbData.rest_seconds,
    rpe: dbData.rpe,
    notes: dbData.notes,
    order: dbData.order_index,
    primaryMuscles: dbData.primary_muscles || [],
    secondaryMuscles: dbData.secondary_muscles || [],
  };
}

function mapDbWeeklySplit(dbData: any): WeeklySplit {
  return {
    id: dbData.id,
    name: dbData.name,
    type: dbData.type,
    days: [],
    totalSessionsPerWeek: dbData.total_sessions_per_week,
    estimatedWeeklyVolume: dbData.estimated_weekly_volume || 0,
    createdAt: new Date(dbData.created_at),
    updatedAt: new Date(dbData.updated_at),
  };
}

function mapDbWeeklySplitDay(dbData: any): WeeklySplitDay {
  return {
    dayOfWeek: dbData.day_of_week,
    sessionTemplateId: dbData.session_template_id,
    isRestDay: dbData.is_rest_day,
    notes: dbData.notes,
  };
}

function mapDbMesocycle(dbData: any): Mesocycle {
  return {
    id: dbData.id,
    name: dbData.name,
    phase: dbData.phase,
    goal: dbData.goal,
    durationWeeks: dbData.duration_weeks,
    weeks: [],
    baseIntensityPercent: dbData.base_intensity_percent || 70,
    baseVolumeMultiplier: dbData.base_volume_multiplier || 1.0,
    color: dbData.color || '#3b82f6',
    order: dbData.order,
    notes: dbData.notes,
    createdAt: new Date(dbData.created_at),
    updatedAt: new Date(dbData.updated_at),
  };
}

function mapDbMesocycleWeek(dbData: any): MesocycleWeek {
  return {
    weekNumber: dbData.week_number,
    weeklySplitId: dbData.weekly_split_id,
    progressionModifier: dbData.progression_modifier || 1.0,
    intensityModifier: dbData.intensity_modifier || 1.0,
    volumeModifier: dbData.volume_modifier || 1.0,
    notes: dbData.notes,
  };
}

function mapDbProgressionRule(dbData: any): ProgressionRule {
  return {
    id: dbData.id,
    type: dbData.type,
    variable: dbData.variable,
    startValue: dbData.start_value,
    incrementPerWeek: dbData.increment_per_week,
    incrementPerMesocycle: dbData.increment_per_mesocycle,
    capValue: dbData.cap_value,
    deloadReduction: dbData.deload_reduction,
  };
}

export class SupabaseService {
  // ============================================
  // USER PROFILES
  // ============================================
  
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) return null;

    const profileData = data as any;

    // Obtener goals por separado
    const { data: goalsData } = await supabase
      .from('user_goals')
      .select('goal')
      .eq('user_id', userId);

    return {
      id: profileData.id,
      userId: profileData.id,
      age: profileData.age ?? undefined,
      weight: profileData.weight ?? undefined,
      height: profileData.height ?? undefined,
      bodyFat: profileData.body_fat ?? undefined,
      activityLevel: profileData.activity_level || 'moderately_active',
      goals: goalsData?.map((g: any) => g.goal) || [],
      experience: profileData.experience || 'beginner',
      preferences: profileData.preferences,
      weeklyGoal: profileData.weekly_goal ?? undefined,
      createdAt: new Date(profileData.created_at),
      updatedAt: new Date(profileData.updated_at),
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
  // EXERCISES
  // ============================================

  async getExercises(): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching exercises:', error);
      return [];
    }

    return (data || []).map(ex => ({
      id: ex.id,
      name: ex.name,
      bodyPart: ex.body_part,
      equipment: ex.equipment,
      target: ex.target,
      instructions: ex.instructions || [],
      gifUrl: ex.gif_url,
      secondaryMuscles: ex.secondary_muscles || [],
    }));
  }

  async searchExercises(filters: {
    bodyPart?: string;
    equipment?: string;
    search?: string;
  }): Promise<Exercise[]> {
    let query = supabase
      .from('exercises')
      .select('*');

    if (filters.bodyPart) {
      query = query.eq('body_part', filters.bodyPart);
    }

    if (filters.equipment) {
      query = query.eq('equipment', filters.equipment);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error searching exercises:', error);
      return [];
    }

    return (data || []).map(ex => ({
      id: ex.id,
      name: ex.name,
      bodyPart: ex.body_part,
      equipment: ex.equipment,
      target: ex.target,
      instructions: ex.instructions || [],
      gifUrl: ex.gif_url,
      secondaryMuscles: ex.secondary_muscles || [],
    }));
  }

  // ============================================
  // TRAINING PROGRAMS - CRUD
  // ============================================
  
  async createProgram(programData: {
    userId: string;
    name: string;
    description?: string;
    splitType: SplitType;
    totalWeeks: number;
    sessionsPerWeek: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
  }): Promise<string> {
    const { data, error } = await supabase
      .from('training_programs')
      .insert({
        user_id: programData.userId,
        name: programData.name,
        description: programData.description,
        split_type: programData.splitType,
        total_weeks: programData.totalWeeks,
        sessions_per_week: programData.sessionsPerWeek,
        difficulty: programData.difficulty || 'intermediate',
        tags: programData.tags || [],
        is_active: false,
        is_template: false,
        is_public: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating program:', error);
      throw error;
    }

    return data.id;
  }

  async getProgram(programId: string): Promise<Program | null> {
    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (error) {
      console.error('Error fetching program:', error);
      return null;
    }

    if (!data) return null;

    const program = mapDbProgram(data);

    // Load all related data
    const [sessionTemplates, weeklySplits, mesocycles, progressionRules] = await Promise.all([
      this.getSessionTemplatesByProgram(programId),
      this.getWeeklySplitsByProgram(programId),
      this.getMesocyclesByProgram(programId),
      this.getProgressionRulesByProgram(programId),
    ]);

    program.sessionTemplates = sessionTemplates;
    program.weeklySplits = weeklySplits;
    program.mesocycles = mesocycles;
    program.progressionRules = progressionRules;

    return program;
  }

  async getProgramsByUser(userId: string): Promise<Program[]> {
    const { data, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching programs:', error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const programs = (data as any[]) || [];
    return programs.map(mapDbProgram);
  }

  async updateProgram(programId: string, updates: Partial<Program>): Promise<void> {
    const { error } = await supabase
      .from('training_programs')
      .update({
        name: updates.name,
        description: updates.description,
        split_type: updates.splitType,
        total_weeks: updates.totalWeeks,
        sessions_per_week: updates.sessionsPerWeek,
        difficulty: updates.difficulty,
        tags: updates.tags,
        is_active: updates.isActive,
      })
      .eq('id', programId);

    if (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  }

  async deleteProgram(programId: string): Promise<void> {
    const { error } = await supabase
      .from('training_programs')
      .delete()
      .eq('id', programId);

    if (error) {
      console.error('Error deleting program:', error);
      throw error;
    }
  }

  async duplicateProgram(programId: string, userId: string): Promise<string> {
    // Obtener el programa original con todos sus datos
    const originalProgram = await this.getProgram(programId);
    if (!originalProgram) {
      throw new Error('Program not found');
    }

    // Crear una copia del programa con nuevo nombre
    const duplicatedProgramData = {
      userId,
      name: `${originalProgram.name} (Copia)`,
      description: originalProgram.description,
      splitType: originalProgram.splitType,
      totalWeeks: originalProgram.totalWeeks,
      sessionsPerWeek: originalProgram.sessionsPerWeek,
      difficulty: originalProgram.difficulty,
      tags: originalProgram.tags,
      sessionTemplates: originalProgram.sessionTemplates,
      weeklySplit: originalProgram.weeklySplits[0], // Usar el primer split
      mesocycles: originalProgram.mesocycles,
      progressionRules: originalProgram.progressionRules,
    };

    // Usar createCompleteProgram para duplicar todo
    const newProgramId = await this.createCompleteProgram(duplicatedProgramData);
    return newProgramId;
  }

  // ============================================
  // SESSION TEMPLATES
  // ============================================

  async createSessionTemplate(templateData: {
    programId: string;
    userId: string;
    name: string;
    type: SessionType;
    focus?: string[];
    estimatedDurationMinutes?: number;
    color?: string;
    notes?: string;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('session_templates')
      .insert({
        program_id: templateData.programId,
        user_id: templateData.userId,
        name: templateData.name,
        type: templateData.type,
        focus: templateData.focus || [],
        estimated_duration_minutes: templateData.estimatedDurationMinutes || 60,
        color: templateData.color || '#3b82f6',
        notes: templateData.notes,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating session template:', error);
      throw error;
    }

    return data.id;
  }

  async getSessionTemplatesByProgram(programId: string): Promise<SessionTemplate[]> {
    const { data, error } = await supabase
      .from('session_templates')
      .select('*')
      .eq('program_id', programId)
      .order('name');

    if (error) {
      console.error('Error fetching session templates:', error);
      return [];
    }

    const templates = (data || []).map(mapDbSessionTemplate);

    // Load exercises for each template
    await Promise.all(
      templates.map(async (template) => {
        template.exercises = await this.getSessionExercises(template.id);
      })
    );

    return templates;
  }

  async deleteSessionTemplate(templateId: string): Promise<void> {
    const { error } = await supabase
      .from('session_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting session template:', error);
      throw error;
    }
  }

  // ============================================
  // SESSION EXERCISES
  // ============================================

  async createSessionExercise(exerciseData: {
    sessionTemplateId: string;
    exerciseId?: string;
    exerciseName: string;
    sets: number;
    reps: string;
    intensityPercent?: number;
    restSeconds: number;
    orderIndex: number;
    primaryMuscles?: string[];
    secondaryMuscles?: string[];
    notes?: string;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('session_exercises')
      .insert({
        session_template_id: exerciseData.sessionTemplateId,
        exercise_id: exerciseData.exerciseId,
        exercise_name: exerciseData.exerciseName,
        sets: exerciseData.sets,
        reps: exerciseData.reps,
        intensity_percent: exerciseData.intensityPercent,
        rest_seconds: exerciseData.restSeconds,
        order_index: exerciseData.orderIndex,
        primary_muscles: exerciseData.primaryMuscles || [],
        secondary_muscles: exerciseData.secondaryMuscles || [],
        notes: exerciseData.notes,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating session exercise:', error);
      throw error;
    }

    return data.id;
  }

  async getSessionExercises(templateId: string): Promise<SessionExercise[]> {
    const { data, error } = await supabase
      .from('session_exercises')
      .select('*')
      .eq('session_template_id', templateId)
      .order('order_index');

    if (error) {
      console.error('Error fetching session exercises:', error);
      return [];
    }

    return (data || []).map(mapDbSessionExercise);
  }

  // ============================================
  // WEEKLY SPLITS
  // ============================================

  async createWeeklySplit(splitData: {
    programId: string;
    userId: string;
    name: string;
    type: SplitType;
    totalSessionsPerWeek: number;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('weekly_splits')
      .insert({
        program_id: splitData.programId,
        user_id: splitData.userId,
        name: splitData.name,
        type: splitData.type,
        total_sessions_per_week: splitData.totalSessionsPerWeek,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating weekly split:', error);
      throw error;
    }

    return data.id;
  }

  async getWeeklySplitsByProgram(programId: string): Promise<WeeklySplit[]> {
    const { data, error } = await supabase
      .from('weekly_splits')
      .select('*')
      .eq('program_id', programId)
      .order('name');

    if (error) {
      console.error('Error fetching weekly splits:', error);
      return [];
    }

    const splits = (data || []).map(mapDbWeeklySplit);

    // Load days for each split
    await Promise.all(
      splits.map(async (split) => {
        split.days = await this.getWeeklySplitDays(split.id);
      })
    );

    return splits;
  }

  // ============================================
  // WEEKLY SPLIT DAYS
  // ============================================

  async createWeeklySplitDay(dayData: {
    weeklySplitId: string;
    dayOfWeek: DayOfWeek;
    sessionTemplateId?: string;
    isRestDay: boolean;
    notes?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('weekly_split_days')
      .insert({
        weekly_split_id: dayData.weeklySplitId,
        day_of_week: dayData.dayOfWeek,
        session_template_id: dayData.sessionTemplateId,
        is_rest_day: dayData.isRestDay,
        notes: dayData.notes,
      });

    if (error) {
      console.error('Error creating weekly split day:', error);
      throw error;
    }
  }

  async getWeeklySplitDays(splitId: string): Promise<WeeklySplitDay[]> {
    const { data, error } = await supabase
      .from('weekly_split_days')
      .select('*')
      .eq('weekly_split_id', splitId)
      .order('day_of_week');

    if (error) {
      console.error('Error fetching weekly split days:', error);
      return [];
    }

    return (data || []).map(mapDbWeeklySplitDay);
  }

  // ============================================
  // MESOCYCLES
  // ============================================

  async createMesocycle(mesocycleData: {
    programId: string;
    name: string;
    phase: PhaseType;
    goal: string;
    durationWeeks: number;
    baseIntensityPercent?: number;
    baseVolumeMultiplier?: number;
    color?: string;
    order: number;
    notes?: string;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('mesocycles')
      .insert({
        program_id: mesocycleData.programId,
        name: mesocycleData.name,
        phase: mesocycleData.phase,
        goal: mesocycleData.goal,
        duration_weeks: mesocycleData.durationWeeks,
        base_intensity_percent: mesocycleData.baseIntensityPercent || 70,
        base_volume_multiplier: mesocycleData.baseVolumeMultiplier || 1.0,
        color: mesocycleData.color || '#3b82f6',
        order: mesocycleData.order,
        notes: mesocycleData.notes,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating mesocycle:', error);
      throw error;
    }

    return data.id;
  }

  async getMesocyclesByProgram(programId: string): Promise<Mesocycle[]> {
    const { data, error } = await supabase
      .from('mesocycles')
      .select('*')
      .eq('program_id', programId)
      .order('order');

    if (error) {
      console.error('Error fetching mesocycles:', error);
      return [];
    }

    const mesocycles = (data || []).map(mapDbMesocycle);

    // Load weeks for each mesocycle
    await Promise.all(
      mesocycles.map(async (mesocycle) => {
        mesocycle.weeks = await this.getMesocycleWeeks(mesocycle.id);
      })
    );

    return mesocycles;
  }

  // ============================================
  // MESOCYCLE WEEKS
  // ============================================

  async createMesocycleWeek(weekData: {
    mesocycleId: string;
    weekNumber: number;
    weeklySplitId: string;
    progressionModifier?: number;
    intensityModifier?: number;
    volumeModifier?: number;
    notes?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('mesocycle_weeks')
      .insert({
        mesocycle_id: weekData.mesocycleId,
        week_number: weekData.weekNumber,
        weekly_split_id: weekData.weeklySplitId,
        progression_modifier: weekData.progressionModifier || 1.0,
        intensity_modifier: weekData.intensityModifier || 1.0,
        volume_modifier: weekData.volumeModifier || 1.0,
        notes: weekData.notes,
      });

    if (error) {
      console.error('Error creating mesocycle week:', error);
      throw error;
    }
  }

  async getMesocycleWeeks(mesocycleId: string): Promise<MesocycleWeek[]> {
    const { data, error } = await supabase
      .from('mesocycle_weeks')
      .select('*')
      .eq('mesocycle_id', mesocycleId)
      .order('week_number');

    if (error) {
      console.error('Error fetching mesocycle weeks:', error);
      return [];
    }

    return (data || []).map(mapDbMesocycleWeek);
  }

  // ============================================
  // PROGRESSION RULES
  // ============================================

  async createProgressionRule(ruleData: {
    programId: string;
    type: 'linear' | 'wave' | 'step' | 'custom';
    variable: 'weight' | 'reps' | 'sets' | 'intensity';
    startValue: number;
    incrementPerWeek: number;
    incrementPerMesocycle?: number;
    capValue?: number;
    deloadReduction?: number;
  }): Promise<string> {
    const { data, error } = await supabase
      .from('progression_rules')
      .insert({
        program_id: ruleData.programId,
        type: ruleData.type,
        variable: ruleData.variable,
        start_value: ruleData.startValue,
        increment_per_week: ruleData.incrementPerWeek,
        increment_per_mesocycle: ruleData.incrementPerMesocycle,
        cap_value: ruleData.capValue,
        deload_reduction: ruleData.deloadReduction,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating progression rule:', error);
      throw error;
    }

    return data.id;
  }

  async getProgressionRulesByProgram(programId: string): Promise<ProgressionRule[]> {
    const { data, error } = await supabase
      .from('progression_rules')
      .select('*')
      .eq('program_id', programId);

    if (error) {
      console.error('Error fetching progression rules:', error);
      return [];
    }

    return (data || []).map(mapDbProgressionRule);
  }

  // ============================================
  // COMPLETE PROGRAM CREATION (Transactional-like)
  // ============================================

  async createCompleteProgram(programData: {
    // Basic info
    userId: string;
    name: string;
    description?: string;
    splitType: SplitType;
    totalWeeks: number;
    sessionsPerWeek: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    
    // Session templates
    sessionTemplates: Array<{
      name: string;
      type: SessionType;
      focus: string[];
      color: string;
      estimatedDurationMinutes: number;
      exercises: Array<{
        exerciseId?: string;
        exerciseName: string;
        sets: number;
        reps: string;
        intensityPercent?: number;
        restSeconds: number;
        primaryMuscles: string[];
        secondaryMuscles: string[];
        notes?: string;
      }>;
    }>;
    
    // Weekly split
    weeklySplit: {
      name: string;
      type: SplitType;
      days: Array<{
        dayOfWeek: DayOfWeek;
        sessionTemplateName?: string; // nombre del template a asignar
        isRestDay: boolean;
        notes?: string;
      }>;
    };
    
    // Mesocycles
    mesocycles: Array<{
      name: string;
      phase: PhaseType;
      goal: string;
      durationWeeks: number;
      baseIntensityPercent: number;
      baseVolumeMultiplier: number;
      color: string;
      notes?: string;
    }>;
    
    // Progression rules
    progressionRules?: Array<{
      type: 'linear' | 'wave' | 'step' | 'custom';
      variable: 'weight' | 'reps' | 'sets' | 'intensity';
      startValue: number;
      incrementPerWeek: number;
      incrementPerMesocycle?: number;
      capValue?: number;
      deloadReduction?: number;
    }>;
  }): Promise<string> {
    try {
      // 1. Create program
      const programId = await this.createProgram({
        userId: programData.userId,
        name: programData.name,
        description: programData.description,
        splitType: programData.splitType,
        totalWeeks: programData.totalWeeks,
        sessionsPerWeek: programData.sessionsPerWeek,
        difficulty: programData.difficulty,
        tags: programData.tags,
      });

      // 2. Create session templates with exercises
      const templateIdMap = new Map<string, string>();
      
      for (const template of programData.sessionTemplates) {
        const templateId = await this.createSessionTemplate({
          programId,
          userId: programData.userId,
          name: template.name,
          type: template.type,
          focus: template.focus,
          estimatedDurationMinutes: template.estimatedDurationMinutes,
          color: template.color,
        });
        
        templateIdMap.set(template.name, templateId);
        
        // Create exercises for this template
        for (let i = 0; i < template.exercises.length; i++) {
          const exercise = template.exercises[i];
          await this.createSessionExercise({
            sessionTemplateId: templateId,
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exerciseName,
            sets: exercise.sets,
            reps: exercise.reps,
            intensityPercent: exercise.intensityPercent,
            restSeconds: exercise.restSeconds,
            orderIndex: i,
            primaryMuscles: exercise.primaryMuscles,
            secondaryMuscles: exercise.secondaryMuscles,
            notes: exercise.notes,
          });
        }
      }

      // 3. Create weekly split
      const splitId = await this.createWeeklySplit({
        programId,
        userId: programData.userId,
        name: programData.weeklySplit.name,
        type: programData.weeklySplit.type,
        totalSessionsPerWeek: programData.sessionsPerWeek,
      });

      // 4. Create split days
      for (const day of programData.weeklySplit.days) {
        const templateId = day.sessionTemplateName 
          ? templateIdMap.get(day.sessionTemplateName)
          : undefined;
        
        await this.createWeeklySplitDay({
          weeklySplitId: splitId,
          dayOfWeek: day.dayOfWeek,
          sessionTemplateId: templateId,
          isRestDay: day.isRestDay,
          notes: day.notes,
        });
      }

      // 5. Create mesocycles
      for (let i = 0; i < programData.mesocycles.length; i++) {
        const meso = programData.mesocycles[i];
        const mesoId = await this.createMesocycle({
          programId,
          name: meso.name,
          phase: meso.phase,
          goal: meso.goal,
          durationWeeks: meso.durationWeeks,
          baseIntensityPercent: meso.baseIntensityPercent,
          baseVolumeMultiplier: meso.baseVolumeMultiplier,
          color: meso.color,
          order: i,
          notes: meso.notes,
        });

        // Create weeks for this mesocycle (all use the same split)
        for (let weekNum = 1; weekNum <= meso.durationWeeks; weekNum++) {
          // Apply deload modifier on last week if it's a deload phase
          const isDeloadWeek = meso.phase === 'deload' || weekNum === meso.durationWeeks;
          
          await this.createMesocycleWeek({
            mesocycleId: mesoId,
            weekNumber: weekNum,
            weeklySplitId: splitId,
            progressionModifier: isDeloadWeek ? 0.7 : 1.0,
            intensityModifier: 1.0,
            volumeModifier: 1.0,
          });
        }
      }

      // 6. Create progression rules (if provided)
      if (programData.progressionRules) {
        for (const rule of programData.progressionRules) {
          await this.createProgressionRule({
            programId,
            ...rule,
          });
        }
      }

      return programId;
    } catch (error) {
      console.error('Error creating complete program:', error);
      throw error;
    }
  }
}

export const supabaseService = new SupabaseService();
