import {
  calculateAggregateScore,
  calculateAverageSleep,
  calculateDailyXP,
  calculateVitalityIndex,
  calculateWeeklyAverage,
  determineUserMode,
  shouldAwardXP,
  shouldFreezeXP,
} from './calculations';
import { SHIELD_REWARD_STREAK } from './constants';
import { DaySummary, ModeType, SleepData } from './types';

// Complete the day and get summary
export const completeDayAndGetSummary = (
  dietScore: number,
  activityScore: number,
  calmScore: number,
  currentMode: ModeType,
  date: string,
): DaySummary => {
  const aggregate = calculateAggregateScore(
    dietScore,
    activityScore,
    calmScore,
  );
  const xpEarned = calculateDailyXP(
    dietScore,
    activityScore,
    calmScore,
    currentMode,
  );

  return {
    date,
    scores: {
      diet: dietScore,
      activity: activityScore,
      calm: calmScore,
    },
    aggregate,
    mode: currentMode,
    xpEarned,
  };
};

// Plan next day based on history
export const planNextDay = (
  last7Days: DaySummary[],
  sleepData: SleepData[], // Last 3 days sleep
  currentStreak: number,
): {
  mode: ModeType;
  message: string;
  focus: string;
} => {
  // Get last 3 days for mode determination
  const last3Days = last7Days.slice(-3);
  const last3DaysScores = last3Days.map(day => day.aggregate);

  // Calculate average sleep (last 3 days)
  const last3DaysSleep = sleepData.slice(-3).map(s => s.hours);
  const avgSleep = calculateAverageSleep(last3DaysSleep);

  // Determine mode
  const mode = determineUserMode(avgSleep, currentStreak, last3DaysScores);

  // Generate message based on mode
  let message = "Let's keep the momentum going!";
  let focus = 'Balanced Health';

  if (mode === 'RECOVERY') {
    message = 'High strain detected. Tomorrow is about regeneration.';
    focus = 'Sleep & Gentle Movement';
  } else if (mode === 'HERO') {
    message = 'You are on fire! Tomorrow is a Challenge Day. 🔥';
    focus = 'Push Your Limits';
  }

  return { mode, message, focus };
};

// Check if user should get a shield reward
export const checkShieldReward = (currentStreak: number): boolean => {
  // Award shield every 7 days
  return currentStreak > 0 && currentStreak % SHIELD_REWARD_STREAK === 0;
};

// Update streak based on performance
export const updateStreak = (
  dayAggregate: number,
  currentStreak: number,
  hasShields: boolean,
): {
  newStreak: number;
  shieldUsed: boolean;
} => {
  // Consider day "successful" if aggregate >= 50%
  const isSuccessful = dayAggregate >= 50;

  if (isSuccessful) {
    // Continue streak
    return {
      newStreak: currentStreak + 1,
      shieldUsed: false,
    };
  } else {
    // Failed day - use shield if available
    if (hasShields) {
      return {
        newStreak: currentStreak, // Maintain streak
        shieldUsed: true,
      };
    } else {
      return {
        newStreak: 0, // Break streak
        shieldUsed: false,
      };
    }
  }
};

// Calculate vitality for display
export const getVitalityData = (
  last7Days: DaySummary[],
): {
  index: number;
  weeklyAverage: number;
  consistency: string;
} => {
  const scores = last7Days.map(day => day.aggregate);
  const index = calculateVitalityIndex(scores);
  const weeklyAverage = calculateWeeklyAverage(last7Days);

  let consistency = 'Building';
  if (index >= 85) consistency = 'Excellent';
  else if (index >= 65) consistency = 'Good';
  else if (index >= 40) consistency = 'Fair';

  return {
    index,
    weeklyAverage,
    consistency,
  };
};

// Check XP rules based on weekly performance
export const getXPStatus = (
  last7Days: DaySummary[],
): {
  canEarnXP: boolean;
  isFrozen: boolean;
  reason: string;
} => {
  const weeklyAverage = calculateWeeklyAverage(last7Days);

  if (shouldFreezeXP(weeklyAverage)) {
    return {
      canEarnXP: false,
      isFrozen: true,
      reason: 'Weekly average below 50% - XP frozen (no penalty)',
    };
  }

  if (!shouldAwardXP(weeklyAverage)) {
    return {
      canEarnXP: false,
      isFrozen: false,
      reason: 'Need 85%+ weekly average to earn XP',
    };
  }

  return {
    canEarnXP: true,
    isFrozen: false,
    reason: 'Great job! Earning XP',
  };
};
