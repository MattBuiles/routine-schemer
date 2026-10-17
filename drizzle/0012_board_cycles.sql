-- Ciclos del tablero: cada tablero puede tener varios (gimnasio, cardio...) con su propia duración en días. Los bloques de ciclo apuntan al suyo.
CREATE TABLE IF NOT EXISTS board_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  name text NOT NULL DEFAULT 'Ciclo',
  days integer NOT NULL DEFAULT 7 CHECK (days BETWEEN 1 AND 28),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS board_cycles_board_idx ON board_cycles (board_id);

ALTER TABLE board_cycles ENABLE ROW LEVEL SECURITY;

ALTER TABLE board_blocks ADD COLUMN IF NOT EXISTS cycle_id uuid REFERENCES board_cycles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS board_blocks_cycle_idx ON board_blocks (cycle_id);

-- Relleno: cada tablero existente recibe un ciclo Gimnasio con la duración que ya tenía y sus bloques pasan a él.
INSERT INTO board_cycles (board_id, user_id, name, days, position) SELECT b.id, b.user_id, 'Gimnasio', b.cycle_days, 0 FROM boards b WHERE NOT EXISTS (SELECT 1 FROM board_cycles c WHERE c.board_id = b.id);

UPDATE board_blocks bb SET cycle_id = (SELECT c.id FROM board_cycles c WHERE c.board_id = bb.board_id ORDER BY c.position LIMIT 1) WHERE bb.kind = 'cycle' AND bb.cycle_id IS NULL;
