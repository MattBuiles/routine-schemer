'use client';

import { authClient, useSession } from '@/lib/auth/client';

export function useAuth() {
  const { data: session, isPending } = useSession();

  return {
    user: session?.user ?? null,
    loading: isPending,
    signOut: () => authClient.signOut(),
  };
}
