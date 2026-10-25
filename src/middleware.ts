import { auth } from '@/lib/auth/server';

export default auth.middleware({ loginUrl: '/' });

export const config = {
  // api/v1 lo usa la app móvil con su propio token y auth/mobile es su entrada de login: sin la excepción, el middleware las mandaría al login web.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|api/v1|auth/mobile).*)'],
};