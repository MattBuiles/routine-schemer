import { AuthView } from '@neondatabase/auth-ui';

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
  const { path } = await params;

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <AuthView path={path} />
      </div>
    </div>
  );
}
