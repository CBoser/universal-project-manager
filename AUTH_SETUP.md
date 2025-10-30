# Authentication & Database Setup Guide

This guide will help you set up the authentication system and database for the Universal Project Manager.

## Overview

The application now includes:
- 🔐 User authentication (registration/login)
- 🔑 Secure encrypted API key storage
- 💾 PostgreSQL database for cross-device synchronization
- 🌐 Session-based authentication with cookies

## Prerequisites

1. **PostgreSQL** installed on your system
   - **macOS**: `brew install postgresql`
   - **Ubuntu/Debian**: `sudo apt-get install postgresql`
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Node.js 18+** and **npm** installed

## Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `pg` (PostgreSQL client)
- `bcrypt` (password hashing)
- `express-session` (session management)
- `connect-pg-simple` (PostgreSQL session store)

## Step 2: Set Up PostgreSQL Database

### A. Start PostgreSQL Service

```bash
# macOS
brew services start postgresql

# Ubuntu/Debian
sudo service postgresql start

# Windows - PostgreSQL should start automatically
```

### B. Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE universal_project_manager;

# Create user (optional, or use your existing postgres user)
CREATE USER upm_user WITH PASSWORD 'your-secure-password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE universal_project_manager TO upm_user;

# Exit psql
\q
```

## Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=universal_project_manager
DB_USER=postgres  # or upm_user if you created a new user
DB_PASSWORD=your-database-password
DB_SSL=false  # Set to true for production

# Session & Encryption Secrets
# IMPORTANT: Generate secure secrets for production!
# You can generate them with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=your-session-secret-change-in-production
API_KEY_ENCRYPTION_SECRET=your-encryption-secret-change-in-production

# Anthropic API (optional - users can add their own)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Backend & Frontend URLs
VITE_BACKEND_URL=http://localhost:3001
PORT=3001
```

## Step 4: Initialize Database Schema

Run the database initialization script:

```bash
npm run db:init
```

This will create all necessary tables:
- `users` - User accounts with authentication
- `user_api_keys` - Encrypted API key storage
- `projects` - User projects with full data
- `tasks` - Project tasks and subtasks
- `time_logs` - Time tracking entries
- `project_collaborators` - For future collaboration features
- `session` - User session storage

## Step 5: Start the Application

```bash
# Start both backend and frontend
npm start

# Or start them separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

## Step 6: Create Your Account

1. Open http://localhost:5173 in your browser
2. Click "Create one here" to register
3. Fill in your details (name, email, password)
4. Login with your credentials

## Step 7: Add Your API Key (Optional)

After logging in:
1. Look for the API Key Settings option in the app
2. Enter your Anthropic API key
3. The key will be securely encrypted and stored in the database
4. Your key will be available across all your devices when you log in

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 10 salt rounds
- Plain text passwords are never stored
- Password validation enforces minimum 8 characters

### API Key Encryption
- API keys are encrypted using PostgreSQL's pgcrypto extension
- Keys are stored encrypted in the database
- Only decrypted when making AI requests
- Never exposed in logs or application code

### Session Management
- Session-based authentication with secure cookies
- Sessions stored in PostgreSQL for persistence
- 30-day session duration
- HttpOnly cookies (can't be accessed via JavaScript)
- Secure flag enabled in production (HTTPS only)

## Database Schema

### Users Table
```sql
- id: UUID (primary key)
- email: VARCHAR (unique)
- password_hash: VARCHAR
- name: VARCHAR
- initials: VARCHAR
- color: VARCHAR
- role: VARCHAR
- active: BOOLEAN
- created_at: TIMESTAMP
- last_login: TIMESTAMP
```

### User API Keys Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- service_name: VARCHAR (e.g., 'anthropic')
- encrypted_key: TEXT
- created_at: TIMESTAMP
- last_used: TIMESTAMP
```

### Projects Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- name: VARCHAR
- description: TEXT
- project_type: VARCHAR
- status: VARCHAR
- ... (all project metadata)
- phases: JSONB
```

### Tasks Table
```sql
- id: UUID (primary key)
- project_id: UUID (foreign key)
- name: VARCHAR
- description: TEXT
- status: VARCHAR
- estimated_hours: DECIMAL
- actual_hours: DECIMAL
- ... (all task metadata)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/check` - Check if authenticated

### API Keys
- `POST /api/keys` - Store/update API key
- `GET /api/keys/:serviceName` - Get API key
- `GET /api/keys/:serviceName/check` - Check if key exists
- `GET /api/keys` - List all services with keys
- `DELETE /api/keys/:serviceName` - Delete API key
- `POST /api/keys/validate` - Validate API key

### Projects
- `GET /api/projects` - Get all user projects
- `GET /api/projects/:id` - Get specific project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/tasks` - Add task to project
- `PUT /api/projects/:projectId/tasks/:taskId` - Update task
- `DELETE /api/projects/:projectId/tasks/:taskId` - Delete task

## Troubleshooting

### Cannot connect to database
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running (`brew services start postgresql` or `sudo service postgresql start`)

### Authentication required error
```
Error: Authentication required
```
**Solution**: Make sure you're logged in. Sessions expire after 30 days or when you logout.

### Database already exists
```
Error: database "universal_project_manager" already exists
```
**Solution**: This is fine! You can skip the CREATE DATABASE step.

### Permission denied for database
```
Error: permission denied for database
```
**Solution**: Grant proper privileges with `GRANT ALL PRIVILEGES ON DATABASE universal_project_manager TO your_user;`

## Migration from localStorage

Your existing projects in localStorage will remain accessible. To migrate them to the database:
1. Login or create an account
2. The app will detect local projects
3. Save/sync them to your account to enable cross-device access

## Production Deployment

For production deployment (e.g., on Render):

1. **Database**: Use a managed PostgreSQL service
2. **Environment Variables**: Set all secrets to secure random values
3. **SSL**: Enable DB_SSL=true for database connections
4. **HTTPS**: Ensure your frontend uses HTTPS (session cookies will be secure)
5. **CORS**: Set FRONTEND_URL to your production frontend URL

### Generate Secure Secrets

```bash
# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate API_KEY_ENCRYPTION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Data Management

### Backup Database
```bash
pg_dump universal_project_manager > backup.sql
```

### Restore Database
```bash
psql universal_project_manager < backup.sql
```

### Reset Database
```bash
# Drop all tables
psql universal_project_manager -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Reinitialize
npm run db:init
```

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check server logs for detailed error messages

## Security Best Practices

1. ✅ Never commit `.env` file to git
2. ✅ Use strong, unique passwords for database users
3. ✅ Generate secure random secrets for SESSION_SECRET and API_KEY_ENCRYPTION_SECRET
4. ✅ Enable SSL for database connections in production
5. ✅ Use HTTPS for your production deployment
6. ✅ Regularly update dependencies for security patches
7. ✅ Backup your database regularly

## Features Enabled

With authentication enabled, users get:
- ✅ Secure account creation and login
- ✅ Encrypted API key storage (not in git repo!)
- ✅ Cross-device project synchronization
- ✅ Data persistence across browsers
- ✅ User-specific project isolation
- ✅ Session-based authentication (30-day sessions)
- ✅ Future: Multi-user collaboration on projects
