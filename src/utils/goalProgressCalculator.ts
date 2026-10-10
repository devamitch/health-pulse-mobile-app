import moment from 'moment';
import {
  fetchDietRecordByDate,
  fetchSupplementRecordByDate,
  fetchActivitiesRecordByDate,
} from '@/services/sqlite/message';
import { Vital } from '@/services/sqlite/interface';
import { MetricConfig } from '@/config/goalMetricsMapping';
import { GoalProgressData } from '@/components/GoalProgressCard';

/**
 * Calculate progress for a single metric based on its source
 */
export const calculateMetricProgress = async (
  metric: MetricConfig,
  vitals: Vital[],
  date: Date = new Date(),
): Promise<GoalProgressData> => {
  const dateStr = moment(date).format('YYYY-MM-DD');

  let progress = 0;
  let currentValue: string | number | undefined;
  let targetValue: string | number | undefined = metric.target;

  try {
    switch (metric.source) {
      case 'diet':
        progress = await calculateDietProgress(dateStr);
        break;

      case 'activity':
        progress = await calculateActivityProgress(dateStr);
        break;

      case 'supplement':
        progress = await calculateSupplementProgress(dateStr);
        break;

      case 'sleep':
      case 'vital':
        const vitalData = calculateVitalProgress(metric, vitals);
        progress = vitalData.progress;
        currentValue = vitalData.currentValue;
        break;

      default:
        progress = 0;
    }
  } catch (error) {
    console.error(`Error calculating progress for ${metric.key}:`, error);
    progress = 0;
  }

  return {
    metric,
    progress: Math.max(0, Math.min(1, progress)),
    currentValue: currentValue ?? undefined,
    targetValue: targetValue ?? undefined,
  };
};

/**
 * Calculate progress for all metrics in a list
 */
export const calculateGoalMetricsProgress = async (
  metrics: MetricConfig[],
  vitals: Vital[],
  date: Date = new Date(),
): Promise<GoalProgressData[]> => {
  // Check if supplements exist in the plan
  const dateStr = moment(date).format('YYYY-MM-DD');
  const supplementRecords = await fetchSupplementRecordByDate(dateStr);
  const hasSupplements = supplementRecords && supplementRecords.length > 0;

  // Filter out supplement metrics if no supplements have been added
  const filteredMetrics = hasSupplements
    ? metrics
    : metrics.filter(metric => metric.source !== 'supplement');

  const progressPromises = filteredMetrics.map(metric =>
    calculateMetricProgress(metric, vitals, date),
  );

  return await Promise.all(progressPromises);
};

/**
 * Calculate diet/superfood progress
 */
const calculateDietProgress = async (dateStr: string): Promise<number> => {
  try {
    const dietRecords = await fetchDietRecordByDate(dateStr);
    if (!dietRecords || dietRecords.length === 0) return 0;

    let totalItems = 0;
    let checkedItems = 0;

    for (const record of dietRecords) {
      try {
        const routineList = JSON.parse(record.routine_list);
        if (Array.isArray(routineList) && routineList.length > 0) {
          totalItems += routineList.length;
          checkedItems += routineList.filter(
            (item: any) => item.checked === true,
          ).length;
        }
      } catch (parseError) {
        console.warn('Failed to parse diet routine_list:', parseError);
      }
    }

    return totalItems > 0 ? checkedItems / totalItems : 0;
  } catch (error) {
    console.error('Error calculating diet progress:', error);
    return 0;
  }
};

/**
 * Calculate activity/exercise progress
 */
const calculateActivityProgress = async (dateStr: string): Promise<number> => {
  try {
    const activityRecords = await fetchActivitiesRecordByDate(dateStr);
    if (!activityRecords || activityRecords.length === 0) return 0;

    let totalItems = 0;
    let checkedItems = 0;

    for (const record of activityRecords) {
      try {
        const routineList = JSON.parse(record.routine_list);
        if (Array.isArray(routineList) && routineList.length > 0) {
          totalItems += routineList.length;
          checkedItems += routineList.filter(
            (item: any) => item.checked === true,
          ).length;
        }
      } catch (parseError) {
        console.warn('Failed to parse activity routine_list:', parseError);
      }
    }

    return totalItems > 0 ? checkedItems / totalItems : 0;
  } catch (error) {
    console.error('Error calculating activity progress:', error);
    return 0;
  }
};

/**
 * Calculate supplement progress
 */
