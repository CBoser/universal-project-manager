/**
 * Invitations Routes
 * Handles team invitation emails
 */

const express = require('express');
const router = express.Router();
const { query } = require('../database/db');
const { requireAuth } = require('../middleware/auth');
const { sendInvitationEmail } = require('../services/emailService');
const crypto = require('crypto');

// All routes require authentication
router.use(requireAuth);

/**
 * POST /api/invitations/send
 * Send a team invitation email
 */
router.post('/send', async (req, res) => {
  try {
    const { email, role, projectId, message } = req.body;
    const inviterId = req.session.userId;

    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email address is required',
      });
    }

    // Validate role
    if (!['viewer', 'editor', 'owner'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role specified',
      });
    }

    // Get inviter information
    const inviterResult = await query(
      'SELECT name, email FROM users WHERE id = $1',
      [inviterId]
    );

    if (inviterResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inviter not found',
      });
    }

    const inviter = inviterResult.rows[0];
    let projectName = null;

    // If inviting to a specific project, verify ownership
    if (projectId) {
      const projectResult = await query(
        'SELECT name FROM projects WHERE id = $1 AND user_id = $2',
        [projectId, inviterId]
      );

      if (projectResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Project not found or you do not have permission',
        });
      }

      projectName = projectResult.rows[0].name;
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Store invitation in database
    await query(
      `INSERT INTO invitations (
        token, inviter_id, email, role, project_id, message, expires_at, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [token, inviterId, email, role, projectId, message, expiresAt, 'pending']
    );

    // Send invitation email
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/invite/${token}`;

    try {
      await sendInvitationEmail({
        to: email,
        inviterName: inviter.name,
        inviterEmail: inviter.email,
        role,
        projectName,
        message,
        invitationLink,
      });

      res.json({
        success: true,
        message: 'Invitation sent successfully',
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);

      // Still return success since invitation was stored
      // User can be manually notified or reminded later
      res.json({
        success: true,
        message: 'Invitation created (email delivery pending)',
        warning: 'Email delivery may be delayed',
      });
    }
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send invitation',
    });
  }
});

/**
 * GET /api/invitations/:token
 * Get invitation details by token
 */
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const result = await query(
      `SELECT i.*, u.name as inviter_name, u.email as inviter_email, p.name as project_name
       FROM invitations i
       LEFT JOIN users u ON i.inviter_id = u.id
       LEFT JOIN projects p ON i.project_id = p.id
       WHERE i.token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found',
      });
    }

    const invitation = result.rows[0];

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'Invitation has expired',
      });
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return res.status(410).json({
        success: false,
        error: 'Invitation has already been used',
      });
    }

    res.json({
      success: true,
      invitation: {
        email: invitation.email,
        role: invitation.role,
        inviterName: invitation.inviter_name,
        inviterEmail: invitation.inviter_email,
        projectName: invitation.project_name,
        message: invitation.message,
        expiresAt: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve invitation',
    });
  }
});

/**
 * POST /api/invitations/:token/accept
 * Accept an invitation
 */
router.post('/:token/accept', async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.session.userId;

    // Get invitation
    const invitationResult = await query(
      `SELECT * FROM invitations WHERE token = $1`,
      [token]
    );

    if (invitationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found',
      });
    }

    const invitation = invitationResult.rows[0];

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'Invitation has expired',
      });
    }

    // Check if already accepted
    if (invitation.status === 'accepted') {
      return res.status(410).json({
        success: false,
        error: 'Invitation has already been used',
      });
    }

    // If inviting to a project, add as collaborator
    if (invitation.project_id) {
      await query(
        `INSERT INTO project_collaborators (project_id, user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3`,
        [invitation.project_id, userId, invitation.role]
      );
    }

    // Mark invitation as accepted
    await query(
      `UPDATE invitations SET status = 'accepted', accepted_at = NOW(), accepted_by = $1
       WHERE token = $2`,
      [userId, token]
    );

    res.json({
      success: true,
      message: 'Invitation accepted successfully',
      projectId: invitation.project_id,
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to accept invitation',
    });
  }
});

/**
 * GET /api/invitations
 * Get all invitations sent by current user
 */
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT i.*, p.name as project_name
       FROM invitations i
       LEFT JOIN projects p ON i.project_id = p.id
       WHERE i.inviter_id = $1
       ORDER BY i.created_at DESC`,
      [req.session.userId]
    );

    res.json({
      success: true,
      invitations: result.rows,
    });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve invitations',
    });
  }
});

module.exports = router;
