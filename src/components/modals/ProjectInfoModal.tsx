// ============================================
// Universal Project Manager - Project Info Modal
// ============================================

import { useState, useEffect } from 'react';
import { theme } from '../../config/theme';
import Modal from '../Modal';
import { getAvailableProjectTypes } from '../../config/projectTemplates';
import type { ProjectMeta, ProjectType, ExperienceLevel } from '../../types';

interface ProjectInfoModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (projectMeta: ProjectMeta) => void;
  projectMeta: ProjectMeta;
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '6px',
  border: `1px solid ${theme.border}`,
  background: theme.bgTertiary,
  color: theme.textPrimary,
  fontSize: '0.95rem',
};

export default function ProjectInfoModal({
  show,
  onClose,
  onSave,
  projectMeta,
}: ProjectInfoModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lead, setLead] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('software_development');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('intermediate');
  const [status, setStatus] = useState<'planning' | 'in-progress' | 'on-hold' | 'completed'>('planning');
  const [startDate, setStartDate] = useState('');
  const [targetEndDate, setTargetEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');

  const projectTypes = getAvailableProjectTypes();

  // Pre-populate form when projectMeta changes
  useEffect(() => {
    if (projectMeta) {
      setName(projectMeta.name);
      setDescription(projectMeta.description || '');
      setLead(projectMeta.lead || '');
      setProjectType(projectMeta.projectType);
      setExperienceLevel(projectMeta.experienceLevel);
      setStatus(projectMeta.status);
      setStartDate(projectMeta.startDate || '');
      setTargetEndDate(projectMeta.targetEndDate || '');
      setBudget(projectMeta.budget?.toString() || '');
      setTimeline(projectMeta.timeline || '');
    }
  }, [projectMeta]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a project name');
      return;
    }

    const updatedMeta: ProjectMeta = {
      name: name.trim(),
      projectType,
      experienceLevel,
      status,
      description: description.trim() || undefined,
      lead: lead.trim() || undefined,
      startDate: startDate || undefined,
      targetEndDate: targetEndDate || undefined,
      budget: budget ? parseFloat(budget) : undefined,
      timeline: timeline.trim() || undefined,
    };

    onSave(updatedMeta);
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose} title="ℹ️ Project Information" width="700px">
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
          Project Name <span style={{ color: theme.accentRed }}>*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name..."
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the project..."
          rows={3}
          style={{
            ...inputStyle,
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
            Project Lead
          </label>
          <input
            type="text"
            value={lead}
            onChange={(e) => setLead(e.target.value)}
            placeholder="Name of project lead..."
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
            Status <span style={{ color: theme.accentRed }}>*</span>
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            style={inputStyle}
          >
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
            Project Type <span style={{ color: theme.accentRed }}>*</span>
          </label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as ProjectType)}
            style={inputStyle}
          >
            {projectTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
            Experience Level <span style={{ color: theme.accentRed }}>*</span>
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
            style={inputStyle}
          >
            <option value="novice">Novice (+50% time)</option>
            <option value="intermediate">Intermediate (standard)</option>
            <option value="expert">Expert (-25% time)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
            Target End Date
          </label>
          <input
            type="date"
            value={targetEndDate}
            onChange={(e) => setTargetEndDate(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
            Budget ($)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g., 50000"
            min="0"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
            Timeline
          </label>
          <input
            type="text"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            placeholder="e.g., 3 months"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
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
          onClick={handleSave}
          style={{
            padding: '0.75rem 1.5rem',
            background: theme.accentBlue,
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}>
          Save Changes
        </button>
      </div>
    </Modal>
  );
}
