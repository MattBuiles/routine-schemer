-- ============================================
-- ROUTINE SCHEMER - SUPABASE DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & PROFILES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    age INTEGER,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    body_fat DECIMAL(4,2),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    experience TEXT CHECK (experience IN ('beginner', 'intermediate', 'advanced', 'expert')),
    weekly_goal INTEGER,
    preferences JSONB DEFAULT '{"theme": "auto", "language": "en", "units": "metric", "weekStartDay": "monday", "defaultRestTime": 90, "notifications": {"workoutReminders": true, "habitReminders": true, "progressUpdates": true, "emailNotifications": false}}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals junction table (many-to-many)
CREATE TABLE public.user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    goal TEXT CHECK (goal IN ('muscle_gain', 'strength', 'fat_loss', 'endurance', 'general_fitness', 'sport_specific')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, goal)
);

-- ============================================
-- EXERCISES
-- ============================================

CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    body_part TEXT NOT NULL,
    equipment TEXT NOT NULL,
    target TEXT NOT NULL,
    instructions TEXT[] DEFAULT '{}',
    gif_url TEXT,
    secondary_muscles TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TRAINING PROGRAMS & SESSIONS
-- ============================================

CREATE TABLE public.training_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    split TEXT CHECK (split IN ('full_body', 'upper_lower', 'push_pull_legs', 'body_part', 'custom')),
    goal TEXT CHECK (goal IN ('muscle_gain', 'strength', 'fat_loss', 'endurance', 'general_fitness', 'sport_specific')),
    duration INTEGER NOT NULL, -- weeks
    sessions_per_week INTEGER NOT NULL,
    estimated_duration INTEGER, -- minutes per session
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    is_public BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES public.training_programs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('strength', 'hypertrophy', 'endurance', 'power', 'flexibility', 'cardio', 'recovery', 'mobility', 'stretching', 'conditioning')),
    estimated_duration INTEGER, -- minutes
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    sets INTEGER NOT NULL,
    reps TEXT NOT NULL, -- e.g., "8-12", "10", "AMRAP"
    weight DECIMAL(6,2),
    rest_time INTEGER NOT NULL, -- seconds
    notes TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MESOCYCLES & MICROCYCLES
-- ============================================

CREATE TABLE public.mesocycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    goal TEXT CHECK (goal IN ('muscle_gain', 'strength', 'fat_loss', 'endurance', 'general_fitness', 'sport_specific')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.microcycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mesocycle_id UUID REFERENCES public.mesocycles(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session assignments to microcycles
CREATE TABLE public.microcycle_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    microcycle_id UUID NOT NULL REFERENCES public.microcycles(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(microcycle_id, scheduled_date)
);

-- ============================================
-- CALENDAR EVENTS
-- ============================================

CREATE TABLE public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('routine', 'habit', 'note', 'workout', 'nutrition', 'other')),
    duration INTEGER, -- minutes
    description TEXT,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
    completed BOOLEAN DEFAULT false,
    actual_duration INTEGER,
    notes TEXT,
    category TEXT CHECK (category IN ('workout', 'nutrition', 'habit', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HABITS & TRACKING
-- ============================================

CREATE TABLE public.habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('water_intake', 'sleep', 'nutrition', 'supplements', 'meditation', 'steps', 'weight', 'custom')),
    target DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.habit_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(habit_id, date)
);

-- ============================================
-- NOTES
-- ============================================

CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('general', 'workout', 'nutrition', 'progress', 'idea', 'reminder')),
    tags TEXT[] DEFAULT '{}',
    workout_session_id UUID REFERENCES public.workout_sessions(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User-related indexes
CREATE INDEX idx_user_profiles_id ON public.user_profiles(id);
CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);

-- Training programs
CREATE INDEX idx_training_programs_user_id ON public.training_programs(user_id);
CREATE INDEX idx_training_programs_is_active ON public.training_programs(is_active);
CREATE INDEX idx_training_programs_created_at ON public.training_programs(created_at DESC);

-- Workout sessions
CREATE INDEX idx_workout_sessions_program_id ON public.workout_sessions(program_id);
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_created_at ON public.workout_sessions(created_at DESC);

-- Workout exercises
CREATE INDEX idx_workout_exercises_session_id ON public.workout_exercises(session_id);
CREATE INDEX idx_workout_exercises_exercise_id ON public.workout_exercises(exercise_id);
CREATE INDEX idx_workout_exercises_order ON public.workout_exercises(session_id, order_index);

-- Calendar events
CREATE INDEX idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX idx_calendar_events_date ON public.calendar_events(date);
CREATE INDEX idx_calendar_events_user_date ON public.calendar_events(user_id, date);
CREATE INDEX idx_calendar_events_session_id ON public.calendar_events(session_id);

-- Habits
CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habits_is_active ON public.habits(is_active);
CREATE INDEX idx_habit_records_habit_id ON public.habit_records(habit_id);
CREATE INDEX idx_habit_records_user_date ON public.habit_records(user_id, date);

-- Notes
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX idx_notes_is_pinned ON public.notes(is_pinned);

-- Exercises
CREATE INDEX idx_exercises_body_part ON public.exercises(body_part);
CREATE INDEX idx_exercises_equipment ON public.exercises(equipment);
CREATE INDEX idx_exercises_target ON public.exercises(target);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesocycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microcycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.microcycle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User Goals Policies
CREATE POLICY "Users can manage own goals" ON public.user_goals
    FOR ALL USING (auth.uid() = user_id);

