-- Los bloques guardados antes de existir el icono quedaron con sparkles. Se limpian para que usen el icono de su enfoque.
UPDATE board_blocks SET icon = NULL WHERE icon = 'sparkles' AND block_type IS NOT NULL AND block_type NOT IN ('free') AND block_type NOT LIKE 'custom:%';
