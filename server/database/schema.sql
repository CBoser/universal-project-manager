-- Universal Project Manager Database Schema
-- This schema supports user authentication, secure API key storage, and cross-device project synchronization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    initials VARCHAR(10),
    color VARCHAR(50),
    role VARCHAR(50) DEFAULT 'user',
    avatar TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Encrypted API keys per user
CREATE TABLE IF NOT EXISTS user_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_name VARCHAR(100) NOT NULL, -- e.g., 'anthropic', 'openai', etc.
    encrypted_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, service_name)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON user_api_keys(user_id);

-- Projects table (migrated from localStorage)
-- Note: Using TEXT for id to support custom IDs from localStorage (e.g., "project_1762224409786_kl80xwye2")
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(100),
    experience_level VARCHAR(50),
    status VARCHAR(50) DEFAULT 'planning',
    icon VARCHAR(100),
    budget DECIMAL(12, 2),
    timeline VARCHAR(255),
    lead VARCHAR(255),
    start_date DATE,
    target_end_date DATE,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Store phases as JSONB for flexibility
    phases JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(archived);

-- Project collaborators (for future multi-user collaboration)
CREATE TABLE IF NOT EXISTS project_collaborators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'viewer', -- owner, editor, viewer
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON project_collaborators(user_id);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    phase_id VARCHAR(100),
    category VARCHAR(100),
    priority VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'not-started',
    dependencies TEXT[], -- Array of task IDs
    estimated_hours DECIMAL(8, 2),
    actual_hours DECIMAL(8, 2) DEFAULT 0,
    blocked_reason TEXT,
    completed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    "order" INTEGER DEFAULT 0,
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);

-- Time logs table
CREATE TABLE IF NOT EXISTS time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hours DECIMAL(8, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_time_logs_project_id ON time_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_task_id ON time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_user_id ON time_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_date ON time_logs(date);

-- Session table (for express-session with connect-pg-simple)
CREATE TABLE IF NOT EXISTS session (
    sid VARCHAR NOT NULL COLLATE "default" PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session(expire);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON user_api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_logs_updated_at BEFORE UPDATE ON time_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Encryption/Decryption functions for API keys
-- Note: In production, use environment variable for encryption key

-- Function to encrypt API keys
CREATE OR REPLACE FUNCTION encrypt_api_key(api_key TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(pgp_sym_encrypt(api_key, encryption_key), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt API keys
CREATE OR REPLACE FUNCTION decrypt_api_key(encrypted_key TEXT, encryption_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN pgp_sym_decrypt(decode(encrypted_key, 'base64'), encryption_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Invitations table for team collaboration
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(255) UNIQUE NOT NULL,
    inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- viewer, editor, owner
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined, expired
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_inviter_id ON invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- Feedback table for user feedback and feature requests
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    feedback_type VARCHAR(100) NOT NULL, -- bug, feature, improvement, other
    content TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(50) DEFAULT 'new', -- new, reviewing, planned, in_progress, completed, closed
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority);

-- Admin configuration table for system settings
CREATE TABLE IF NOT EXISTS admin_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    value_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_config_key ON admin_config(key);

-- Trigger for feedback updated_at
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for admin_config updated_at
CREATE TRIGGER update_admin_config_updated_at BEFORE UPDATE ON admin_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
