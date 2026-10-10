/**
 * Example: Customizing Point Values and Thresholds
 *
 * This file demonstrates how to customize the gamification system
 * for different use cases and user preferences.
 */

import {
  ACTIVITY_POINTS,
  DAILY_THRESHOLDS,
  DEFAULT_ITEM_POINTS,
  getItemPoints,
  getThreshold,
  calculateProgressWithOverflow,
} from '@/config/gamificationConfig';

// ============================================
// Example 1: Default Configuration
// ============================================
console.log('=== Default Configuration ===');
console.log('Breakfast points:', ACTIVITY_POINTS.breakfast.basePoints); // 30
console.log('Diet target:', getThreshold('diet').targetPoints); // 100
console.log('Diet minimum:', getThreshold('diet').minPoints); // 60

// ============================================
// Example 2: Calculate Progress Examples
// ============================================
console.log('\n=== Progress Examples ===');

// Scenario 1: User completes 2 out of 3 meals (70/100 points)
const scenario1Progress = calculateProgressWithOverflow(70, 100);
console.log('70/100 points progress:', scenario1Progress); // 0.7 (70%)

// Scenario 2: User exceeds goal (130/100 points)
const scenario2Progress = calculateProgressWithOverflow(130, 100);
console.log('130/100 points progress:', scenario2Progress); // 1.3 (130%)

// Scenario 3: User doubles goal (200/100 points)
const scenario3Progress = calculateProgressWithOverflow(200, 100);
console.log('200/100 points progress:', scenario3Progress); // 2.0 (200% - max)

// ============================================
// Example 3: Dynamic Point Assignment
// ============================================
console.log('\n=== Dynamic Point Assignment ===');

// Example routine items from database
const routineItems = [
  { name: 'Greek Yogurt with Berries', type: 'breakfast', checked: true },
  { name: 'Grilled Chicken Salad', type: 'lunch', checked: true },
  { name: 'Salmon with Vegetables', type: 'dinner', checked: false },
  { name: 'Apple Slices', type: 'snack', checked: true },
];

let totalEarned = 0;
routineItems.forEach(item => {
  if (item.checked) {
    const points = getItemPoints(item.type, 'diet');
    totalEarned += points;
    console.log(`${item.name} (${item.type}): +${points} points`);
  }
});
console.log(`Total earned: ${totalEarned} points`);

// ============================================
// Example 4: Achievement Levels
// ============================================
console.log('\n=== Achievement Levels ===');

const achievementExamples = [
  { points: 30, label: 'Just started' },
  { points: 60, label: 'Reached minimum' },
  { points: 100, label: 'Goal completed!' },
  { points: 150, label: 'Overflow achievement!' },
];

achievementExamples.forEach(({ points, label }) => {
  const threshold = getThreshold('diet');
  let level = 'none';

  if (points >= threshold.targetPoints * 1.5) {
    level = 'overflow';
  } else if (points >= threshold.targetPoints) {
    level = 'complete';
  } else if (points >= threshold.minPoints) {
    level = 'minimum';
  }

  console.log(`${points} points (${label}): ${level}`);
});

// ============================================
// Example 5: Custom Configuration (Advanced)
// ============================================
console.log('\n=== Custom Configuration Example ===');

// For an athlete who needs higher nutrition goals
const athleteConfig = {
  diet: {
    targetPoints: 150, // Higher target
    minPoints: 100, // Higher minimum
    breakfast: 50, // More important meal
    lunch: 50,
    dinner: 50,
  },
  activity: {
    targetPoints: 200, // Much higher for athletes
    minPoints: 100,
    cardio: 80,
    strength: 70,
  },
};

console.log('Athlete diet target:', athleteConfig.diet.targetPoints);
console.log('Athlete activity target:', athleteConfig.activity.targetPoints);

// For a beginner starting their wellness journey
const beginnerConfig = {
  diet: {
    targetPoints: 80, // Lower target
    minPoints: 40, // Lower minimum
    breakfast: 30,
    lunch: 30,
    dinner: 20,
  },
  activity: {
    targetPoints: 60, // Much lower for beginners
    minPoints: 30,
    cardio: 20,
    strength: 15,
  },
};

