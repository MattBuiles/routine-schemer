import { auth } from '@/lib/auth/server';
import { MOBILE_REDIRECT, createAuthCode } from '@/lib/auth/mobile';
import { CHALLENGE_RE, STATE_RE } from '@/lib/auth/pkce';

/**
 * Último paso del login de la app: con la sesión de Neon ya iniciada, crea un código de un solo uso y devuelve el
 * navegador a la app. El destino es fijo (MOBILE_REDIRECT): ningún parámetro puede cambiarlo.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const state = searchParams.get('state') ?? '';
  const challenge = searchParams.get('challenge') ?? '';
  if (!STATE_RE.test(state) || !CHALLENGE_RE.test(challenge)) return new Response('Solicitud no válida', { status: 400 });

  const query = `state=${encodeURIComponent(state)}&challenge=${encodeURIComponent(challenge)}`;
  const { data: session } = await auth.getSession();
  if (!session?.user) return new Response(null, { status: 302, headers: { location: `${origin}/auth/mobile?${query}`, 'cache-control': 'no-store' } });

  const code = await createAuthCode(session.user.id, challenge);
  return new Response(null, { status: 302, headers: { location: `${MOBILE_REDIRECT}?code=${code}&state=${encodeURIComponent(state)}`, 'cache-control': 'no-store' } });
}
