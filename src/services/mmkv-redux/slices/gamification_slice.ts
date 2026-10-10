import {
  adjustTargetForMode,
  calculateAggregateScore,
  calculateDailyTarget,
  calculatePercentage,
  calculatePointsWithBonus,
  calculateScoreWithOverdrive,
  calculateXPForNextLevel,
  checkForLevelUp,
  getStatusFromPercentage,
} from '@/utils/gamification/calculations';
import {
  checkShieldReward,
  completeDayAndGetSummary,
  getVitalityData,
  getXPStatus,
  planNextDay,
  updateStreak as updateStreakUtil,
} from '@/utils/gamification/dayManager';
import {
  DaySummary,
  MicroBooster,
  ModeType,
  PillarScore,
  SleepData,
  UserProfile,
} from '@/utils/gamification/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Gamification State Interface
export interface GamificationState {
  userProfile: UserProfile;
  dailyScores: {
    diet: PillarScore;
    activity: PillarScore;
    calm: PillarScore;
    aggregate: number;
  };
  history: DaySummary[]; // Last 7 days
  sleepData: SleepData[]; // Last 3 days
  todayBoostersUsed: string[]; // Track which boosters were used today
  lastResetDate: string; // Track when we last reset daily scores
}

// Initial State
const initialState: GamificationState = {
  userProfile: {
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    streak: 0,
    shields: 2,
    mode: 'STANDARD',
    vitalityIndex: 0,
  },
  dailyScores: {
    diet: {
      current: 0,
      target: 100,
      percentage: 0,
      status: 'critical',
    },
    activity: {
      current: 0,
      target: 100,
      percentage: 0,
      status: 'critical',
    },
    calm: {
      current: 0,
      target: 100,
      percentage: 0,
      status: 'critical',
    },
    aggregate: 0,
  },
  history: [],
  sleepData: [],
  todayBoostersUsed: [],
  lastResetDate: new Date().toISOString().split('T')[0],
};

