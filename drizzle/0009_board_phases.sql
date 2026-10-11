-- Fases (mesociclos) del plan: una secuencia de bloques de semanas sobre el ciclo del tablero.
CREATE TABLE IF NOT EXISTS board_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  name text NOT NULL,
  kind text NOT NULL,
  start_week integer NOT NULL CHECK (start_week BETWEEN 0 AND 51),
  weeks integer NOT NULL CHECK (weeks BETWEEN 1 AND 52),
  color text NOT NULL DEFAULT '#3b82f6',
  volume_pct integer NOT NULL DEFAULT 0,
  intensity_pct integer NOT NULL DEFAULT 0,
  ramp_sets integer NOT NULL DEFAULT 0,
  ramp_load double precision NOT NULL DEFAULT 0,
  deload_last boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS board_phases_board_idx ON board_phases (board_id);

ALTER TABLE board_phases ENABLE ROW LEVEL SECURITY;
