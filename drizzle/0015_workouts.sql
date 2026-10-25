-- Entrenos registrados desde la app móvil: sesión, ejercicios de la sesión y series. Los ids los crea el teléfono y todo se sincroniza con push y pull.
-- seq sale de una secuencia común y sirve de cursor de lectura. client_updated_at es la hora del teléfono en milisegundos y decide qué edición gana.
CREATE SEQUENCE IF NOT EXISTS wk_sync_seq;

CREATE TABLE IF NOT EXISTS wk_workouts (
  id uuid PRIMARY KEY,
  user_id text NOT NULL,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  note text NOT NULL DEFAULT '',
  cycle_id uuid,
  plan_week integer CHECK (plan_week BETWEEN 0 AND 51),
  plan_day integer CHECK (plan_day BETWEEN 0 AND 27),
  client_updated_at bigint NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  seq bigint NOT NULL DEFAULT nextval('wk_sync_seq')
);

CREATE TABLE IF NOT EXISTS wk_workout_exercises (
  id uuid PRIMARY KEY,
  user_id text NOT NULL,
  workout_id uuid NOT NULL,
  exercise_id uuid,
  name text NOT NULL,
  position integer NOT NULL CHECK (position BETWEEN 0 AND 200),
  superset_group integer CHECK (superset_group BETWEEN 0 AND 50),
  target_sets integer CHECK (target_sets BETWEEN 1 AND 50),
  target_reps text,
  client_updated_at bigint NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  seq bigint NOT NULL DEFAULT nextval('wk_sync_seq')
);

CREATE TABLE IF NOT EXISTS wk_sets (
  id uuid PRIMARY KEY,
  user_id text NOT NULL,
  workout_exercise_id uuid NOT NULL,
  position integer NOT NULL CHECK (position BETWEEN 0 AND 200),
  kind text NOT NULL CHECK (kind IN ('warmup', 'work', 'backoff', 'failure')),
  weight_kg double precision CHECK (weight_kg BETWEEN 0 AND 1000),
  reps integer CHECK (reps BETWEEN 0 AND 1000),
  rir integer CHECK (rir BETWEEN 0 AND 10),
  rest_s integer CHECK (rest_s BETWEEN 0 AND 7200),
  incline_pct double precision CHECK (incline_pct BETWEEN 0 AND 40),
  per_side boolean NOT NULL DEFAULT false,
  done_at timestamptz,
  client_updated_at bigint NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  seq bigint NOT NULL DEFAULT nextval('wk_sync_seq')
);

CREATE INDEX IF NOT EXISTS wk_workouts_user_seq_idx ON wk_workouts (user_id, seq);

CREATE INDEX IF NOT EXISTS wk_workout_exercises_user_seq_idx ON wk_workout_exercises (user_id, seq);

CREATE INDEX IF NOT EXISTS wk_sets_user_seq_idx ON wk_sets (user_id, seq);

ALTER TABLE wk_workouts ENABLE ROW LEVEL SECURITY;

ALTER TABLE wk_workout_exercises ENABLE ROW LEVEL SECURITY;

ALTER TABLE wk_sets ENABLE ROW LEVEL SECURITY;
