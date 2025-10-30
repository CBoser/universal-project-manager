/**
 * API Key Service
 * Handles encrypted storage and retrieval of user API keys
 */

const { query } = require('../database/db');

// Encryption key from environment variable
// IMPORTANT: This must be set in production!
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_SECRET || 'default-development-key-change-in-production';

if (process.env.NODE_ENV === 'production' && ENCRYPTION_KEY === 'default-development-key-change-in-production') {
  console.warn('⚠️  WARNING: Using default encryption key in production! Set API_KEY_ENCRYPTION_SECRET environment variable!');
}

/**
 * Store or update an encrypted API key for a user
 * @param {string} userId - User's ID
 * @param {string} serviceName - Name of the service (e.g., 'anthropic', 'openai')
 * @param {string} apiKey - The API key to encrypt and store
 * @returns {Promise<Object>} Stored API key record (without the actual key)
 */
async function storeApiKey(userId, serviceName, apiKey) {
  if (!userId || !serviceName || !apiKey) {
    throw new Error('User ID, service name, and API key are required');
  }

  try {
    // Check if key already exists for this user and service
    const existing = await query(
      'SELECT id FROM user_api_keys WHERE user_id = $1 AND service_name = $2',
      [userId, serviceName]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing key
      result = await query(
        `UPDATE user_api_keys
         SET encrypted_key = encrypt_api_key($1, $2),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3 AND service_name = $4
         RETURNING id, user_id, service_name, created_at, updated_at`,
        [apiKey, ENCRYPTION_KEY, userId, serviceName]
      );
    } else {
      // Insert new key
      result = await query(
        `INSERT INTO user_api_keys (user_id, service_name, encrypted_key)
         VALUES ($1, $2, encrypt_api_key($3, $4))
         RETURNING id, user_id, service_name, created_at, updated_at`,
        [userId, serviceName, apiKey, ENCRYPTION_KEY]
      );
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error storing API key:', error);
    throw error;
  }
}

/**
 * Retrieve and decrypt an API key for a user
 * @param {string} userId - User's ID
 * @param {string} serviceName - Name of the service
 * @returns {Promise<string|null>} Decrypted API key or null if not found
 */
async function getApiKey(userId, serviceName) {
  if (!userId || !serviceName) {
    throw new Error('User ID and service name are required');
  }

  try {
    const result = await query(
      `SELECT decrypt_api_key(encrypted_key, $1) as api_key, last_used
       FROM user_api_keys
       WHERE user_id = $2 AND service_name = $3`,
      [ENCRYPTION_KEY, userId, serviceName]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Update last_used timestamp
    await query(
      `UPDATE user_api_keys
       SET last_used = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND service_name = $2`,
      [userId, serviceName]
    );

    return result.rows[0].api_key;
  } catch (error) {
    console.error('Error retrieving API key:', error);
    throw error;
  }
}

/**
 * Check if a user has an API key for a service
 * @param {string} userId - User's ID
 * @param {string} serviceName - Name of the service
 * @returns {Promise<boolean>} True if key exists
 */
async function hasApiKey(userId, serviceName) {
  if (!userId || !serviceName) {
    throw new Error('User ID and service name are required');
  }

  try {
    const result = await query(
      'SELECT id FROM user_api_keys WHERE user_id = $1 AND service_name = $2',
      [userId, serviceName]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking API key:', error);
    throw error;
  }
}

/**
 * Get all services that a user has API keys for
 * @param {string} userId - User's ID
 * @returns {Promise<Array>} List of service names and metadata
 */
async function getUserApiKeyServices(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const result = await query(
      `SELECT service_name, created_at, updated_at, last_used
       FROM user_api_keys
       WHERE user_id = $1
       ORDER BY service_name`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting user API key services:', error);
    throw error;
  }
}

/**
 * Delete an API key for a user
 * @param {string} userId - User's ID
 * @param {string} serviceName - Name of the service
 * @returns {Promise<boolean>} True if deleted successfully
 */
async function deleteApiKey(userId, serviceName) {
  if (!userId || !serviceName) {
    throw new Error('User ID and service name are required');
  }

  try {
    const result = await query(
      'DELETE FROM user_api_keys WHERE user_id = $1 AND service_name = $2 RETURNING id',
      [userId, serviceName]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
}

/**
 * Validate an Anthropic API key by making a test request
 * @param {string} apiKey - The API key to validate
 * @returns {Promise<boolean>} True if valid
 */
async function validateAnthropicKey(apiKey) {
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    // Make a minimal test request
    await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }]
    });

    return true;
  } catch (error) {
    if (error.status === 401) {
      return false; // Invalid API key
    }
    // Other errors might be network issues, rate limits, etc.
    console.error('Error validating Anthropic key:', error);
    throw new Error('Unable to validate API key: ' + error.message);
  }
}

module.exports = {
  storeApiKey,
  getApiKey,
  hasApiKey,
  getUserApiKeyServices,
  deleteApiKey,
  validateAnthropicKey
};
