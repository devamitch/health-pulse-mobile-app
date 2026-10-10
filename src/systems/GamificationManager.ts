/**
 * GAMIFICATION MANAGER
 *
 * Core manager that handles:
 * - XP calculation and distribution
 * - Level progression
 * - Achievement tracking and unlocking
 * - Streak management
 * - Reward distribution
 * - Event triggering
 */

import {
  UserProfile,
  Achievement,
  DailyChallenge,
  ActivityRing,
  CelebrationEvent,
  Streak,
  ActivityCategory,
  ACHIEVEMENTS,
  XP_CONFIG,
  calculateLevelInfo,
  createCelebration,
  generateDailyChallenges,
  calculateStreakMultiplier,
  getStreakEmoji,
  getTaskCompletionFeedback,
  ACTIVITY_RINGS,
  RingConfig,
} from './gamificationEngine';

// ============================================================================
// MANAGER CLASS
// ============================================================================

export class GamificationManager {
  private userProfile: UserProfile;
  private celebrations: CelebrationEvent[] = [];
  private streaks: Map<ActivityCategory, Streak> = new Map();

  constructor(userProfile: UserProfile) {
    this.userProfile = userProfile;
    this.initializeStreaks();
  }

  // ========================================================================
  // STREAK MANAGEMENT
  // ========================================================================

  private initializeStreaks() {
    const categories: ActivityCategory[] = ['diet', 'exercise', 'supplement'];
    categories.forEach(category => {
      this.streaks.set(category, {
        category,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: '',
        multiplier: 1.0,
        milestones: [3, 7, 14, 30, 50, 100],
      });
    });
  }

  updateStreak(
    category: ActivityCategory,
    completed: boolean,
    date: Date,
  ): Streak {
    const streak = this.streaks.get(category)!;
    const dateStr = date.toISOString().split('T')[0];
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (completed) {
      // Check if this continues the streak
      if (streak.lastCompletedDate === yesterdayStr) {
        streak.currentStreak++;
      } else if (streak.lastCompletedDate !== dateStr) {
        // New streak
        streak.currentStreak = 1;
      }

      streak.lastCompletedDate = dateStr;
      streak.multiplier = calculateStreakMultiplier(streak.currentStreak);

      // Update longest streak
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }

      // Check for streak milestones
      if (streak.milestones.includes(streak.currentStreak)) {
        this.celebrations.push(
          createCelebration('streak', {
            streak: streak.currentStreak,
            category,
          }),
        );
      }
    } else {
      // Check if streak is broken
      if (
        streak.lastCompletedDate !== dateStr &&
        streak.lastCompletedDate !== yesterdayStr
      ) {
        streak.currentStreak = 0;
        streak.multiplier = 1.0;
      }
    }

