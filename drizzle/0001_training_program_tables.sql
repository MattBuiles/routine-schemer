CREATE TABLE IF NOT EXISTS session_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  focus text[] NOT NULL DEFAULT '{}',
  color text NOT NULL DEFAULT '#3b82f6',
  estimated_duration_minutes integer NOT NULL DEFAULT 60,
  order_index integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_template_id uuid NOT NULL REFERENCES session_templates(id) ON DELETE CASCADE,
  exercise_id text,
  exercise_name text NOT NULL,
  sets integer NOT NULL,
  reps text NOT NULL,
  intensity_percent double precision,
  tempo text,
  rest_seconds integer NOT NULL,
  rpe double precision,
  notes text,
  order_index integer NOT NULL DEFAULT 0,
  primary_muscles text[] NOT NULL DEFAULT '{}',
  secondary_muscles text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weekly_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  total_sessions_per_week integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weekly_split_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_split_id uuid NOT NULL REFERENCES weekly_splits(id) ON DELETE CASCADE,
  day_of_week text NOT NULL,
  session_template_id uuid REFERENCES session_templates(id) ON DELETE SET NULL,
  is_rest_day boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mesocycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  phase text NOT NULL,
  goal text NOT NULL,
  duration_weeks integer NOT NULL,
  base_intensity_percent double precision NOT NULL DEFAULT 70,
  base_volume_multiplier double precision NOT NULL DEFAULT 1,
  color text NOT NULL DEFAULT '#3b82f6',
  order_index integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mesocycle_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mesocycle_id uuid NOT NULL REFERENCES mesocycles(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  weekly_split_id uuid REFERENCES weekly_splits(id) ON DELETE SET NULL,
  progression_modifier double precision NOT NULL DEFAULT 1,
  intensity_modifier double precision NOT NULL DEFAULT 1,
  volume_modifier double precision NOT NULL DEFAULT 1,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS progression_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  type text NOT NULL,
  variable text NOT NULL,
  start_value double precision NOT NULL,
  increment_per_week double precision NOT NULL,
  increment_per_mesocycle double precision,
  cap_value double precision,
  deload_reduction double precision,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS session_templates_program_id_idx ON session_templates (program_id);
CREATE INDEX IF NOT EXISTS session_exercises_template_id_idx ON session_exercises (session_template_id);
CREATE INDEX IF NOT EXISTS weekly_splits_program_id_idx ON weekly_splits (program_id);
CREATE INDEX IF NOT EXISTS weekly_split_days_split_id_idx ON weekly_split_days (weekly_split_id);
CREATE INDEX IF NOT EXISTS mesocycles_program_id_idx ON mesocycles (program_id);
CREATE INDEX IF NOT EXISTS mesocycle_weeks_mesocycle_id_idx ON mesocycle_weeks (mesocycle_id);
CREATE INDEX IF NOT EXISTS progression_rules_program_id_idx ON progression_rules (program_id);

ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_split_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesocycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesocycle_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE progression_rules ENABLE ROW LEVEL SECURITY;
