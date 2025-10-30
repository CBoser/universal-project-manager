/**
 * Database Initialization Script
 * Run this script to set up the PostgreSQL database with the required schema
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Database configuration - support both DATABASE_URL and individual parameters
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'universal_project_manager',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(poolConfig);

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database initialization...');

    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    console.log('📋 Creating tables and indexes...');
    await client.query(schema);

    console.log('✅ Database schema created successfully!');
    console.log('');
    console.log('📊 Database Tables Created:');
    console.log('  - users (with authentication)');
    console.log('  - user_api_keys (encrypted API key storage)');
    console.log('  - projects (multi-user project management)');
    console.log('  - project_collaborators (for future collaboration features)');
    console.log('  - tasks (task management with subtasks)');
    console.log('  - time_logs (time tracking)');
    console.log('  - session (for user sessions)');
    console.log('');
    console.log('🔐 Security Features:');
    console.log('  - Password hashing with bcrypt');
    console.log('  - API keys encrypted with pgcrypto');
    console.log('  - Session management with express-session');
    console.log('');
    console.log('✨ Database is ready to use!');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
