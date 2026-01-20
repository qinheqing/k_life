# AGENTS.md

This file guides AI agents working on this Life K-Line codebase.

## Development Commands

### Core Commands
- `npm run dev` - Start Vite dev server (port 3003, host 0.0.0.0)
- `npm run build` - Production build with manual chunk splitting
- `npm run preview` - Preview production build locally

### PM2 Process Management
- `npm run pm2:dev` - Start with PM2 in development mode
- `npm run pm2:prod` - Start with PM2 in production mode
- `npm run pm2:stop` - Stop PM2 processes
- `npm run pm2:restart` - Restart PM2 processes
- `npm run pm2:logs` - View PM2 logs
- `npm run pm2:status` - Check PM2 process status

### Testing/Linting
No test framework is configured. When adding tests, first check for test commands in package.json.

## Code Style Guidelines

### TypeScript & React
- Use functional components with `React.FC<Props>` interface typing
- State management: React hooks only (useState, useEffect) - no global state libraries
- All types defined in `types.ts` - import from there, don't redefine
- Component props: define interfaces with explicit type annotations
- Language type: `Language = 'en' | 'zh'` - always type language parameters

### Imports
- Prefer explicit relative paths: `./components/ComponentName`
- Third-party: react, react-dom, lucide-react, recharts, openai, html2canvas, jspdf
- Type imports: `import { Type } from './types'`
- Group imports: React first, third-party, then local components

### Naming Conventions
- Components: PascalCase (e.g., `InputForm`, `KLineChart`)
- Functions/variables: camelCase (e.g., `handleSubmit`, `formData`)
- Constants: UPPER_SNAKE_CASE (e.g., `COLOR_BULL`, `COLOR_BEAR`)
- Interfaces: PascalCase, prefixed with I only for React props interfaces if needed
- Types: PascalCase for types/enums (e.g., `UserInput`, `Gender`, `Language`)

### Styling (Tailwind CSS)
- Dark mode: Always include `dark:` variants (e.g., `bg-white dark:bg-amber-50`)
- Transitions: Add `transition-colors duration-200` for theme-aware elements
- Colors: Use constants from `constants.ts`:
  - `COLOR_BULL = '#10B981'` (Green - good/up)
  - `COLOR_BEAR = '#EF4444'` (Red - bad/down)
  - `COLOR_NEUTRAL = '#9CA3AF'`
- Animation classes: Use defined classes from `index.css`
- PDF capture: Add `data-html2canvas-ignore` to UI elements to exclude from PDF export

### Error Handling
- Wrap async operations in try/catch blocks
- Log errors with `console.error()`
- For API quota errors: throw specific error string "QUOTA_EXHAUSTED"
- Use `isQuotaExhaustedError()` helper from aiService.ts for detection
- Show user-friendly dialogs (see ApiQuotaDialog component)

### Component Structure
- Each component receives `lang: Language` prop for i18n
- Get translations via `const t = getTexts(lang);`
- Use descriptive prop names matching their purpose
- Export components as default: `export default ComponentName;`
- Keep components focused - extract sub-components when logic gets complex

### AI Integration (services/aiService.ts)
- **IMPORTANT**: BaZi calculation is now done locally in baziCalculator.ts, NOT by AI
- Two-stage generation: `calculateBaZi()` → `generateDestinyAnalysis()`
  - calculateBaZi(): Uses local baziCalculator for accurate pillar calculation
  - generateDestinyAnalysis(): AI generates only fortune timeline and analysis
- Support multiple providers via VITE_AI_PROVIDER ('deepseek' | 'glm')
- Use environment variables: VITE_AI_API_KEY, VITE_AI_BASE_URL, VITE_AI_MODEL
- Prompt engineering: Strict JSON schema, clear instructions
- Data validation: Timeline must have exactly 100 entries starting from birth year
- Single peak detection: Only one `isPeak: true` per timeline

### BaZi Calculation (services/baziCalculator.ts)
- Uses lunar-javascript library (v1.7.7) for precise calculations
- Local calculation - NO AI involved for pillar determination
- Functions:
  - calculateBaZiLocal(): Returns pillars, lunarDate, solarTime, solarHour, startAge, direction, daYun
  - Uses: Solar.fromYmdHms(), Lunar, getTimeGan(), getTimeZhi(), getDayGan(), etc.
