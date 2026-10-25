import 'server-only';

import { and, eq, gt, isNull, lt, sql } from 'drizzle-orm';

import { db } from '@/db/client';
import { mobileAuthCodes, mobileSessions } from '@/db/schema';
import { TOKEN_RE, hashToken, newCode, newToken, pkceMatches } from '@/lib/auth/pkce';

/** Único destino al que se devuelve el código: nunca se acepta uno que mande el cliente. */
export const MOBILE_REDIRECT = 'gymapp://auth';
export const CODE_TTL_MS = 2 * 60_000;
export const SESSION_TTL_MS = 60 * 24 * 3_600_000;

/** Guarda un código de un solo uso para `userId`, atado al `challenge` de PKCE; devuelve el código en claro. */
export async function createAuthCode(userId: string, challenge: string): Promise<string> {
  const code = newCode();
  await db.insert(mobileAuthCodes).values({
    codeHash: hashToken(code),
    codeChallenge: challenge,
    userId,
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  });
  return code;
}

/** Canjea el código por una sesión de la app. `null` si no existe, caducó, ya se usó o el verifier no corresponde. */
export async function exchangeCode(code: string, verifier: string): Promise<{ token: string; expiresAt: string } | null> {
  const [row] = await db
    .select()
    .from(mobileAuthCodes)
    .where(and(eq(mobileAuthCodes.codeHash, hashToken(code)), isNull(mobileAuthCodes.usedAt), gt(mobileAuthCodes.expiresAt, sql`now()`)));
  if (!row || !pkceMatches(verifier, row.codeChallenge)) return null;

  // Gastarlo es atómico: si dos peticiones llegan a la vez, solo una obtiene la fila.
  const [spent] = await db
    .update(mobileAuthCodes)
    .set({ usedAt: sql`now()` })
    .where(and(eq(mobileAuthCodes.id, row.id), isNull(mobileAuthCodes.usedAt)))
    .returning({ id: mobileAuthCodes.id });
  if (!spent) return null;

  const token = newToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(mobileSessions).values({ tokenHash: hashToken(token), userId: row.userId, expiresAt });
  await db.delete(mobileAuthCodes).where(lt(mobileAuthCodes.expiresAt, sql`now() - interval '1 day'`));
  await db.delete(mobileSessions).where(lt(mobileSessions.expiresAt, sql`now()`));
  return { token, expiresAt: expiresAt.toISOString() };
}

export type MobileUser = { id: string; email: string; name: string };

const bearer = (request: Request) => {
  const token = /^Bearer (\S+)$/.exec(request.headers.get('authorization') ?? '')?.[1];
  return token && TOKEN_RE.test(token) ? token : null;
};

/** Usuario dueño del token `Authorization: Bearer`, o `null` si falta, caducó o el usuario ya no existe en Neon Auth. */
export async function getMobileUser(request: Request): Promise<MobileUser | null> {
  const token = bearer(request);
  if (!token) return null;
  const { rows } = await db.execute<MobileUser>(sql`
    select u.id::text as id, u.email, u.name
    from mobile_sessions s join neon_auth."user" u on u.id::text = s.user_id
    where s.token_hash = ${hashToken(token)} and s.expires_at > now()`);
  return rows[0] ?? null;
}

/** Id del usuario autenticado por token (para los endpoints de la app); `null` si no hay sesión válida. */
export const getMobileUserId = async (request: Request) => (await getMobileUser(request))?.id ?? null;

export async function revokeMobileSession(request: Request): Promise<void> {
  const token = bearer(request);
  if (token) await db.delete(mobileSessions).where(eq(mobileSessions.tokenHash, hashToken(token)));
}
