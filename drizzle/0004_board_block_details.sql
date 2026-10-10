-- Bloques más ricos: enfoque, notas, duración e icono. Los tipos propios recuerdan su icono.
ALTER TABLE board_blocks ADD COLUMN IF NOT EXISTS focus text[] NOT NULL DEFAULT '{}';
ALTER TABLE board_blocks ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';
ALTER TABLE board_blocks ADD COLUMN IF NOT EXISTS duration_minutes integer;
ALTER TABLE board_blocks ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE block_types ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'sparkles';
