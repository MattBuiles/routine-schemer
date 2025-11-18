-- ============================================
-- SCRIPT: Crear Perfil para Usuario Actual
-- ============================================
-- Este script crea el perfil para cualquier usuario que ya existe en auth.users
-- pero no tiene perfil en user_profiles

-- PASO 1: Verificar el ID de tu usuario actual
-- Ejecuta esto primero para obtener tu user ID:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- PASO 2: Reemplaza 'TU_USER_ID_AQUI' con tu ID real del paso 1
-- Usuario del error: e67d66a0-646c-4c83-ae65-0bb65ca7a7c2

-- PASO 3: Crear perfil
INSERT INTO public.user_profiles (
  id,
  created_at,
  updated_at,
  age,
  weight,
  height,
  preferences
) VALUES (
  'e67d66a0-646c-4c83-ae65-0bb65ca7a7c2', -- Reemplaza con tu user ID
  NOW(),
  NOW(),
  25,
  70,
  175,
  jsonb_build_object(
    'theme', 'dark',
    'language', 'es',
    'units', 'metric',
    'weekStartDay', 'monday',
    'defaultRestTime', 90,
    'notifications', jsonb_build_object(
      'workoutReminders', true,
      'habitReminders', true,
      'progressUpdates', true,
      'emailNotifications', false
    )
  )
)
ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW();

-- PASO 4: Verificar que se creó correctamente
SELECT 
  id, 
  age, 
  weight, 
  height, 
  created_at,
  preferences->'theme' as theme,
  preferences->'language' as language
FROM public.user_profiles 
WHERE id = 'e67d66a0-646c-4c83-ae65-0bb65ca7a7c2';

-- OPCIONAL: Si quieres crear perfil para TODOS los usuarios que no lo tienen
-- Descomenta las siguientes líneas:

/*
INSERT INTO public.user_profiles (id, created_at, updated_at, age, weight, height, preferences)
SELECT 
  u.id,
  NOW(),
  NOW(),
  25,
  70,
  175,
  jsonb_build_object(
    'theme', 'dark',
    'language', 'es',
    'units', 'metric',
    'weekStartDay', 'monday',
    'defaultRestTime', 90,
    'notifications', jsonb_build_object(
      'workoutReminders', true,
      'habitReminders', true,
      'progressUpdates', true,
      'emailNotifications', false
    )
  )
FROM auth.users u
LEFT JOIN public.user_profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
*/
