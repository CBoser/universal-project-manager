/**
 * Team Invitation Modal
 * Allows users to invite team members via email
 */

import React, { useState } from 'react';
import { theme } from '../../config/theme';
import Modal from '../Modal';
import { TouchButton } from '../TouchButton';

interface TeamInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectName?: string;
}

export const TeamInvitationModal: React.FC<TeamInvitationModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor' | 'owner'>('editor');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendInvitation = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      const response = await fetch(`${API_URL}/api/invitations/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          role,
          projectId,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      setSuccess(true);
      setEmail('');
      setMessage('');

      // Auto-close after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Modal show={isOpen} onClose={handleClose} title="Invite Team Member">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Project Info */}
        {projectName && (
          <div style={{
            padding: '1rem',
            background: theme.bgTertiary,
            borderRadius: '8px',
            borderLeft: `4px solid ${theme.accentBlue}`,
          }}>
            <div style={{ fontSize: '0.85rem', color: theme.textMuted }}>
              Inviting to project:
            </div>
            <div style={{ fontSize: '1rem', color: theme.textPrimary, fontWeight: '500', marginTop: '0.25rem' }}>
              {projectName}
            </div>
          </div>
        )}

        {/* Email Input */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: theme.textPrimary,
            fontSize: '0.95rem',
            fontWeight: '500',
          }}>
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            disabled={isSending || success}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1rem',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              background: theme.bgPrimary,
              color: theme.textPrimary,
            }}
          />
        </div>

        {/* Role Selection */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: theme.textPrimary,
            fontSize: '0.95rem',
            fontWeight: '500',
          }}>
            Access Level
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            disabled={isSending || success}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1rem',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              background: theme.bgPrimary,
              color: theme.textPrimary,
              cursor: 'pointer',
            }}
          >
            <option value="viewer">Viewer - Can view only</option>
            <option value="editor">Editor - Can view and edit</option>
            <option value="owner">Owner - Full access</option>
          </select>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: theme.textMuted }}>
            {role === 'viewer' && '👁️ Can view tasks and project details'}
            {role === 'editor' && '✏️ Can create, edit, and update tasks'}
            {role === 'owner' && '👑 Full project control including deletion'}
          </div>
        </div>

        {/* Personal Message */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: theme.textPrimary,
            fontSize: '0.95rem',
            fontWeight: '500',
          }}>
            Personal Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message to your invitation..."
            disabled={isSending || success}
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1rem',
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              background: theme.bgPrimary,
              color: theme.textPrimary,
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            background: `${theme.accentRed}22`,
            border: `1px solid ${theme.accentRed}`,
            borderRadius: '8px',
            color: theme.accentRed,
            fontSize: '0.9rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            padding: '1rem',
            background: `${theme.accentGreen}22`,
            border: `1px solid ${theme.accentGreen}`,
            borderRadius: '8px',
            color: theme.accentGreen,
            fontSize: '0.9rem',
          }}>
            ✅ Invitation sent successfully!
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <TouchButton
            variant="ghost"
            onClick={handleClose}
            disabled={isSending}
            fullWidth
          >
            Cancel
          </TouchButton>
          <TouchButton
            variant="primary"
            onClick={handleSendInvitation}
            disabled={isSending || success || !email}
            fullWidth
          >
            {isSending ? 'Sending...' : 'Send Invitation'}
          </TouchButton>
        </div>

        {/* Info Note */}
        <div style={{
          padding: '0.75rem',
          background: theme.bgTertiary,
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: theme.textMuted,
        }}>
          💡 <strong>Note:</strong> An email will be sent to {email || 'the recipient'} with a link to join your {projectName ? 'project' : 'team'}.
        </div>
      </div>
    </Modal>
  );
};
