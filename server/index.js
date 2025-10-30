// ============================================
// Universal Project Manager - Backend Server
// ============================================

import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for development and production
const allowedOrigins = [
  'http://localhost:5173',           // Local development
  'http://localhost:3000',           // Alternative local port
  process.env.FRONTEND_URL,          // Production frontend URL (set in Render)
].filter(Boolean); // Remove undefined values

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // Support large project descriptions

// Get Anthropic client with API key (from env or request)
function getAnthropicClient(customApiKey) {
  const apiKey = customApiKey || process.env.VITE_ANTHROPIC_API_KEY;
  return new Anthropic({
    apiKey: apiKey,
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Check if API is configured
app.get('/api/ai/available', (req, res) => {
  const isAvailable = !!process.env.VITE_ANTHROPIC_API_KEY &&
                      process.env.VITE_USE_MOCK_AI !== 'true';
  res.json({ available: isAvailable });
});

// Analyze project endpoint
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { prompt, model, maxTokens, timeout, apiKey } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('📊 Received analysis request');
    console.log('  Prompt length:', prompt.length, 'characters');
    console.log('  Model:', model);
    console.log('  Max tokens:', maxTokens);
    console.log('  Using custom API key:', apiKey ? 'Yes' : 'No (using .env)');

    const anthropic = getAnthropicClient(apiKey);

    const response = await anthropic.messages.create({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: maxTokens || 8000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log('✅ Analysis complete');

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    res.json({ content });
  } catch (error) {
    console.error('❌ Error calling Anthropic API:', error);

    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    if (error.status === 529) {
      return res.status(503).json({ error: 'API temporarily overloaded' });
    }

    res.status(500).json({
      error: error.message || 'Failed to analyze project',
      type: error.constructor.name
    });
  }
});

// Generate progress report endpoint
app.post('/api/ai/report', async (req, res) => {
  try {
    const { prompt, model, maxTokens, apiKey } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('📊 Generating progress report');
    console.log('  Using custom API key:', apiKey ? 'Yes' : 'No (using .env)');

    const anthropic = getAnthropicClient(apiKey);

    const response = await anthropic.messages.create({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: maxTokens || 5000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    console.log('✅ Report generated');

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    res.json({ content });
  } catch (error) {
    console.error('❌ Error generating report:', error);

    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    res.status(500).json({
      error: error.message || 'Failed to generate report'
    });
  }
});

// Test API key endpoint
app.post('/api/ai/test', async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    console.log('🧪 Testing API key...');

    const anthropic = getAnthropicClient(apiKey);

    // Make a minimal API call to test the key
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Hello, respond with "OK" if you can hear me.',
        },
      ],
    });

    console.log('✅ API key is valid');
    res.json({ success: true, message: 'API key is valid' });
  } catch (error) {
    console.error('❌ API key test failed:', error);

    if (error.status === 401) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    res.status(500).json({
      error: error.message || 'API key test failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Universal Project Manager Backend`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🤖 Anthropic API: ${process.env.VITE_ANTHROPIC_API_KEY ? 'Configured ✓' : 'Not configured ✗'}`);
  console.log(`🔧 Mock mode: ${process.env.VITE_USE_MOCK_AI === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`🌐 CORS allowed origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'All origins (development only)'}\n`);
});
