-- Nota fija y descanso propio de cada ejercicio de un entreno o rutina (se sincronizan con el móvil). Aditiva: dos columnas opcionales.
ALTER TABLE wk_workout_exercises ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE wk_workout_exercises ADD COLUMN IF NOT EXISTS rest_s integer;
