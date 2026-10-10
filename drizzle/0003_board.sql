-- Lienzo de bloques: un tablero por usuario, sus bloques (ciclo y widgets) y tipos de bloque propios.
CREATE TABLE IF NOT EXISTS boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  cycle_days integer NOT NULL DEFAULT 7 CHECK (cycle_days BETWEEN 1 AND 28),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS board_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('cycle', 'widget')),
  label text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '#3b82f6',
  block_type text,
  day_start integer,
  day_span integer,
  lane integer,
  load integer,
  widget_type text,
  x integer,
  y integer,
  w integer,
  h integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS block_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS board_blocks_board_idx ON board_blocks (board_id);
CREATE INDEX IF NOT EXISTS block_types_user_idx ON block_types (user_id);

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_types ENABLE ROW LEVEL SECURITY;
