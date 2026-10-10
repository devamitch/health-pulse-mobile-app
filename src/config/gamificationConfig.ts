/**
 * Gamification Configuration
 *
 * Defines point values for different activities and daily thresholds.
 * Inspired by Google Fit's activity ring system with overflow capability.
 */

export interface ActivityPoints {
  basePoints: number; // Points per completed item
  categoryName: string;
  color: string;
  icon?: string;
}

export interface DailyThreshold {
  category: 'diet' | 'activity' | 'supplement';
  targetPoints: number; // Daily target points to complete the ring
  minPoints: number; // Minimum points to show some progress (allows skipping some tasks)
  color: string;
  overflowColor: string; // Color when points exceed target
}

/**
 * Point values for different activity types
 */
export const ACTIVITY_POINTS: Record<string, ActivityPoints> = {
  // Diet/Superfood items
  breakfast: {
    basePoints: 30,
    categoryName: 'Breakfast',
    color: '#4CAF50',
  },
  lunch: {
    basePoints: 40,
    categoryName: 'Lunch',
    color: '#4CAF50',
  },
  dinner: {
    basePoints: 30,
    categoryName: 'Dinner',
    color: '#4CAF50',
  },
  snack: {
    basePoints: 10,
    categoryName: 'Snack',
    color: '#4CAF50',
  },

  // Activity/Exercise items
  cardio: {
    basePoints: 50,
    categoryName: 'Cardio',
    color: '#DC0014',
  },
  strength: {
    basePoints: 40,
    categoryName: 'Strength',
    color: '#DC0014',
  },
  flexibility: {
    basePoints: 20,
    categoryName: 'Flexibility',
    color: '#DC0014',
  },
  workout: {
    basePoints: 30,
    categoryName: 'Workout',
    color: '#DC0014',
  },

  // Supplement items
  supplement: {
    basePoints: 15,
    categoryName: 'Supplement',
    color: '#FEDD00',
  },
  vitamin: {
    basePoints: 15,
    categoryName: 'Vitamin',
    color: '#FEDD00',
  },
};

/**
 * Daily thresholds for each category
 * Users can overflow beyond 100% for extra achievement
 */
export const DAILY_THRESHOLDS: DailyThreshold[] = [
  {
    category: 'diet',
    targetPoints: 100, // Target: Complete most meals
    minPoints: 60, // Minimum: At least 2 meals
    color: '#4CAF50',
    overflowColor: '#2E7D32', // Darker green for overflow
  },
  {
    category: 'activity',
    targetPoints: 100, // Target: Complete workout routine
    minPoints: 50, // Minimum: At least some exercises
    color: '#DC0014',
    overflowColor: '#A50010', // Darker red for overflow
  },
  {
    category: 'supplement',
    targetPoints: 100, // Target: Take all supplements
    minPoints: 50, // Minimum: At least half of supplements
    color: '#FEDD00',
    overflowColor: '#C5A600', // Darker yellow for overflow
  },
];

/**
 * Default points for items without specific categorization
 */
export const DEFAULT_ITEM_POINTS = {
  diet: 25,
  activity: 35,
  supplement: 20,
};

/**
 * Maximum overflow multiplier (e.g., 2.0 = 200% max)
 */
export const MAX_OVERFLOW_MULTIPLIER = 2.0;

/**
 * Get points for a specific item type
 */
export const getItemPoints = (
  itemType: string,
  category: 'diet' | 'activity' | 'supplement',
): number => {
  const normalizedType = itemType.toLowerCase();

  // Check if we have specific points for this type
  if (ACTIVITY_POINTS[normalizedType]) {
    return ACTIVITY_POINTS[normalizedType].basePoints;
  }

  // Return default points for the category
  return DEFAULT_ITEM_POINTS[category];
};

/**
 * Get threshold configuration for a category
 */
export const getThreshold = (
  category: 'diet' | 'activity' | 'supplement',
): DailyThreshold => {
  const threshold = DAILY_THRESHOLDS.find(t => t.category === category);
  if (!threshold) {
    throw new Error(
      `No threshold configuration found for category: ${category}`,
    );
  }
  return threshold;
};

/**
 * Calculate progress with overflow support
 * Returns value between 0 and MAX_OVERFLOW_MULTIPLIER
 */
export const calculateProgressWithOverflow = (
  earnedPoints: number,
  targetPoints: number,
): number => {
  if (targetPoints === 0) return 0;
  const progress = earnedPoints / targetPoints;
  return Math.min(progress, MAX_OVERFLOW_MULTIPLIER);
};

/**
 * Check if user has reached minimum threshold
 */
export const hasReachedMinimum = (
  earnedPoints: number,
  category: 'diet' | 'activity' | 'supplement',
): boolean => {
  const threshold = getThreshold(category);
  return earnedPoints >= threshold.minPoints;
};

/**
 * Check if user has completed the daily goal
 */
export const hasCompletedGoal = (
  earnedPoints: number,
  category: 'diet' | 'activity' | 'supplement',
): boolean => {
  const threshold = getThreshold(category);
  return earnedPoints >= threshold.targetPoints;
};

/**
 * Check if user has overflow (exceeded target)
 */
export const hasOverflow = (
  earnedPoints: number,
  category: 'diet' | 'activity' | 'supplement',
): boolean => {
  const threshold = getThreshold(category);
  return earnedPoints > threshold.targetPoints;
};

/**
 * Get achievement level based on points
 */
export const getAchievementLevel = (
  earnedPoints: number,
  category: 'diet' | 'activity' | 'supplement',
): 'none' | 'minimum' | 'complete' | 'overflow' => {
  const threshold = getThreshold(category);

  if (earnedPoints >= threshold.targetPoints * MAX_OVERFLOW_MULTIPLIER) {
    return 'overflow';
  }
  if (earnedPoints >= threshold.targetPoints) {
    return 'complete';
  }
  if (earnedPoints >= threshold.minPoints) {
    return 'minimum';
  }
  return 'none';
};
