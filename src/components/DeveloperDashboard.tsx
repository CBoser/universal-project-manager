/**
 * Developer Dashboard
 * Admin page for managing the application
 */

import React, { useState, useEffect } from 'react';
import { theme } from '../config/theme';
import { TouchButton } from './TouchButton';

interface DeveloperDashboardProps {
  onClose: () => void;
}

type TabType = 'overview' | 'projects' | 'apiKeys' | 'aiConfig' | 'feedback';

export const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<any>(null);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [aiConfig, setAiConfig] = useState<any>({});
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

      switch (activeTab) {
        case 'overview':
          const statsRes = await fetch(`${API_URL}/api/admin/stats`, { credentials: 'include' });
          const statsData = await statsRes.json();
          if (statsData.success) setStats(statsData.stats);
          break;

        case 'projects':
          const projectsRes = await fetch(`${API_URL}/api/admin/projects`, { credentials: 'include' });
          const projectsData = await projectsRes.json();
          if (projectsData.success) setAllProjects(projectsData.projects);
          break;

        case 'apiKeys':
          const keysRes = await fetch(`${API_URL}/api/admin/api-keys`, { credentials: 'include' });
          const keysData = await keysRes.json();
          if (keysData.success) setApiKeys(keysData.keys);
          break;

        case 'aiConfig':
          const configRes = await fetch(`${API_URL}/api/admin/ai-config`, { credentials: 'include' });
          const configData = await configRes.json();
          if (configData.success) setAiConfig(configData.config);
          break;

        case 'feedback':
          const feedbackRes = await fetch(`${API_URL}/api/admin/feedback`, { credentials: 'include' });
          const feedbackData = await feedbackRes.json();
          if (feedbackData.success) setFeedback(feedbackData.feedback);
          break;
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: theme.bgPrimary,
      zIndex: theme.zIndex.modal,
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        background: theme.bgSecondary,
        borderBottom: `1px solid ${theme.border}`,
        padding: '1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: theme.zIndex.sticky,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: theme.textPrimary, fontSize: '1.75rem' }}>
              🛠️ Developer Dashboard
            </h1>
            <p style={{ margin: '0.5rem 0 0 0', color: theme.textMuted, fontSize: '0.95rem' }}>
              System administration and configuration
            </p>
          </div>
          <TouchButton variant="ghost" onClick={onClose}>
            Close
          </TouchButton>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: theme.bgSecondary,
        borderBottom: `1px solid ${theme.border}`,
        padding: '0 1.5rem',
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
      }}>
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          📊 Overview
        </TabButton>
        <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')}>
          📁 All Projects
        </TabButton>
        <TabButton active={activeTab === 'apiKeys'} onClick={() => setActiveTab('apiKeys')}>
          🔑 API Keys
        </TabButton>
        <TabButton active={activeTab === 'aiConfig'} onClick={() => setActiveTab('aiConfig')}>
          🤖 AI Config
        </TabButton>
        <TabButton active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')}>
          💬 Feedback
        </TabButton>
      </div>

      {/* Content */}
      <div style={{ padding: '2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: theme.textMuted }}>
            <div className="spinner" style={{ fontSize: '2rem' }}>⏳</div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab stats={stats} />}
            {activeTab === 'projects' && <ProjectsTab projects={allProjects} />}
            {activeTab === 'apiKeys' && <APIKeysTab keys={apiKeys} onRefresh={loadData} />}
            {activeTab === 'aiConfig' && <AIConfigTab config={aiConfig} onRefresh={loadData} />}
            {activeTab === 'feedback' && <FeedbackTab feedback={feedback} onRefresh={loadData} />}
          </>
        )}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '1rem 1.5rem',
      background: 'transparent',
      border: 'none',
      borderBottom: active ? `3px solid ${theme.accentBlue}` : '3px solid transparent',
      color: active ? theme.textPrimary : theme.textMuted,
      fontSize: '0.95rem',
      fontWeight: active ? '600' : '500',
      cursor: 'pointer',
      transition: `all ${theme.transition.fast} ease`,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </button>
);