console.log('Beginner diet target:', beginnerConfig.diet.targetPoints);
console.log('Beginner activity target:', beginnerConfig.activity.targetPoints);

// ============================================
// Example 6: Weekly Summary Calculation
// ============================================
console.log('\n=== Weekly Summary Example ===');

const weeklyData = [
  { day: 'Monday', diet: 95, activity: 80, supplement: 90 },
  { day: 'Tuesday', diet: 70, activity: 100, supplement: 75 },
  { day: 'Wednesday', diet: 100, activity: 120, supplement: 100 },
  { day: 'Thursday', diet: 85, activity: 90, supplement: 100 },
  { day: 'Friday', diet: 110, activity: 110, supplement: 100 },
  { day: 'Saturday', diet: 60, activity: 70, supplement: 50 },
  { day: 'Sunday', diet: 80, activity: 85, supplement: 90 },
];

const weeklyTotal = weeklyData.reduce(
  (acc, day) => ({
    diet: acc.diet + day.diet,
    activity: acc.activity + day.activity,
    supplement: acc.supplement + day.supplement,
  }),
  { diet: 0, activity: 0, supplement: 0 },
);

const weeklyAverage = {
  diet: Math.round(weeklyTotal.diet / 7),
  activity: Math.round(weeklyTotal.activity / 7),
  supplement: Math.round(weeklyTotal.supplement / 7),
};

console.log('Weekly totals:', weeklyTotal);
console.log('Daily averages:', weeklyAverage);

const dietThreshold = getThreshold('diet');
const dietCompletionRate = weeklyData.filter(
  day => day.diet >= dietThreshold.targetPoints,
).length;
console.log(`Diet goal completed ${dietCompletionRate}/7 days`);

// ============================================
// Example 7: Motivation Messages
// ============================================
console.log('\n=== Motivation Messages ===');

const getMotivationMessage = (points: number, target: number) => {
  const percentage = (points / target) * 100;

  if (percentage >= 150) {
    return `🎉 Incredible! ${points}/${target} points! You're crushing it!`;
  } else if (percentage >= 100) {
    return `✅ Perfect! ${points}/${target} points! Goal achieved!`;
  } else if (percentage >= 80) {
    return `💪 Almost there! ${points}/${target} points! Keep going!`;
  } else if (percentage >= 60) {
    return `👍 Good progress! ${points}/${target} points! You're on track!`;
  } else if (percentage >= 40) {
    return `🌱 You're getting started! ${points}/${target} points!`;
  } else {
    return `🚀 Let's begin! ${points}/${target} points so far!`;
  }
};

[30, 60, 85, 100, 130].forEach(points => {
  console.log(getMotivationMessage(points, 100));
});

// ============================================
// Example 8: Bonus Points & Multipliers
// ============================================
console.log('\n=== Bonus Points System Example ===');

// Example: Weekend multiplier
const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const applyMultiplier = (basePoints: number, date: Date) => {
  if (isWeekend(date)) {
    return basePoints * 1.5; // 50% bonus on weekends
  }
  return basePoints;
};

const testDate = new Date('2024-01-13'); // Saturday
const basePoints = 30;
const bonusPoints = applyMultiplier(basePoints, testDate);
console.log(`Base points: ${basePoints}`);
console.log(`Weekend bonus: ${bonusPoints} (${testDate.toDateString()})`);

// Example: Streak multiplier
const calculateStreakBonus = (currentPoints: number, streakDays: number) => {
  if (streakDays >= 30) return currentPoints * 1.3; // 30% bonus
  if (streakDays >= 14) return currentPoints * 1.2; // 20% bonus
  if (streakDays >= 7) return currentPoints * 1.1; // 10% bonus
  return currentPoints;
};

console.log('7-day streak bonus:', calculateStreakBonus(100, 7));
console.log('14-day streak bonus:', calculateStreakBonus(100, 14));
console.log('30-day streak bonus:', calculateStreakBonus(100, 30));

export {};
