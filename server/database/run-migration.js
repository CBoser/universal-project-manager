/**
 * Database Migration Runner
 * Run with: node server/database/run-migration.js
 */

const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

async function runMigration() {
  console.log('🔧 Starting database migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_change_project_id_to_text.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Running migration: 001_change_project_id_to_text.sql');
    console.log('   This will change project IDs from UUID to TEXT\n');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('   Projects can now use custom IDs like "project_1762224409786_kl80xwye2"\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

runMigration();
