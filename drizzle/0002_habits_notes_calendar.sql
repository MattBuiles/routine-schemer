CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'custom',
  target double precision NOT NULL,
  unit text NOT NULL,
  color text NOT NULL,
  icon text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  date date NOT NULL,
  value double precision NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT habit_records_habit_id_date_key UNIQUE (habit_id, date)
);

CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'general',
  tags text[] NOT NULL DEFAULT '{}',
  workout_session_id uuid REFERENCES session_templates(id) ON DELETE SET NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  date date NOT NULL,
  time time,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'other',
  duration integer,
  description text,
  session_template_id uuid REFERENCES session_templates(id) ON DELETE SET NULL,
  completed boolean NOT NULL DEFAULT false,
  actual_duration integer,
  notes text,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits (user_id);
CREATE INDEX IF NOT EXISTS habit_records_user_date_idx ON habit_records (user_id, date);
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes (user_id);
CREATE INDEX IF NOT EXISTS calendar_events_user_date_idx ON calendar_events (user_id, date);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
