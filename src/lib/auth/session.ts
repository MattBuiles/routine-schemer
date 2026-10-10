import 'server-only';

import { auth } from '@/lib/auth/server';

export async function requireUserId(): Promise<string> {
  const { data: session } = await auth.getSession();
  if (!session?.user) throw new Error('No autenticado');
  return session.user.id;
}
