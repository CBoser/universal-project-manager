# Universal Project Manager 🚀

AI-powered project management system that works for **ANY** type of project. Start with a blank template, describe your project, and let AI generate a complete plan with phases, tasks, time estimates, and recommendations.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple)](https://vitejs.dev/)

## 🌟 Features

### ✨ Universal Project Support
Works seamlessly for any project type:
- 💻 **Software Development** - Apps, APIs, web projects
- 📢 **Marketing Campaigns** - Social media, content, product launches
- 🎓 **Course/Content Creation** - Online courses, tutorials, documentation
- 🎉 **Event Planning** - Conferences, workshops, webinars
- 🚀 **Product Launches** - SaaS, physical products, services
- 🔬 **Research Projects** - Studies, experiments, data analysis
- ✍️ **Content Creation** - Books, videos, podcasts, articles
- 🏗️ **Construction** - Residential, commercial, remodeling
- 📊 **Business Operations** - Process improvements, implementations
- 🎨 **Creative Projects** - Design, art, multimedia
- 📋 **Custom** - Any other project type

### 🤖 AI-Powered Features
- **Smart Project Setup** - Describe your project, AI generates complete plan
- **Intelligent Task Breakdown** - Automatic phase and task generation
- **Time Estimation** - AI-calculated time estimates based on project complexity
- **Risk Assessment** - Identifies potential issues and mitigation strategies
- **Recommendations** - Best practices for your specific project type

### 👤 Experience Level System
Adjusts all time estimates based on your skill level:
- **Novice** - +50% time for learning curve
- **Intermediate** - Standard time estimates
- **Expert** - -25% time for efficiency

### 📊 Progress Tracking
- Visual progress bars and completion percentages
- Task status management (Pending, In Progress, Complete, Blocked)
- Estimated vs. actual time tracking
- Export to CSV, JSON formats

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Anthropic API key (for AI features) - [Get one here](https://console.anthropic.com/)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/CBoser/universal-project-manager.git
cd universal-project-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
VITE_USE_MOCK_AI=false
VITE_BACKEND_URL=http://localhost:3001
```

4. **Start the application (requires 2 terminals)**

**Terminal 1 - Backend Server:**
```bash
npm run server
```
This starts the backend API server on port 3001.

**Terminal 2 - Frontend:**
```bash
npm run dev
```
This starts the frontend on port 5173.

5. **Open in browser**
Navigate to `http://localhost:5173`

> **Note**: You MUST run both servers. The backend handles AI API calls securely (the Anthropic API cannot be called directly from the browser due to CORS restrictions).

### First Time Setup

1. Click **"🤖 AI Project Setup"** button
2. Enter your project description (e.g., "Build a mobile expense tracking app with React Native")
3. Select your project type and experience level
4. Click **"Generate Project Plan with AI"**
5. Review generated phases and tasks
6. Start tracking your progress!

## 📖 Usage Guide

### Creating Your First Project

**Example: Software Development**
```
Description: "Build a task management web app with user authentication,
drag-and-drop interface, team collaboration, and real-time updates"

Project Type: Software Development
Experience Level: Intermediate
Timeline: 3 months

AI Generates:
- 6 phases (Planning through Deployment)
- 40+ detailed tasks
- Time estimates: 400+ hours
- Technology recommendations
- Risk factors and mitigations
```

**Example: Marketing Campaign**
```
Description: "Launch social media campaign for eco-friendly water bottles
targeting millennials, includes Instagram, TikTok, and email marketing"

Project Type: Marketing Campaign
Experience Level: Novice
Budget: $10,000
Timeline: 6 weeks

AI Generates:
- 5 phases (Strategy through Analysis)
- 25+ tasks
- Time estimates: 120 hours (adjusted +50% for novice)
- Platform-specific strategies
- Content calendar recommendations
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript 5
- **AI Integration**: Anthropic Claude API
- **Storage**: LocalStorage (API-ready architecture)
- **Styling**: CSS-in-JS

## 🔧 Configuration

### Environment Variables
```env
# Required for AI features
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx

# Optional: Use mock AI for development
VITE_USE_MOCK_AI=false
```

### Mock Mode (No API Key)

The system works without an API key using intelligent mock responses:
```env
VITE_USE_MOCK_AI=true
```

Mock mode generates realistic sample data for development and testing.

## 🏗️ Project Structure
```
universal-project-manager/
├── src/
│   ├── components/           # React components
│   │   ├── modals/          # Modal dialogs
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── config/              # Configuration files
│   │   ├── theme.ts         # UI theme
│   │   ├── constants.ts     # App constants
│   │   └── projectTemplates.ts  # Project type templates
│   ├── services/            # Business logic
│   │   ├── aiService.ts     # AI integration
│   │   └── storageService.ts    # Data persistence
│   ├── types/               # TypeScript definitions
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Utility functions
├── .env                     # Environment variables
├── package.json
└── vite.config.ts
```

## 🤖 AI Integration

### How AI Analysis Works

1. **Project Description Analysis**
   - Understands project context and requirements
   - Identifies project type and complexity
   - Considers timeline and resource constraints

2. **Phase Generation**
   - Creates logical project phases
   - Assigns appropriate durations
   - Sets phase colors for visual clarity

3. **Task Breakdown**
   - Generates comprehensive task list
   - Estimates time requirements
   - Identifies task dependencies
   - Marks critical path items

4. **Risk Assessment**
   - Identifies potential bottlenecks
   - Suggests mitigation strategies
   - Highlights areas needing attention

5. **Recommendations**
   - Best practices for project type
   - Resource allocation suggestions
   - Timeline optimization tips

## 📊 Data Management

### Local Storage
All data is stored locally in your browser using localStorage:
- Project metadata
- Task list and states
- Phase configurations
- Custom categories

### Data Export
Export your project data in multiple formats:
- **CSV** - Open in Excel or Google Sheets
- **JSON** - Full data export for integrations

## 🚢 Deployment

> **🚀 Ready to deploy?** Follow our **[Step-by-Step Render Deployment Guide](./RENDER_DEPLOYMENT_GUIDE.md)** for the easiest deployment experience (15-20 minutes, free tier available).

This project consists of two components that need to be deployed:
1. **Frontend** - React + Vite static site
2. **Backend** - Express.js API server (required for Anthropic API calls)

### Quick Start - Build for Production

```bash
# Build frontend
npm run build

# Output will be in the 'dist/' directory
```

### Deployment Options

We support multiple deployment platforms:

- **Render** (Recommended) - Full-stack support with free tier
- **Railway** - Excellent for full-stack apps
- **Vercel + Backend** - Best frontend experience
- **Netlify + Backend** - Easy static site hosting
- **AWS EC2** - Full control and scalability
- **Docker** - Deploy anywhere

### Full Deployment Guide

**📚 See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions** including:

- Step-by-step guides for each platform
- Environment variable configuration
- CORS setup
- Troubleshooting tips
- Cost comparisons
- Security best practices
- Monitoring setup

### Environment Variables Required

Make sure to set these in your deployment platform:

```env
VITE_ANTHROPIC_API_KEY=your_api_key_here
VITE_BACKEND_URL=https://your-backend-url.com
VITE_USE_MOCK_AI=false
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Roadmap

### v1.0 (Current)
- ✅ Universal project support
- ✅ AI project analysis
- ✅ Experience level system
- ✅ Progress tracking
- ✅ Export functionality

### v1.1 (Planned)
- [ ] Team collaboration features
- [ ] Real-time sync
- [ ] Cloud storage integration
- [ ] Mobile app (React Native)
- [ ] Advanced reporting with charts

### v2.0 (Future)
- [ ] Multi-project workspace
- [ ] Time tracking with timer
- [ ] Resource allocation
- [ ] Budget tracking
- [ ] Integration with popular tools (Jira, Trello, etc.)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Claude](https://www.anthropic.com/claude) by Anthropic
- UI inspiration from modern project management tools
- Community feedback and contributions

## 📧 Contact

- GitHub: [@CBoser](https://github.com/CBoser)
- Issues: [GitHub Issues](https://github.com/CBoser/universal-project-manager/issues)

## 🌟 Star This Repo!

If you find this project useful, please consider giving it a star ⭐ on GitHub!

---

**Built with ❤️ using React, TypeScript, and Claude AI**
