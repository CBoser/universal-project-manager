// ============================================
// Universal Project Manager - Login Component
// ============================================

import { useState } from 'react';
import { theme } from '../config/theme';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
  error?: string;
}

export default function Login({ onLogin, onSwitchToRegister, error }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Basic validation
    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      // Error will be handled by parent component
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = error || localError;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.bgPrimary,
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: theme.bgSecondary,
          borderRadius: '12px',
          padding: '2.5rem',
          border: `1px solid ${theme.border}`,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: theme.brandOrange, fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            Universal Project Manager
          </h1>
          <p style={{ color: theme.textMuted, margin: 0 }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {displayError && (
            <div
              style={{
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                border: `1px solid ${theme.accentRed}`,
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
                color: theme.accentRed,
                fontSize: '0.875rem',
              }}
            >
              {displayError}
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                color: theme.textSecondary,
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: theme.bgTertiary,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.textPrimary,
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                color: theme.textSecondary,
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: theme.bgTertiary,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                color: theme.textPrimary,
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.875rem',
              backgroundColor: isLoading ? theme.textMuted : theme.brandOrange,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            color: theme.textMuted,
            fontSize: '0.875rem',
          }}
        >
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              color: theme.accentBlue,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              fontSize: '0.875rem',
              padding: 0,
            }}
          >
            Create one here
          </button>
        </div>
      </div>
    </div>
  );
}
