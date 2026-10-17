-- Duración total del plan de fases en semanas (el plan se repite al terminar). Los tableros con fases conservan la longitud que ya tenían y el resto empieza en 12.
ALTER TABLE boards ADD COLUMN IF NOT EXISTS plan_weeks integer NOT NULL DEFAULT 12 CHECK (plan_weeks BETWEEN 1 AND 52);

UPDATE boards SET plan_weeks = (SELECT MAX(start_week + weeks) FROM board_phases WHERE board_phases.board_id = boards.id) WHERE EXISTS (SELECT 1 FROM board_phases WHERE board_phases.board_id = boards.id);
