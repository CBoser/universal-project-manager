// ============================================
// Universal Project Manager - New Project Choice Modal
// ============================================

import { theme } from '../../config/theme';
import Modal from '../Modal';

interface NewProjectChoiceModalProps {
  show: boolean;
  onClose: () => void;
  onChooseAI: () => void;
  onChooseManual: () => void;
  onChooseImport: () => void;
}

export default function NewProjectChoiceModal({
  show,
  onClose,
  onChooseAI,
  onChooseManual,
  onChooseImport,
}: NewProjectChoiceModalProps) {
  return (
    <Modal show={show} onClose={onClose} title="Create New Project" width="600px">
      <p style={{ color: theme.textMuted, marginBottom: '2rem', fontSize: '1rem' }}>
        Choose how you'd like to create your project:
      </p>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {/* AI Setup Option */}
        <button
          onClick={onChooseAI}
          style={{
            padding: '1.5rem',
            background: theme.bgSecondary,
            border: `2px solid ${theme.border}`,
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease',
            color: theme.textPrimary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.accentBlue;
            e.currentTarget.style.background = theme.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border;
            e.currentTarget.style.background = theme.bgSecondary;
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '2rem' }}>🤖</div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>AI Setup</h3>
          </div>
          <p style={{ color: theme.textMuted, fontSize: '0.95rem', margin: 0, paddingLeft: '3.5rem' }}>
            Describe your project and let AI generate a comprehensive task breakdown with phases,
            time estimates, and recommendations.
          </p>
        </button>

        {/* Manual/Blank Project Option */}
        <button
          onClick={onChooseManual}
          style={{
            padding: '1.5rem',
            background: theme.bgSecondary,
            border: `2px solid ${theme.border}`,
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease',
            color: theme.textPrimary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.accentGreen;
            e.currentTarget.style.background = theme.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border;
            e.currentTarget.style.background = theme.bgSecondary;
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '2rem' }}>📋</div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Blank Project</h3>
          </div>
          <p style={{ color: theme.textMuted, fontSize: '0.95rem', margin: 0, paddingLeft: '3.5rem' }}>
            Start with an empty project and manually add tasks as you go. Perfect for simple projects
            or when you have your own plan.
          </p>
        </button>

        {/* Import from CSV Option */}
        <button
          onClick={onChooseImport}
          style={{
            padding: '1.5rem',
            background: theme.bgSecondary,
            border: `2px solid ${theme.border}`,
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease',
            color: theme.textPrimary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.accentOrange;
            e.currentTarget.style.background = theme.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.border;
            e.currentTarget.style.background = theme.bgSecondary;
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '2rem' }}>📥</div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>Import from CSV</h3>
          </div>
          <p style={{ color: theme.textMuted, fontSize: '0.95rem', margin: 0, paddingLeft: '3.5rem' }}>
            Import a project from a CSV file with tasks, phases, and metadata. Great for migrating
            existing projects or using templates.
          </p>
        </button>
      </div>

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <button
          onClick={onClose}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
            color: theme.textMuted,
            fontSize: '0.95rem',
            fontWeight: '500',
          }}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}
