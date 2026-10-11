import type { ReactNode } from 'react';
import { ThemeToggle } from 'strata';

/** Marco común de las pantallas de acceso: fondo, tema y cabecera con los tokens de strata. */
export default function AuthShell({ children, showHeading = false }: { children: ReactNode; showHeading?: boolean }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-4 py-10">
      <ThemeToggle className="absolute right-4 top-4" />
      <div className="rise-in w-full max-w-sm">
        {showHeading && (
          <header className="mb-8 text-center">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-fg">Routine Schemer</h1>
            <p className="mt-2 text-sm text-muted">Diseña tu ciclo de entrenamiento como si fuera plastilina.</p>
          </header>
        )}
        {children}
      </div>
    </div>
  );
}
