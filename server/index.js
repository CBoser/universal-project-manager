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

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support large project descriptions

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

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
    const { prompt, model, maxTokens, timeout } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('📊 Received analysis request');
    console.log('  Prompt length:', prompt.length, 'characters');
    console.log('  Model:', model);
    console.log('  Max tokens:', maxTokens);

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
    const { prompt, model, maxTokens } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('📊 Generating progress report');

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
    res.status(500).json({
      error: error.message || 'Failed to generate report'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Universal Project Manager Backend`);
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🤖 Anthropic API: ${process.env.VITE_ANTHROPIC_API_KEY ? 'Configured ✓' : 'Not configured ✗'}`);
  console.log(`🔧 Mock mode: ${process.env.VITE_USE_MOCK_AI === 'true' ? 'Enabled' : 'Disabled'}\n`);
});
