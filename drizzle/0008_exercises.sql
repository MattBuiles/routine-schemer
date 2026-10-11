-- Biblioteca de ejercicios. Las filas con user_id nulo son la biblioteca común y las demás son ejercicios propios de un usuario.
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  source text NOT NULL,
  source_id text NOT NULL,
  name_en text NOT NULL,
  name_es text,
  category text,
  level text,
  equipment text[] NOT NULL DEFAULT '{}',
  primary_muscles text[] NOT NULL DEFAULT '{}',
  secondary_muscles text[] NOT NULL DEFAULT '{}',
  instructions_en text NOT NULL DEFAULT '',
  instructions_es text,
  images text[] NOT NULL DEFAULT '{}',
  license text NOT NULL DEFAULT '',
  attribution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exercises_source_key UNIQUE (source, source_id)
);

CREATE INDEX IF NOT EXISTS exercises_name_en_idx ON exercises (lower(name_en));
CREATE INDEX IF NOT EXISTS exercises_user_id_idx ON exercises (user_id);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Los ejercicios de cada bloque viajan con el propio bloque (lista JSON con una copia del nombre).
ALTER TABLE board_blocks ADD COLUMN IF NOT EXISTS exercises jsonb NOT NULL DEFAULT '[]'::jsonb;
