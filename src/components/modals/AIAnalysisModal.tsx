// ============================================
// Universal Project Manager - AI Analysis Modal
// ============================================

import { useState } from 'react';
import { theme } from '../../config/theme';
import Modal from '../Modal';
import { aiService } from '../../services/aiService';
import { getAvailableProjectTypes } from '../../config/projectTemplates';
import type { AIAnalysisRequest, ProjectType, ExperienceLevel } from '../../types';

interface AIAnalysisModalProps {
  show: boolean;
  onClose: () => void;
  onAnalysisComplete: (request: AIAnalysisRequest, useRealAI: boolean) => void;
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

export default function AIAnalysisModal({
  show,
  onClose,
  onAnalysisComplete,
}: AIAnalysisModalProps) {
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('software_development');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('intermediate');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const projectTypes = getAvailableProjectTypes();
  const hasAPIKey = aiService.isAvailable();

  const handleAnalyze = async () => {
    if (!description.trim()) {
      alert('Please enter a project description');
      return;
    }

    const request: AIAnalysisRequest = {
      projectDescription: description,
      projectType,
      experienceLevel,
      budget: budget ? parseFloat(budget) : undefined,
      timeline: timeline || undefined,
    };

    setIsAnalyzing(true);

    try {
      await onAnalysisComplete(request, hasAPIKey);

      // Reset form
      setDescription('');
      setBudget('');
      setTimeline('');
      onClose();
    } catch (error) {
      alert('Error during analysis. Please try again.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Modal show={show} onClose={onClose} title="🤖 AI Project Analysis" width="700px">
      {!hasAPIKey && (
        <div
          style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            border: '1px solid #ffeaa7',
          }}
        >
          <strong>Demo Mode:</strong> API key not configured. Using mock AI responses for demonstration.
          Add your Anthropic API key to .env to enable real AI analysis.
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted }}>
          Project Description <span style={{ color: theme.accentRed }}>*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your project in detail. Include: type of work, scope, key features, special requirements, etc.&#10;&#10;Example: 'Build a mobile expense tracking app with React Native, user authentication, receipt scanning, budget alerts, and data export features'"
          rows={6}
          style={{
            ...inputStyle,
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted }}>
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
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted }}>
            Your Experience Level <span style={{ color: theme.accentRed }}>*</span>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted }}>
            Budget (Optional)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g., 50000"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.textMuted }}>
            Target Timeline (Optional)
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

      <div
        style={{
          background: theme.bgTertiary,
          padding: '1rem',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          border: `1px solid ${theme.border}`,
        }}
      >
        <h4 style={{ marginBottom: '0.5rem', color: theme.textPrimary }}>What AI Will Generate:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: theme.textSecondary }}>
          <li>Complete project phase breakdown</li>
          <li>Detailed task list with time estimates</li>
          <li>Task dependencies and critical path</li>
          <li>Risk factors and mitigation strategies</li>
          <li>Recommendations specific to your project</li>
        </ul>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || !description.trim()}
        style={{
          background: isAnalyzing
            ? theme.textMuted
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '6px',
          cursor: isAnalyzing || !description.trim() ? 'not-allowed' : 'pointer',
          width: '100%',
          fontSize: '1rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
        }}
      >
        {isAnalyzing ? (
          <>
            <span className="spinner">⏳</span>
            Analyzing Project...
          </>
        ) : (
          <>
            <span>🤖</span>
            Generate Project Plan with AI
          </>
        )}
      </button>

      {isAnalyzing && (
        <p
          style={{
            marginTop: '1rem',
            textAlign: 'center',
            color: theme.textMuted,
            fontSize: '0.9rem',
          }}
        >
          This may take 10-30 seconds. Analyzing your project requirements...
        </p>
      )}
    </Modal>
  );
}
