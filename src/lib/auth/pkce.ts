import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export { CHALLENGE_RE, STATE_RE } from './mobile-params';

/** Formas válidas de lo que llega al canjear el código: se comprueban antes de tocar la base de datos. */
export const CODE_RE = /^[A-Za-z0-9_-]{43}$/; // 32 bytes aleatorios en base64url
export const VERIFIER_RE = /^[A-Za-z0-9._~-]{43,128}$/; // RFC 7636

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const challengeOf = (verifier: string) => createHash('sha256').update(verifier).digest('base64url');

/** PKCE (S256): el código solo se canjea con el verifier cuyo hash se envió al empezar. */
export function pkceMatches(verifier: string, challenge: string): boolean {
  const a = Buffer.from(challengeOf(verifier));
  const b = Buffer.from(challenge);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const TOKEN_PREFIX = 'gym_';
export const TOKEN_RE = /^gym_[A-Za-z0-9_-]{43}$/;
export const newToken = () => `${TOKEN_PREFIX}${randomBytes(32).toString('base64url')}`;
export const newCode = () => randomBytes(32).toString('base64url');
