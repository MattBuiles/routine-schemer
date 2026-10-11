-- Se retiran las tablas de programas y de perfil. Ningún código las usa desde que el lienzo reemplazó la interfaz antigua y estaban vacías.
ALTER TABLE notes DROP COLUMN IF EXISTS workout_session_id;
ALTER TABLE calendar_events DROP COLUMN IF EXISTS session_template_id;
DROP TABLE IF EXISTS session_exercises;
DROP TABLE IF EXISTS weekly_split_days;
DROP TABLE IF EXISTS weekly_splits;
DROP TABLE IF EXISTS mesocycle_weeks;
DROP TABLE IF EXISTS mesocycles;
DROP TABLE IF EXISTS progression_rules;
DROP TABLE IF EXISTS session_templates;
DROP TABLE IF EXISTS training_programs;
DROP TABLE IF EXISTS user_goals;
DROP TABLE IF EXISTS user_profiles;
