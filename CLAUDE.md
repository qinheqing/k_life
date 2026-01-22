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
The app uses a 5-step wizard flow managed by [App.tsx](App.tsx):

1. **Landing Page** - Marketing page with hero section
2. **Access Code Entry** - Optional access control gate (controlled by `VITE_REQUIRE_ACCESS_CODE`)
3. **Input Form** - User enters birth data (name, gender, birth date/time, location)
4. **Confirmation** - Displays calculated BaZi chart for user verification
5. **Results** - Full K-line chart and detailed analysis

**State Management**: Single source of truth in App.tsx
- `step`: Current wizard step ('landing' | 'code-entry' | 'input' | 'confirmation' | 'result')
- `preliminaryBaZi`: BaZi result from Stage 1 (local calculation)
- `analysis`: Final analysis from Stage 2 (AI generation)
- `partialAnalysis`: Progressive results during AI generation for real-time UI updates
- `progress`, `progressStep`, `estimatedTime`: Loading state feedback
- `theme`, `lang`: User preferences (persisted in localStorage)

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

**Hybrid Local + AI Architecture**
1. **Stage 1 - Local Calculation**: `calculateBaZi()` uses `lunar-javascript` library for deterministic BaZi calculations (no AI involved)
   - Solar time calculation with longitude correction
   - Lunar date conversion
   - Four pillars (year/month/day/hour stems and branches)
   - Big Luck cycles and start age
2. **Stage 2 - AI Analysis**: `generateDestinyAnalysis()` performs 10 operations (8 AI calls + 2 local analyses)
   - **Local Phase (10-30%)**: Basic BaZi analysis, extended analysis, personality analysis
   - **AI Phase (35-95%)**: 7 independent AI calls for dimensions (main attribute, geographic, personality, career, feng shui, wealth, marriage)
   - **Timeline Phase (95-100%)**: 2 batch AI calls for 100-year timeline (years 1-50, then 51-100)

**Data Processing Pipeline**
- **Validation**: `validateTimelineResult()` ensures 100 entries, correct year range, single peak
- **Normalization**: `normalizeTimelineData()` fixes K-line violations (ensures high ≥ open/close, low ≤ open/close)
- **Peak Detection**: Post-generation logic enforces exactly one `isPeak: true` by finding highest `high` value (with tiebreakers: `close` value, then earliest year)
- **Error Handling**: `detectErrorType()` categorizes errors (quota, network, timeout, server) for user-friendly messages
- **Fallback Strategy**: If AI timeline fails, `generateFallbackTimeline()` creates local deterministic timeline

**Component Architecture**
- **Core Pages**: LandingPage, InputForm, BaZiConfirmation (all in `/components`)
- **Main Content**:
  - KLineChart - Custom candlestick chart using Recharts ComposedChart with CandleShape component
  - AnalysisSection - 6 analysis cards with RatingBar progress indicators
  - BaZiDisplay - Four pillars visualization
- **Analysis Cards**: BasicAnalysisCard (quick results), ExtendedAnalysisCard (detailed breakdown)
- **UI Components**: ProgressBar (real-time progress), LoadingContent, AnalysisSkeleton, Modal, OnboardingTips
- **Special Components**: ApiQuotaDialog (quota exhaustion handling), AccessCodeForm (access control), WeChatModal (contact info)
- **Props Pattern**: All components receive `lang` prop for i18n; theme-aware components receive `theme` prop

**Service Layer Organization**
Located in `/services` directory:
- **aiService.ts** - Core orchestrator: AI provider config, prompt generation, retry logic, error handling
- **baziCalculator.ts** - Local BaZi computation using `lunar-javascript` (no AI dependency)
- **basicAnalysis.ts** - Local basic analysis (five elements, stem-branch relationships)
- **extendedAnalysis.ts** - Extended local analysis (career, wealth, marriage, feng shui)
- **solarTime.ts** - Solar time calculations with longitude correction and Equation of Time
- **geographicAnalysis.ts** - Geographic recommendations for development
- **geoLocation.ts** - Location to coordinates conversion
- **accessCodeService.ts** - Backend integration for access code verification

**Internationalization**
- Bilingual support (English/Chinese) via [locales.ts](locales.ts)
- Language state managed in App.tsx, passed down to all components
- AI prompts dynamically switch between English and Simplified Chinese

**PDF Export**
- Uses html2canvas + jsPDF for report generation
- **Dark mode handling**: Temporarily removes `dark` class, forces white background, then restores original theme
- **Layout fixes**: Expands scrollable areas (`maxHeight: 'none'`) to capture full content
- Special handling in [vite.config.ts](vite.config.ts) to copy `/doc` folder to dist for PDF images
- `data-html2canvas-ignore` attribute excludes UI controls from PDF output

