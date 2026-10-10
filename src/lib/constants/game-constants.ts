import {
  AgeRange,
  BehaviorMetrics,
  GameMode,
  TaskAction,
  TimeWindow,
} from '@/lib/types/game-progression.types';

// ============================================================================
// XP CONFIG
// ============================================================================
export const XP_CONFIG = {
  BASE_XP_PER_LEVEL: 500,
  XP_GROWTH_PER_LEVEL: 100,
  PERFECT_DAY_BONUS: 50,
  STREAK_BONUS_PER_DAY: 5,
  MAX_STREAK_BONUS: 30,
};

// ============================================================================
// TASK COUNTS BY MODE
// ============================================================================
export const TASK_COUNT_BY_MODE: Record<GameMode, number> = {
  rehab: 2,
  recovery: 3,
  standard: 5,
  hero: 6,
};

export const NEW_USER_TASK_COUNT = { diet: 2, activity: 1, stress: 1 };
export const VETERAN_TASK_COUNT = { diet: 5, activity: 5, stress: 5 };

// ============================================================================
// DIFFICULTY BY MODE
// ============================================================================
export const DIFFICULTY_BY_MODE: Record<
  GameMode,
  { min: number; max: number }
> = {
  rehab: { min: 1, max: 3 },
  recovery: { min: 2, max: 5 },
  standard: { min: 3, max: 7 },
  hero: { min: 5, max: 10 },
};

// ============================================================================
// CATEGORY DISTRIBUTION & COLORS
// ============================================================================
export const CATEGORY_DISTRIBUTION = {
  diet: 0.35,
  activity: 0.35,
  stress: 0.3,
};

export const MODE_MULTIPLIERS: Record<GameMode, number> = {
  rehab: 0.5,
  recovery: 0.7,
  standard: 1.0,
  hero: 1.3,
};

export const CATEGORY_COLORS: Record<string, string> = {
  diet: '#4CAF50',
  activity: '#DC0014',
  stress: '#00BBFF',
};

// ============================================================================
// AGE-BASED TASK CONFIGURATION
// ============================================================================
export const AGE_TASK_CONFIG: Record<
  AgeRange,
  {
    maxTimerMinutes: number;
    activityIntensity: 'gentle' | 'moderate' | 'intense';
    dietFocus: string[];
    stressApproach: string[];
    taskCountMultiplier: number;
    coinMultiplier: number;
  }
> = {
  '13-17': {
    maxTimerMinutes: 15,
    activityIntensity: 'moderate',
    dietFocus: ['balanced meals', 'hydration', 'snack awareness'],
    stressApproach: ['breathing', 'journaling', 'screen breaks'],
    taskCountMultiplier: 0.8,
    coinMultiplier: 1.2,
  },
  '18-24': {
    maxTimerMinutes: 30,
    activityIntensity: 'intense',
    dietFocus: ['meal prep', 'protein intake', 'sugar reduction'],
    stressApproach: ['meditation', 'social connection', 'sleep hygiene'],
    taskCountMultiplier: 1.0,
    coinMultiplier: 1.0,
  },
  '25-34': {
    maxTimerMinutes: 30,
    activityIntensity: 'intense',
    dietFocus: ['meal planning', 'whole foods', 'portion control'],
    stressApproach: ['mindfulness', 'work-life balance', 'exercise'],
    taskCountMultiplier: 1.0,
    coinMultiplier: 1.0,
  },
  '35-44': {
    maxTimerMinutes: 25,
    activityIntensity: 'moderate',
    dietFocus: ['heart health', 'fiber', 'reduced processed food'],
    stressApproach: ['yoga', 'nature walks', 'deep breathing'],
    taskCountMultiplier: 0.95,
    coinMultiplier: 1.05,
  },
  '45-54': {
    maxTimerMinutes: 20,
    activityIntensity: 'moderate',
    dietFocus: ['calcium', 'anti-inflammatory', 'hydration'],
    stressApproach: ['tai chi', 'reading', 'social activities'],
    taskCountMultiplier: 0.9,
    coinMultiplier: 1.1,
  },
  '55-64': {
    maxTimerMinutes: 15,
    activityIntensity: 'gentle',
    dietFocus: ['bone health', 'vitamin D', 'smaller meals'],
    stressApproach: ['gentle stretching', 'gardening', 'meditation'],
    taskCountMultiplier: 0.8,
    coinMultiplier: 1.15,
  },
  '65+': {
    maxTimerMinutes: 10,
    activityIntensity: 'gentle',
    dietFocus: ['easy digestion', 'hydration', 'nutrient density'],
    stressApproach: ['chair yoga', 'breathing', 'light walks'],
    taskCountMultiplier: 0.7,
    coinMultiplier: 1.2,
  },
};

