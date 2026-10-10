'use client';

import { NeonAuthUIProvider } from '@neondatabase/auth-ui';
import Link from 'next/link';
import { ThemeProvider, ToastProvider } from 'strata';
import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth/client';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NeonAuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => router.refresh()}
      social={{ providers: ['google'] }}
      redirectTo="/"
      Link={Link}
    >
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </NeonAuthUIProvider>
  );
}