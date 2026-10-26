-- Búsqueda de ejercicios que perdona errores de escritura (sqat, dumbel curl): usa similitud de trigramas como último recurso
-- cuando la búsqueda normal no encuentra nada. Aditiva y reversible con DROP EXTENSION pg_trgm.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
