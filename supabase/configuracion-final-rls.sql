-- ============================================
-- CONFIGURACIÓN FINAL: RLS + TRIGGER + POLÍTICAS
-- ============================================

-- PASO 1: Asegurar que el trigger de creación de perfil existe
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger anterior si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear nuevo trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PASO 2: Habilitar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_split_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesocycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesocycle_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progression_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- PASO 3: Crear políticas RLS simples y funcionales
-- USER PROFILES
DROP POLICY IF EXISTS "user_profiles_all" ON public.user_profiles;
CREATE POLICY "user_profiles_all" ON public.user_profiles
    FOR ALL USING (auth.uid() = id);

-- USER GOALS
DROP POLICY IF EXISTS "user_goals_all" ON public.user_goals;
CREATE POLICY "user_goals_all" ON public.user_goals
    FOR ALL USING (auth.uid() = user_id);

-- TRAINING PROGRAMS
DROP POLICY IF EXISTS "training_programs_all" ON public.training_programs;
CREATE POLICY "training_programs_all" ON public.training_programs
    FOR ALL USING (auth.uid() = user_id OR is_public = true);

-- SESSION TEMPLATES
DROP POLICY IF EXISTS "session_templates_all" ON public.session_templates;
CREATE POLICY "session_templates_all" ON public.session_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.training_programs 
            WHERE training_programs.id = session_templates.program_id 
            AND (training_programs.user_id = auth.uid() OR training_programs.is_public = true)
        )
    );

-- SESSION EXERCISES
DROP POLICY IF EXISTS "session_exercises_all" ON public.session_exercises;
CREATE POLICY "session_exercises_all" ON public.session_exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.session_templates st
            JOIN public.training_programs tp ON st.program_id = tp.id
            WHERE st.id = session_exercises.session_template_id 
            AND (tp.user_id = auth.uid() OR tp.is_public = true)
        )
    );

-- WEEKLY SPLITS
DROP POLICY IF EXISTS "weekly_splits_all" ON public.weekly_splits;
CREATE POLICY "weekly_splits_all" ON public.weekly_splits
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.training_programs 
            WHERE training_programs.id = weekly_splits.program_id 
            AND (training_programs.user_id = auth.uid() OR training_programs.is_public = true)
        )
    );

-- WEEKLY SPLIT DAYS
DROP POLICY IF EXISTS "weekly_split_days_all" ON public.weekly_split_days;
CREATE POLICY "weekly_split_days_all" ON public.weekly_split_days
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.weekly_splits ws
            JOIN public.training_programs tp ON ws.program_id = tp.id
            WHERE ws.id = weekly_split_days.weekly_split_id 
            AND (tp.user_id = auth.uid() OR tp.is_public = true)
        )
    );

-- MESOCYCLES
DROP POLICY IF EXISTS "mesocycles_all" ON public.mesocycles;
CREATE POLICY "mesocycles_all" ON public.mesocycles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.training_programs 
            WHERE training_programs.id = mesocycles.program_id 
            AND (training_programs.user_id = auth.uid() OR training_programs.is_public = true)
        )
    );

-- MESOCYCLE WEEKS
DROP POLICY IF EXISTS "mesocycle_weeks_all" ON public.mesocycle_weeks;
CREATE POLICY "mesocycle_weeks_all" ON public.mesocycle_weeks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.mesocycles m
            JOIN public.training_programs tp ON m.program_id = tp.id
            WHERE m.id = mesocycle_weeks.mesocycle_id 
            AND (tp.user_id = auth.uid() OR tp.is_public = true)
        )
    );

-- PROGRESSION RULES
DROP POLICY IF EXISTS "progression_rules_all" ON public.progression_rules;
CREATE POLICY "progression_rules_all" ON public.progression_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.training_programs 
            WHERE training_programs.id = progression_rules.program_id 
            AND (training_programs.user_id = auth.uid() OR training_programs.is_public = true)
        )
    );

-- EXERCISES (público para todos)
DROP POLICY IF EXISTS "exercises_all" ON public.exercises;
CREATE POLICY "exercises_all" ON public.exercises
    FOR ALL USING (true);

-- PASO 4: Verificar que todo está configurado
SELECT 
    p.tablename,
    COUNT(*) as policy_count,
    BOOL_OR(t.rowsecurity) as rls_enabled
FROM pg_policies p
JOIN pg_tables t ON p.tablename = t.tablename AND p.schemaname = t.schemaname
WHERE p.schemaname = 'public'
AND p.tablename IN ('user_profiles', 'training_programs', 'user_goals', 
                    'session_templates', 'mesocycles', 'weekly_splits')
GROUP BY p.tablename
ORDER BY p.tablename;

-- PASO 5: Verificar permisos de roles
SELECT 
    t.tablename,
    COUNT(DISTINCT grantee) as roles_with_access
FROM pg_tables t
LEFT JOIN information_schema.role_table_grants g 
    ON t.tablename = g.table_name AND t.schemaname = g.table_schema
WHERE t.schemaname = 'public'
AND t.tablename IN ('user_profiles', 'training_programs', 'user_goals')
AND grantee IN ('anon', 'authenticated')
GROUP BY t.tablename
ORDER BY t.tablename;
