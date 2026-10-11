-- Fecha de inicio del plan de fases: ancla las semanas del plan al calendario. Nula mientras no se fija.
ALTER TABLE boards ADD COLUMN IF NOT EXISTS plan_start date;
