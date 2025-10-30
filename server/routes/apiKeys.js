/**
 * API Keys Routes
 * Handles encrypted storage and retrieval of user API keys
 */

const express = require('express');
const router = express.Router();
const apiKeyService = require('../services/apiKeyService');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

/**
 * POST /api/keys
 * Store or update an API key for a service
 */
router.post('/', async (req, res) => {
  try {
    const { serviceName, apiKey } = req.body;

    if (!serviceName || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Service name and API key are required'
      });
    }

    const result = await apiKeyService.storeApiKey(
      req.session.userId,
      serviceName,
      apiKey
    );

    res.json({
      success: true,
      message: 'API key stored successfully',
      service: result.service_name
    });
  } catch (error) {
    console.error('Store API key error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to store API key'
    });
  }
});

/**
 * GET /api/keys/:serviceName
 * Retrieve an API key for a service
 */
router.get('/:serviceName', async (req, res) => {
  try {
    const { serviceName } = req.params;

    const apiKey = await apiKeyService.getApiKey(
      req.session.userId,
      serviceName
    );

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        error: 'API key not found for this service'
      });
    }

    res.json({
      success: true,
      apiKey
    });
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve API key'
    });
  }
});

/**
 * GET /api/keys/:serviceName/check
 * Check if user has an API key for a service
 */
router.get('/:serviceName/check', async (req, res) => {
  try {
    const { serviceName } = req.params;

    const hasKey = await apiKeyService.hasApiKey(
      req.session.userId,
      serviceName
    );

    res.json({
      success: true,
      hasKey
    });
  } catch (error) {
    console.error('Check API key error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to check API key'
    });
  }
});

/**
 * GET /api/keys
 * Get all services that user has API keys for
 */
router.get('/', async (req, res) => {
  try {
    const services = await apiKeyService.getUserApiKeyServices(
      req.session.userId
    );

    res.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Get API key services error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve API key services'
    });
  }
});

/**
 * DELETE /api/keys/:serviceName
 * Delete an API key for a service
 */
router.delete('/:serviceName', async (req, res) => {
  try {
    const { serviceName } = req.params;

    const deleted = await apiKeyService.deleteApiKey(
      req.session.userId,
      serviceName
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'API key not found for this service'
      });
    }

    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete API key'
    });
  }
});

/**
 * POST /api/keys/validate
 * Validate an API key without storing it
 */
router.post('/validate', async (req, res) => {
  try {
    const { serviceName, apiKey } = req.body;

    if (!serviceName || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Service name and API key are required'
      });
    }

    let isValid = false;

    // Validate based on service
    if (serviceName === 'anthropic') {
      isValid = await apiKeyService.validateAnthropicKey(apiKey);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Validation not supported for this service'
      });
    }

    res.json({
      success: true,
      valid: isValid
    });
  } catch (error) {
    console.error('Validate API key error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate API key'
    });
  }
});

module.exports = router;
