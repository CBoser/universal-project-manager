// ============================================
// Universal Project Manager - Settings Modal
// ============================================

import React, { useState, useEffect } from 'react';
import { theme } from '../../config/theme';

interface SettingsModalProps {
  show: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ show, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (show) {
      // Load API key from localStorage
      const savedKey = localStorage.getItem('anthropic_api_key');
      if (savedKey) {
        setApiKey(savedKey);
      }
    }
  }, [show]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-ant-api03-')) {
      alert('Invalid API key format. Anthropic API keys start with "sk-ant-api03-"');
      return;
    }

    // Save to localStorage
    localStorage.setItem('anthropic_api_key', apiKey.trim());
    alert('API key saved successfully! It will be used for all AI requests.');
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key first');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      const response = await fetch(`${backendUrl}/api/ai/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
        }),
      });

      if (response.ok) {
        setTestResult({ success: true, message: 'API key is valid! ✓' });
      } else {
        const data = await response.json();
        setTestResult({ success: false, message: `API key test failed: ${data.error || 'Unknown error'}` });
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setTestResult({ success: false, message: 'Failed to connect to backend server. Make sure it\'s running on port 3001.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the saved API key?')) {
      localStorage.removeItem('anthropic_api_key');
      setApiKey('');
      setTestResult(null);
      alert('API key cleared. The application will use the key from .env file if available.');
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length < 20) return key;
    return key.substring(0, 15) + '...' + key.substring(key.length - 4);
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>
            ⚙️ Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
            }}>
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1,
        }}>
          <h3 style={{ marginTop: 0, fontSize: '1.1rem', color: '#333' }}>
            Anthropic API Key
          </h3>

          <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
            Enter your Anthropic API key to enable AI-powered project analysis.
            Get your API key from: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" style={{ color: theme.accentBlue }}>console.anthropic.com</a>
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
              API Key
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}>
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '0.5rem' }}>
              {apiKey && !showKey && `Current: ${maskApiKey(apiKey)}`}
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div style={{
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              background: testResult.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
              color: testResult.success ? '#155724' : '#721c24',
            }}>
              {testResult.message}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              style={{
                flex: 1,
                padding: '0.75rem 1.25rem',
                background: apiKey.trim() ? theme.accentGreen : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: apiKey.trim() ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                fontSize: '0.95rem',
              }}>
              💾 Save API Key
            </button>
            <button
              onClick={handleTest}
              disabled={!apiKey.trim() || isTesting}
              style={{
                flex: 1,
                padding: '0.75rem 1.25rem',
                background: apiKey.trim() && !isTesting ? theme.accentBlue : '#ccc',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: apiKey.trim() && !isTesting ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                fontSize: '0.95rem',
              }}>
              {isTesting ? '⏳ Testing...' : '🧪 Test API Key'}
            </button>
          </div>

          <button
            onClick={handleClear}
            disabled={!apiKey}
            style={{
              width: '100%',
              padding: '0.75rem 1.25rem',
              background: apiKey ? '#f44336' : '#ccc',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: apiKey ? 'pointer' : 'not-allowed',
              fontWeight: '600',
              fontSize: '0.95rem',
            }}>
            🗑️ Clear Saved API Key
          </button>

          {/* Info Box */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f0f7ff',
            border: '1px solid #d0e7ff',
            borderRadius: '4px',
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#0066cc' }}>
              ℹ️ How it works
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem', color: '#555', lineHeight: '1.6' }}>
              <li>API key is stored securely in your browser's localStorage</li>
              <li>The key is sent with each AI request to authenticate</li>
              <li>Click "Test API Key" to verify it works before saving</li>
              <li>Your key never leaves your browser except to call the API</li>
              <li>Clear the key to use the default from .env file instead</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.65rem 1.5rem',
              background: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
