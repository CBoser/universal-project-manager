// ============================================
// Universal Project Manager - AI Service
// ============================================

import type {
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIReport,
  Task,
  ProjectMeta,
  TaskState,
} from '../types';
import { EXPERIENCE_MULTIPLIERS, AI_CONFIG } from '../config/constants';

// Backend API URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AI === 'true';

// Debug logging
console.log('🔍 AI Service Debug:');
console.log('  Backend URL:', BACKEND_URL);
console.log('  USE_MOCK:', USE_MOCK);

/**
 * Real AI service using Anthropic Claude
 */
export const aiService = {
  /**
   * Analyze project description and generate comprehensive task list
   */
  async analyzeProjectAndGenerateTasks(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> {
    if (USE_MOCK) {
      return mockAIService.analyzeProjectAndGenerateTasks(request);
    }

    const prompt = buildProjectAnalysisPrompt(request);

    // Log prompt length for debugging
    console.log('📊 Prompt length:', prompt.length, 'characters');
    console.log('📊 Estimated tokens:', Math.ceil(prompt.length / 4));

    try {
      console.log('🚀 Sending request to backend API...');

      const response = await fetch(`${BACKEND_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: AI_CONFIG.model,
          maxTokens: AI_CONFIG.maxTokens,
          timeout: AI_CONFIG.timeout,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Received response from backend API');

      // Parse the JSON response from Claude
      const analysisResult = parseAnalysisResponse(data.content);

      // Adjust task estimates based on experience level
      return adjustForExperience(analysisResult, request.experienceLevel);
    } catch (error) {
      console.error('❌ Error calling backend API:', error);

      // Log more details about the error
      if (error instanceof Error) {
        console.error('Error message:', error.message);
      }

      // Provide specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Cannot connect to backend server. Make sure the backend is running on port 3001.');
        }
        if (error.message.includes('timeout') || error.message.includes('timed out')) {
          throw new Error('Request timed out. Your project description may be very long. Try shortening it or try again.');
        }
        if (error.message.includes('rate_limit') || error.message.includes('429')) {
          throw new Error('API rate limit reached. Please wait a moment and try again.');
        }
        if (error.message.includes('Invalid API key') || error.message.includes('401')) {
          throw new Error('Authentication failed. Please check your API key in .env file.');
        }
        if (error.message.includes('overloaded') || error.message.includes('529') || error.message.includes('503')) {
          throw new Error('Claude API is temporarily overloaded. Please try again in a moment.');
        }
      }

      throw new Error('Failed to analyze project. Please try again or shorten your description.');
    }
  },

  /**
   * Generate AI-powered progress report and recommendations
   */
  async generateProgressReport(
    projectMeta: ProjectMeta,
    tasks: Task[],
    taskStates: { [key: string]: TaskState }
  ): Promise<AIReport> {
    if (USE_MOCK) {
      return mockAIService.generateProgressReport(projectMeta, tasks, taskStates);
    }

    const prompt = buildProgressReportPrompt(projectMeta, tasks, taskStates);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: AI_CONFIG.model,
          maxTokens: 5000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return parseProgressReport(data.content, projectMeta.name);
    } catch (error) {
      console.error('Error generating AI report:', error);
      throw new Error('Failed to generate progress report.');
    }
  },

  /**
   * Check if AI service is available
   */
  async isAvailable(): Promise<boolean> {
    if (USE_MOCK) {
      return false;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/available`);
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error checking AI availability:', error);
      return false;
    }
  },
};

/**
 * Build prompt for project analysis
 */
function buildProjectAnalysisPrompt(request: AIAnalysisRequest): string {
  const optionalFields = [
    request.budget ? `Budget: $${request.budget}` : null,
    request.timeline ? `Timeline: ${request.timeline}` : null,
    request.teamSize ? `Team Size: ${request.teamSize}` : null,
  ].filter(Boolean).join('\n');

  return `You are an expert project manager analyzing a ${request.projectType} project for someone with ${request.experienceLevel} experience level.

PROJECT DESCRIPTION:
${request.projectDescription}

${optionalFields ? `CONSTRAINTS:\n${optionalFields}\n` : ''}
Analyze this project and create a comprehensive breakdown. Return ONLY valid JSON (no markdown, no explanations) with this exact structure:

{
  "suggestedTasks": [{"task": "string", "phase": "phase_id", "phaseTitle": "string", "baseEstHours": number, "category": "string", "dependencies": ["id"], "criticalPath": boolean}],
  "suggestedPhases": [{"phaseId": "id", "phaseTitle": "string", "description": "string", "color": "#hex", "typicalDuration": number}],
  "estimatedTimeline": "string",
  "riskFactors": [{"category": "string", "description": "string", "severity": "low|medium|high", "mitigation": "string"}],
  "recommendations": ["string"],
  "confidence": 0.85
}

Requirements:
- Create ALL phases typical for this project type
- Break down into specific, actionable tasks with realistic hour estimates
- Adjust complexity for ${request.experienceLevel} experience
- Mark critical path tasks
- Include dependencies where logical
- Provide 3-5 key risk factors
- Give 5-8 actionable recommendations`;
}

/**
 * Build prompt for progress report
 */
function buildProgressReportPrompt(
  projectMeta: ProjectMeta,
  tasks: Task[],
  taskStates: { [key: string]: TaskState }
): string {
  const completedTasks = tasks.filter(t => taskStates[t.id]?.status === 'complete').length;
  const totalTasks = tasks.length;
  const blockedTasks = tasks.filter(t => taskStates[t.id]?.status === 'blocked');

  let totalEstimated = 0;
  let totalActual = 0;
  tasks.forEach(task => {
    const state = taskStates[task.id];
    if (state) {
      totalEstimated += state.estHours || 0;
      totalActual += parseFloat(state.actualHours || '0');
    }
  });

  return `You are a project analyst. Analyze this project's progress and provide insights.

PROJECT: ${projectMeta.name}
Type: ${projectMeta.projectType}
Status: ${projectMeta.status}
Experience Level: ${projectMeta.experienceLevel}

PROGRESS METRICS:
- Tasks Completed: ${completedTasks}/${totalTasks} (${Math.round(completedTasks/totalTasks * 100)}%)
- Total Estimated Hours: ${totalEstimated}
- Total Actual Hours: ${totalActual}
- Variance: ${totalActual - totalEstimated} hours
- Blocked Tasks: ${blockedTasks.length}

BLOCKED TASKS:
${blockedTasks.map(t => `- ${t.task}: ${taskStates[t.id]?.blockedReason || 'Not specified'}`).join('\n')}

Please provide a comprehensive analysis in JSON format:
{
  "generatedAt": "${new Date().toISOString()}",
  "projectId": "${projectMeta.name}",
  "analysis": {
    "progressAssessment": "Overall progress assessment",
    "schedulePerformance": "Schedule performance analysis",
    "costPerformance": "Cost/time performance analysis",
    "qualityMetrics": "Quality and risk assessment"
  },
  "recommendations": {
    "immediate": ["Action 1", "Action 2"],
    "shortTerm": ["Action 1", "Action 2"],
    "longTerm": ["Action 1", "Action 2"]
  },
  "predictiveInsights": {
    "completionForecast": "Estimated completion timeline",
    "budgetForecast": "Budget forecast based on current burn rate",
    "riskAreas": [
      {
        "category": "Risk category",
        "description": "Description",
        "severity": "low/medium/high",
        "mitigation": "Recommended mitigation"
      }
    ]
  },
  "exportData": {
    "rawMetrics": {},
    "formattedReport": "Full formatted report",
    "apiPayload": {}
  }
}`;
}

/**
 * Parse Claude's analysis response
 */
function parseAnalysisResponse(content: string): AIAnalysisResponse {
  try {
    // Remove markdown code blocks if present
    let cleanedContent = content.trim();
    cleanedContent = cleanedContent.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');

    // Extract JSON from response - find outermost braces
    const firstBrace = cleanedContent.indexOf('{');
    const lastBrace = cleanedContent.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
      console.error('Response content:', content);
      throw new Error('No JSON found in response');
    }

    const jsonStr = cleanedContent.substring(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    if (!parsed.suggestedTasks || !Array.isArray(parsed.suggestedTasks)) {
      throw new Error('Invalid response: missing suggestedTasks array');
    }
    if (!parsed.suggestedPhases || !Array.isArray(parsed.suggestedPhases)) {
      throw new Error('Invalid response: missing suggestedPhases array');
    }

    // Add IDs to tasks
    parsed.suggestedTasks = parsed.suggestedTasks.map((task: any, index: number) => ({
      ...task,
      id: `ai_${Date.now()}_${index}`,
      adjustedEstHours: task.baseEstHours,
      aiGenerated: true,
    }));

    console.log(`✅ Successfully parsed ${parsed.suggestedTasks.length} tasks and ${parsed.suggestedPhases.length} phases`);

    return parsed;
  } catch (error) {
    console.error('❌ Error parsing AI response:', error);
    console.error('Response content:', content.substring(0, 500) + '...');
    throw new Error('Failed to parse AI analysis response. The AI may have returned an invalid format.');
  }
}

/**
 * Parse progress report response
 */
function parseProgressReport(content: string, projectId: string): AIReport {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...parsed,
      projectId,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error parsing progress report:', error);
    throw new Error('Failed to parse AI progress report');
  }
}

