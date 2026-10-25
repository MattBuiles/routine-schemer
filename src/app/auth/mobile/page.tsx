'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Button, Skeleton } from 'strata';

import AuthShell from '@/components/auth/AuthShell';
import { authClient, useSession } from '@/lib/auth/client';
import { CHALLENGE_RE, STATE_RE } from '@/lib/auth/mobile-params';

/** Entrada del login de la app: pide entrar con Google y termina en /auth/mobile/complete. */
function MobileLogin() {
  const params = useSearchParams();
  const state = params.get('state') ?? '';
  const challenge = params.get('challenge') ?? '';
  const valid = STATE_RE.test(state) && CHALLENGE_RE.test(challenge);
  const { data: session, isPending } = useSession();
  const complete = `/auth/mobile/complete?state=${encodeURIComponent(state)}&challenge=${encodeURIComponent(challenge)}`;

  // Con la sesión ya iniciada no hay nada que pedir: se pasa directo al último paso.
  useEffect(() => {
    if (valid && session?.user) window.location.replace(complete);
  }, [valid, session?.user, complete]);

  if (!valid) return <Alert tone="error">Enlace no válido. Vuelve a abrir el inicio de sesión desde la app.</Alert>;
  if (isPending || session?.user) return <Skeleton className="h-40 w-full" />;
  return (
    <Button className="w-full" onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: complete })}>
      Continuar con Google
    </Button>
  );
}

export default function MobileLoginPage() {
  return (
    <AuthShell showHeading>
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <MobileLogin />
      </Suspense>
    </AuthShell>
  );
}
