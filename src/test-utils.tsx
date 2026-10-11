import { render } from '@testing-library/react';
import { ConfirmProvider, ThemeProvider, ToastProvider } from 'strata';
import type { ReactElement } from 'react';

/** Renderiza un componente con los proveedores de strata (tema, avisos y confirmaciones) que usa la app. */
export function renderWithStrata(ui: ReactElement) {
  // jsdom no implementa matchMedia, que el proveedor de tema consulta para seguir el modo del sistema.
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;

  return render(
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>{ui}</ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>,
  );
}

/** jsdom no implementa la captura de puntero; los gestos de arrastre la necesitan. */
export function stubPointerCapture() {
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}
