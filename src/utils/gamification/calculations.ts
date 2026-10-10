import {
  BASE_DAILY_TARGET,
  BASE_XP_THRESHOLD,
  EXCELLENT_THRESHOLD,
  GOOD_THRESHOLD,
  LEVEL_MULTIPLIER,
  WARNING_THRESHOLD,
  XP_GROWTH_RATE,
} from './constants';
import { ModeType, StatusType } from './types';

// Calculate how much XP is needed for the next level
export const calculateXPForNextLevel = (currentLevel: number): number => {
  // Level 1 needs 1000 XP
  // Level 2 needs 1200 XP (1000 * 1.2)
  // Level 3 needs 1440 XP (1200 * 1.2)
  return Math.floor(
    BASE_XP_THRESHOLD * Math.pow(XP_GROWTH_RATE, currentLevel - 1),
  );
};

// Calculate daily target based on user level
export const calculateDailyTarget = (level: number): number => {
  // Level 1: 100 points
  // Level 10: 150 points (100 * 1.5)
  return Math.floor(BASE_DAILY_TARGET * (1 + level * LEVEL_MULTIPLIER));
};

// Calculate points with level bonus
export const calculatePointsWithBonus = (
  basePoints: number,
  userLevel: number,
): number => {
  // Each level gives 2% bonus
  const multiplier = 1 + userLevel * 0.02;
  return Math.floor(basePoints * multiplier);
};

// Get status based on percentage
export const getStatusFromPercentage = (percentage: number): StatusType => {
  if (percentage >= EXCELLENT_THRESHOLD) return 'excellent';
  if (percentage >= GOOD_THRESHOLD) return 'good';
  if (percentage >= WARNING_THRESHOLD) return 'warning';
  return 'critical';
};

// Calculate percentage
export const calculatePercentage = (
  current: number,
  target: number,
): number => {
  if (target === 0) return 0;
  return Math.floor((current / target) * 100);
};

// Calculate aggregate score from three pillars
export const calculateAggregateScore = (
  dietPercentage: number,
  activityPercentage: number,
  calmPercentage: number,
): number => {
  return Math.floor((dietPercentage + activityPercentage + calmPercentage) / 3);
};

// Determine user mode based on conditions
export const determineUserMode = (
  avgSleep: number,
  streak: number,
  avgScore: number,
): ModeType => {
  // Not enough sleep? Recovery mode
  if (avgSleep < 6) {
    return 'RECOVERY';
  }

  // Good streak and score? Hero mode
  if (streak > 5 && avgScore > 80) {
    return 'HERO';
  }

  // Otherwise standard mode
  return 'STANDARD';
};

// Calculate vitality index (consistency score)
export const calculateVitalityIndex = (last7DaysScores: number[]): number => {
  if (last7DaysScores.length === 0) return 0;

  // Get average score
  const average =
    last7DaysScores.reduce((sum, score) => sum + score, 0) /
    last7DaysScores.length;

  // Calculate how consistent the scores are
  const variance = calculateVariance(last7DaysScores);

  // Lower variance = more consistent = better
  // We want consistency, not just high scores
  const consistencyBonus = Math.max(0, 100 - variance);

  // 70% weight on average, 30% on consistency
  const finalScore = average * 0.7 + consistencyBonus * 0.3;

  return Math.min(100, Math.floor(finalScore));
};

// Helper: Calculate variance (how much scores differ)
const calculateVariance = (scores: number[]): number => {
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  const squaredDiffs = scores.map(score => Math.pow(score - avg, 2));
  const avgSquaredDiff =
    squaredDiffs.reduce((sum, diff) => sum + diff, 0) / scores.length;

  return Math.sqrt(avgSquaredDiff);
};

// Check if user should level up
export const checkForLevelUp = (
  currentXP: number,
  currentLevel: number,
): {
  shouldLevelUp: boolean;
  newLevel: number;
  remainingXP: number;
} => {
  const xpNeeded = calculateXPForNextLevel(currentLevel);

  if (currentXP >= xpNeeded) {
    // Level up!
    return {
      shouldLevelUp: true,
      newLevel: currentLevel + 1,
      remainingXP: currentXP - xpNeeded,
    };
  }

  return {
    shouldLevelUp: false,
    newLevel: currentLevel,
    remainingXP: currentXP,
  };
};

// Get weakest pillar
export const getWeakestPillar = (
  dietPercentage: number,
  activityPercentage: number,
  calmPercentage: number,
): 'diet' | 'activity' | 'calm' => {
  const scores = {
    diet: dietPercentage,
    activity: activityPercentage,
    calm: calmPercentage,
  };

  // Find the pillar with lowest percentage
  const weakest = Object.entries(scores).reduce(
    (min, [pillar, score]) => (score < min.score ? { pillar, score } : min),
    { pillar: 'diet', score: scores.diet },
  );

  return weakest.pillar as 'diet' | 'activity' | 'calm';
};

// Calculate weekly average score
export const calculateWeeklyAverage = (last7DaysScores: number[]): number => {
  if (last7DaysScores.length === 0) return 0;

  const sum = last7DaysScores.reduce((total, score) => total + score, 0);
  return Math.floor(sum / last7DaysScores.length);
};

// export const xpCalculator = (n: number): number => Math.round(100 * n);
export const xpCalculator = (n: number): number =>
  Math.round(100 * (1 - Math.pow(0.95, n)));
