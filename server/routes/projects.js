/**
 * Projects Routes
 * Handles project CRUD operations with user association
 */

const express = require('express');
const router = express.Router();
const { query, transaction } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/projects
 * Get all projects for current user
 */
router.get('/', async (req, res) => {
  try {
    const { archived } = req.query;

    let queryText = `
      SELECT * FROM projects
      WHERE user_id = $1
    `;

    const params = [req.session.userId];

    // Filter by archived status if specified
    if (archived !== undefined) {
      queryText += ' AND archived = $2';
      params.push(archived === 'true');
    }

    queryText += ' ORDER BY updated_at DESC';

    const result = await query(queryText, params);

    res.json({
      success: true,
      projects: result.rows
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve projects'
    });
  }
});

/**
 * GET /api/projects/:id
 * Get a specific project with all tasks
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get project
    const projectResult = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, req.session.userId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const project = projectResult.rows[0];

    // Get all tasks for this project
    const tasksResult = await query(
      `SELECT * FROM tasks
       WHERE project_id = $1
       ORDER BY "order", created_at`,
      [id]
    );

    // Get time logs for this project
    const timeLogsResult = await query(
      `SELECT * FROM time_logs
       WHERE project_id = $1
       ORDER BY date DESC`,
      [id]
    );

    res.json({
      success: true,
      project: {
        ...project,
        tasks: tasksResult.rows,
        timeLogs: timeLogsResult.rows
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve project'
    });
  }
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      projectType,
      experienceLevel,
      status,
      icon,
      budget,
      timeline,
      lead,
      startDate,
      targetEndDate,
      phases
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    const result = await query(
      `INSERT INTO projects (
        user_id, name, description, project_type, experience_level,
        status, icon, budget, timeline, lead, start_date, target_end_date, phases
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        req.session.userId,
        name,
        description || '',
        projectType || 'other',
        experienceLevel || 'intermediate',
        status || 'planning',
        icon || '📁',
        budget || null,
        timeline || '',
        lead || '',
        startDate || null,
        targetEndDate || null,
        JSON.stringify(phases || [])
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create project'
    });
  }
});

/**
 * PUT /api/projects/:id
 * Update a project
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const ownerCheck = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [id, req.session.userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const {
      name,
      description,
      projectType,
      experienceLevel,
      status,
      icon,
      budget,
      timeline,
      lead,
      startDate,
      targetEndDate,
      phases,
      archived
    } = req.body;

    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCounter++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCounter++}`);
      values.push(description);
    }
    if (projectType !== undefined) {
      updates.push(`project_type = $${paramCounter++}`);
      values.push(projectType);
    }
    if (experienceLevel !== undefined) {
      updates.push(`experience_level = $${paramCounter++}`);
      values.push(experienceLevel);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCounter++}`);
      values.push(status);
    }
    if (icon !== undefined) {
      updates.push(`icon = $${paramCounter++}`);
      values.push(icon);
    }
    if (budget !== undefined) {
      updates.push(`budget = $${paramCounter++}`);
      values.push(budget);
    }
    if (timeline !== undefined) {
      updates.push(`timeline = $${paramCounter++}`);
      values.push(timeline);
    }
    if (lead !== undefined) {
      updates.push(`lead = $${paramCounter++}`);
      values.push(lead);
    }
    if (startDate !== undefined) {
      updates.push(`start_date = $${paramCounter++}`);
      values.push(startDate);
    }
    if (targetEndDate !== undefined) {
      updates.push(`target_end_date = $${paramCounter++}`);
      values.push(targetEndDate);
    }
    if (phases !== undefined) {
      updates.push(`phases = $${paramCounter++}`);
      values.push(JSON.stringify(phases));
    }
    if (archived !== undefined) {
      updates.push(`archived = $${paramCounter++}`);
      values.push(archived);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(id);

    const result = await query(
      `UPDATE projects
       SET ${updates.join(', ')}
       WHERE id = $${paramCounter}
       RETURNING *`,
      values
    );

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update project'
    });
  }
});

/**
 * POST /api/projects/sync
 * Sync a complete project (create or update with all tasks)
 * Used for syncing from localStorage to database
 */