/**
 * Adjust task estimates based on experience level
 */
function adjustForExperience(
  response: AIAnalysisResponse,
  experienceLevel: string
): AIAnalysisResponse {
  const multiplier = EXPERIENCE_MULTIPLIERS[experienceLevel as keyof typeof EXPERIENCE_MULTIPLIERS] || 1.0;

  return {
    ...response,
    suggestedTasks: response.suggestedTasks.map(task => ({
      ...task,
      adjustedEstHours: Math.round((task.baseEstHours || task.adjustedEstHours) * multiplier * 10) / 10,
    })),
  };
}

/**
 * Mock AI service for development/testing without API key
 */
export const mockAIService = {
  async analyzeProjectAndGenerateTasks(
    _request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      suggestedTasks: [
        {
          id: 'mock_1',
          task: 'Define project requirements and scope',
          phase: 'planning',
          phaseTitle: 'Planning & Requirements',
          baseEstHours: 8,
          adjustedEstHours: 8,
          category: 'Planning',
          criticalPath: true,
          aiGenerated: true,
        },
        {
          id: 'mock_2',
          task: 'Create project timeline and milestones',
          phase: 'planning',
          phaseTitle: 'Planning & Requirements',
          baseEstHours: 4,
          adjustedEstHours: 4,
          category: 'Planning',
          dependencies: ['mock_1'],
          criticalPath: true,
          aiGenerated: true,
        },
        {
          id: 'mock_3',
          task: 'Research and gather resources',
          phase: 'research',
          phaseTitle: 'Research & Design',
          baseEstHours: 12,
          adjustedEstHours: 12,
          category: 'Research',
          aiGenerated: true,
        },
        {
          id: 'mock_4',
          task: 'Design initial mockups or plans',
          phase: 'research',
          phaseTitle: 'Research & Design',
          baseEstHours: 16,
          adjustedEstHours: 16,
          category: 'Design',
          dependencies: ['mock_3'],
          aiGenerated: true,
        },
        {
          id: 'mock_5',
          task: 'Begin core implementation',
          phase: 'implementation',
          phaseTitle: 'Implementation',
          baseEstHours: 40,
          adjustedEstHours: 40,
          category: 'Implementation',
          dependencies: ['mock_4'],
          criticalPath: true,
          aiGenerated: true,
        },
        {
          id: 'mock_6',
          task: 'Testing and quality assurance',
          phase: 'testing',
          phaseTitle: 'Testing & Review',
          baseEstHours: 16,
          adjustedEstHours: 16,
          category: 'Testing',
          dependencies: ['mock_5'],
          criticalPath: true,
          aiGenerated: true,
        },
        {
          id: 'mock_7',
          task: 'Final review and adjustments',
          phase: 'testing',
          phaseTitle: 'Testing & Review',
          baseEstHours: 8,
          adjustedEstHours: 8,
          category: 'Review',
          dependencies: ['mock_6'],
          aiGenerated: true,
        },
        {
          id: 'mock_8',
          task: 'Documentation and handoff',
          phase: 'completion',
          phaseTitle: 'Completion',
          baseEstHours: 8,
          adjustedEstHours: 8,
          category: 'Documentation',
          dependencies: ['mock_7'],
          aiGenerated: true,
        },
      ],
      suggestedPhases: [
        {
          phaseId: 'planning',
          phaseTitle: 'Planning & Requirements',
          description: 'Initial planning and requirements gathering',
          color: '#00A3FF',
          typicalDuration: 14,
        },
        {
          phaseId: 'research',
          phaseTitle: 'Research & Design',
          description: 'Research and design phase',
          color: '#00d4aa',
          typicalDuration: 21,
        },
        {
          phaseId: 'implementation',
          phaseTitle: 'Implementation',
          description: 'Core implementation work',
          color: '#4caf50',
          typicalDuration: 30,
        },
        {
          phaseId: 'testing',
          phaseTitle: 'Testing & Review',
          description: 'Testing, review, and refinement',
          color: '#ff7b00',
          typicalDuration: 14,
        },
        {
          phaseId: 'completion',
          phaseTitle: 'Completion',
          description: 'Final documentation and completion',
          color: '#9c27b0',
          typicalDuration: 7,
        },
      ],
      estimatedTimeline: '12-16 weeks',
      riskFactors: [
        {
          category: 'Scope Creep',
          description: 'Project scope may expand during implementation',
          severity: 'medium',
          mitigation: 'Establish clear change management process',
        },
        {
          category: 'Resource Availability',
          description: 'Key resources may not be available when needed',
          severity: 'medium',
          mitigation: 'Identify backup resources and cross-train team members',
        },
      ],
      recommendations: [
        'Start with a detailed requirements gathering phase',
        'Set up regular check-ins to monitor progress',
        'Document decisions and changes throughout the project',
        'Build in buffer time for unexpected challenges',
        'Consider experience level when estimating timelines',
      ],
      confidence: 0.85,
    };
  },

  async generateProgressReport(
    projectMeta: ProjectMeta,
    tasks: Task[],
    taskStates: { [key: string]: TaskState }
  ): Promise<AIReport> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const completedTasks = tasks.filter(t => taskStates[t.id]?.status === 'complete').length;
    const totalTasks = tasks.length;
    const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

    return {
      generatedAt: new Date().toISOString(),
      projectId: projectMeta.name,
      analysis: {
        progressAssessment: `Project is ${progressPercentage}% complete with ${completedTasks} of ${totalTasks} tasks finished. Overall progress is ${progressPercentage > 50 ? 'on track' : 'needs attention'}.`,
        schedulePerformance: 'Schedule performance index (SPI): 1.0 - performing on schedule',
        costPerformance: 'Time performance index (TPI): 0.95 - slightly over time estimates',
        qualityMetrics: 'Quality metrics look good, no major issues identified',
      },
      recommendations: {
        immediate: [
          'Review and address any blocked tasks',
          'Update time estimates for remaining tasks',
        ],
        shortTerm: [
          'Schedule regular progress check-ins',
          'Identify potential bottlenecks in upcoming phases',
        ],
        longTerm: [
          'Document lessons learned for future projects',
          'Consider process improvements based on current experience',
        ],
      },
      predictiveInsights: {
        completionForecast: 'Expected completion: on schedule',
        budgetForecast: 'Projected to finish within estimated time',
        riskAreas: [],
      },
      exportData: {
        rawMetrics: { completedTasks, totalTasks, progressPercentage },
        formattedReport: 'Mock progress report',
        apiPayload: {},
      },
    };
  },

  isAvailable(): boolean {
    return true;
  },
};
