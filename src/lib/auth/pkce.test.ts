import { describe, expect, it } from 'vitest';

import { CHALLENGE_RE, CODE_RE, STATE_RE, TOKEN_RE, VERIFIER_RE, challengeOf, hashToken, newCode, newToken, pkceMatches } from './pkce';

// Vector de ejemplo del apéndice B de la RFC 7636.
const VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

describe('PKCE', () => {
  it('calcula el challenge S256 de la RFC 7636', () => {
    expect(challengeOf(VERIFIER)).toBe(CHALLENGE);
  });

  it('acepta el verifier correcto y rechaza otro, uno vacío o uno de otra longitud', () => {
    expect(pkceMatches(VERIFIER, CHALLENGE)).toBe(true);
    expect(pkceMatches(`${VERIFIER}x`, CHALLENGE)).toBe(false);
    expect(pkceMatches('', CHALLENGE)).toBe(false);
    expect(pkceMatches(VERIFIER, CHALLENGE.slice(0, -1))).toBe(false);
  });
});

describe('formas válidas', () => {
  it('state: 8 a 128 caracteres de base64url', () => {
    for (const ok of ['abcdefgh', 'A_b-9'.repeat(5), 'x'.repeat(128)]) expect(STATE_RE.test(ok)).toBe(true);
    for (const bad of ['', 'corto', 'x'.repeat(129), 'con espacio!', 'a/b/c/d/e/f', '<script>']) expect(STATE_RE.test(bad)).toBe(false);
  });

  it('challenge y código: exactamente 43 caracteres de base64url', () => {
    expect(CHALLENGE_RE.test(CHALLENGE)).toBe(true);
    expect(CODE_RE.test(newCode())).toBe(true);
    for (const bad of [CHALLENGE.slice(1), `${CHALLENGE}a`, `${CHALLENGE.slice(1)}=`, '']) {
      expect(CHALLENGE_RE.test(bad)).toBe(false);
      expect(CODE_RE.test(bad)).toBe(false);
    }
  });

  it('verifier: 43 a 128 caracteres del juego de la RFC 7636', () => {
    expect(VERIFIER_RE.test(VERIFIER)).toBe(true);
    expect(VERIFIER_RE.test('a.b~c-d_'.repeat(6))).toBe(true);
    for (const bad of ['x'.repeat(42), 'x'.repeat(129), `${VERIFIER.slice(1)} `, `${VERIFIER.slice(1)}+`]) expect(VERIFIER_RE.test(bad)).toBe(false);
  });
});

describe('tokens', () => {
  it('el token lleva prefijo, es aleatorio y no se parece a su hash', () => {
    const a = newToken(), b = newToken();
    expect(TOKEN_RE.test(a)).toBe(true);
    expect(a).not.toBe(b);
    expect(hashToken(a)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(a)).toBe(hashToken(a));
    expect(hashToken(a)).not.toBe(hashToken(b));
  });

  it('TOKEN_RE rechaza lo que no es un token entero', () => {
    const t = newToken();
    for (const bad of ['', t.slice(1), `${t}x`, t.replace('gym_', 'abc_'), ` ${t}`, `${t}\n`]) expect(TOKEN_RE.test(bad)).toBe(false);
  });
});
