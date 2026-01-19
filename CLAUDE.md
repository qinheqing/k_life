# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Life K-Line is a React + TypeScript application that combines traditional Chinese BaZi (Four Pillars of Destiny) astrology with financial K-line chart visualization. Users input their birth information, and the app uses AI (GLM or DeepSeek APIs) to generate a 100-year fortune analysis displayed as stock market candlestick charts.

## Development Commands

### Core Development
- `npm run dev` - Start Vite dev server on port 3003
- `npm run build` - Build production version
- `npm run preview` - Preview production build locally

### PM2 Process Management
- `npm run pm2:dev` - Start with PM2 in development mode
- `npm run pm2:prod` - Start with PM2 in production mode
- `npm run pm2:stop` - Stop PM2 processes
- `npm run pm2:restart` - Restart PM2 processes
- `npm run pm2:logs` - View PM2 logs
- `npm run pm2:status` - Check PM2 process status

## Architecture

### Application Flow
The app uses a multi-step wizard flow managed by [App.tsx](App.tsx):

1. **Landing Page** - Marketing page with hero section
2. **Input Form** - User enters birth data (name, gender, birth date/time, location)
3. **Confirmation** - Displays calculated BaZi chart for user verification
4. **Results** - Full K-line chart and detailed analysis

### Key Architectural Patterns

**Multi-AI Provider Support**
The app supports both GLM (智谱清言) and DeepSeek AI providers using OpenAI-compatible APIs:
- **Provider**: `VITE_AI_PROVIDER` - 'deepseek' or 'glm' (default: 'deepseek')
- **API Key**: `VITE_AI_API_KEY` - Your API key for the selected provider
- **Base URL**: `VITE_AI_BASE_URL` - Optional custom endpoint (uses provider defaults if empty)
- **Model**: `VITE_AI_MODEL` - Optional model name (uses provider defaults if empty)
- Configuration in [services/aiService.ts](services/aiService.ts)

**Default Provider Configurations:**
- **DeepSeek**: Base URL: `https://api.deepseek.com`, Model: `deepseek-chat`
- **GLM**: Base URL: `https://open.bigmodel.cn/api/paas/v4/`, Model: `glm-4-flash`

**Two-Stage AI Generation**
1. `calculateBaZi()` - Calculates BaZi chart, solar time, lunar date, Big Luck cycles
2. `generateDestinyAnalysis()` - Generates 100-year timeline and multi-dimensional analysis

**Strict Data Validation**
- Timeline must contain exactly 100 entries starting from birth year
- Single peak detection logic enforces only one `isPeak: true` per timeline
- Quota exhaustion error handling with user-friendly dialog

**Component Structure**
- All UI components in `/components` directory
- Main components: [LandingPage.tsx](components/LandingPage.tsx), [InputForm.tsx](components/InputForm.tsx), [BaZiConfirmation.tsx](components/BaZiConfirmation.tsx), [KLineChart.tsx](components/KLineChart.tsx), [AnalysisSection.tsx](components/AnalysisSection.tsx)
- Each component receives `lang` prop for i18n support

**State Management**
- Local component state with React hooks (no global state library)
- Theme persistence in localStorage
- Single source of truth: step state in App.tsx

**Internationalization**
- Bilingual support (English/Chinese) via [locales.ts](locales.ts)
- Language state managed in App.tsx, passed down to all components
- AI prompts dynamically switch between English and Simplified Chinese

**PDF Export**
- Uses html2canvas + jsPDF for report generation
- Special handling in [vite.config.ts](vite.config.ts) to copy `/doc` folder to dist
- `data-html2canvas-ignore` attribute excludes UI elements from PDF

### Environment Variables

Required in `.env.local` for development:
```env
# AI Provider Configuration
VITE_AI_PROVIDER=deepseek  # Options: 'deepseek' | 'glm'
VITE_AI_API_KEY=your_api_key_here
VITE_AI_BASE_URL=  # Optional - uses provider default if empty
VITE_AI_MODEL=     # Optional - uses provider default if empty
```

**For Docker deployment**, see [DOCKER_QUICK_START.md](DOCKER_QUICK_START.md) for configuration options including:
- Build-time configuration (baking API keys into image)
- Runtime configuration (mounting config files via volumes)

### Color Scheme
- Bull (Good/Up): `#10B981` (Green-500)
- Bear (Bad/Down): `#EF4444` (Red-500)
- Neutral: `#9CA3AF`
- Uses Western/crypto convention (Green=Up, Red=Down)

### Build Configuration
- Vite with manual chunk splitting for vendor, charts, icons, AI, and PDF libraries
- Dev server runs on port 3003 with host `0.0.0.0`
- Custom build plugin copies doc folder to dist for PDF images
