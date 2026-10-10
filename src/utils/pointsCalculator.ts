import {
  fetchDietRecordByDate,
  fetchSupplementRecordByDate,
  fetchActivitiesRecordByDate,
} from '@/services/sqlite/message';
import {
  getItemPoints,
  getThreshold,
  calculateProgressWithOverflow,
  DailyThreshold,
} from '@/config/gamificationConfig';
import moment from 'moment';

export interface PointsData {
  earnedPoints: number;
  targetPoints: number;
  progress: number; // 0-2 (supports overflow)
  completedItems: number;
  totalItems: number;
  achievementLevel: 'none' | 'minimum' | 'complete' | 'overflow';
}

export interface CategoryPointsResult {
  category: 'diet' | 'activity' | 'supplement';
  label: string;
  color: string;
  overflowColor: string;
  data: PointsData;
}

/**
 * Calculate points for all categories for a given date
 */
export const calculateDailyPoints = async (
  date: Date,
): Promise<{
  diet: CategoryPointsResult;
  activity: CategoryPointsResult;
  supplement: CategoryPointsResult;
  overallPoints: number;
  overallTarget: number;
}> => {
  const dateStr = moment(date).format('YYYY-MM-DD');

  try {
    // Fetch all routine records for the date
    const [activityRecords, dietRecords, supplementRecords] = await Promise.all(
      [
        fetchActivitiesRecordByDate(dateStr || ''),
        fetchDietRecordByDate(dateStr || ''),
        fetchSupplementRecordByDate(dateStr || ''),
      ],
    );

    // Calculate points for each category
    const dietData = await calculateCategoryPoints(dietRecords, 'diet');
    const activityData = await calculateCategoryPoints(
      activityRecords,
      'activity',
    );
    const supplementData = await calculateCategoryPoints(
      supplementRecords,
      'supplement',
    );

    // Get thresholds
    const dietThreshold = getThreshold('diet');
    const activityThreshold = getThreshold('activity');
    const supplementThreshold = getThreshold('supplement');

    const overallPoints =
      dietData.earnedPoints +
      activityData.earnedPoints +
      supplementData.earnedPoints;
    const overallTarget =
      dietThreshold.targetPoints +
      activityThreshold.targetPoints +
      supplementThreshold.targetPoints;

    return {
      diet: {
        category: 'diet',
        label: 'Superfood',
        color: dietThreshold.color,
        overflowColor: dietThreshold.overflowColor,
        data: dietData,
      },
      activity: {
        category: 'activity',
        label: 'Exercise',
        color: activityThreshold.color,
        overflowColor: activityThreshold.overflowColor,
        data: activityData,
      },
      supplement: {
        category: 'supplement',
        label: 'Supplement',
        color: supplementThreshold.color,
        overflowColor: supplementThreshold.overflowColor,
        data: supplementData,
      },
      overallPoints,
      overallTarget,
    };
  } catch (error) {
    console.error('Error calculating daily points:', error);
    const dietThreshold = getThreshold('diet');
    const activityThreshold = getThreshold('activity');
    const supplementThreshold = getThreshold('supplement');

    const emptyData: PointsData = {
      earnedPoints: 0,
      targetPoints: 0,
      progress: 0,
      completedItems: 0,
      totalItems: 0,
      achievementLevel: 'none',
    };

    return {
      diet: {
        category: 'diet',
        label: 'Superfood',
        color: dietThreshold.color,
        overflowColor: dietThreshold.overflowColor,
        data: { ...emptyData, targetPoints: dietThreshold.targetPoints },
      },
      activity: {
        category: 'activity',
        label: 'Exercise',
        color: activityThreshold.color,
        overflowColor: activityThreshold.overflowColor,
        data: { ...emptyData, targetPoints: activityThreshold.targetPoints },
      },
      supplement: {
        category: 'supplement',
        label: 'Supplement',
        color: supplementThreshold.color,
        overflowColor: supplementThreshold.overflowColor,
        data: { ...emptyData, targetPoints: supplementThreshold.targetPoints },
      },
      overallPoints: 0,
      overallTarget:
        dietThreshold.targetPoints +
        activityThreshold.targetPoints +
        supplementThreshold.targetPoints,
    };
  }
};

/**
 * Calculate points for a single category
 */
const calculateCategoryPoints = async (
  records: any[],
  category: 'diet' | 'activity' | 'supplement',
): Promise<PointsData> => {
  if (!records || records.length === 0) {
    const threshold = getThreshold(category);
    return {
      earnedPoints: 0,
      targetPoints: threshold.targetPoints,
      progress: 0,
      completedItems: 0,
      totalItems: 0,
      achievementLevel: 'none',
    };
  }

  try {
    let earnedPoints = 0;
    let totalItems = 0;
    let completedItems = 0;

    for (const record of records) {
      try {
        // Parse the routine_list JSON string
        const routineList = JSON.parse(record.routine_list);

        if (Array.isArray(routineList) && routineList.length > 0) {
          for (const item of routineList) {
            totalItems++;

            // Determine item type from the item data
            const itemType = item.type || item.name || 'default';
            const itemPoints = getItemPoints(itemType, category);

            if (item.checked) {
              earnedPoints += itemPoints;
              completedItems++;
            }
          }
        }
      } catch (parseError) {
        console.warn('Failed to parse routine_list for record:', record);
        continue;
      }
    }

    const threshold = getThreshold(category);
    const progress = calculateProgressWithOverflow(
      earnedPoints,
      threshold.targetPoints,
    );

    // Determine achievement level
    let achievementLevel: 'none' | 'minimum' | 'complete' | 'overflow' = 'none';
    if (earnedPoints >= threshold.targetPoints * 1.5) {
      achievementLevel = 'overflow';
    } else if (earnedPoints >= threshold.targetPoints) {
      achievementLevel = 'complete';
    } else if (earnedPoints >= threshold.minPoints) {
      achievementLevel = 'minimum';
    }

    return {
      earnedPoints,
      targetPoints: threshold.targetPoints,
      progress,
      completedItems,
      totalItems,
      achievementLevel,
    };
  } catch (error) {
    console.error(`Error calculating ${category} points:`, error);
    const threshold = getThreshold(category);
    return {
      earnedPoints: 0,
      targetPoints: threshold.targetPoints,
      progress: 0,
      completedItems: 0,
      totalItems: 0,
      achievementLevel: 'none',
    };
  }
};

/**
 * Format points display text
 */
export const formatPointsDisplay = (
  earnedPoints: number,
  targetPoints: number,
): string => {
  return `${Math.round(earnedPoints)}/${targetPoints}`;
};

/**
 * Get motivational message based on achievement level
 */
export const getMotivationalMessage = (
  achievementLevel: 'none' | 'minimum' | 'complete' | 'overflow',
  category: string,
): string => {
  switch (achievementLevel) {
    case 'overflow':
      return `🎉 Amazing! You exceeded your ${category} goal!`;
    case 'complete':
      return `✅ Great job! ${category} goal completed!`;
    case 'minimum':
      return `👍 Good progress on ${category}!`;
    case 'none':
      return `Let's get started with ${category}!`;
    default:
      return '';
  }
};

/**
 * Calculate streak (consecutive days of completing goals)
 * This can be extended with database storage
 */
export const calculateStreak = (
  completedDays: number,
  category: string,
): string => {
  if (completedDays === 0) {
    return `Start your ${category} streak today!`;
  }
  if (completedDays === 1) {
    return `🔥 1 day streak!`;
  }
  return `🔥 ${completedDays} days streak!`;
};
