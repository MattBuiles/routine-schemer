'use client';

import { AuthView } from '@neondatabase/auth-ui';

import AuthShell from './AuthShell';

export default function NeonAuthForm() {
  return (
    <AuthShell showHeading>
      <AuthView view="SIGN_IN" />
    </AuthShell>
  );
}
