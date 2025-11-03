/**
 * Admin Routes
 * Developer dashboard endpoints (require admin role)
 */

const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT role FROM users WHERE id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to verify admin status',
    });
  }
};

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Get overview statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Total users
    const usersResult = await query('SELECT COUNT(*) as count FROM users WHERE active = true');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Total projects
    const projectsResult = await query('SELECT COUNT(*) as count FROM projects WHERE archived = false');
    const totalProjects = parseInt(projectsResult.rows[0].count);

    // Total tasks
    const tasksResult = await query('SELECT COUNT(*) as count FROM tasks');
    const totalTasks = parseInt(tasksResult.rows[0].count);

    // Active today (users who logged in today)
    const activeResult = await query(
      `SELECT COUNT(*) as count FROM users
       WHERE last_login >= CURRENT_DATE AND active = true`
    );
    const activeToday = parseInt(activeResult.rows[0].count);

    // Pending feedback
    const feedbackResult = await query(
      `SELECT COUNT(*) as count FROM feedback WHERE status = 'new'`
    );
    const pendingFeedback = parseInt(feedbackResult.rows[0].count);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProjects,
        totalTasks,
        activeToday,
        pendingFeedback,
        apiCalls24h: 0, // Placeholder - implement API call tracking if needed
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve statistics',
    });
  }
});

/**
 * GET /api/admin/projects
 * Get all projects across all accounts
 */
router.get('/projects', async (req, res) => {
  try {
    const result = await query(
      `SELECT
        p.id, p.name, p.status, p.created_at, p.updated_at,
        u.email as owner_email, u.name as owner_name,
        (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
       FROM projects p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC
       LIMIT 100`
    );

    res.json({
      success: true,
      projects: result.rows,
    });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve projects',
    });
  }
});

/**
 * GET /api/admin/api-keys
 * Get all system API keys
 */
router.get('/api-keys', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, service_name, created_at, last_used
       FROM user_api_keys
       WHERE user_id = (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
       ORDER BY created_at DESC`
    );

    res.json({
      success: false,
      keys: result.rows,
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve API keys',
    });
  }
});

/**
 * POST /api/admin/api-keys
 * Add a new system API key
 */
router.post('/api-keys', async (req, res) => {
  try {
    const { service, key } = req.body;

    if (!service || !key) {
      return res.status(400).json({
        success: false,
        error: 'Service name and API key are required',
      });
    }

    // Encrypt and store the key
    const encryptionKey = process.env.API_KEY_ENCRYPTION_SECRET || 'default-key-change-in-production';

    await query(
      `INSERT INTO user_api_keys (user_id, service_name, encrypted_key)
       VALUES ($1, $2, encrypt_api_key($3, $4))
       ON CONFLICT (user_id, service_name)
       DO UPDATE SET encrypted_key = encrypt_api_key($3, $4), updated_at = CURRENT_TIMESTAMP`,
      [req.session.userId, service, key, encryptionKey]
    );

    res.json({
      success: true,
      message: 'API key saved successfully',
    });
  } catch (error) {
    console.error('Save API key error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save API key',
    });
  }
});

/**
 * DELETE /api/admin/api-keys/:id
 * Delete an API key
 */
router.delete('/api-keys/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await query(
      'DELETE FROM user_api_keys WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete API key',
    });
  }
});

/**
 * GET /api/admin/ai-config
 * Get AI assistant configuration
 */
router.get('/ai-config', async (req, res) => {
  try {
    const result = await query(
      `SELECT key, value, value_type, description
       FROM admin_config
       WHERE key LIKE 'ai_%'
       ORDER BY key`
    );

    const config = {};
    result.rows.forEach(row => {
      let value = row.value;
      if (row.value_type === 'number') {
        value = parseFloat(value);
      } else if (row.value_type === 'boolean') {
        value = value === 'true';
      } else if (row.value_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          console.error('Failed to parse JSON config:', e);
        }
      }
      config[row.key] = value;
    });

    res.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('Get AI config error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve AI configuration',
    });
  }
});

/**
 * PUT /api/admin/ai-config
 * Update AI assistant configuration
 */
router.put('/ai-config', async (req, res) => {
  try {
    const { key, value, valueType, description } = req.body;

    await query(
      `INSERT INTO admin_config (key, value, value_type, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key)
       DO UPDATE SET value = $2, value_type = $3, description = $4, updated_at = CURRENT_TIMESTAMP`,
      [key, value.toString(), valueType || 'string', description || '']
    );

    res.json({
      success: true,
      message: 'Configuration updated successfully',
    });
  } catch (error) {
    console.error('Update AI config error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update configuration',
    });
  }
});

/**
 * GET /api/admin/feedback
 * Get all user feedback
 */
router.get('/feedback', async (req, res) => {
  try {
    const { status, type } = req.query;

    let queryText = `
      SELECT f.*, u.name as user_name, u.email as user_email
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    if (status) {
      params.push(status);
      queryText += ` AND f.status = $${params.length}`;
    }
    if (type) {
      params.push(type);
      queryText += ` AND f.feedback_type = $${params.length}`;
    }

    queryText += ' ORDER BY f.created_at DESC LIMIT 100';

    const result = await query(queryText, params);

    res.json({
      success: true,
      feedback: result.rows,
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve feedback',
    });
  }
});

/**
 * PUT /api/admin/feedback/:id
 * Update feedback status/notes
 */
router.put('/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, priority } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (adminNotes !== undefined) {
      updates.push(`admin_notes = $${paramCount++}`);
      values.push(adminNotes);
    }
    if (priority) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    values.push(id);

    await query(
      `UPDATE feedback SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}`,
      values
    );

    res.json({
      success: true,
      message: 'Feedback updated successfully',
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update feedback',
    });
  }
});

module.exports = router;
