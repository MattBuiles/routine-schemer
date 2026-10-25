import { exchangeCode } from '@/lib/auth/mobile';
import { CODE_RE, VERIFIER_RE } from '@/lib/auth/pkce';

const noStore = { 'cache-control': 'no-store' };

/** La app cambia el código que recibió por su sesión, demostrando con el verifier que fue ella quien empezó el login. */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const { code, verifier } = (body ?? {}) as { code?: unknown; verifier?: unknown };
  if (typeof code !== 'string' || typeof verifier !== 'string' || !CODE_RE.test(code) || !VERIFIER_RE.test(verifier)) {
    return Response.json({ error: 'invalid_request' }, { status: 400, headers: noStore });
  }
  const grant = await exchangeCode(code, verifier);
  if (!grant) return Response.json({ error: 'invalid_grant' }, { status: 400, headers: noStore });
  return Response.json(grant, { headers: noStore });
}
