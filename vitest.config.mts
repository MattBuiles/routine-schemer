import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': fromRoot('./src'),
      'server-only': fromRoot('./test/server-only.ts'),
    },
  },
  // El JSX de los tests de componentes usa el runtime automático (tsconfig lo deja en `preserve` para Next).
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    // strata se publica como TypeScript sin compilar: hay que transformarlo en lugar de importarlo tal cual.
    server: { deps: { inline: ['strata'] } },
  },
});