**Key Data Types** (see [types.ts](types.ts)):
- `UserInput` → `BaZiResult` → `AnalysisResult`
- `YearlyFortune`: K-line data structure (open/close/high/low 0-100 scale, summary, detailedReview, isPeak flag)
- `ScoredContent`: Analysis dimensions with content + 1-10 score
- `PartialAnalysisResult`: Streaming updates during AI generation

### Environment Variables

Required in `.env.local` for development:
```env
# AI Provider Configuration
VITE_AI_PROVIDER=deepseek  # Options: 'deepseek' | 'glm'
VITE_AI_API_KEY=your_api_key_here
VITE_AI_BASE_URL=  # Optional - uses provider default if empty
VITE_AI_MODEL=     # Optional - uses provider default if empty

# Access Control (optional)
VITE_REQUIRE_ACCESS_CODE=false  # Set to 'true' to enable access code gate
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
- Vite with manual chunk splitting: vendor (React), charts (Recharts), icons (Lucide), AI (OpenAI), pdf (html2canvas/jsPDF)
- Dev server: `0.0.0.0:3003` with proxy to backend at `/api`
- Allowed hosts: `lifeline.undground.fun`
- Path alias: `@/` maps to project root
- Custom Vite plugin copies `/doc` folder to dist for PDF images
- Production build outputs to `dist/`

### Backend Configuration
- Express server in `/server` directory
- Access code management with SQLite database (`/server/data/access_codes.db`)
- API routes in `/server/routes`
- Scripts for code generation in `/server/scripts`
- Backend starts on port 3001 (configurable)

## Development Patterns

### AI Service Architecture
The app uses a **10-operation pipeline** for analysis generation in [services/aiService.ts](services/aiService.ts):

1. **Local Analysis (3 operations)**: `analyzeBasicBaZi()`, `generateExtendedAnalysis()`, `generatePersonalityAnalysis()`
   - Deterministic, instant results
   - No API calls, no cost
   - Progress: 10% → 30%

2. **AI Dimension Calls (7 operations)**: Independent AI calls for each dimension
   - Main attribute (35-40%)
   - Geographic development (40-50%)
   - Personality analysis (50-60%)
   - Career analysis (60-70%)
   - Feng Shui analysis (70-80%)
   - Wealth analysis (80-90%)
   - Marriage analysis (90-95%)
   - Each call is independent and includes retry logic (3 attempts)
   - Quota exhaustion errors immediately abort the pipeline

3. **Timeline Batch Generation (2 operations)**: Split into 2 batches to avoid token limits
   - Batch 1: Years 1-50 (95-97%)
   - Batch 2: Years 51-100 (97-100%)
   - Fallback to `generateFallbackTimeline()` if AI fails

**Key Implementation Details**:
- Progress callbacks: `onProgressUpdate(percentage, step, estimatedTime)`
- Partial results: `onPartialResult(partialData)` for streaming UI updates
- Error handling: Distinguishes quota/network/timeout/server errors
- Retry logic: Exponential backoff for transient failures
- Data validation: Post-generation checks ensure data integrity

### Critical Data Constraints
When modifying AI prompts or data processing:

1. **Timeline Requirements**:
   - Must have exactly 100 entries
   - Years must be sequential starting from birth year
   - Each entry: `open`, `close`, `high`, `low` (0-100 scale)
   - K-line rules: `high >= max(open, close)`, `low <= min(open, close)`
   - Exactly ONE entry with `isPeak: true` (enforced by post-processing)
   - 6-8% of entries should have `isKeyYear: true`

2. **Score Dimensions**:
   - All scores must be 1-10 integers
   - Dimensions: personality, career, fengShui, wealth, marriage, cryptoFortune (optional)

3. **BaZi Calculation**:
   - NEVER modify BaZi calculation logic without verifying against traditional sources
   - Solar time correction is critical for hour pillar accuracy
   - Uses `lunar-javascript` library - do not reimplement this logic

### Theme System
- Root element (`document.documentElement`) uses `dark` class for dark mode
- All components use Tailwind's `dark:` prefix for dark mode styles
- Theme state persisted in localStorage as `theme` key
- PDF export temporarily removes `dark` class to ensure clean output

### Internationalization Pattern
- Import `getTexts` from [locales.ts](locales.ts): `const t = getTexts(lang)`
- All user-facing strings must be in translation file
- AI prompts switch language based on `lang` parameter
- Never hardcode English or Chinese strings in components

### Error Handling Strategy
- Use `detectErrorType()` to categorize errors before showing to user
- Quota errors: Show ApiQuotaDialog with payment/contact info
- Network errors: Suggest checking connection and retrying
- Timeout errors: Suggest retrying with better connection
- Server errors: Log details, show generic message to user
- Unknown errors: Log full error object for debugging

### Solar Time Calculation
Located in [services/solarTime.ts](services/solarTime.ts):
- Implements Equation of Time using USNO formula
- Accounts for longitude correction (4 minutes per degree from 120°E)
- Critical for accurate hour pillar calculation
- Uses geocoding service to convert location names to coordinates
