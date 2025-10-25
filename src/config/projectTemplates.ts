// ============================================
// Universal Project Manager - Project Templates
// ============================================

import type { ProjectTemplate, ProjectType } from '../types';
import { theme } from './theme';

/**
 * Project templates for all supported project types
 */
export const PROJECT_TEMPLATES: { [key in ProjectType]: ProjectTemplate } = {
  software_development: {
    id: 'software_development',
    name: 'Software Development',
    projectType: 'software_development',
    phases: [
      {
        phaseId: 'planning',
        phaseTitle: 'Planning & Requirements',
        description: 'Requirements gathering and project planning',
        color: theme.accentBlue,
        typicalDuration: 14,
      },
      {
        phaseId: 'design',
        phaseTitle: 'Design & Architecture',
        description: 'System design and architecture planning',
        color: theme.accentTeal,
        typicalDuration: 14,
      },
      {
        phaseId: 'development',
        phaseTitle: 'Development',
        description: 'Core development and implementation',
        color: theme.accentGreen,
        typicalDuration: 60,
      },
      {
        phaseId: 'testing',
        phaseTitle: 'Testing & QA',
        description: 'Testing, debugging, and quality assurance',
        color: theme.brandOrange,
        typicalDuration: 21,
      },
      {
        phaseId: 'deployment',
        phaseTitle: 'Deployment',
        description: 'Production deployment and launch',
        color: theme.accentPurple,
        typicalDuration: 7,
      },
      {
        phaseId: 'maintenance',
        phaseTitle: 'Post-Launch',
        description: 'Monitoring, bug fixes, and improvements',
        color: theme.accentRed,
        typicalDuration: 30,
      },
    ],
    standardTasks: [],
    bestPractices: [
      'Use version control (Git) from day one',
      'Write tests alongside features',
      'Regular code reviews improve quality',
      'Document as you build',
      'Plan for scalability from the start',
    ],
    commonPitfalls: [
      'Skipping requirements gathering',
      'Premature optimization',
      'Insufficient testing',
      'Poor documentation',
    ],
    estimatedDuration: '3-6 months',
    skillsRequired: ['Programming', 'Architecture', 'Testing', 'DevOps'],
  },

  marketing_campaign: {
    id: 'marketing_campaign',
    name: 'Marketing Campaign',
    projectType: 'marketing_campaign',
    phases: [
      {
        phaseId: 'strategy',
        phaseTitle: 'Strategy & Research',
        description: 'Market research and campaign strategy',
        color: theme.accentBlue,
        typicalDuration: 14,
      },
      {
        phaseId: 'planning',
        phaseTitle: 'Planning & Creative',
        description: 'Campaign planning and creative development',
        color: theme.accentTeal,
        typicalDuration: 14,
      },
      {
        phaseId: 'content',
        phaseTitle: 'Content Creation',
        description: 'Create all campaign assets and content',
        color: theme.accentGreen,
        typicalDuration: 21,
      },
      {
        phaseId: 'launch',
        phaseTitle: 'Campaign Launch',
        description: 'Launch and initial monitoring',
        color: theme.brandOrange,
        typicalDuration: 7,
      },
      {
        phaseId: 'optimization',
        phaseTitle: 'Monitoring & Optimization',
        description: 'Monitor performance and optimize',
        color: theme.accentPurple,
        typicalDuration: 30,
      },
      {
        phaseId: 'analysis',
        phaseTitle: 'Analysis & Reporting',
        description: 'Performance analysis and reporting',
        color: theme.accentRed,
        typicalDuration: 7,
      },
    ],
    standardTasks: [],
    bestPractices: [
      'Define clear KPIs upfront',
      'Know your target audience deeply',
      'A/B test everything',
      'Monitor metrics daily',
      'Stay flexible to pivot based on data',
    ],
    estimatedDuration: '6-12 weeks',
  },

  course_creation: {
    id: 'course_creation',
    name: 'Course/Content Creation',
    projectType: 'course_creation',
    phases: [
      {
        phaseId: 'research',
        phaseTitle: 'Research & Outline',
        description: 'Topic research and course outline',
        color: theme.accentBlue,
        typicalDuration: 14,
      },
      {
        phaseId: 'curriculum',
        phaseTitle: 'Curriculum Design',
        description: 'Learning objectives and curriculum structure',
        color: theme.accentTeal,
        typicalDuration: 14,
      },
      {
        phaseId: 'content',
        phaseTitle: 'Content Creation',
        description: 'Create all course content and materials',
        color: theme.accentGreen,
        typicalDuration: 45,
      },
      {
        phaseId: 'production',
        phaseTitle: 'Production',
        description: 'Video recording, editing, and platform setup',
        color: theme.brandOrange,
        typicalDuration: 30,
      },
      {
        phaseId: 'testing',
        phaseTitle: 'Testing & Refinement',
        description: 'Beta testing and content refinement',
        color: theme.accentPurple,
        typicalDuration: 14,
      },
      {
        phaseId: 'launch',
        phaseTitle: 'Launch & Marketing',
        description: 'Course launch and student acquisition',
        color: theme.accentRed,
        typicalDuration: 30,
      },
    ],
    standardTasks: [],
    bestPractices: [
      'Start with learning outcomes',
      'Create engaging, actionable content',
      'Include hands-on exercises',
      'Get feedback from beta students',
      'Update content regularly',
    ],
    estimatedDuration: '2-4 months',
  },

  event_planning: {
    id: 'event_planning',
    name: 'Event Planning',
    projectType: 'event_planning',
    phases: [
      {
        phaseId: 'concept',
        phaseTitle: 'Concept & Planning',
        description: 'Event concept and initial planning',
        color: theme.accentBlue,
        typicalDuration: 21,
      },
      {
        phaseId: 'logistics',
        phaseTitle: 'Venue & Logistics',
        description: 'Venue booking and logistics planning',
        color: theme.accentTeal,
        typicalDuration: 30,
      },
      {
        phaseId: 'speakers',
        phaseTitle: 'Speakers & Content',
        description: 'Speaker coordination and content planning',
        color: theme.accentGreen,
        typicalDuration: 45,
      },
      {
        phaseId: 'marketing',
        phaseTitle: 'Marketing & Registration',
        description: 'Promotion and attendee registration',
        color: theme.brandOrange,
        typicalDuration: 60,
      },
      {
        phaseId: 'preparation',
        phaseTitle: 'Final Preparation',
        description: 'Final logistics and preparation',
        color: theme.accentPurple,
        typicalDuration: 14,
      },
      {
        phaseId: 'execution',
        phaseTitle: 'Event Execution',
        description: 'Event day execution',
        color: theme.accentOrange,
        typicalDuration: 1,
      },
      {
        phaseId: 'followup',
        phaseTitle: 'Post-Event Follow-up',
        description: 'Thank you notes and feedback collection',
        color: theme.accentRed,
        typicalDuration: 7,
      },
    ],
    standardTasks: [],
    bestPractices: [
      'Book venue and key vendors early',
      'Have backup plans for everything',
      'Create detailed run-of-show',
      'Over-communicate with all parties',
      'Budget for 10-15% contingency',
    ],
    estimatedDuration: '3-6 months',
  },

  product_launch: {
    id: 'product_launch',
    name: 'Product Launch',
    projectType: 'product_launch',
    phases: [
      {
        phaseId: 'planning',
        phaseTitle: 'Launch Planning',
        description: 'Launch strategy and planning',
        color: theme.accentBlue,
        typicalDuration: 21,
      },
      {
        phaseId: 'preparation',
        phaseTitle: 'Product Preparation',
        description: 'Finalize product and materials',
        color: theme.accentTeal,
        typicalDuration: 30,
      },
      {
        phaseId: 'marketing',
        phaseTitle: 'Marketing Assets',
        description: 'Create all marketing materials',
        color: theme.accentGreen,
        typicalDuration: 30,
      },
      {
        phaseId: 'prelaunch',
        phaseTitle: 'Pre-Launch Campaign',
        description: 'Build anticipation and early interest',
        color: theme.brandOrange,
        typicalDuration: 30,
      },
      {
        phaseId: 'launch',
        phaseTitle: 'Launch',
        description: 'Product launch execution',
        color: theme.accentPurple,
        typicalDuration: 7,
      },
      {
        phaseId: 'postlaunch',
        phaseTitle: 'Post-Launch',
        description: 'Monitor, support, and optimize',
        color: theme.accentRed,
        typicalDuration: 60,
      },
    ],
    standardTasks: [],
    bestPractices: [
      'Build email list before launch',
      'Create launch buzz with teasers',
      'Have customer support ready',
      'Monitor metrics closely',
      'Respond quickly to feedback',
    ],
    estimatedDuration: '2-4 months',
  },

  research_project: {
    id: 'research_project',
    name: 'Research Project',
    projectType: 'research_project',
    phases: [
      {
        phaseId: 'literature',
        phaseTitle: 'Literature Review',
        description: 'Review existing research and literature',
        color: theme.accentBlue,
        typicalDuration: 30,
      },
      {
        phaseId: 'methodology',
        phaseTitle: 'Methodology Design',
        description: 'Design research methodology',
        color: theme.accentTeal,
        typicalDuration: 21,
      },
      {
        phaseId: 'data_collection',
        phaseTitle: 'Data Collection',
        description: 'Gather and collect data',
        color: theme.accentGreen,
        typicalDuration: 60,
      },
      {
        phaseId: 'analysis',
        phaseTitle: 'Data Analysis',
        description: 'Analyze collected data',
        color: theme.brandOrange,
        typicalDuration: 45,
      },
      {
        phaseId: 'writing',
        phaseTitle: 'Writing & Documentation',
        description: 'Write research paper or report',
        color: theme.accentPurple,
        typicalDuration: 30,
      },
      {
        phaseId: 'review',
        phaseTitle: 'Peer Review & Revision',
        description: 'Peer review and final revisions',
        color: theme.accentRed,
        typicalDuration: 21,
      },
    ],
    standardTasks: [],
    bestPractices: [
      'Document methodology meticulously',
      'Keep detailed research notes',
      'Back up data regularly',
      'Seek peer feedback early',
      'Follow research ethics guidelines',
    ],
    estimatedDuration: '6-12 months',
  },

  content_creation: {
    id: 'content_creation',
    name: 'Content Creation',
    projectType: 'content_creation',
    phases: [
      {
        phaseId: 'planning',
        phaseTitle: 'Planning & Research',
        description: 'Content planning and research',
        color: theme.accentBlue,
        typicalDuration: 14,
      },
      {
        phaseId: 'outline',
        phaseTitle: 'Outline & Structure',
        description: 'Create content outline and structure',
        color: theme.accentTeal,
        typicalDuration: 7,
      },
      {
        phaseId: 'creation',
        phaseTitle: 'Content Creation',
        description: 'Write, record, or produce content',
        color: theme.accentGreen,
        typicalDuration: 30,
      },
      {
        phaseId: 'editing',
        phaseTitle: 'Editing & Refinement',
        description: 'Edit and refine content',
        color: theme.brandOrange,
        typicalDuration: 14,
      },
      {
        phaseId: 'production',
        phaseTitle: 'Production',
        description: 'Final production and formatting',
        color: theme.accentPurple,
        typicalDuration: 7,
      },
      {
        phaseId: 'distribution',
        phaseTitle: 'Distribution',
        description: 'Publish and distribute content',
        color: theme.accentRed,
        typicalDuration: 7,
      },
    ],
    standardTasks: [],
    bestPractices: [
      'Know your audience deeply',
      'Create content calendar',
      'Batch similar tasks',
      'Repurpose content across channels',
      'Track engagement metrics',
    ],
    estimatedDuration: '1-3 months',
  },

  construction: {
    id: 'construction',
    name: 'Construction Project',
    projectType: 'construction',
    phases: [
      {
        phaseId: 'preconstruction',
        phaseTitle: 'Pre-Construction',
        description: 'Planning, permits, and site preparation',
        color: theme.accentBlue,
        typicalDuration: 30,
      },
      {
        phaseId: 'foundation',
        phaseTitle: 'Foundation',
        description: 'Site work and foundation',
        color: theme.accentTeal,
        typicalDuration: 14,
      },
      {
        phaseId: 'framing',
        phaseTitle: 'Framing',
        description: 'Structural framing and roof',
        color: theme.accentGreen,
        typicalDuration: 21,
      },
      {
        phaseId: 'roughin',
        phaseTitle: 'Rough-In',
        description: 'MEP rough-in',
        color: theme.brandOrange,
        typicalDuration: 14,
      },
      {
        phaseId: 'finishes',
        phaseTitle: 'Finishes',
        description: 'Interior and exterior finishes',
        color: theme.accentPurple,
        typicalDuration: 30,
      },
      {
        phaseId: 'closeout',
        phaseTitle: 'Closeout',
        description: 'Final inspections and punch list',
        color: theme.accentRed,
        typicalDuration: 7,
      },
    ],
    standardTasks: [],
    bestPractices: [
      'Secure permits early',
      'Order long-lead items first',
      'Maintain daily site logs',
      'Schedule inspections proactively',
      'Track change orders carefully',
    ],
    estimatedDuration: '4-12 months',
  },

  business_operations: {
    id: 'business_operations',
    name: 'Business Operations',
    projectType: 'business_operations',
    phases: [
      {
        phaseId: 'assessment',
        phaseTitle: 'Current State Assessment',
        description: 'Assess current operations',
        color: theme.accentBlue,
        typicalDuration: 14,
      },
      {
        phaseId: 'planning',
        phaseTitle: 'Planning & Design',
        description: 'Design new processes and systems',
        color: theme.accentTeal,
        typicalDuration: 21,
      },
      {
        phaseId: 'development',
        phaseTitle: 'Development',
        description: 'Build tools and processes',
        color: theme.accentGreen,
        typicalDuration: 30,
      },
      {
        phaseId: 'training',
        phaseTitle: 'Training',
        description: 'Train staff on new processes',
        color: theme.brandOrange,
        typicalDuration: 14,
      },
      {
        phaseId: 'rollout',
        phaseTitle: 'Rollout',
        description: 'Implement new systems',
        color: theme.accentPurple,
        typicalDuration: 14,
      },
      {
        phaseId: 'optimization',
        phaseTitle: 'Optimization',
        description: 'Monitor and optimize',
        color: theme.accentRed,
        typicalDuration: 30,
      },
    ],
    standardTasks: [],
    bestPractices: [
      'Document current processes first',
      'Involve stakeholders early',
      'Plan for change management',
      'Test before full rollout',
      'Measure impact with metrics',
    ],
    estimatedDuration: '3-6 months',
  },

  creative_project: {
    id: 'creative_project',
    name: 'Creative Project',
    projectType: 'creative_project',
    phases: [
      {
        phaseId: 'concept',
        phaseTitle: 'Concept Development',
        description: 'Develop creative concept',
        color: theme.accentBlue,
        typicalDuration: 14,
      },
      {
        phaseId: 'research',
        phaseTitle: 'Research & Inspiration',
        description: 'Research and gather inspiration',
        color: theme.accentTeal,
        typicalDuration: 7,
      },
      {
        phaseId: 'prototyping',
        phaseTitle: 'Prototyping',
        description: 'Create prototypes and mockups',
        color: theme.accentGreen,
        typicalDuration: 14,
      },
      {
        phaseId: 'production',
        phaseTitle: 'Production',
        description: 'Final production work',
        color: theme.brandOrange,
        typicalDuration: 30,
      },
      {
        phaseId: 'refinement',
        phaseTitle: 'Refinement',
        description: 'Refine and polish',
        color: theme.accentPurple,
        typicalDuration: 14,
      },
      {
        phaseId: 'delivery',
        phaseTitle: 'Delivery',
        description: 'Final delivery and presentation',
        color: theme.accentRed,
        typicalDuration: 7,
      },
    ],
    standardTasks: [],
    bestPractices: [
      'Allow time for creative exploration',
      'Get feedback throughout',
      'Iterate based on feedback',
      'Document your process',
      'Maintain version control',
    ],
    estimatedDuration: '1-4 months',
  },

  custom: {
    id: 'custom',
    name: 'Custom Project',
    projectType: 'custom',
    phases: [
      {
        phaseId: 'phase1',
        phaseTitle: 'Phase 1',
        description: 'Custom phase 1',
        color: theme.accentBlue,
        typicalDuration: 30,
      },
    ],
    standardTasks: [],
    bestPractices: [
      'Define clear goals and objectives',
      'Break work into manageable phases',
      'Track progress regularly',
      'Adapt and iterate as needed',
    ],
    estimatedDuration: 'Variable',
  },
};

/**
 * Get project template by type
 */
export function getProjectTemplate(projectType: ProjectType): ProjectTemplate {
  return PROJECT_TEMPLATES[projectType] || PROJECT_TEMPLATES.custom;
}

/**
 * Get all available project types
 */
export function getAvailableProjectTypes(): Array<{ value: ProjectType; label: string }> {
  return [
    { value: 'software_development', label: '💻 Software Development' },
    { value: 'marketing_campaign', label: '📢 Marketing Campaign' },
    { value: 'course_creation', label: '🎓 Course/Content Creation' },
    { value: 'event_planning', label: '🎉 Event Planning' },
    { value: 'product_launch', label: '🚀 Product Launch' },
    { value: 'research_project', label: '🔬 Research Project' },
    { value: 'content_creation', label: '✍️ Content Creation' },
    { value: 'construction', label: '🏗️ Construction Project' },
    { value: 'business_operations', label: '📊 Business Operations' },
    { value: 'creative_project', label: '🎨 Creative Project' },
    { value: 'custom', label: '📋 Custom Project' },
  ];
}
