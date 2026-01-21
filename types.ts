export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export type Language = 'en' | 'zh';

export interface UserInput {
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthLocation: string;
}

export interface BaZiPillar {
  gan: string; // Heavenly Stem
  zhi: string; // Earthly Branch
  element?: string; // e.g., "Yang Fire"
}

export interface BaZiChart {
  year: BaZiPillar;
  month: BaZiPillar;
  day: BaZiPillar;
  hour: BaZiPillar;
}

// Intermediate result for confirmation step
export interface BaZiResult {
  userInput: UserInput;
  solarTime: string; // HH:mm
  lunarDate: string; // Lunar Date string (e.g. "一九九零年腊月初五")
  bazi: BaZiChart;
  startAge: number; // Age the Da Yun starts
  direction: string; // Forward or Backward
  daYun: string[]; // List of Big Luck pillars (e.g. "甲子", "乙丑")
  originalSolarTime?: {
    solarTime: string;
    longitude: number;
    latitude: number;
    timezone: string;
    solarHour: string;
  };
}

export interface YearlyFortune {
  year: number;
  age: number;
  open: number; // Luck score start
  close: number; // Luck score end
  high: number; // Peak luck
  low: number; // Lowest luck
  summary: string; // Short summary for tooltip
  detailedReview: string; // Detailed text for bottom report
  isPeak?: boolean; // Is this a local maximum/life peak?
  isKeyYear?: boolean; // Is this a key year with detailed review?
  
  // Yearly review with detailed analysis for key years
  yearlyReview?: {
    brief: string; // Brief review for normal years (max 100 chars)
    detailed?: {
      career: string; // Career fortune (around 100 chars)
      wealth: string; // Wealth fortune (around 80 chars)
      health: string; // Health fortune (around 80 chars)
      advice: string; // Annual advice (around 40 chars)
      luckyColor?: string; // Lucky color (optional, key years only)
      luckyNumber?: number; // Lucky number (optional, key years only)
    };
  };
}

export interface ScoredContent {
  rating: number; // 1-10
  summary: string; // Brief summary (2-3 sentences, 50-80 chars)
  
  // Detailed content for expanded view
  details: {
    overview: string; // General overview (100-150 chars)
    strengths: string[]; // Strengths analysis (3-4 items, 50 chars each)
    weaknesses: string[]; // Weaknesses analysis (2-3 items, 50 chars each)
    recommendations: string[]; // Specific recommendations (4-5 items, 50 chars each)
    taboos: string[]; // Taboos/cautions (2-3 items, 40 chars each)
    bestTiming: string; // Best timing for advantages (around 50 chars)
  };
}

// Geographical development analysis
export interface GeographicalAnalysis {
  recommendedDirections: {
    primary: string; // Main recommended direction (e.g., "South", "North")
    secondary: string; // Secondary recommended direction
    description: string; // Direction explanation (80-100 chars)
  };
  
  recommendedCityTypes: {
    types: string[]; // Recommended city types (e.g., ["一线城市", "沿海城市"])
    examples: string[]; // Example cities (3-5 cities, e.g., ["深圳", "上海", "杭州"])
    description: string; // City type explanation (100-150 chars)
  };
  
  migrationAdvice: {
    timing: string; // Best timing for migration (around 50 chars)
    preparation: string[]; // Preparation work (2-3 items)
    considerations: string[]; // Considerations/cautions (2-3 items)
  };
  
  workplaceArrangement: string; // Workplace environment suggestions (80-100 chars)
  rating: number; // Overall rating 1-10
}

export interface AnalysisResult {
  bazi: BaZiChart; // This will be the confirmed chart
  mainAttribute: string; // e.g., "Weak Fire", "Strong Wood"
  generalComment: string; // Destiny Overview
  
  // Scored Sections
  geographicDevelopment: GeographicalAnalysis; // Geographic development direction
  personality: ScoredContent;
  career: ScoredContent;
  fengShui: ScoredContent;
  wealth: ScoredContent;
  marriage: ScoredContent;
  
  volatilityAnalysis: string; // Logic analysis for the chart
  timeline: YearlyFortune[];
}
