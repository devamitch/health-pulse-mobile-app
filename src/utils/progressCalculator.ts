import {
  fetchDietRecordByDate,
  fetchSupplementRecordByDate,
  fetchActivitiesRecordByDate,
} from '@/services/sqlite/message';
import { ProgressItem } from '@/components/ProgressCard';

/**
 * Enhanced progress calculation with better error handling and real data fetching
 */
export const calculateProgressForDate = async (
  date: Date,
): Promise<{
  activity: ProgressItem;
  superfood: ProgressItem;
  supplement: ProgressItem;
  overallProgress: number;
}> => {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format

  try {
    // Fetch all routine records for the date
    const [gymRecords, superfoodRecords, supplementRecords] = await Promise.all(
      [
        fetchActivitiesRecordByDate(dateStr || ''),
        fetchDietRecordByDate(dateStr || ''),
        fetchSupplementRecordByDate(dateStr || ''),
      ],
    );

    // Calculate progress for each category
    const activityProgress = calculateCategoryProgress(gymRecords);
    const superfoodProgress = calculateCategoryProgress(superfoodRecords);
    const supplementProgress = calculateCategoryProgress(supplementRecords);

    const overallProgress =
      (activityProgress + superfoodProgress + supplementProgress) / 3;

    return {
      activity: {
        label: 'Evening Gym',
        progress: activityProgress,
        color: '#DC0014',
      },
      superfood: {
        label: 'Superfood',
        progress: superfoodProgress,
        color: '#4CAF50',
      },
      supplement: {
        label: 'Supplement',
        progress: supplementProgress,
        color: '#FEDD00',
      },
      overallProgress,
    };
  } catch (error) {
    console.error('Error calculating progress:', error);
    return {
      activity: { label: 'Evening Gym', progress: 0, color: '#DC0014' },
      superfood: { label: 'Superfood', progress: 0, color: '#4CAF50' },
      supplement: { label: 'Supplement', progress: 0, color: '#FEDD00' },
      overallProgress: 0,
    };
  }
};

/**
 * Calculate progress for a single category
 * Properly parses the routine_list JSON and counts checked items
 */
const calculateCategoryProgress = (records: any[]): number => {
  if (!records || records.length === 0) return 0;

  try {
    let totalItems = 0;
    let checkedItems = 0;

    for (const record of records) {
      try {
        // Parse the routine_list JSON string
        const routineList = JSON.parse(record.routine_list);

        if (Array.isArray(routineList) && routineList.length > 0) {
          totalItems += routineList.length;
          // Count items marked as checked
          checkedItems += routineList.filter(
            (item: any) => item.checked === true,
          ).length;
        }
      } catch (parseError) {
        console.warn('Failed to parse routine_list for record:', record);
        continue;
      }
    }

    if (totalItems === 0) return 0;

    const progress = checkedItems / totalItems;
    // Ensure progress is between 0 and 1
    return Math.min(Math.max(progress, 0), 1);
  } catch (error) {
    console.error('Error calculating category progress:', error);
    return 0;
  }
};

/**
 * Get progress items for display
 */
export const getProgressItems = (
  activityProgress: number,
  superfoodProgress: number,
  supplementProgress: number,
): ProgressItem[] => {
  return [
    {
      label: 'Evening Gym',
      progress: activityProgress,
      color: '#DC0014',
    },
    {
      label: 'Superfood',
      progress: superfoodProgress,
      color: '#4CAF50',
    },
    {
      label: 'Supplement',
      progress: supplementProgress,
      color: '#FEDD00',
    },
  ];
};
