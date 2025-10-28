// ============================================
// Universal Project Manager - Create Blank Project Modal
// ============================================

import { useState } from 'react';
import { theme } from '../../config/theme';
import Modal from '../Modal';
import { getAvailableProjectTypes } from '../../config/projectTemplates';
import type { ProjectType, ExperienceLevel } from '../../types';

interface CreateBlankProjectModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: (projectData: {
    name: string;
    description: string;
    projectType: ProjectType;
    experienceLevel: ExperienceLevel;
    icon: string;
  }) => void;
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

const projectIcons = ['📋', '🚀', '💼', '🎯', '🔧', '🎨', '📱', '🌐', '📊', '🏗️', '📚', '🎬', '🎮', '🔬', '📦'];

export default function CreateBlankProjectModal({
  show,
  onClose,
  onCreate,
}: CreateBlankProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('custom');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('intermediate');
  const [selectedIcon, setSelectedIcon] = useState('📋');

  const projectTypes = getAvailableProjectTypes();

  const handleCreate = () => {
    if (!name.trim()) {
      alert('Please enter a project name');
      return;
    }

    onCreate({
      name: name.trim(),
      description: description.trim(),
      projectType,
      experienceLevel,
      icon: selectedIcon,
    });

    // Reset form
    setName('');
    setDescription('');
    setProjectType('custom');
    setExperienceLevel('intermediate');
    setSelectedIcon('📋');
  };

  const handleCancel = () => {
    // Reset form
    setName('');
    setDescription('');
    setProjectType('custom');
    setExperienceLevel('intermediate');
    setSelectedIcon('📋');
    onClose();
  };

  return (
    <Modal show={show} onClose={handleCancel} title="📋 Create Blank Project" width="650px">
      {/* Project Name */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
          Project Name <span style={{ color: theme.accentRed }}>*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Website Redesign, Mobile App Development"
          style={inputStyle}
          autoFocus
        />
      </div>

      {/* Project Description */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of what this project is about..."
          style={{
            ...inputStyle,
            minHeight: '100px',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Project Type and Experience Level */}
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
            {projectTypes.map(type => (
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
            <option value="novice">🌱 Novice (Learning)</option>
            <option value="intermediate">⚡ Intermediate (Capable)</option>
            <option value="expert">🏆 Expert (Proficient)</option>
          </select>
        </div>
      </div>

      {/* Project Icon */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted, fontWeight: '600' }}>
          Project Icon
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
          gap: '0.5rem',
        }}>
          {projectIcons.map(icon => (
            <button
              key={icon}
              onClick={() => setSelectedIcon(icon)}
              style={{
                fontSize: '1.75rem',
                padding: '0.5rem',
                background: selectedIcon === icon ? theme.accentBlue : theme.bgSecondary,
                border: `2px solid ${selectedIcon === icon ? theme.accentBlue : theme.border}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (selectedIcon !== icon) {
                  e.currentTarget.style.background = theme.hover;
                  e.currentTarget.style.borderColor = theme.accentBlue;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedIcon !== icon) {
                  e.currentTarget.style.background = theme.bgSecondary;
                  e.currentTarget.style.borderColor = theme.border;
                }
              }}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        border: `1px solid rgba(59, 130, 246, 0.3)`,
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem',
      }}>
        <p style={{ color: theme.textPrimary, fontSize: '0.9rem', margin: 0 }}>
          💡 <strong>Tip:</strong> Your blank project will be created with no tasks.
          You can add tasks manually using the "Add Task" button, or generate them later using AI from the project info menu.
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={handleCancel}
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
        <button
          onClick={handleCreate}
          style={{
            padding: '0.75rem 1.5rem',
            background: theme.accentGreen,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'white',
            fontSize: '0.95rem',
            fontWeight: '600',
          }}>
          Create Project
        </button>
      </div>
    </Modal>
  );
}
