import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { serverEnv } from './env';

const valid = {
  DATABASE_URL: 'postgresql://user:password@localhost:5432/db',
  NEON_AUTH_BASE_URL: 'https://example.invalid/neondb/auth',
  NEON_AUTH_COOKIE_SECRET: 'x'.repeat(32),
};

const stub = (env: Record<string, string | undefined>) => {
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value as string);
};

afterEach(() => vi.unstubAllEnvs());

describe('serverEnv', () => {
  it('acepta una configuración completa', () => {
    stub(valid);
    expect(serverEnv()).toEqual(valid);
  });

  it('rechaza un secreto de cookie de menos de 32 caracteres', () => {
    stub({ ...valid, NEON_AUTH_COOKIE_SECRET: 'x'.repeat(31) });
    expect(() => serverEnv()).toThrow();
  });

  it.each(Object.keys(valid))('rechaza la configuración si falta %s', key => {
    stub({ ...valid, [key]: '' });
    expect(() => serverEnv()).toThrow();
  });

  it('rechaza URLs mal formadas', () => {
    stub({ ...valid, DATABASE_URL: 'no-es-una-url' });
    expect(() => serverEnv()).toThrow();
  });
});

describe('.env.example', () => {
  const example = readFileSync(join(process.cwd(), '.env.example'), 'utf8');
  const assignments = Object.fromEntries(
    example
      .split('\n')
      .filter(line => /^[A-Z_]+=/.test(line))
      .map(line => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1)])
  );

  it('documenta todas las variables que exige serverEnv()', () => {
    for (const key of Object.keys(valid)) expect(assignments).toHaveProperty(key);
  });

  it('no contiene secretos reales: el secreto va vacío y la conexión usa marcadores', () => {
    expect(assignments.NEON_AUTH_COOKIE_SECRET).toBe('');
    expect(assignments.DATABASE_URL).toContain('USER:PASSWORD@');
    expect(assignments.NEON_AUTH_BASE_URL).toContain('YOUR-ENDPOINT');
  });
});
