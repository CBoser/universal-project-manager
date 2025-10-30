// ============================================
// Universal Project Manager - Registration Component
// ============================================

import { useState } from 'react';
import { theme } from '../config/theme';

interface RegisterProps {
  onRegister: (email: string, password: string, name: string) => Promise<void>;
  onSwitchToLogin: () => void;
  error?: string;
}

export default function Register({ onRegister, onSwitchToLogin, error }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      setLocalError('All fields are required');
      return;
    }

    // Name validation
    if (name.trim().length < 2) {
      setLocalError('Name must be at least 2 characters long');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    // Password validation
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    // Password confirmation
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await onRegister(email, password, name.trim());
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
          <p style={{ color: theme.textMuted, margin: 0 }}>Create your account</p>
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
              htmlFor="name"
              style={{
                display: 'block',
                color: theme.textSecondary,
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="John Doe"
              required
            />
          </div>

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

          <div style={{ marginBottom: '1.25rem' }}>
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
              placeholder="At least 8 characters"
              required
            />
            <small style={{ color: theme.textMuted, fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
              Must be at least 8 characters long
            </small>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: 'block',
                color: theme.textSecondary,
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              placeholder="Re-enter your password"
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
            {isLoading ? 'Creating account...' : 'Create Account'}
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
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
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
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}
