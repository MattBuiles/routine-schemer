-- Acceso desde la app móvil: códigos de un solo uso con PKCE que se canjean por una sesión propia de la app. Códigos y tokens se guardan solo como hash.
CREATE TABLE IF NOT EXISTS mobile_auth_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash text NOT NULL UNIQUE,
  code_challenge text NOT NULL,
  user_id text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mobile_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  user_id text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mobile_sessions_user_idx ON mobile_sessions (user_id);

ALTER TABLE mobile_auth_codes ENABLE ROW LEVEL SECURITY;

ALTER TABLE mobile_sessions ENABLE ROW LEVEL SECURITY;
