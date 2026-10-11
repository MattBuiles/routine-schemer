// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Canvas from './Canvas';

afterEach(cleanup);

describe('Canvas', () => {
  it('muestra el zoom al 100 % y los botones lo cambian y lo restablecen', () => {
    render(
      <Canvas>
        <div>contenido</div>
      </Canvas>,
    );
    expect(screen.getByText('100%')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Acercar' }));
    expect(screen.getByText('120%')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Alejar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Alejar' }));
    expect(screen.getByText('83%')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Restablecer vista' }));
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('renderiza el contenido dentro del plano', () => {
    render(
      <Canvas>
        <div>contenido</div>
      </Canvas>,
    );
    expect(screen.getByText('contenido')).toBeTruthy();
  });
});
