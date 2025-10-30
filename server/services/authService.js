/**
 * Authentication Service
 * Handles user registration, login, password management
 */

const bcrypt = require('bcrypt');
const { query, transaction } = require('../database/db');

const SALT_ROUNDS = 10;

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user (without password)
 */
async function registerUser(userData) {
  const { email, password, name, initials, color } = userData;

  // Validate required fields
  if (!email || !password || !name) {
    throw new Error('Email, password, and name are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate password strength
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  try {
    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate initials if not provided
    const userInitials = initials || name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    // Generate a random color if not provided
    const userColor = color || `#${Math.floor(Math.random()*16777215).toString(16)}`;

    // Create the user
    const result = await query(
      `INSERT INTO users (email, password_hash, name, initials, color, role, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, name, initials, color, role, active, created_at`,
      [email.toLowerCase(), passwordHash, name, userInitials, userColor, 'user', true]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

/**
 * Login a user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data (without password)
 */
async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    // Get user by email
    const result = await query(
      `SELECT id, email, password_hash, name, initials, color, role, active, created_at
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.active) {
      throw new Error('Account is inactive. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Remove password hash from returned user
    delete user.password_hash;

    return user;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}

/**
 * Get user by ID
 * @param {string} userId - User's ID
 * @returns {Promise<Object>} User data (without password)
 */
async function getUserById(userId) {
  try {
    const result = await query(
      `SELECT id, email, name, initials, color, role, active, created_at, last_login
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

/**
 * Update user profile
 * @param {string} userId - User's ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user data
 */
async function updateUser(userId, updates) {
  const allowedFields = ['name', 'initials', 'color', 'avatar'];
  const updateFields = [];
  const values = [];
  let paramCounter = 1;

  // Build dynamic update query
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      updateFields.push(`${key} = $${paramCounter}`);
      values.push(value);
      paramCounter++;
    }
  }

  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }

  values.push(userId);

  try {
    const result = await query(
      `UPDATE users
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCounter}
       RETURNING id, email, name, initials, color, role, active, avatar, created_at`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

/**
 * Change user password
 * @param {string} userId - User's ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success status
 */
async function changePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw new Error('Current password and new password are required');
  }

  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long');
  }

  try {
    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );

    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

/**
 * Deactivate user account
 * @param {string} userId - User's ID
 * @returns {Promise<boolean>} Success status
 */
async function deactivateUser(userId) {
  try {
    const result = await query(
      'UPDATE users SET active = false WHERE id = $1 RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    return true;
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  changePassword,
  deactivateUser
};
