// Gamification Constants - Easy to understand and modify

// Level System
export const BASE_XP_THRESHOLD = 1000; // XP needed for level 2
export const XP_GROWTH_RATE = 1.2; // Each level needs 20% more XP
export const BASE_DAILY_TARGET = 100; // Starting daily target points
export const LEVEL_MULTIPLIER = 0.05; // 5% increase per level

// Scoring
export const MAX_DAILY_SCORE = 100; // Normal cap
export const OVERDRIVE_MULTIPLIER = 1.5; // Hero mode multiplier

// Streak & Shields
export const MAX_SHIELDS = 5; // Maximum shields you can have
export const SHIELD_REWARD_STREAK = 7; // Get a shield every 7 days
export const HERO_MODE_STREAK = 5; // Need 5+ days for hero mode

// Sleep thresholds
export const MIN_SLEEP_HOURS = 6; // Below this triggers recovery mode
export const GOOD_SLEEP_HOURS = 7.5; // Optimal sleep

// Scoring thresholds
export const EXCELLENT_THRESHOLD = 85; // 85%+ is excellent
export const GOOD_THRESHOLD = 65; // 65%+ is good
export const WARNING_THRESHOLD = 40; // 40%+ is warning
// Below 40% is critical

// XP Rewards
export const XP_REWARDS = {
  STANDARD_DAY: 100,
  RECOVERY_DAY: 50,
  HERO_DAY: 200,
  BOOSTER_BONUS: 10,
  PERFECT_DAY: 150, // Bonus for hitting 100% on all pillars
  SHIELD_SAVE: 25, // Bonus XP when using a shield
};

// User Titles based on level
export const USER_TITLES = [
  { level: 1, title: 'Beginner' },
  { level: 5, title: 'Health Seeker' },
  { level: 10, title: 'Wellness Warrior' },
  { level: 15, title: 'Vitality Champion' },
  { level: 20, title: 'Peak Performer' },
  { level: 30, title: 'Legendary Hero' },
];

// Micro-Boosters Database
export const MICRO_BOOSTERS = [
  // Diet Boosters
  {
    id: 'water',
    name: 'Water Glass',
    icon: '💧',
    points: 2,
    pillar: 'diet',
    description: 'Drink a glass of water',
  },
  {
    id: 'protein',
    name: 'Protein First',
    icon: '🥚',
    points: 5,
    pillar: 'diet',
    description: 'Eat protein first',
  },
  {
    id: 'no-sugar',
    name: 'No Sugar 4h',
    icon: '🚫',
    points: 10,
    pillar: 'diet',
    description: 'No sugar for 4 hours',
  },
  {
    id: 'veggies',
    name: 'Veggies',
    icon: '🥗',
    points: 8,
    pillar: 'diet',
    description: 'Eat vegetables',
  },
  {
    id: 'fiber',
    name: 'Fiber Starter',
    icon: '🌾',
    points: 15,
    pillar: 'diet',
    description: 'Fibrous starter before meal',
  },

  // Activity Boosters
  {
    id: 'stairs',
    name: 'Stair Climb',
    icon: '🪜',
    points: 4,
    pillar: 'activity',
    description: 'Climb stairs',
  },
  {
    id: 'squats',
    name: '20 Squats',
    icon: '🏋️',
    points: 5,
    pillar: 'activity',
    description: 'Do 20 squats',
  },
  {
    id: 'walk-meeting',
    name: 'Walk Meeting',
    icon: '🚶',
    points: 10,
    pillar: 'activity',
    description: 'Walking meeting',
  },
  {
    id: 'pushups',
    name: '20 Pushups',
    icon: '💪',
    points: 8,
    pillar: 'activity',
    description: 'Do 20 pushups',
  },
  {
    id: 'stretch',
    name: '5min Stretch',
    icon: '🧘',
    points: 6,
    pillar: 'activity',
    description: '5 min stretching',
  },

  // Calm Boosters
  {
    id: 'deep-breath',
    name: '3 Deep Breaths',
    icon: '🌬️',
    points: 2,
    pillar: 'calm',
    description: 'Take 3 deep breaths',
  },
  {
    id: 'no-phone-bed',
    name: 'No Phone Bedtime',
    icon: '📵',
    points: 15,
    pillar: 'calm',
    description: 'No phone before bed',
  },
  {
    id: 'box-breath',
    name: 'Box Breathing',
    icon: '⬜',
    points: 10,
    pillar: 'calm',
    description: '5 min box breathing',
  },
  {
    id: 'meditation',
    name: '10min Meditation',
    icon: '🧘‍♂️',
    points: 12,
    pillar: 'calm',
    description: '10 min meditation',
  },
  {
    id: 'journal',
    name: 'Gratitude Journal',
    icon: '📔',
    points: 8,
    pillar: 'calm',
    description: 'Write 3 grateful things',
  },
];

// Mode Colors
export const MODE_COLORS = {
  STANDARD: '#10B981', // Green
  RECOVERY: '#4F46E5', // Indigo
  HERO: '#F97316', // Orange
};

// Pillar Colors
export const PILLAR_COLORS = {
  diet: '#22C55E', // Green
  activity: '#3B82F6', // Blue
  calm: '#A855F7', // Purple
};
