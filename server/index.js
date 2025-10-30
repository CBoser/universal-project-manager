// ============================================
// Universal Project Manager - Backend Server
// ============================================

const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const dotenv = require('dotenv');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { pool } = require('./database/db');

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

// Session middleware with PostgreSQL store
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: false // We create it in schema.sql
  }),
  secret: process.env.SESSION_SECRET || 'universal-project-manager-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    sameSite: 'lax'
  }
}));

// Import routes
const authRoutes = require('./routes/auth');
const apiKeyRoutes = require('./routes/apiKeys');
const projectRoutes = require('./routes/projects');
const apiKeyService = require('./services/apiKeyService');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/projects', projectRoutes);

// Get Anthropic client with API key (from env, database, or request)
async function getAnthropicClient(customApiKey, userId) {
  let apiKey = customApiKey || process.env.VITE_ANTHROPIC_API_KEY;

  // If user is authenticated and no custom key provided, try to get from database
  if (!apiKey && userId) {
    try {
      apiKey = await apiKeyService.getApiKey(userId, 'anthropic');
    } catch (error) {
      console.warn('Could not retrieve API key from database:', error.message);
    }
  }

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
    const userId = req.session?.userId;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('📊 Received analysis request');
    console.log('  Prompt length:', prompt.length, 'characters');
    console.log('  Model:', model);
    console.log('  Max tokens:', maxTokens);
    console.log('  Authenticated user:', userId ? 'Yes' : 'No');
    console.log('  Using custom API key:', apiKey ? 'Yes' : 'No');

    const anthropic = await getAnthropicClient(apiKey, userId);

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
    const userId = req.session?.userId;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('📊 Generating progress report');
    console.log('  Authenticated user:', userId ? 'Yes' : 'No');
    console.log('  Using custom API key:', apiKey ? 'Yes' : 'No');

    const anthropic = await getAnthropicClient(apiKey, userId);

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
    const userId = req.session?.userId;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    console.log('🧪 Testing API key...');

    const anthropic = await getAnthropicClient(apiKey, userId);

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
