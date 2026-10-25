// @vitest-environment jsdom
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithStrata } from '@/test-utils';

const nav = vi.hoisted(() => ({ query: '' }));
const authState = vi.hoisted(() => ({ session: { data: null as unknown, isPending: false }, signIn: vi.fn() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams(nav.query) }));
vi.mock('@/lib/auth/client', () => ({ authClient: { signIn: { social: authState.signIn } }, useSession: () => authState.session }));

import MobileLoginPage from './page';

const STATE = 'estado-aleatorio-123';
const CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';
const COMPLETE = `/auth/mobile/complete?state=${STATE}&challenge=${CHALLENGE}`;
const replace = vi.fn();
const originalLocation = window.location;

beforeEach(() => {
  nav.query = `state=${STATE}&challenge=${CHALLENGE}`;
  authState.session = { data: null, isPending: false };
  authState.signIn.mockReset();
  replace.mockReset();
  Object.defineProperty(window, 'location', { configurable: true, value: { ...originalLocation, replace } });
});
afterEach(() => {
  cleanup();
  Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
});

describe('/auth/mobile', () => {
  it('sin sesión ofrece entrar con Google y vuelve al último paso conservando state y challenge', () => {
    renderWithStrata(<MobileLoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }));
    expect(authState.signIn).toHaveBeenCalledWith({ provider: 'google', callbackURL: COMPLETE });
    expect(replace).not.toHaveBeenCalled();
  });

  it('con la sesión ya iniciada pasa directo al último paso sin pedir nada', () => {
    authState.session = { data: { user: { id: 'u1' } }, isPending: false };
    renderWithStrata(<MobileLoginPage />);
    expect(replace).toHaveBeenCalledWith(COMPLETE);
    expect(screen.queryByRole('button', { name: 'Continuar con Google' })).toBeNull();
  });

  it('mientras carga la sesión no muestra el botón ni redirige', () => {
    authState.session = { data: null, isPending: true };
    renderWithStrata(<MobileLoginPage />);
    expect(screen.queryByRole('button', { name: 'Continuar con Google' })).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it('con parámetros ausentes o inválidos avisa y no inicia sesión ni redirige', () => {
    for (const q of ['', `state=${STATE}`, `state=x&challenge=${CHALLENGE}`, `state=${STATE}&challenge=corto`]) {
      nav.query = q;
      authState.session = { data: { user: { id: 'u1' } }, isPending: false };
      renderWithStrata(<MobileLoginPage />);
      expect(screen.getByText(/Enlace no válido/)).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Continuar con Google' })).toBeNull();
      cleanup();
    }
    expect(replace).not.toHaveBeenCalled();
    expect(authState.signIn).not.toHaveBeenCalled();
  });
});
