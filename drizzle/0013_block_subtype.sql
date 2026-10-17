-- Subenfoque libre de un bloque (por ejemplo bici, trotar o nadar dentro de resistencia). Nulo mientras no se rellena.
ALTER TABLE board_blocks ADD COLUMN IF NOT EXISTS sub_type text;