// Overview Tab
const OverviewTab: React.FC<{ stats: any }> = ({ stats }) => {
  if (!stats) return <div style={{ color: theme.textMuted }}>No data available</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
      <StatCard title="Total Users" value={stats.totalUsers || 0} icon="👥" color={theme.accentBlue} />
      <StatCard title="Total Projects" value={stats.totalProjects || 0} icon="📁" color={theme.accentGreen} />
      <StatCard title="Total Tasks" value={stats.totalTasks || 0} icon="✅" color={theme.accentPurple} />
      <StatCard title="Active Today" value={stats.activeToday || 0} icon="🔥" color={theme.accentOrange} />
      <StatCard title="Pending Feedback" value={stats.pendingFeedback || 0} icon="💬" color={theme.accentTeal} />
      <StatCard title="API Calls (24h)" value={stats.apiCalls24h || 0} icon="📡" color={theme.brandOrange} />
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({
  title,
  value,
  icon,
  color,
}) => (
  <div style={{
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderLeft: `4px solid ${color}`,
    borderRadius: '8px',
    padding: '1.5rem',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.9rem', color: theme.textMuted, fontWeight: '500' }}>{title}</div>
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: '700', color: theme.textPrimary }}>
      {value.toLocaleString()}
    </div>
  </div>
);

// Projects Tab
const ProjectsTab: React.FC<{ projects: any[] }> = ({ projects }) => (
  <div>
    <h2 style={{ color: theme.textPrimary, marginBottom: '1rem' }}>All Projects Across Accounts</h2>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: theme.bgSecondary, borderBottom: `2px solid ${theme.border}` }}>
            <th style={tableHeaderStyle}>Project Name</th>
            <th style={tableHeaderStyle}>Owner</th>
            <th style={tableHeaderStyle}>Status</th>
            <th style={tableHeaderStyle}>Tasks</th>
            <th style={tableHeaderStyle}>Created</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
              <td style={tableCellStyle}>{project.name}</td>
              <td style={tableCellStyle}>{project.owner_email}</td>
              <td style={tableCellStyle}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: `${theme.accentGreen}22`,
                  color: theme.accentGreen,
                  fontSize: '0.85rem',
                }}>
                  {project.status}
                </span>
              </td>
              <td style={tableCellStyle}>{project.task_count || 0}</td>
              <td style={tableCellStyle}>{new Date(project.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// API Keys Tab
const APIKeysTab: React.FC<{ keys: any[]; onRefresh: () => void }> = ({ keys, onRefresh }) => {
  const [newKey, setNewKey] = useState({ service: '', key: '' });

  const handleAddKey = async () => {
    // Implementation for adding API key
    console.log('Adding key:', newKey);
    onRefresh();
  };

  return (
    <div>
      <h2 style={{ color: theme.textPrimary, marginBottom: '1rem' }}>System API Keys</h2>

      {/* Add new key form */}
      <div style={{
        background: theme.bgSecondary,
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem',
      }}>
        <h3 style={{ color: theme.textPrimary, marginBottom: '1rem' }}>Add New API Key</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Service (e.g., anthropic, openai)"
            value={newKey.service}
            onChange={(e) => setNewKey({ ...newKey, service: e.target.value })}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '12px',
              background: theme.bgPrimary,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.textPrimary,
            }}
          />
          <input
            type="password"
            placeholder="API Key"
            value={newKey.key}
            onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
            style={{
              flex: 2,
              minWidth: '300px',
              padding: '12px',
              background: theme.bgPrimary,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.textPrimary,
            }}
          />
          <TouchButton onClick={handleAddKey}>Add Key</TouchButton>
        </div>
      </div>

      {/* Existing keys */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {keys.map((key) => (
          <div key={key.id} style={{
            background: theme.bgSecondary,
            padding: '1rem',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ color: theme.textPrimary, fontWeight: '600' }}>{key.service_name}</div>
              <div style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
                Added: {new Date(key.created_at).toLocaleDateString()}
              </div>
            </div>
            <div style={{ color: theme.accentRed, cursor: 'pointer' }}>🗑️</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// AI Config Tab
const AIConfigTab: React.FC<{ config: any; onRefresh: () => void }> = () => (
  <div>
    <h2 style={{ color: theme.textPrimary, marginBottom: '1rem' }}>AI Assistant Configuration</h2>
    <p style={{ color: theme.textMuted, marginBottom: '2rem' }}>
      Configure AI capabilities and parameters
    </p>
    {/* AI config form will go here */}
  </div>
);

// Feedback Tab
const FeedbackTab: React.FC<{ feedback: any[]; onRefresh: () => void }> = ({ feedback }) => (
  <div>
    <h2 style={{ color: theme.textPrimary, marginBottom: '1rem' }}>User Feedback</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {feedback.map((item) => (
        <div key={item.id} style={{
          background: theme.bgSecondary,
          padding: '1.5rem',
          borderRadius: '8px',
          borderLeft: `4px solid ${
            item.priority === 'high' ? theme.accentRed :
            item.priority === 'medium' ? theme.accentOrange :
            theme.accentGreen
          }`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <span style={{ color: theme.textPrimary, fontWeight: '600' }}>{item.user_name || 'Anonymous'}</span>
              {' '}<span style={{ color: theme.textMuted }}>({item.user_email})</span>
            </div>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: `${theme.accentBlue}22`,
              color: theme.accentBlue,
              fontSize: '0.85rem',
            }}>
              {item.feedback_type}
            </span>
          </div>
          <p style={{ color: theme.textPrimary, margin: '0.5rem 0' }}>{item.content}</p>
          <div style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
            {new Date(item.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const tableHeaderStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'left',
  color: theme.textPrimary,
  fontWeight: '600',
  fontSize: '0.9rem',
};

const tableCellStyle: React.CSSProperties = {
  padding: '1rem',
  color: theme.textSecondary,
  fontSize: '0.95rem',
};