    this.streaks.set(category, streak);
    return streak;
  }

  getStreak(category: ActivityCategory): Streak {
    return this.streaks.get(category)!;
  }

  // ========================================================================
  // XP & LEVEL MANAGEMENT
  // ========================================================================

  addXP(
    amount: number,
    category?: ActivityCategory,
    bonusMultiplier: number = 1,
  ): number {
    const baseXP = amount;
    let totalXP = baseXP;

    // Apply streak multiplier if category provided
    if (category) {
      const streak = this.streaks.get(category);
      if (streak) {
        totalXP *= streak.multiplier;
      }
    }

    // Apply bonus multiplier
    totalXP *= bonusMultiplier;

    // Round to nearest integer
    totalXP = Math.floor(totalXP);

    // Store previous level
    const previousLevel = this.userProfile.level;

    // Add XP to profile
    this.userProfile.xp += totalXP;
    this.userProfile.totalXP += totalXP;

    // Check for level up
    const levelInfo = calculateLevelInfo(this.userProfile.totalXP);
    if (levelInfo.level > previousLevel) {
      this.userProfile.level = levelInfo.level;
      this.celebrations.push(
        createCelebration('level_up', {
          level: levelInfo.level,
          title: levelInfo.title,
          rewards: [
            {
              type: 'badge',
              value: `level_${levelInfo.level}`,
              label: `Reached Level ${levelInfo.level}`,
            },
          ],
        }),
      );
    }

    return totalXP;
  }

  getLevelInfo() {
    return calculateLevelInfo(this.userProfile.totalXP);
  }

  // ========================================================================
  // TASK COMPLETION
  // ========================================================================

  completeTask(
    category: ActivityCategory,
    taskType: string,
    context?: {
      isEarly?: boolean;
      inCombo?: boolean;
    },
  ): {
    xpEarned: number;
    feedback: string;
    celebrations: CelebrationEvent[];
  } {
    const celebrations: CelebrationEvent[] = [];
    let xpEarned = 0;
    let bonusMultiplier = 1;

    // Base XP based on category
    switch (category) {
      case 'diet':
        xpEarned = XP_CONFIG.MEAL_COMPLETE;
        break;
      case 'exercise':
        xpEarned = XP_CONFIG.WORKOUT_COMPLETE;
        break;
      case 'supplement':
        xpEarned = XP_CONFIG.SUPPLEMENT_COMPLETE;
        break;
      case 'vital':
        xpEarned = XP_CONFIG.VITAL_LOG;
        break;
      default:
        xpEarned = 10;
    }

    // Apply bonuses
    if (context?.isEarly) {
      xpEarned += XP_CONFIG.EARLY_COMPLETION_BONUS;
    }

    if (context?.inCombo) {
      bonusMultiplier = XP_CONFIG.COMBO_MULTIPLIER;
    }

    // Add XP with streak multiplier
    const totalXP = this.addXP(xpEarned, category, bonusMultiplier);

    // Update stats
    this.userProfile.stats.totalTasksCompleted++;
    switch (category) {
      case 'diet':
        this.userProfile.stats.totalMealsLogged++;
        break;
      case 'exercise':
        this.userProfile.stats.totalWorkoutsLogged++;
        break;
      case 'supplement':
        this.userProfile.stats.totalSupplementsTaken++;
        break;
      case 'vital':
        this.userProfile.stats.totalVitalsLogged++;
        break;
    }

    // Check for achievements
    this.checkAchievements(category);

    // Get feedback message
    const feedback = getTaskCompletionFeedback(category);

    // Add any new celebrations
    celebrations.push(...this.celebrations);
    this.celebrations = [];

    return {
      xpEarned: totalXP,
      feedback,
      celebrations,
    };
  }

  // ========================================================================
  // ACTIVITY RING MANAGEMENT
  // ========================================================================

  async calculateActivityRings(
    date: Date,
    tasksData: {
      diet: { completed: number; total: number };
      exercise: { completed: number; total: number };
      supplement: { completed: number; total: number };
    },
  ): Promise<ActivityRing[]> {
    const rings: ActivityRing[] = [];

    for (const ringConfig of ACTIVITY_RINGS) {
      const category = ringConfig.category;
      const data = tasksData[category as keyof typeof tasksData];

      if (!data) continue;

      // Calculate XP earned
      const xpPerTask = ringConfig.baseXP;
      const xpEarned = data.completed * xpPerTask;

      // Get streak for this category
      const streak = this.getStreak(category);

      // Calculate progress
      const progress = Math.min(
        (xpEarned / ringConfig.targetXP) * streak.multiplier,
        2,
      );

      // Check for overflow
      if (progress > 1) {
        this.userProfile.stats.overflowAchievements++;
        this.celebrations.push(
          createCelebration('overflow', {
            category: ringConfig.label,
          }),
        );
      }

      rings.push({
        category,
        label: ringConfig.label,
        xpEarned,
        xpTarget: ringConfig.targetXP,
        progress,
        tasksCompleted: data.completed,
        totalTasks: data.total,
        color: ringConfig.color,
        overflowColor: ringConfig.overflowColor,
        glowColor: ringConfig.glowColor,
        streak: streak.currentStreak,
        multiplier: streak.multiplier,
      });
    }

    // Check for perfect day
    const allComplete = rings.every(ring => ring.progress >= 1);
    if (allComplete) {
      this.userProfile.stats.perfectDays++;
      this.addXP(XP_CONFIG.PERFECT_DAY_BONUS);
      this.celebrations.push(createCelebration('perfect_day', {}));
    }

    return rings;
  }

  // ========================================================================
  // ACHIEVEMENT SYSTEM
  // ========================================================================

  checkAchievements(category?: ActivityCategory): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked and not repeatable
      if (
        this.userProfile.achievements.includes(achievement.id) &&
        !achievement.repeatable
      ) {
        continue;
      }

      // Skip if category doesn't match
      if (category && achievement.category !== category) {
        continue;
      }

      // Check requirement
      const unlocked = this.checkAchievementRequirement(achievement);

      if (unlocked) {
        // Add to user's achievements
        if (!this.userProfile.achievements.includes(achievement.id)) {
          this.userProfile.achievements.push(achievement.id);
        }

        // Apply rewards
        achievement.rewards.forEach(reward => {
          if (reward.type === 'title' && typeof reward.value === 'string') {
            if (!this.userProfile.titles.includes(reward.value)) {
              this.userProfile.titles.push(reward.value);
            }
          }
        });

        // Create celebration
        this.celebrations.push(
          createCelebration('achievement', {
            achievementName: achievement.name,
            icon: achievement.icon,
            rewards: achievement.rewards,
          }),
        );

        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  }

  private checkAchievementRequirement(achievement: Achievement): boolean {
    const req = achievement.requirement;

    switch (req.type) {
      case 'count':
        let count = 0;
        switch (req.category) {
          case 'diet':
            count = this.userProfile.stats.totalMealsLogged;
            break;
          case 'exercise':
            count = this.userProfile.stats.totalWorkoutsLogged;
            break;
          case 'supplement':
            count = this.userProfile.stats.totalSupplementsTaken;
            break;
          case 'vital':
            count = this.userProfile.stats.totalVitalsLogged;
            break;
          default:
            count = this.userProfile.stats.totalTasksCompleted;
        }
        return count >= req.target;

      case 'streak':
        return this.userProfile.currentStreak >= req.target;

      case 'perfect_day':
        return this.userProfile.stats.perfectDays >= req.target;

      case 'overflow':
        return this.userProfile.stats.overflowAchievements >= req.target;

      default:
        return false;
    }
  }

  getAchievementProgress(achievementId: string): number {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return 0;

    const req = achievement.requirement;
    let current = 0;

    switch (req.type) {
      case 'count':
        switch (req.category) {
          case 'diet':
            current = this.userProfile.stats.totalMealsLogged;
            break;
          case 'exercise':
            current = this.userProfile.stats.totalWorkoutsLogged;
            break;
          case 'supplement':
            current = this.userProfile.stats.totalSupplementsTaken;
            break;
        }
        break;
      case 'streak':
        current = this.userProfile.currentStreak;
        break;
      case 'perfect_day':
        current = this.userProfile.stats.perfectDays;
        break;
      case 'overflow':
        current = this.userProfile.stats.overflowAchievements;
        break;
    }

    return Math.min(current / req.target, 1);
  }

  // ========================================================================
  // DAILY CHALLENGES
  // ========================================================================

  getDailyChallenges(): DailyChallenge[] {
    return generateDailyChallenges(this.userProfile.level);
  }

  updateChallengeProgress(
    challengeId: string,
    progress: number,
  ): DailyChallenge | null {
    const challenges = this.getDailyChallenges();
    const challenge = challenges.find(c => c.id === challengeId);

    if (!challenge) return null;

    challenge.progress = progress;

    if (progress >= challenge.target && !challenge.completed) {
      challenge.completed = true;
      this.addXP(challenge.xpReward);
      this.userProfile.coins += challenge.coinReward;
      this.userProfile.completedChallenges.push(challengeId);
    }

    return challenge;
  }

  // ========================================================================
  // GETTERS
  // ========================================================================

  getUserProfile(): UserProfile {
    return this.userProfile;
  }

  getCelebrations(): CelebrationEvent[] {
    const celebrations = [...this.celebrations];
    this.celebrations = [];
    return celebrations;
  }

  getAllAchievements(): Achievement[] {
    return ACHIEVEMENTS;
  }

  getUnlockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(a =>
      this.userProfile.achievements.includes(a.id),
    );
  }

  getLockedAchievements(): Achievement[] {
    return ACHIEVEMENTS.filter(
      a => !this.userProfile.achievements.includes(a.id) && !a.hidden,
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const createDefaultUserProfile = (): UserProfile => {
  return {
    id: Date.now().toString(),
    level: 1,
    xp: 0,
    totalXP: 0,
    coins: 0,
    gems: 0,
    currentStreak: 0,
    longestStreak: 0,
    titles: [],
    achievements: [],
    completedChallenges: [],
    stats: {
      totalTasksCompleted: 0,
      totalMealsLogged: 0,
      totalWorkoutsLogged: 0,
      totalSupplementsTaken: 0,
      totalVitalsLogged: 0,
      perfectDays: 0,
      overflowAchievements: 0,
      weeklyStreak: 0,
    },
  };
};

export default GamificationManager;
