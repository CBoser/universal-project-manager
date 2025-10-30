// ============================================
// Universal Project Manager - API Key Settings Modal
// ============================================

import { useState, useEffect } from 'react';
import Modal from '../Modal';
import { theme } from '../../config/theme';
import * as apiKeyService from '../../services/apiKeyApiService';

interface ApiKeySettingsModalProps {
  show: boolean;
  onClose: () => void;
}

export default function ApiKeySettingsModal({ show, onClose }: ApiKeySettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (show) {
      checkExistingKey();
    }
  }, [show]);

  const checkExistingKey = async () => {
    setIsLoading(true);
    try {
      const hasKey = await apiKeyService.hasApiKey('anthropic');
      setHasExistingKey(hasKey);
      if (hasKey) {
        setMessage({ type: 'success', text: 'You have an API key stored securely' });
      }
    } catch (error) {
      console.error('Error checking API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' });
      return;
    }

    setIsValidating(true);
    setMessage(null);

    try {
      const isValid = await apiKeyService.validateApiKey('anthropic', apiKey);
      if (isValid) {
        setMessage({ type: 'success', text: 'API key is valid!' });
      } else {
        setMessage({ type: 'error', text: 'API key is invalid. Please check and try again.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to validate API key' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await apiKeyService.storeApiKey('anthropic', apiKey);
      setMessage({ type: 'success', text: 'API key saved successfully!' });
      setHasExistingKey(true);
      setApiKey('');
      setShowKey(false);

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to save API key' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your stored API key?')) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await apiKeyService.deleteApiKey('anthropic');
      setMessage({ type: 'success', text: 'API key deleted successfully' });
      setHasExistingKey(false);
      setApiKey('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete API key' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="API Key Settings" width="550px">
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: theme.textPrimary, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Anthropic API Key
          </h3>
          <p style={{ color: theme.textMuted, fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
            Your API key is stored securely and encrypted in the database. It will never appear in the GitHub
            repository or be visible to others.
          </p>
        </div>

        {message && (
          <div
            style={{
              backgroundColor: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
              border: `1px solid ${message.type === 'success' ? theme.accentGreen : theme.accentRed}`,
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1rem',
              color: message.type === 'success' ? theme.accentGreen : theme.accentRed,
              fontSize: '0.875rem',
            }}
          >
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: theme.textMuted }}>
            Loading...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="apiKey"
                style={{
                  display: 'block',
                  color: theme.textSecondary,
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {hasExistingKey ? 'Update API Key (Optional)' : 'Enter Your API Key'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="apiKey"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isSaving || isValidating}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    backgroundColor: theme.bgTertiary,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    color: theme.textPrimary,
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                  placeholder="sk-ant-api03-..."
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: theme.textMuted,
                    cursor: 'pointer',
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                >
                  {showKey ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <small style={{ color: theme.textMuted, fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                Get your API key from{' '}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: theme.accentBlue, textDecoration: 'underline' }}
                >
                  console.anthropic.com
                </a>
              </small>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <button
                onClick={handleValidate}
                disabled={!apiKey.trim() || isValidating || isSaving}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: theme.bgTertiary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  color: theme.textPrimary,
                  fontSize: '0.95rem',
                  cursor: !apiKey.trim() || isValidating || isSaving ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                {isValidating ? 'Validating...' : 'Validate Key'}
              </button>

              <button
                onClick={handleSave}
                disabled={!apiKey.trim() || isSaving || isValidating}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: !apiKey.trim() || isSaving || isValidating ? theme.textMuted : theme.brandOrange,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: !apiKey.trim() || isSaving || isValidating ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                {isSaving ? 'Saving...' : 'Save Key'}
              </button>
            </div>

            {hasExistingKey && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${theme.border}` }}>
                <p style={{ color: theme.textMuted, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  You currently have an API key stored securely in the database.
                </p>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    border: `1px solid ${theme.accentRed}`,
                    borderRadius: '8px',
                    color: theme.accentRed,
                    fontSize: '0.875rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  Delete Stored Key
                </button>
              </div>
            )}

            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: theme.bgTertiary,
                borderRadius: '8px',
                border: `1px solid ${theme.border}`,
              }}
            >
              <h4 style={{ color: theme.textSecondary, fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                Security Information
              </h4>
              <ul style={{ color: theme.textMuted, fontSize: '0.8rem', margin: 0, paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                <li>Your API key is encrypted before being stored in the database</li>
                <li>The key is only decrypted when making AI requests</li>
                <li>Your key is never logged or exposed in the application code</li>
                <li>Only you can access and use your stored API key</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