const calculateSupplementProgress = async (
  dateStr: string,
): Promise<number> => {
  try {
    const supplementRecords = await fetchSupplementRecordByDate(dateStr);
    if (!supplementRecords || supplementRecords.length === 0) return 0;

    let totalItems = 0;
    let checkedItems = 0;

    for (const record of supplementRecords) {
      try {
        const routineList = JSON.parse(record.routine_list);
        if (Array.isArray(routineList) && routineList.length > 0) {
          totalItems += routineList.length;
          checkedItems += routineList.filter(
            (item: any) => item.checked === true,
          ).length;
        }
      } catch (parseError) {
        console.warn('Failed to parse supplement routine_list:', parseError);
      }
    }

    return totalItems > 0 ? checkedItems / totalItems : 0;
  } catch (error) {
    console.error('Error calculating supplement progress:', error);
    return 0;
  }
};

/**
 * Calculate vital-based progress (including sleep)
 */
const calculateVitalProgress = (
  metric: MetricConfig,
  vitals: Vital[],
): { progress: number; currentValue?: string | number } => {
  try {
    // Find the vital matching this metric
    const vital = vitals.find(v => {
      if (!v.type) return false;

      // Direct match
      if (v.type === metric.vitalType) return true;

      // Partial match for sleep metrics
      if (metric.source === 'sleep' && v.type.toLowerCase().includes('sleep')) {
        return true;
      }

      // Match by metric key patterns
      if (metric.key === 'heart_rate' && v.type.includes('Heart')) {
        return v.type === 'Heart Health' || v.type === 'HR';
      }

      if (metric.key === 'hrv' && v.type.includes('Variability')) {
        return true;
      }

      if (metric.key === 'weight' && v.type.includes('Composition')) {
        return true;
      }

      if (metric.key === 'calories' && v.type === 'Calories') {
        return true;
      }

      return false;
    });

    if (!vital || !vital.value) {
      return { progress: 0 };
    }

    const value = parseFloat(vital.value);
    if (isNaN(value)) {
      return { progress: 0, currentValue: vital.value };
    }

    // Calculate progress based on metric type
    let progress = 0;

    if (metric.target) {
      // If there's a target, calculate progress towards it
      progress = Math.min(value / metric.target, 1);
    } else if (metric.source === 'sleep') {
      // Sleep efficiency is already a percentage (0-100)
      progress = value / 100;
    } else if (metric.key === 'heart_rate') {
      // Heart rate: ideal range is 60-100 bpm, closer to 60 is better
      // Normalize to 0-1 scale
      if (value >= 60 && value <= 100) {
        progress = 1 - (value - 60) / 40; // 60 bpm = 1.0, 100 bpm = 0.0
      } else if (value < 60) {
        progress = 1; // Below 60 is excellent
      } else {
        progress = Math.max(0, 1 - (value - 100) / 100); // Above 100 decreases
      }
    } else if (metric.key === 'hrv') {
      // HRV: higher is better, typical range 20-200ms
      // Normalize to 0-1 scale
      progress = Math.min(value / 100, 1);
    } else if (metric.key === 'bp') {
      // Blood pressure: parse systolic/diastolic
      const bpParts = vital.value.split('/');
      if (bpParts.length === 2 && bpParts[0] && bpParts[1]) {
        const systolic = parseFloat(bpParts[0]);
        const diastolic = parseFloat(bpParts[1]);

        // Ideal: 120/80, normalize based on distance from ideal
        const systolicScore =
          systolic >= 90 && systolic <= 120
            ? 1
            : Math.max(0, 1 - Math.abs(systolic - 120) / 60);
        const diastolicScore =
          diastolic >= 60 && diastolic <= 80
            ? 1
            : Math.max(0, 1 - Math.abs(diastolic - 80) / 40);

        progress = (systolicScore + diastolicScore) / 2;
      }
    } else {
      // Default: assume the value itself is a progress indicator (0-1 or 0-100)
      progress = value > 1 ? value / 100 : value;
    }

    return {
      progress: Math.max(0, Math.min(1, progress)),
      currentValue: vital.value,
    };
  } catch (error) {
    console.error('Error calculating vital progress:', error);
    return { progress: 0 };
  }
};

/**
 * Get progress color based on value
 */
export const getProgressColor = (progress: number): string => {
  if (progress >= 0.8) return '#4CAF50'; // Green - Excellent
  if (progress >= 0.6) return '#8BC34A'; // Light Green - Good
  if (progress >= 0.4) return '#FFC107'; // Yellow - Fair
  if (progress >= 0.2) return '#FF9800'; // Orange - Needs improvement
  return '#F44336'; // Red - Poor
};
