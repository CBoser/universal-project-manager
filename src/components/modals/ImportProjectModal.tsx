// ============================================
// Universal Project Manager - Import Project Modal
// ============================================

import { useState } from 'react';
import { theme } from '../../config/theme';
import Modal from '../Modal';
import type { SavedProject } from '../../types';

interface ImportProjectModalProps {
  show: boolean;
  onClose: () => void;
  onImport: (project: SavedProject) => void;
}

export default function ImportProjectModal({
  show,
  onClose,
  onImport,
}: ImportProjectModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const projectData = JSON.parse(content);

        // Validate the imported data has required structure
        if (!projectData.meta || !projectData.tasks || !projectData.taskStates) {
          setError('Invalid project file format. Missing required fields (meta, tasks, or taskStates).');
          return;
        }

        // Validate meta has required fields
        if (!projectData.meta.id || !projectData.meta.name || !projectData.meta.projectType) {
          setError('Invalid project metadata. Missing required fields (id, name, or projectType).');
          return;
        }

        onImport(projectData as SavedProject);
        onClose();
      } catch (err) {
        console.error('Import error:', err);
        setError('Failed to parse JSON file. Please ensure it\'s a valid Universal Project Manager export file.');
      }
    };

    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };

    reader.readAsText(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        setError('Please select a JSON file (.json)');
        return;
      }
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        setError('Please drop a JSON file (.json)');
        return;
      }
      handleFileSelect(file);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="📥 Import Project from JSON" width="600px">
      <p style={{ color: theme.textMuted, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Import a complete project from a JSON export file. This will create a new project with all tasks,
        task states, phases, and metadata.
      </p>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? theme.accentBlue : theme.border}`,
          borderRadius: '12px',
          padding: '3rem 2rem',
          textAlign: 'center',
          background: isDragging ? 'rgba(59, 130, 246, 0.1)' : theme.bgSecondary,
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          marginBottom: '1rem',
        }}
        onClick={() => document.getElementById('json-file-input')?.click()}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
        <h3 style={{ color: theme.textPrimary, marginBottom: '0.5rem', fontSize: '1.1rem' }}>
          {isDragging ? 'Drop your JSON file here' : 'Drag & drop your JSON file here'}
        </h3>
        <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginBottom: '1rem' }}>
          or click to browse
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            document.getElementById('json-file-input')?.click();
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: theme.accentBlue,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
          }}>
          Browse Files
        </button>
        <input
          id="json-file-input"
          type="file"
          accept=".json"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: theme.accentRed,
            fontSize: '0.9rem',
          }}>
          ⚠️ {error}
        </div>
      )}

      {/* Info Box */}
      <div
        style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
        }}>
        <p style={{ color: theme.textPrimary, fontSize: '0.9rem', margin: 0, marginBottom: '0.5rem' }}>
          <strong>💡 Supported Format:</strong>
        </p>
        <ul style={{ color: theme.textMuted, fontSize: '0.85rem', margin: 0, paddingLeft: '1.5rem' }}>
          <li>JSON export files from Universal Project Manager</li>
          <li>Must contain meta, tasks, taskStates, and phases fields</li>
          <li>A new project ID will be generated on import</li>
          <li>All task states and progress will be preserved</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
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
            fontWeight: '600',
          }}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}
