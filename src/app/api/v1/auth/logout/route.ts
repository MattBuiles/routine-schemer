import { revokeMobileSession } from '@/lib/auth/mobile';

/** Cierra la sesión de este dispositivo: el token deja de valer aunque no haya caducado. */
export async function POST(request: Request) {
  await revokeMobileSession(request);
  return new Response(null, { status: 204 });
}
