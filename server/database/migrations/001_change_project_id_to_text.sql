-- Migration: Change project ID from UUID to TEXT to support custom IDs
-- Run this in your PostgreSQL database

-- 1. Drop foreign key constraints that reference projects.id
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;
ALTER TABLE time_logs DROP CONSTRAINT IF EXISTS time_logs_project_id_fkey;

-- 2. Change the projects.id column type from UUID to TEXT
ALTER TABLE projects ALTER COLUMN id TYPE TEXT;

-- 3. Change the foreign key columns to TEXT
ALTER TABLE tasks ALTER COLUMN project_id TYPE TEXT;
ALTER TABLE time_logs ALTER COLUMN project_id TYPE TEXT;

-- 4. Re-add the foreign key constraints
ALTER TABLE tasks
  ADD CONSTRAINT tasks_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE time_logs
  ADD CONSTRAINT time_logs_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Done! Now the database can accept custom project IDs like "project_1762224409786_kl80xwye2"