// ============================================================================
// LEVEL TITLES
// ============================================================================
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Health Seeker',
  2: 'Wellness Rookie',
  3: 'Habit Builder',
  4: 'Mindful Starter',
  5: 'Rising Star',
  6: 'Balance Keeper',
  7: 'Momentum Builder',
  8: 'Steady Climber',
  9: 'Rhythm Finder',
  10: 'Wellness Warrior',
  15: 'Health Champion',
  20: 'Peak Performer',
  25: 'Zen Master',
  30: 'Lifestyle Legend',
  40: 'Wellness Sage',
  50: 'Health Titan',
  60: 'Immortal Spirit',
  70: 'Cosmic Healer',
  80: 'Transcendent',
  90: 'Enlightened One',
  100: 'Wellness God',
};

export function getLevelTitle(level: number): string {
  const keys = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);
  for (const key of keys) {
    if (level >= key) return LEVEL_TITLES[key]!;
  }
  return 'Health Seeker';
}

// ============================================================================
// SMART SYSTEM TIMINGS
// ============================================================================
export const SMART_SYSTEM = {
  MORNING_START: 7,
  MORNING_END: 12,
  EVENING_START: 17,
  EVENING_END: 24,
  NEW_USER_DAYS: 3,
  NEW_USER_MIN_TASKS: 4,
  NEW_USER_MAX_TASKS: 6,
  VETERAN_TOTAL_TASKS: 15,
};

// ============================================================================
// TOKEN BUDGET CONFIGURATION
// ============================================================================
export const TOKEN_CONFIG = {
  DAILY_BUDGET: 15000,
  TASK_GENERATION_MAX: 2500,
  TASK_GENERATION_COMPRESSED: 1200,
  EVENING_BOOSTER_MAX: 800,
  PHOTO_VALIDATION_MAX: 600,
  WEEKLY_REPORT_MAX: 2000,
  ASSESSMENT_MAX: 1500,
  CACHE_TTL_HOURS: 6,
  MIN_BUDGET_FOR_AI: 500,
};

// ============================================================================
// ADAPTIVE DIFFICULTY CONFIG
// ============================================================================
export const ADAPTIVE_DIFFICULTY = {
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 10,
  INCREASE_THRESHOLD: 0.85, // >85% completion → harder
  DECREASE_THRESHOLD: 0.5, // <50% completion → easier
  CONSECUTIVE_DAYS_TO_ADJUST: 3,
  DIFFICULTY_STEP: 0.5,
};

// ============================================================================
// SMART RESET CONFIG
// ============================================================================
export const SMART_RESET_CONFIG = {
  MILD_ABSENCE_DAYS: 1,
  MODERATE_ABSENCE_DAYS: 3,
  SEVERE_ABSENCE_DAYS: 7,
  RECOVERY_MODE_DAYS: 3,
  REHAB_MODE_DAYS: 5,
  STREAK_GRACE_PERIOD: 1,
  LEVEL_REDUCTION_PER_WEEK_MISSED: 1,
  MIN_LEVEL_AFTER_RESET: 1,
};

// ============================================================================
// BEHAVIOR PATTERN HELPERS
// ============================================================================
export function getAdaptiveDifficulty(metrics: BehaviorMetrics): number {
  const base = metrics.adaptiveDifficulty ?? 5;
  if (
    metrics.completionRate >= ADAPTIVE_DIFFICULTY.INCREASE_THRESHOLD * 100 &&
    metrics.consecutiveEasyDays >=
      ADAPTIVE_DIFFICULTY.CONSECUTIVE_DAYS_TO_ADJUST
  ) {
    return Math.min(
      ADAPTIVE_DIFFICULTY.MAX_DIFFICULTY,
      base + ADAPTIVE_DIFFICULTY.DIFFICULTY_STEP,
    );
  }
  if (
    metrics.completionRate <= ADAPTIVE_DIFFICULTY.DECREASE_THRESHOLD * 100 &&
    metrics.consecutiveHardDays >=
      ADAPTIVE_DIFFICULTY.CONSECUTIVE_DAYS_TO_ADJUST
  ) {
    return Math.max(
      ADAPTIVE_DIFFICULTY.MIN_DIFFICULTY,
      base - ADAPTIVE_DIFFICULTY.DIFFICULTY_STEP,
    );
  }
  return base;
}

export function getPreferredTimeWindow(metrics: BehaviorMetrics): TimeWindow {
  return (metrics.mostActiveTimeWindow as TimeWindow) ?? 'evening';
}

export function getWeakCategory(metrics: BehaviorMetrics): string {
  const rates = {
    diet: metrics.dietCompletionRate ?? 0,
    activity: metrics.activityCompletionRate ?? 0,
    stress: metrics.stressCompletionRate ?? 0,
  };
  return Object.entries(rates).sort(([, a], [, b]) => a - b)[0]?.[0] ?? 'diet';
}

export function getPreferredActions(metrics: BehaviorMetrics): TaskAction[] {
  return metrics.preferredTaskActions?.length > 0
    ? metrics.preferredTaskActions
    : ['timer', 'capture_photo', 'log_record'];
}
