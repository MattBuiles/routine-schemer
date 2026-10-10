-- El enfoque pasa a ser el tipo de bloque y las etiquetas de músculos se llaman zonas. Se retira la duración.
ALTER TABLE board_blocks RENAME COLUMN focus TO zones;
ALTER TABLE board_blocks DROP COLUMN IF EXISTS duration_minutes;
