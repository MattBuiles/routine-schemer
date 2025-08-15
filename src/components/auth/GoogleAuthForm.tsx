import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import '@/styles/auth.css';

export default function GoogleAuthForm() {
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="auth-container">
      {/* Professional Background */}
      <div className="auth-background"></div>
      
      {/* Floating elements for depth */}
      <div className="auth-floating-element auth-floating-element-1"></div>
      <div className="auth-floating-element auth-floating-element-2"></div>
      <div className="auth-floating-element auth-floating-element-3"></div>
      
      {/* Main Content */}
      <div className="auth-card">
        {/* Professional Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"></div>
        </div>
        
        {/* Brand Identity */}
        <h1 className="auth-title">Routine Schemer</h1>
        <p className="auth-subtitle">Professional Training Management</p>
        <div className="auth-divider"></div>
        
        {/* Auth Section */}
        <h2 className="auth-section-title">Professional Access</h2>
        <p className="auth-section-description">
          Secure authentication for training professionals and fitness experts
        </p>
        {/* Google Auth Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="auth-button"
        >
          {loading ? (
            <>
              <div className="auth-spinner"></div>
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Trust Indicators */}
        <div className="auth-trust-section">
          <div className="auth-trust-grid">
            <div className="auth-trust-item">
              <div className="auth-trust-icon">
                <div className="auth-trust-icon-dot"></div>
              </div>
              <span className="auth-trust-label">Secure</span>
            </div>
            <div className="auth-trust-item">
              <div className="auth-trust-icon">
                <div className="auth-trust-icon-dot"></div>
              </div>
              <span className="auth-trust-label">Professional</span>
            </div>
            <div className="auth-trust-item">
              <div className="auth-trust-icon">
                <div className="auth-trust-icon-dot"></div>
              </div>
              <span className="auth-trust-label">Enterprise</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