router.post('/sync', async (req, res) => {
  try {
    const projectData = req.body;

    if (!projectData || !projectData.meta) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project data'
      });
    }

    const { meta, tasks = [], taskStates = {}, phases = [] } = projectData;
    const projectId = meta.id;

    // Check if project already exists
    const existingProject = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.session.userId]
    );

    let result;

    if (existingProject.rows.length > 0) {
      // Update existing project
      result = await query(
        `UPDATE projects
         SET name = $1, description = $2, project_type = $3, experience_level = $4,
             status = $5, icon = $6, budget = $7, timeline = $8, lead = $9,
             start_date = $10, target_end_date = $11, phases = $12, archived = $13,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $14 AND user_id = $15
         RETURNING *`,
        [
          meta.name || 'Untitled Project',
          meta.description || '',
          meta.projectType || 'other',
          meta.experienceLevel || 'intermediate',
          meta.status || 'planning',
          meta.icon || '📁',
          meta.budget || null,
          meta.timeline || '',
          meta.lead || '',
          meta.startDate || null,
          meta.targetEndDate || null,
          JSON.stringify(phases),
          meta.archived || false,
          projectId,
          req.session.userId
        ]
      );
    } else {
      // Create new project with specific ID
      result = await query(
        `INSERT INTO projects (
          id, user_id, name, description, project_type, experience_level,
          status, icon, budget, timeline, lead, start_date, target_end_date, phases, archived
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          projectId,
          req.session.userId,
          meta.name || 'Untitled Project',
          meta.description || '',
          meta.projectType || 'other',
          meta.experienceLevel || 'intermediate',
          meta.status || 'planning',
          meta.icon || '📁',
          meta.budget || null,
          meta.timeline || '',
          meta.lead || '',
          meta.startDate || null,
          meta.targetEndDate || null,
          JSON.stringify(phases),
          meta.archived || false
        ]
      );
    }

    // TODO: Sync tasks if needed (for now, we're just syncing project metadata)
    // Tasks are complex with subtasks, states, etc. - can be added later if needed

    res.json({
      success: true,
      message: 'Project synced successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Sync project error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to sync project'
    });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project (and all associated data)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete project'
    });
  }
});

/**
 * POST /api/projects/:id/tasks
 * Add a task to a project
 */
router.post('/:id/tasks', async (req, res) => {
  try {
    const { id: projectId } = req.params;

    // Verify project ownership
    const ownerCheck = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.session.userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const {
      name,
      description,
      phaseId,
      category,
      priority,
      status,
      dependencies,
      estimatedHours,
      order,
      parentTaskId
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Task name is required'
      });
    }

    const result = await query(
      `INSERT INTO tasks (
        project_id, name, description, phase_id, category,
        priority, status, dependencies, estimated_hours, "order", parent_task_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        projectId,
        name,
        description || '',
        phaseId || null,
        category || 'other',
        priority || 'medium',
        status || 'not-started',
        dependencies || [],
        estimatedHours || 0,
        order || 0,
        parentTaskId || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create task'
    });
  }
});

/**
 * PUT /api/projects/:projectId/tasks/:taskId
 * Update a task
 */
router.put('/:projectId/tasks/:taskId', async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Verify project ownership
    const ownerCheck = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.session.userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const updates = [];
    const values = [];
    let paramCounter = 1;

    // Dynamically build update query
    const allowedFields = [
      'name', 'description', 'phase_id', 'category', 'priority',
      'status', 'dependencies', 'estimated_hours', 'actual_hours',
      'blocked_reason', 'completed_date', 'notes', 'order', 'parent_task_id'
    ];

    for (const field of allowedFields) {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (req.body[camelField] !== undefined) {
        updates.push(`${field} = $${paramCounter++}`);
        values.push(req.body[camelField]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    values.push(taskId);
    values.push(projectId);

    const result = await query(
      `UPDATE tasks
       SET ${updates.join(', ')}
       WHERE id = $${paramCounter} AND project_id = $${paramCounter + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update task'
    });
  }
});

/**
 * DELETE /api/projects/:projectId/tasks/:taskId
 * Delete a task
 */
router.delete('/:projectId/tasks/:taskId', async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    // Verify project ownership
    const ownerCheck = await query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.session.userId]
    );

    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const result = await query(
      'DELETE FROM tasks WHERE id = $1 AND project_id = $2 RETURNING id',
      [taskId, projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete task'
    });
  }
});

module.exports = router;
