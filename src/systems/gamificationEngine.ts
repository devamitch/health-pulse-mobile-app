/**
 * ADVANCED GAMIFICATION ENGINE
 *
 * A comprehensive system featuring:
 * - XP and Level progression
 * - Achievement badges and milestones
 * - Streak tracking with multipliers
 * - Daily challenges and quests
 * - Reward system
 * - Social features (personal bests, leaderboards)
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ActivityCategory =
  | 'diet'
  | 'exercise'
  | 'supplement'
  | 'vital'
  | 'sleep';
export type AchievementTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond';
export type RewardType =
  | 'badge'
  | 'title'
  | 'theme'
  | 'animation'
  | 'multiplier';

export interface UserProfile {
  id: string;
  level: number;
  xp: number;
  totalXP: number;
  coins: number;
  gems: number;
  currentStreak: number;
  longestStreak: number;
  titles: string[];
  activeTitle?: string;
  achievements: string[];
  completedChallenges: string[];
  stats: UserStats;
}

export interface UserStats {
  totalTasksCompleted: number;
  totalMealsLogged: number;
  totalWorkoutsLogged: number;
  totalSupplementsTaken: number;
  totalVitalsLogged: number;
  perfectDays: number;
  overflowAchievements: number;
  weeklyStreak: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: AchievementTier;
  category: ActivityCategory;
  icon: string;
  requirement: AchievementRequirement;
  rewards: Reward[];
  hidden?: boolean; // Secret achievements
  repeatable?: boolean;
}

export interface AchievementRequirement {
  type: 'count' | 'streak' | 'perfect_day' | 'overflow' | 'speed' | 'combo';
  target: number;
  category?: ActivityCategory;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
}

export interface Reward {
  type: RewardType;
  value: string | number;
  label: string;
}

export interface DailyChallenge {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  target: number;
  progress: number;
  xpReward: number;
  coinReward: number;
  deadline: Date;
  completed: boolean;
}

export interface Streak {
  category: ActivityCategory;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  multiplier: number;
  milestones: number[];
}

export interface ActivityRing {
  category: ActivityCategory;
  label: string;
  xpEarned: number;
  xpTarget: number;
  progress: number; // 0-2 (supports overflow)
  tasksCompleted: number;
  totalTasks: number;
  color: string;
  overflowColor: string;
  glowColor: string;
  streak: number;
  multiplier: number;
}

export interface LevelInfo {
  level: number;
  xpRequired: number;
  xpProgress: number;
  title: string;
  perks: string[];
  nextLevelXP: number;
}

export interface CelebrationEvent {
  type:
    | 'level_up'
    | 'achievement'
    | 'streak'
    | 'perfect_day'
    | 'overflow'
    | 'milestone';
  title: string;
  message: string;
  icon: string;
  rewards: Reward[];
  animation: 'confetti' | 'fireworks' | 'sparkles' | 'stars' | 'rainbow';
  sound?: string;
}

// ============================================================================
// XP & LEVEL SYSTEM
// ============================================================================

export const XP_CONFIG = {
  // Base XP for completing tasks
  MEAL_COMPLETE: 20,
  WORKOUT_COMPLETE: 30,
  SUPPLEMENT_COMPLETE: 15,
  VITAL_LOG: 25,

  // Bonus XP multipliers
  PERFECT_DAY_BONUS: 100,
  STREAK_BONUS_PER_DAY: 5,
  OVERFLOW_BONUS: 50,
  EARLY_COMPLETION_BONUS: 10,
  COMBO_MULTIPLIER: 1.5, // Complete multiple tasks in short time

  // Level thresholds (exponential growth)
  BASE_XP_PER_LEVEL: 100,
  LEVEL_MULTIPLIER: 1.15,
};

export const calculateLevelInfo = (totalXP: number): LevelInfo => {
  let level = 1;
  let xpRequired = 0;
  let nextLevelXP = XP_CONFIG.BASE_XP_PER_LEVEL;

  // Calculate current level
  while (totalXP >= xpRequired + nextLevelXP) {
    xpRequired += nextLevelXP;
    level++;
    nextLevelXP = Math.floor(
      XP_CONFIG.BASE_XP_PER_LEVEL *
        Math.pow(XP_CONFIG.LEVEL_MULTIPLIER, level - 1),
    );
  }

  const xpProgress = totalXP - xpRequired;

  return {
    level,
    xpRequired,
    xpProgress,
    title: getLevelTitle(level),
    perks: getLevelPerks(level),
    nextLevelXP,
  };
};

export const getLevelTitle = (level: number): string => {
  if (level >= 100) return '🌟 Wellness Legend';
  if (level >= 75) return '💎 Diamond Master';
  if (level >= 50) return '🏆 Platinum Champion';
  if (level >= 30) return '⭐ Gold Achiever';
  if (level >= 20) return '🥈 Silver Warrior';
  if (level >= 10) return '🥉 Bronze Fighter';
  if (level >= 5) return '🌱 Rising Star';
  return '🌟 Beginner';
};

export const getLevelPerks = (level: number): string[] => {
  const perks: string[] = [];

  if (level >= 5) perks.push('Unlock custom themes');
  if (level >= 10) perks.push('Unlock advanced stats');
  if (level >= 15) perks.push('2x XP weekends');
  if (level >= 20) perks.push('Unlock exclusive badges');
  if (level >= 30) perks.push('Custom activity rings');
  if (level >= 50) perks.push('VIP supporter status');
  if (level >= 75) perks.push('Early access to features');
  if (level >= 100) perks.push('Hall of Fame entry');

  return perks;
};

// ============================================================================
// ACHIEVEMENT SYSTEM
// ============================================================================

export const ACHIEVEMENTS: Achievement[] = [
  // ===== STARTER ACHIEVEMENTS =====
  {
    id: 'first_meal',
    name: 'First Bite',
    description: 'Log your first meal',
    tier: 'bronze',
    category: 'diet',
    icon: '🍽️',
    requirement: { type: 'count', target: 1, category: 'diet' },
    rewards: [
      { type: 'badge', value: 'first_meal', label: 'First Meal Badge' },
    ],
  },
  {
    id: 'first_workout',
    name: 'First Rep',
    description: 'Complete your first workout',
    tier: 'bronze',
    category: 'exercise',
    icon: '💪',
    requirement: { type: 'count', target: 1, category: 'exercise' },
    rewards: [
      { type: 'badge', value: 'first_workout', label: 'First Workout Badge' },
    ],
  },

  // ===== STREAK ACHIEVEMENTS =====
  {
    id: 'streak_3',
    name: 'On Fire',
    description: 'Maintain a 3-day streak',
    tier: 'bronze',
    category: 'diet',
    icon: '🔥',
    requirement: { type: 'streak', target: 3 },
    rewards: [
      { type: 'badge', value: 'streak_3', label: '3-Day Streak' },
      { type: 'multiplier', value: 1.1, label: '10% XP Boost' },
    ],
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Complete 7 days in a row',
    tier: 'silver',
    category: 'diet',
    icon: '🔥🔥',
    requirement: { type: 'streak', target: 7 },
    rewards: [
      { type: 'badge', value: 'streak_7', label: 'Week Warrior' },
      { type: 'multiplier', value: 1.25, label: '25% XP Boost' },
    ],
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Complete 30 days straight',
    tier: 'gold',
    category: 'diet',
    icon: '🔥🔥🔥',
    requirement: { type: 'streak', target: 30 },
    rewards: [
      { type: 'badge', value: 'streak_30', label: 'Monthly Master' },
      { type: 'title', value: 'The Consistent One', label: 'Special Title' },
      { type: 'multiplier', value: 1.5, label: '50% XP Boost' },
    ],
  },
  {
    id: 'streak_100',
    name: 'Centurion',
    description: '100 days of perfection',
    tier: 'diamond',
    category: 'diet',
    icon: '💯',
    requirement: { type: 'streak', target: 100 },
    rewards: [
      { type: 'badge', value: 'streak_100', label: 'Centurion Badge' },
      { type: 'title', value: 'The Unstoppable', label: 'Legendary Title' },
      { type: 'theme', value: 'golden', label: 'Golden Theme' },
      { type: 'multiplier', value: 2, label: '2x XP Forever' },
    ],
  },

  // ===== PERFECT DAY ACHIEVEMENTS =====
  {
    id: 'perfect_day_1',
    name: 'Perfect Start',
    description: 'Complete all tasks in one day',
    tier: 'bronze',
    category: 'diet',
    icon: '⭐',
    requirement: { type: 'perfect_day', target: 1 },
    rewards: [{ type: 'badge', value: 'perfect_day_1', label: 'Perfect Day' }],
  },
  {
    id: 'perfect_week',
    name: 'Flawless Week',
    description: '7 perfect days in a row',
    tier: 'gold',
    category: 'diet',
    icon: '🌟',
    requirement: { type: 'perfect_day', target: 7, timeframe: 'weekly' },
    rewards: [
      { type: 'badge', value: 'perfect_week', label: 'Flawless Week' },
      { type: 'title', value: 'Perfectionist', label: 'Special Title' },
    ],
  },

  // ===== OVERFLOW ACHIEVEMENTS =====
  {
    id: 'overflow_10',
    name: 'Overachiever',
    description: 'Exceed your goal 10 times',
    tier: 'silver',
    category: 'diet',
    icon: '🚀',
    requirement: { type: 'overflow', target: 10 },
    rewards: [{ type: 'badge', value: 'overflow_10', label: 'Overachiever' }],
  },
  {
    id: 'overflow_50',
    name: 'Beyond Limits',
    description: 'Exceed your goal 50 times',
    tier: 'platinum',
    category: 'diet',
    icon: '🌠',
    requirement: { type: 'overflow', target: 50 },
    rewards: [
      { type: 'badge', value: 'overflow_50', label: 'Beyond Limits' },
      { type: 'animation', value: 'rainbow', label: 'Rainbow Effect' },
    ],
  },

  // ===== COUNT ACHIEVEMENTS =====
  {
    id: 'meals_50',
    name: 'Nutrition Novice',
    description: 'Log 50 meals',
    tier: 'bronze',
    category: 'diet',
    icon: '🥗',
    requirement: { type: 'count', target: 50, category: 'diet' },
    rewards: [{ type: 'badge', value: 'meals_50', label: 'Nutrition Novice' }],
  },
  {
    id: 'meals_500',
    name: 'Food Master',
    description: 'Log 500 meals',
    tier: 'gold',
    category: 'diet',
    icon: '👨‍🍳',
    requirement: { type: 'count', target: 500, category: 'diet' },
    rewards: [
      { type: 'badge', value: 'meals_500', label: 'Food Master' },
      { type: 'title', value: 'Chef Supreme', label: 'Special Title' },
    ],
  },
  {
    id: 'workouts_100',
    name: 'Gym Rat',
    description: 'Complete 100 workouts',
    tier: 'silver',
    category: 'exercise',
    icon: '🏋️',
    requirement: { type: 'count', target: 100, category: 'exercise' },
    rewards: [{ type: 'badge', value: 'workouts_100', label: 'Gym Rat' }],
  },
  {
    id: 'workouts_500',
    name: 'Fitness Legend',
    description: 'Complete 500 workouts',
    tier: 'platinum',
    category: 'exercise',
    icon: '🏆',
    requirement: { type: 'count', target: 500, category: 'exercise' },
    rewards: [
      { type: 'badge', value: 'workouts_500', label: 'Fitness Legend' },
      { type: 'title', value: 'Iron Champion', label: 'Legendary Title' },
    ],
  },

  // ===== SECRET ACHIEVEMENTS =====
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Log a task after midnight',
    tier: 'silver',
    category: 'diet',
    icon: '🦉',
    requirement: { type: 'speed', target: 1 },
    rewards: [{ type: 'badge', value: 'night_owl', label: 'Night Owl' }],
    hidden: true,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Log breakfast before 6 AM',
    tier: 'silver',
    category: 'diet',
    icon: '🐦',
    requirement: { type: 'speed', target: 1 },
    rewards: [{ type: 'badge', value: 'early_bird', label: 'Early Bird' }],
    hidden: true,
  },
];

// ============================================================================
// STREAK SYSTEM
// ============================================================================

export const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 75, 100, 200, 365];

export const calculateStreakMultiplier = (streak: number): number => {
  if (streak >= 100) return 2.0;
  if (streak >= 50) return 1.75;
  if (streak >= 30) return 1.5;
  if (streak >= 14) return 1.35;
  if (streak >= 7) return 1.25;
  if (streak >= 3) return 1.15;
  return 1.0;
};

export const getStreakEmoji = (streak: number): string => {
  if (streak >= 100) return '💎🔥💎';
  if (streak >= 50) return '🏆🔥🏆';
  if (streak >= 30) return '⭐🔥⭐';
  if (streak >= 14) return '🔥🔥🔥';
  if (streak >= 7) return '🔥🔥';
  if (streak >= 3) return '🔥';
  return '';
};

export const getStreakMessage = (streak: number): string => {
  if (streak >= 100) return `LEGENDARY ${streak}-DAY STREAK! 💎`;
  if (streak >= 50) return `INCREDIBLE ${streak}-DAY STREAK! 🏆`;
  if (streak >= 30) return `AMAZING ${streak}-DAY STREAK! ⭐`;
  if (streak >= 14) return `OUTSTANDING ${streak}-DAY STREAK! 🔥`;
  if (streak >= 7) return `GREAT ${streak}-DAY STREAK! 🔥`;
  if (streak >= 3) return `NICE ${streak}-DAY STREAK! 🔥`;
  if (streak === 1) return `START YOUR STREAK! 💪`;
  return `KEEP IT GOING! 💪`;
};

// ============================================================================
// RING CONFIGURATION
// ============================================================================

export interface RingConfig {
  category: ActivityCategory;
  label: string;
  emoji: string;
  color: string;
  overflowColor: string;
  glowColor: string;
  baseXP: number;
  targetXP: number;
  minXP: number;
}

export const ACTIVITY_RINGS: RingConfig[] = [
  {
    category: 'diet',
    label: 'Nutrition',
    emoji: '🍎',
    color: '#4CAF50',
    overflowColor: '#2E7D32',
    glowColor: '#81C784',
    baseXP: 20,
    targetXP: 100,
    minXP: 60,
  },
  {
    category: 'exercise',
    label: 'Movement',
    emoji: '💪',
    color: '#E91E63',
    overflowColor: '#C2185B',
    glowColor: '#F06292',
    baseXP: 30,
    targetXP: 120,
    minXP: 60,
  },
  {
    category: 'supplement',
    label: 'Supplements',
    emoji: '💊',
    color: '#FF9800',
    overflowColor: '#F57C00',
    glowColor: '#FFB74D',
    baseXP: 15,
    targetXP: 60,
    minXP: 30,
  },
];

// ============================================================================
// DAILY CHALLENGES
// ============================================================================

export const generateDailyChallenges = (
  userLevel: number,
): DailyChallenge[] => {
  const now = new Date();
  const deadline = new Date(now);
  deadline.setHours(23, 59, 59, 999);

  const levelMultiplier = 1 + userLevel * 0.05;

  return [
    {
      id: `daily_meals_${now.toDateString()}`,
      name: 'Nutrition Champion',
      description: 'Log all 3 meals today',
      category: 'diet',
      target: 3,
      progress: 0,
      xpReward: Math.floor(50 * levelMultiplier),
      coinReward: 25,
      deadline,
      completed: false,
    },
    {
      id: `daily_workout_${now.toDateString()}`,
      name: 'Fitness Focus',
      description: 'Complete a workout session',
      category: 'exercise',
      target: 1,
      progress: 0,
      xpReward: Math.floor(75 * levelMultiplier),
      coinReward: 35,
      deadline,
      completed: false,
    },
    {
      id: `daily_vitals_${now.toDateString()}`,
      name: 'Health Check',
      description: 'Log your vitals',
      category: 'vital',
      target: 1,
      progress: 0,
      xpReward: Math.floor(40 * levelMultiplier),
      coinReward: 20,
      deadline,
      completed: false,
    },
  ];
};

// ============================================================================
// CELEBRATION EVENTS
// ============================================================================

export const createCelebration = (
  type: CelebrationEvent['type'],
  context: any,
): CelebrationEvent => {
  switch (type) {
    case 'level_up':
      return {
        type: 'level_up',
        title: `LEVEL ${context.level} REACHED! 🎉`,
        message: `You're now a ${context.title}!`,
        icon: '🆙',
        rewards: context.rewards || [],
        animation: 'fireworks',
        sound: 'level_up',
      };

    case 'achievement':
      return {
        type: 'achievement',
        title: 'ACHIEVEMENT UNLOCKED! 🏆',
        message: context.achievementName,
        icon: context.icon,
        rewards: context.rewards,
        animation: 'confetti',
        sound: 'achievement',
      };

    case 'streak':
      return {
        type: 'streak',
        title: `${context.streak}-DAY STREAK! ${getStreakEmoji(
          context.streak,
        )}`,
        message: getStreakMessage(context.streak),
        icon: '🔥',
        rewards: [
          {
            type: 'multiplier',
            value: calculateStreakMultiplier(context.streak),
            label: 'Streak Bonus',
          },
        ],
        animation: 'sparkles',
        sound: 'streak',
      };

    case 'perfect_day':
      return {
        type: 'perfect_day',
        title: 'PERFECT DAY! ⭐',
        message: 'You completed all your tasks!',
        icon: '⭐',
        rewards: [
          {
            type: 'badge',
            value: 'perfect_day',
            label: `+${XP_CONFIG.PERFECT_DAY_BONUS} Bonus XP`,
          },
        ],
        animation: 'stars',
        sound: 'perfect_day',
      };

    case 'overflow':
      return {
        type: 'overflow',
        title: 'EXCEEDED GOAL! 🚀',
        message: `${context.category} ring overflowed!`,
        icon: '🌟',
        rewards: [
          {
            type: 'badge',
            value: 'overflow',
            label: `+${XP_CONFIG.OVERFLOW_BONUS} Bonus XP`,
          },
        ],
        animation: 'rainbow',
        sound: 'overflow',
      };

    default:
      return {
        type: 'milestone',
        title: 'MILESTONE REACHED! 🎯',
        message: context.message,
        icon: '🎯',
        rewards: [],
        animation: 'confetti',
      };
  }
};

// ============================================================================
// MOTIVATIONAL MESSAGES
// ============================================================================

export const getMotivationalMessage = (context: {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  streak: number;
  completionRate: number;
}): string => {
  const { timeOfDay, streak, completionRate } = context;

  // High performance messages
  if (completionRate >= 0.9) {
    const messages = [
      "You're absolutely crushing it! 🔥",
      'Unstoppable! Keep this momentum! 💪',
      "You're on fire today! Amazing work! 🌟",
      'This is what peak performance looks like! 🏆',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Good progress messages
  if (completionRate >= 0.6) {
    const messages = [
      "Great progress! You're doing awesome! 👏",
      'Keep up the excellent work! 💯',
      "You're making it happen! Way to go! ⭐",
      "Solid effort! You've got this! 💪",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Encouraging messages
  if (completionRate >= 0.3) {
    const messages = [
      'Good start! Keep building momentum! 🚀',
      "You're making progress! Stay consistent! 💪",
      "Nice work! Let's keep it going! 🌟",
      "You're on the right track! Keep pushing! ⭐",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Fresh start messages
  const messages = [
    "Every expert was once a beginner. Let's start! 🌱",
    "Today is a new opportunity! You've got this! 💫",
    "Small steps lead to big results! Let's begin! 🎯",
    'Your journey to better health starts now! 🌟',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getTaskCompletionFeedback = (
  category: ActivityCategory,
): string => {
  const feedbackMap: Record<ActivityCategory, string[]> = {
    diet: [
      'Delicious and nutritious! 🍎',
      'Fueling your body right! 🥗',
      'Great food choice! 🍽️',
      'Nutrition goals crushed! 💪',
    ],
    exercise: [
      'Beast mode activated! 💪',
      'Those gains though! 🔥',
      'Stronger every day! 🏋️',
      'Fitness champion! 🏆',
    ],
    supplement: [
      'Health boost unlocked! 💊',
      'Supporting your wellness! ✨',
      'Smart supplementation! 🌟',
      'Body nourished! 💪',
    ],
    vital: [
      'Data recorded! 📊',
      'Health tracked! ❤️',
      'Vital signs logged! 📈',
      'Health monitoring on point! ✅',
    ],
    sleep: [
      'Rest well earned! 😴',
      'Sweet dreams! 🌙',
      'Recovery mode activated! 💤',
      'Sleep is gains! 🛏️',
    ],
  };

  const messages = feedbackMap[category];
  return messages[Math.floor(Math.random() * messages.length)];
};