- Key lunar-javascript methods:
  - getYearGan(), getYearZhi(): Year stem/branch
  - getMonthGan(), getMonthZhi(): Month stem/branch
  - getDayGan(), getDayZhi(): Day stem/branch
  - getTimeGan(), getTimeZhi(): Hour stem/branch (based on solar time)
  - getYearInGanZhi(): Full year stem-branch (e.g., "壬申"）

### Solar Time Calculation (services/solarTime.ts)
- Calculates true solar time (真太阳时) based on geolocation
- Formula: True Solar Time = Mean Solar Time + Equation of Time + Longitude Correction
- Equation of Time: Uses US Naval Observatory formula
  - Range: approx -14 to +16 minutes
- Longitude Correction: (local longitude - standard longitude) × 4 minutes
  - Standard longitude for Beijing time: 120°E
- Returns: solarTime, longitude, latitude, timezone, solarHour, lunarDate
- Uses geolocation service (geoLocation.ts) to get coordinates from place name

### File Organization
- `/components` - All React components
- `/services` - External service integrations (AI, BaZi calculation, solar time, analysis services)
  - `basicAnalysis.ts` - Basic analysis service for quick BaZi insights
  - `extendedAnalysis.ts` - Extended analysis service for deep fortune analysis
- `/types.ts` - All TypeScript interfaces and enums
- `/constants.ts` - App-wide constants (colors, app name)
- `/locales.ts` - Bilingual translations (English/Chinese)
- `/server` - Backend server for access code management
- Root files: `App.tsx`, `index.tsx`, `index.css`

### Comments & Documentation
- Minimal inline comments - code should be self-explanatory
- Section headers with dashed lines for logical separation (e.g., in aiService.ts)
- JSDoc not used extensively - prefer clear naming and interfaces
- Complex logic deserves brief explanatory comments

### State Management Patterns
- App.tsx is single source of truth for step state
- Theme persisted in localStorage
- Each component manages its own local state
- Pass data down via props, lift state up when needed

### Code Formatting
- No enforced linting tools - follow existing patterns
- Indentation: 2 spaces (standard for TypeScript/React)
- Max line length: Not strictly enforced, but prefer < 100 chars
- Consistent spacing around operators and after commas
- Trailing commas in multi-line objects/arrays

### Key Architectural Patterns
- Multi-step wizard flow: Landing → Input → Confirmation → Results
- Wizard state managed in App.tsx
- BaZi confirmation required before full analysis
- User can reset and start over from any step
- Loading states shown during AI calls
- Error handling triggers quota dialog for all API failures

## Recent Improvements

### True Solar Time & BaZi Calculation Optimization (Jan 2026)

**Problems Fixed**:
1. Incorrect lunar date calculation (showing "1992" instead of "壬申"）
2. Inaccurate solar time calculation formula
3. AI-generated BaZi pillars were unreliable

**Solutions Implemented**:

1. **Enhanced Solar Time Calculation** (services/solarTime.ts)
   - Fixed time difference equation using US Naval Observatory formula
   - Corrected longitude correction calculation
   - Added proper lunar date formatting with gan-zhi year (干支纪年）
   - Example: 1993-01-01 18:12 (Beijing) → True solar time: 17:51

2. **Local BaZi Calculator** (services/baziCalculator.ts) ⭐ NEW
   - Uses lunar-javascript library for precise calculations
   - Calculates all four pillars locally, no AI involved
   - Returns accurate results:
     - Year Pillar: 壬申
     - Month Pillar: 壬子
     - Day Pillar: 壬午
     - Hour Pillar: 己酉
   - Calculates start age and fortune direction
   - Generates 10 DaYun (大运）pillars

3. **Updated AI Service** (services/aiService.ts)
   - calculateBaZi() now uses local baziCalculator
   - AI only generates fortune analysis, not BaZi calculation
   - Eliminates AI hallucination risks
   - Reduces API costs

**Testing Results**:
- Input: 1993-01-01 18:12, Beijing
- True Solar Time: 17:51 (corrected by ~18 minutes)
- Lunar Date: 壬申年腊月初九 (correct)
- Time Pillar: 己酉 (accurate based on true solar time）

**Files Added/Modified**:
- ✅ New: services/baziCalculator.ts - Local BaZi calculation
- ✅ New: services/solarTime.ts - Enhanced solar time calculation
- ✅ New: services/geoLocation.ts - Geocoding service
- ✅ New: services/basicAnalysis.ts - Basic analysis service
- ✅ New: services/extendedAnalysis.ts - Extended analysis service
- ✅ New: LOCALIZATION_REPORT.md - Localization support documentation
- ✅ Modified: services/aiService.ts - Uses local calculator
- ✅ Modified: components/BaZiConfirmation.tsx - Updated display

**Dependencies Added**:
- lunar-javascript@1.7.7 - Professional lunar/BaZi calculation library

### Analysis Service Enhancement (Jan 2026)

**New Services Added**:

1. **basicAnalysis.ts** - Quick Analysis Service
   - Provides rapid BaZi insights for users who want quick results
   - Lightweight analysis with essential fortune information
   - Faster response times for basic queries

2. **extendedAnalysis.ts** - Deep Analysis Service  
   - Comprehensive fortune analysis with detailed insights
   - Advanced algorithms for more accurate predictions
   - Suitable for users seeking in-depth life guidance

3. **LOCALIZATION_REPORT.md** - Internationalization Documentation
   - Complete report on multilingual support capabilities
   - Language-specific optimization guidelines
   - Translation workflow and best practices

**Benefits**:
- Flexible analysis options for different user needs
- Improved performance through service specialization
- Better internationalization support
- Enhanced user experience with choice of analysis depth
