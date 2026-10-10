/**
 * Comprehensive Goal to Metrics Mapping
 *
 * This file defines the relationship between health goals and their associated
 * metrics/vitals that need to be tracked. Each goal has specific metrics that
 * help measure progress towards achieving that goal.
 */

export interface MetricConfig {
  /** Metric identifier */
  key: string;
  /** Display label for the metric */
  label: string;
  /** Source screen or data type */
  source: 'diet' | 'activity' | 'supplement' | 'vital' | 'sleep';
  /** Color for progress visualization */
  color: string;
  /** Unit of measurement (if applicable) */
  unit?: string;
  /** Vital type name (for vital metrics) */
  vitalType?: string;
  /** Target value or range (optional) */
  target?: number;
  /** Icon name or component (optional) */
  icon?: string;
}

export interface GoalMetricsConfig {
  /** Goal key identifier */
  goalKey: string;
  /** Display name for the goal */
  goalName: string;
  /** List of metrics to track for this goal */
  metrics: MetricConfig[];
  /** Priority order (1-9, lower is higher priority) */
  priority: number;
}

/**
 * Comprehensive mapping of all goals to their associated metrics
 */
export const GOAL_METRICS_MAPPING: Record<string, GoalMetricsConfig> = {
  'stress management': {
    goalKey: 'stress management',
    goalName: 'Stress Management',
    priority: 6,
    metrics: [
      {
        key: 'superfood',
        label: 'Superfood Diet',
        source: 'diet',
        color: '#4CAF50',
        icon: 'food',
      },
      {
        key: 'activity',
        label: 'Exercise',
        source: 'activity',
        color: '#DC0014',
        unit: 'minutes',
        icon: 'workout',
      },
      {
        key: 'supplement',
        label: 'Supplements',
        source: 'supplement',
        color: '#FEDD00',
        icon: 'medicine',
      },
      {
        key: 'sleep',
        label: 'Sleep Quality',
        source: 'sleep',
        vitalType: 'Sleep Health',
        color: '#7A47C3',
        unit: '%',
        target: 85,
        icon: 'sleep',
      },
      {
        key: 'hrv',
        label: 'HRV',
        source: 'vital',
        vitalType: 'Heart Rate Variablity',
        color: '#FF6B6B',
        unit: 'ms',
        icon: 'heart',
      },
    ],
  },
  'weigth loss': {
    goalKey: 'weigth loss',
    goalName: 'Healthy Weight Loss',
    priority: 4,
    metrics: [
      {
        key: 'superfood',
        label: 'Superfood Diet',
        source: 'diet',
        color: '#4CAF50',
        icon: 'food',
      },
      {
        key: 'activity',
        label: 'Exercise',
        source: 'activity',
        color: '#DC0014',
        unit: 'minutes',
        icon: 'workout',
      },
      {
        key: 'weight',
        label: 'Body Weight',
        source: 'vital',
        vitalType: 'Body Composition',
        color: '#FF9800',
        unit: 'kgs',
        icon: 'weight',
      },
      {
        key: 'calories',
        label: 'Calorie Balance',
        source: 'vital',
        vitalType: 'Calories',
        color: '#FFC107',
        unit: 'cal',
        icon: 'flame',
      },
      {
        key: 'walking',
        label: 'Walking',
        source: 'vital',
        vitalType: 'Fitness',
        color: '#8BC34A',
        unit: 'km',
        icon: 'walk',
      },
    ],
  },
  'improve fitness': {
    goalKey: 'improve fitness',
    goalName: 'Improve Fitness',
    priority: 8,
    metrics: [
      {
        key: 'activity',
        label: 'Exercise',
        source: 'activity',
        color: '#DC0014',
        unit: 'minutes',
        icon: 'workout',
      },
      {
        key: 'vo2max',
        label: 'VO2 Max',
        source: 'vital',
        vitalType: 'Fitness',
        color: '#2196F3',
        icon: 'lungs',
      },
      {
        key: 'heart_rate',
        label: 'Heart Rate',
        source: 'vital',
        vitalType: 'Heart Health',
        color: '#E91E63',
        unit: 'bpm',
        icon: 'heart',
      },
      {
        key: 'sleep',
        label: 'Recovery',
        source: 'sleep',
        vitalType: 'Sleep Health',
        color: '#7A47C3',
        unit: '%',
        icon: 'sleep',
      },
    ],
  },
  'build muscle': {
    goalKey: 'build muscle',
    goalName: 'Build Muscle',
    priority: 9,
    metrics: [
      {
        key: 'activity',
        label: 'Strength Training',
        source: 'activity',
        color: '#DC0014',
        unit: 'minutes',
        icon: 'workout',
      },
      {
        key: 'weight',
        label: 'Body Weight',
        source: 'vital',
        vitalType: 'Body Composition',
        color: '#FF9800',
        unit: 'kgs',
        icon: 'weight',
      },
      {
        key: 'calories',
        label: 'Calorie Intake',
        source: 'vital',
        vitalType: 'Calories',
        color: '#FFC107',
        unit: 'cal',
        icon: 'flame',
      },
      {
        key: 'supplement',
        label: 'Protein & Supplements',
        source: 'supplement',
        color: '#FEDD00',
        icon: 'medicine',
      },
    ],
  },
  'increase heart health': {
    goalKey: 'increase heart health',
    goalName: 'Improve Heart Health',
    priority: 2,
    metrics: [
      {
        key: 'heart_rate',
        label: 'Heart Rate',
        source: 'vital',
        vitalType: 'Heart Health',
        color: '#E91E63',
        unit: 'bpm',
        icon: 'heart',
      },
      {
        key: 'hrv',
        label: 'HRV',
        source: 'vital',
        vitalType: 'Heart Rate Variablity',
        color: '#FF6B6B',
        unit: 'ms',
        icon: 'heart',
      },
      {
        key: 'bp',
        label: 'Blood Pressure',
        source: 'vital',
        vitalType: 'BP',
        color: '#9C27B0',
        unit: 'mmHg',
        icon: 'blood-pressure',
      },
      {
        key: 'activity',
        label: 'Cardio Exercise',
        source: 'activity',
        color: '#DC0014',
        unit: 'minutes',
        icon: 'workout',
      },
      {
        key: 'superfood',
        label: 'Heart-Healthy Diet',
        source: 'diet',
        color: '#4CAF50',
        icon: 'food',
      },
    ],
  },
  'improve meatabolic health': {
    goalKey: 'improve meatabolic health',
    goalName: 'Improve Metabolic Health',
    priority: 3,
    metrics: [
      {
        key: 'heart_rate',
        label: 'Resting Heart Rate',
        source: 'vital',
        vitalType: 'Heart Health',
        color: '#E91E63',
        unit: 'bpm',
        icon: 'heart',
      },
      {
        key: 'superfood',
        label: 'Balanced Diet',
        source: 'diet',
        color: '#4CAF50',
        icon: 'food',
      },
      {
        key: 'activity',
        label: 'Physical Activity',
        source: 'activity',
        color: '#DC0014',
        unit: 'minutes',
        icon: 'workout',
      },
      {
        key: 'sleep',
        label: 'Sleep Quality',
        source: 'sleep',
        vitalType: 'Sleep Health',
        color: '#7A47C3',
        unit: '%',
        icon: 'sleep',
      },
    ],
  },
  'recover from cancer': {
    goalKey: 'recover from cancer',
    goalName: 'Cancer Recovery',
    priority: 1,
    metrics: [
      {
        key: 'superfood',
        label: 'Nutrition',
        source: 'diet',
        color: '#4CAF50',
        icon: 'food',
      },
      {
        key: 'activity',
        label: 'Light Exercise',
        source: 'activity',
        color: '#DC0014',
        unit: 'minutes',
        icon: 'workout',
      },
      {
        key: 'sleep',
        label: 'Rest & Recovery',
        source: 'sleep',
        vitalType: 'Sleep Health',
        color: '#7A47C3',
        unit: '%',
        icon: 'sleep',
      },
      {
        key: 'supplement',
        label: 'Medical Supplements',
        source: 'supplement',
        color: '#FEDD00',
        icon: 'medicine',
      },
    ],
  },
  longevity: {
    goalKey: 'longevity',
    goalName: 'Longevity',
    priority: 5,
    metrics: [
      {
        key: 'superfood',
        label: 'Nutrient-Rich Diet',
        source: 'diet',
        color: '#4CAF50',
        icon: 'food',
      },
      {
        key: 'activity',
        label: 'Regular Exercise',
        source: 'activity',
        color: '#DC0014',
        unit: 'minutes',
        icon: 'workout',
      },
      {
        key: 'supplement',
        label: 'Longevity Supplements',
        source: 'supplement',
        color: '#FEDD00',
        icon: 'medicine',
      },
      {
        key: 'heart_health',
        label: 'Cardiovascular Health',
        source: 'vital',
        vitalType: 'Heart Health',
        color: '#E91E63',
        unit: 'bpm',
        icon: 'heart',
      },
      {
        key: 'sleep',
        label: 'Quality Sleep',
        source: 'sleep',
        vitalType: 'Sleep Health',
        color: '#7A47C3',
        unit: '%',
        icon: 'sleep',
      },
    ],
  },
  'improve sleep': {
    goalKey: 'improve sleep',
    goalName: 'Improve Sleep',
    priority: 7,
    metrics: [
      {
        key: 'sleep_duration',
        label: 'Sleep Duration',
        source: 'sleep',
        vitalType: 'Sleep Health',
        color: '#7A47C3',
        unit: 'hours',
        target: 8,
        icon: 'sleep',
      },
      {
        key: 'sleep_efficiency',
        label: 'Sleep Efficiency',
        source: 'sleep',
        vitalType: 'Sleep Efficiency',
        color: '#9575CD',
        unit: '%',
        target: 85,
        icon: 'sleep',
      },
      {
        key: 'sleep_interruptions',
        label: 'Sleep Quality',
        source: 'sleep',
        vitalType: 'Sleep Interruptions',
        color: '#B39DDB',
        icon: 'sleep',
      },
      {
        key: 'activity',
        label: 'Exercise',
        source: 'activity',
        color: '#DC0014',
        unit: 'minutes',
        icon: 'workout',
      },
    ],
  },
};

