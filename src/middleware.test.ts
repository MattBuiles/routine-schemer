import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/server', () => ({ auth: { middleware: () => () => null } }));

import { config } from './middleware';

// El matcher de Next es un patrón de rutas con un grupo de expresión regular; aquí se aplica como tal.
const matches = (path: string) => new RegExp(`^${config.matcher[0]}$`).test(path);

describe('matcher del middleware', () => {
  it('protege las páginas y las rutas web', () => {
    for (const p of ['/', '/board', '/auth/mobile', '/auth/mobile/complete', '/api/auth/get-session']) expect(matches(p)).toBe(true);
  });

  it('deja pasar la API móvil, que se autentica con su propio token, y los estáticos', () => {
    for (const p of ['/api/v1/me', '/api/v1/auth/exchange', '/_next/static/x.js', '/_next/image', '/favicon.ico', '/icon.svg']) expect(matches(p)).toBe(false);
  });
});
