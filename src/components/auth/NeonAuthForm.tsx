'use client';

import { AuthView } from '@neondatabase/auth-ui';

export default function NeonAuthForm() {
  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold text-gradient">Routine Schemer</h1>
          <p className="text-gray-400 text-lg">Professional Training Management</p>
        </div>
        <AuthView view="SIGN_IN" />
      </div>
    </div>
  );
}
