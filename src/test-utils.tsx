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

/** Lanza un evento de puntero con coordenadas (jsdom no trae PointerEvent: un MouseEvent con ese nombre llega igual a React). */
export function pointer(el: Element | Window, type: 'pointerdown' | 'pointermove' | 'pointerup', init: { clientX?: number; clientY?: number } = {}) {
  el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ...init }));
}
