CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_profiles (
  id text PRIMARY KEY,
  age integer,
  weight numeric(5, 2),
  height numeric(5, 2),
  body_fat numeric(4, 2),
  activity_level text,
  experience text,
  weekly_goal integer,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, goal)
);

CREATE TABLE IF NOT EXISTS training_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL,
  description text,
  split_type text NOT NULL,
  total_weeks integer NOT NULL,
  sessions_per_week integer NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  is_template boolean NOT NULL DEFAULT false,
  tags text[] NOT NULL DEFAULT '{}',
  difficulty text NOT NULL DEFAULT 'intermediate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS training_programs_user_id_idx ON training_programs (user_id);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals FORCE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs FORCE ROW LEVEL SECURITY;
