// ============================================
// Universal Project Manager - Import Modal
// ============================================

import { useState, useRef } from 'react';
import { theme } from '../../config/theme';
import Modal from '../Modal';
import { parseCSV, validateCSV, readFileAsText } from '../../utils/csvImport';
import type { Task, ProjectMeta } from '../../types';

interface ImportModalProps {
  show: boolean;
  onClose: () => void;
  onImport: (tasks: Task[], newPhases: any, newPhaseColors: any, metadata?: Partial<ProjectMeta>) => void;
  existingPhaseColors: { [key: string]: string };
}

export default function ImportModal({ show, onClose, onImport, existingPhaseColors }: ImportModalProps) {
  const [importData, setImportData] = useState('');
  const [importMethod, setImportMethod] = useState<'paste' | 'upload'>('paste');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    try {
      const text = await readFileAsText(file);
      setImportData(text);
      setImportMethod('paste'); // Switch to paste view to show the data
    } catch (error) {
      alert('Error reading file: ' + (error as Error).message);
    }
  };

  const handleImport = () => {
    try {
      if (!importData.trim()) {
        alert('Please paste CSV data or upload a file');
        return;
      }

      // Validate CSV
      const validation = validateCSV(importData);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      // Parse CSV
      const { tasks: newTasks, metadata } = parseCSV(importData);

      if (newTasks.length === 0) {
        alert('No valid tasks found in CSV');
        return;
      }

      // Extract unique phases and generate colors
      const newPhases: { [key: string]: string } = {};
      const newPhaseColors: { [key: string]: string } = {};

      newTasks.forEach(task => {
        if (!newPhases[task.phase]) {
          newPhases[task.phase] = task.phaseTitle;
          newPhaseColors[task.phase] = existingPhaseColors[task.phase] ||
            `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        }
      });

      // Call onImport with the parsed data including metadata
      onImport(newTasks, newPhases, newPhaseColors, metadata);

      alert(`Successfully imported ${newTasks.length} tasks!`);
      setImportData('');
      onClose();
    } catch (error) {
      alert('Error importing tasks: ' + (error as Error).message);
      console.error(error);
    }
  };

  const handleBrowseFile = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal show={show} onClose={onClose} title="📥 Import Tasks" width="700px">
      {/* Method Selector */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setImportMethod('paste')}
          style={{
            flex: 1,
            padding: '1rem',
            background: importMethod === 'paste' ? theme.accentBlue : theme.bgTertiary,
            color: importMethod === 'paste' ? '#fff' : theme.textPrimary,
            border: `2px solid ${importMethod === 'paste' ? theme.accentBlue : theme.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}>
          📋 Paste CSV Data
        </button>
        <button
          onClick={() => setImportMethod('upload')}
          style={{
            flex: 1,
            padding: '1rem',
            background: importMethod === 'upload' ? theme.accentBlue : theme.bgTertiary,
            color: importMethod === 'upload' ? '#fff' : theme.textPrimary,
            border: `2px solid ${importMethod === 'upload' ? theme.accentBlue : theme.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}>
          📁 Upload CSV File
        </button>
      </div>

      {/* Instructions */}
      <div style={{
        background: theme.bgTertiary,
        padding: '1rem',
        borderRadius: '6px',
        marginBottom: '1rem',
        border: `1px solid ${theme.border}`,
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: theme.textPrimary }}>CSV Format:</h4>
        <div style={{ fontSize: '0.9rem', color: theme.textSecondary, lineHeight: '1.8' }}>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Required columns:</strong> task, phase
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Optional columns:</strong> phaseTitle, category, estHours
          </p>
          <p style={{ margin: '0.5rem 0 0.25rem 0' }}><strong>Example:</strong></p>
          <code style={{
            display: 'block',
            padding: '0.75rem',
            background: theme.bgPrimary,
            borderRadius: '4px',
            fontSize: '0.85rem',
            overflowX: 'auto',
            fontFamily: 'monospace',
          }}>
            task,phase,phaseTitle,category,estHours<br />
            Create wireframes,phase1,Phase 1: Design,Design,8<br />
            Build prototype,phase2,Phase 2: Development,Tech,12
          </code>
        </div>
      </div>

      {/* Upload Method */}
      {importMethod === 'upload' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={handleBrowseFile}
            style={{
              width: '100%',
              padding: '3rem 2rem',
              background: theme.bgTertiary,
              border: `2px dashed ${theme.border}`,
              borderRadius: '8px',
              cursor: 'pointer',
              color: theme.textPrimary,
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.accentBlue;
              e.currentTarget.style.background = `${theme.accentBlue}11`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border;
              e.currentTarget.style.background = theme.bgTertiary;
            }}>
            📁 Click to Browse for CSV File<br />
            <span style={{ fontSize: '0.85rem', color: theme.textMuted }}>
              or drag and drop here
            </span>
          </button>
        </div>
      )}

      {/* Paste Method */}
      {importMethod === 'paste' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
            Paste CSV Data:
          </label>
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder="Paste your CSV data here...&#10;&#10;task,phase,category,estHours&#10;Design mockups,planning,Design,8&#10;Develop feature,development,Development,24"
            rows={12}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              background: theme.bgTertiary,
              color: theme.textPrimary,
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              resize: 'vertical',
            }}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            setImportData('');
            onClose();
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: theme.textMuted,
            color: theme.bgPrimary,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}>
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={!importData.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            background: importData.trim() ? theme.accentGreen : theme.textMuted,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: importData.trim() ? 'pointer' : 'not-allowed',
            fontWeight: '600',
            opacity: importData.trim() ? 1 : 0.5,
          }}>
          Import Tasks
        </button>
      </div>
    </Modal>
  );
}