/**
 * Get metrics for specific goals
 * @param goals - Array of goal keys
 * @returns Combined array of unique metrics
 */
export const getMetricsForGoals = (goals: string[]): MetricConfig[] => {
  const metricsMap = new Map<string, MetricConfig>();

  goals.forEach(goal => {
    const goalConfig = GOAL_METRICS_MAPPING[goal];
    if (goalConfig) {
      goalConfig.metrics.forEach(metric => {
        // Use metric key as unique identifier
        if (!metricsMap.has(metric.key)) {
          metricsMap.set(metric.key, metric);
        }
      });
    }
  });

  return Array.from(metricsMap.values());
};

/**
 * Get all unique metric sources for given goals
 * @param goals - Array of goal keys
 * @returns Array of unique sources
 */
export const getSourcesForGoals = (
  goals: string[],
): Array<'diet' | 'activity' | 'supplement' | 'vital' | 'sleep'> => {
  const sources = new Set<
    'diet' | 'activity' | 'supplement' | 'vital' | 'sleep'
  >();

  goals.forEach(goal => {
    const goalConfig = GOAL_METRICS_MAPPING[goal];
    if (goalConfig) {
      goalConfig.metrics.forEach(metric => {
        sources.add(metric.source);
      });
    }
  });

  return Array.from(sources);
};

/**
 * Check if a goal requires tracking a specific metric
 * @param goal - Goal key
 * @param metricKey - Metric key to check
 * @returns true if the goal includes this metric
 */
export const doesGoalRequireMetric = (
  goal: string,
  metricKey: string,
): boolean => {
  const goalConfig = GOAL_METRICS_MAPPING[goal];
  if (!goalConfig) return false;

  return goalConfig.metrics.some(metric => metric.key === metricKey);
};

/**
 * Get display color for a metric
 * @param metricKey - Metric key
 * @returns Color hex string
 */
export const getMetricColor = (metricKey: string): string => {
  // Search through all goals to find the metric
  for (const goalConfig of Object.values(GOAL_METRICS_MAPPING)) {
    const metric = goalConfig.metrics.find(m => m.key === metricKey);
    if (metric) return metric.color;
  }
  return '#888888'; // Default gray
};