// Gamification Slice
const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    // Add a booster (instant points)
    addBooster: (state, action: PayloadAction<MicroBooster>) => {
      const booster = action.payload;

      // Calculate points with level bonus
      const pointsToAdd = calculatePointsWithBonus(
        booster.points,
        state.userProfile.level,
      );

      // Update the correct pillar
      const pillar = state.dailyScores[booster.pillar];

      // Calculate new score with overdrive support
      const newCurrent = calculateScoreWithOverdrive(
        pillar.current + pointsToAdd,
        state.userProfile.mode,
      );

      const newPercentage = calculatePercentage(newCurrent, pillar.target);
      const newStatus = getStatusFromPercentage(newPercentage);

      // Update pillar
      state.dailyScores[booster.pillar] = {
        ...pillar,
        current: newCurrent,
        percentage: newPercentage,
        status: newStatus,
      };

      // Recalculate aggregate
      state.dailyScores.aggregate = calculateAggregateScore(
        state.dailyScores.diet.percentage,
        state.dailyScores.activity.percentage,
        state.dailyScores.calm.percentage,
      );

      // Track booster usage
      if (!state.todayBoostersUsed.includes(booster.id)) {
        state.todayBoostersUsed.push(booster.id);
      }
    },

    // Add XP (with weekly average check)
    addXP: (state, action: PayloadAction<number>) => {
      // Check if user can earn XP
      const xpStatus = getXPStatus(state.history);

      if (xpStatus.isFrozen || !xpStatus.canEarnXP) {
        console.log('XP not awarded:', xpStatus.reason);
        return;
      }

      const newXP = state.userProfile.xp + action.payload;
      const levelUpCheck = checkForLevelUp(newXP, state.userProfile.level);

      if (levelUpCheck.shouldLevelUp) {
        // Level up!
        const newLevel = levelUpCheck.newLevel;
        const newBaseTarget = calculateDailyTarget(newLevel);
        const newTarget = adjustTargetForMode(
          newBaseTarget,
          state.userProfile.mode,
        );

        // Update user profile
        state.userProfile.level = newLevel;
        state.userProfile.xp = levelUpCheck.remainingXP;
        state.userProfile.xpToNextLevel = calculateXPForNextLevel(newLevel);

        // Update daily targets
        state.dailyScores.diet.target = newTarget;
        state.dailyScores.activity.target = newTarget;
        state.dailyScores.calm.target = newTarget;
      } else {
        state.userProfile.xp = newXP;
      }
    },

    // Complete day and plan next day
    completeDay: (state, action: PayloadAction<string>) => {
      const date = action.payload;

      // Create day summary
      const daySummary = completeDayAndGetSummary(
        state.dailyScores.diet.current,
        state.dailyScores.activity.current,
        state.dailyScores.calm.current,
        state.userProfile.mode,
        date,
      );

      // Update streak
      const streakUpdate = updateStreakUtil(
        daySummary.aggregate,
        state.userProfile.streak,
        state.userProfile.shields > 0,
      );

      // Check for shield reward
      const earnedShield = checkShieldReward(streakUpdate.newStreak);

      // Plan next day
      const nextDayPlan = planNextDay(
        [...state.history, daySummary],
        state.sleepData,
        streakUpdate.newStreak,
      );

      // Add to history
      state.history.push(daySummary);
      if (state.history.length > 7) {
        state.history.shift(); // Keep only last 7 days
      }

      // Update user profile
      state.userProfile.streak = streakUpdate.newStreak;
      if (streakUpdate.shieldUsed) {
        state.userProfile.shields -= 1;
      }
      if (earnedShield) {
        state.userProfile.shields += 1;
      }
      state.userProfile.mode = nextDayPlan.mode;
      state.userProfile.vitalityIndex = getVitalityData([
        ...state.history,
        daySummary,
      ]).index;

      // Try to add XP (will check if eligible)
      const xpStatus = getXPStatus([...state.history, daySummary]);
      if (xpStatus.canEarnXP && !xpStatus.isFrozen) {
        const newXP = state.userProfile.xp + daySummary.xpEarned;
        const levelUpCheck = checkForLevelUp(newXP, state.userProfile.level);

        if (levelUpCheck.shouldLevelUp) {
          const newLevel = levelUpCheck.newLevel;
          const newBaseTarget = calculateDailyTarget(newLevel);
          const newTarget = adjustTargetForMode(
            newBaseTarget,
            nextDayPlan.mode,
          );

          state.userProfile.level = newLevel;
          state.userProfile.xp = levelUpCheck.remainingXP;
          state.userProfile.xpToNextLevel = calculateXPForNextLevel(newLevel);

          // Update targets with new mode
          state.dailyScores.diet.target = newTarget;
          state.dailyScores.activity.target = newTarget;
          state.dailyScores.calm.target = newTarget;
        } else {
          state.userProfile.xp = newXP;
        }
      }

      // Reset daily scores for next day
      const newBaseTarget = calculateDailyTarget(state.userProfile.level);
      const newTarget = adjustTargetForMode(newBaseTarget, nextDayPlan.mode);

      state.dailyScores = {
        diet: {
          current: 0,
          target: newTarget,
          percentage: 0,
          status: 'critical',
        },
        activity: {
          current: 0,
          target: newTarget,
          percentage: 0,
          status: 'critical',
        },
        calm: {
          current: 0,
          target: newTarget,
          percentage: 0,
          status: 'critical',
        },
        aggregate: 0,
      };

      state.todayBoostersUsed = [];
      state.lastResetDate = date;
    },

    // Add sleep data
    addSleepData: (
      state,
      action: PayloadAction<{ date: string; hours: number }>,
    ) => {
      state.sleepData.push(action.payload);
      if (state.sleepData.length > 3) {
        state.sleepData.shift(); // Keep only last 3 days
      }
    },

    // Manually set mode (for testing or special cases)
    setMode: (state, action: PayloadAction<ModeType>) => {
      state.userProfile.mode = action.payload;

      // Adjust targets based on new mode
      const newBaseTarget = calculateDailyTarget(state.userProfile.level);
      const newTarget = adjustTargetForMode(newBaseTarget, action.payload);

      state.dailyScores.diet.target = newTarget;
      state.dailyScores.activity.target = newTarget;
      state.dailyScores.calm.target = newTarget;
    },

    // Manually add shield (for rewards/purchases)
    addShield: state => {
      state.userProfile.shields += 1;
    },

    // Reset daily scores if needed
    resetDailyScores: state => {
      const target = calculateDailyTarget(state.userProfile.level);
      state.dailyScores = {
        diet: {
          current: 0,
          target,
          percentage: 0,
          status: 'critical',
        },
        activity: {
          current: 0,
          target,
          percentage: 0,
          status: 'critical',
        },
        calm: {
          current: 0,
          target,
          percentage: 0,
          status: 'critical',
        },
        aggregate: 0,
      };
      state.todayBoostersUsed = [];
      state.lastResetDate = new Date().toISOString().split('T')[0];
    },

    // Reset all gamification data (for new user)
    resetGamification: () => initialState,
  },
});

// Export actions
export const {
  addBooster,
  addXP,
  completeDay,
  addSleepData,
  setMode,
  addShield,
  resetDailyScores,
  resetGamification,
} = gamificationSlice.actions;

// Export reducer
export default gamificationSlice.reducer;
