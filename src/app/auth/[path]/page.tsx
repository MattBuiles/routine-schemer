import { AuthView } from '@neondatabase/auth-ui';

import AuthShell from '@/components/auth/AuthShell';

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;

  return (
    <AuthShell showHeading>
      <AuthView path={path} />
    </AuthShell>
  );
}