-- Training Programs Policies
CREATE POLICY "Users can view own programs" ON public.training_programs
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage own programs" ON public.training_programs
    FOR ALL USING (auth.uid() = user_id);

-- Workout Sessions Policies
CREATE POLICY "Users can view own sessions" ON public.workout_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON public.workout_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Workout Exercises Policies (access through session)
CREATE POLICY "Users can view exercises in their sessions" ON public.workout_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workout_sessions 
            WHERE workout_sessions.id = workout_exercises.session_id 
            AND workout_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage exercises in their sessions" ON public.workout_exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workout_sessions 
            WHERE workout_sessions.id = workout_exercises.session_id 
            AND workout_sessions.user_id = auth.uid()
        )
    );

-- Mesocycles Policies
CREATE POLICY "Users can view own mesocycles" ON public.mesocycles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.training_programs 
            WHERE training_programs.id = mesocycles.program_id 
            AND training_programs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own mesocycles" ON public.mesocycles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.training_programs 
            WHERE training_programs.id = mesocycles.program_id 
            AND training_programs.user_id = auth.uid()
        )
    );

-- Microcycles Policies
CREATE POLICY "Users can view own microcycles" ON public.microcycles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.training_programs 
            WHERE training_programs.id = microcycles.program_id 
            AND training_programs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own microcycles" ON public.microcycles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.training_programs 
            WHERE training_programs.id = microcycles.program_id 
            AND training_programs.user_id = auth.uid()
        )
    );

-- Microcycle Sessions Policies
CREATE POLICY "Users can view own microcycle sessions" ON public.microcycle_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.microcycles 
            JOIN public.training_programs ON training_programs.id = microcycles.program_id
            WHERE microcycles.id = microcycle_sessions.microcycle_id 
            AND training_programs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own microcycle sessions" ON public.microcycle_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.microcycles 
            JOIN public.training_programs ON training_programs.id = microcycles.program_id
            WHERE microcycles.id = microcycle_sessions.microcycle_id 
            AND training_programs.user_id = auth.uid()
        )
    );

-- Calendar Events Policies
CREATE POLICY "Users can manage own calendar events" ON public.calendar_events
    FOR ALL USING (auth.uid() = user_id);

-- Habits Policies
CREATE POLICY "Users can manage own habits" ON public.habits
    FOR ALL USING (auth.uid() = user_id);

-- Habit Records Policies
CREATE POLICY "Users can manage own habit records" ON public.habit_records
    FOR ALL USING (auth.uid() = user_id);

-- Notes Policies
CREATE POLICY "Users can manage own notes" ON public.notes
    FOR ALL USING (auth.uid() = user_id);

-- Exercises Policies (public read, admin write)
CREATE POLICY "Anyone can view exercises" ON public.exercises
    FOR SELECT USING (true);

-- Only authenticated users can create exercises
CREATE POLICY "Authenticated users can create exercises" ON public.exercises
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_programs_updated_at BEFORE UPDATE ON public.training_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_exercises_updated_at BEFORE UPDATE ON public.workout_exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mesocycles_updated_at BEFORE UPDATE ON public.mesocycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_microcycles_updated_at BEFORE UPDATE ON public.microcycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON public.habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for workout sessions with exercise count
CREATE OR REPLACE VIEW workout_sessions_with_details AS
SELECT 
    ws.*,
    COUNT(we.id) as exercise_count,
    ARRAY_AGG(DISTINCT e.body_part) as body_parts_targeted
FROM public.workout_sessions ws
LEFT JOIN public.workout_exercises we ON ws.id = we.session_id
LEFT JOIN public.exercises e ON we.exercise_id = e.id
GROUP BY ws.id;

-- View for user statistics
CREATE OR REPLACE VIEW user_workout_stats AS
SELECT 
    ce.user_id,
    COUNT(*) FILTER (WHERE ce.completed = true) as completed_workouts,
    COUNT(*) FILTER (WHERE ce.date >= CURRENT_DATE - INTERVAL '7 days') as workouts_this_week,
    COUNT(*) FILTER (WHERE ce.date >= DATE_TRUNC('month', CURRENT_DATE)) as workouts_this_month,
    AVG(ce.actual_duration) FILTER (WHERE ce.completed = true) as avg_workout_duration
FROM public.calendar_events ce
WHERE ce.type = 'workout'
GROUP BY ce.user_id;

-- ============================================
-- SAMPLE DATA (OPTIONAL)
-- ============================================

-- Insert some sample exercises (optional)
INSERT INTO public.exercises (name, body_part, equipment, target, instructions, secondary_muscles) VALUES
('Barbell Bench Press', 'chest', 'barbell', 'pectorals', ARRAY['Lie on bench', 'Lower bar to chest', 'Press up'], ARRAY['triceps', 'shoulders']),
('Barbell Squat', 'legs', 'barbell', 'quadriceps', ARRAY['Bar on shoulders', 'Squat down', 'Stand up'], ARRAY['glutes', 'hamstrings']),
('Deadlift', 'back', 'barbell', 'lower back', ARRAY['Grip bar', 'Lift to standing', 'Lower controlled'], ARRAY['hamstrings', 'glutes', 'traps']),
('Pull-ups', 'back', 'bodyweight', 'lats', ARRAY['Hang from bar', 'Pull up until chin over bar', 'Lower controlled'], ARRAY['biceps', 'forearms'])
ON CONFLICT DO NOTHING;
