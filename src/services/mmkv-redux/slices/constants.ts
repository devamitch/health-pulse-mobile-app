import { PriorityVital } from './interfaces';

export const prioritizingVitals: Record<number, PriorityVital[]> = {
  1: [
    {
      title: 'Sleep Health',
      metrics: [{ metric: 'Efficiency', unit: '%' }],
    },
    {
      title: 'Calories',
      metrics: [
        { metric: 'Burned', unit: 'cal' },
        { metric: 'Intake', unit: 'cal' },
      ],
    },
    {
      title: 'Temperature',
      metrics: [{ metric: 'Temperature', unit: '°C' }],
    },
  ],
  2: [
    {
      title: 'Heart Rate',
      metrics: [{ metric: 'HR', unit: 'bpm' }],
    },
    {
      title: 'Heart Rate Variablity',
      metrics: [{ metric: 'HRV', unit: 'ms' }],
    },
    {
      title: 'BP',
      metrics: [
        { metric: 'SYS', unit: 'mmHg' },
        { metric: 'DIA', unit: 'mmHg' },
      ],
    },
  ],
  3: [
    {
      title: 'Body Composition',
      metrics: [{ metric: 'BMI' }],
    },
    {
      title: 'Heart Health',
      metrics: [{ metric: 'HR', unit: 'bpm' }],
    },
    {
      title: 'Calories',
      metrics: [
        { metric: 'Burned', unit: 'cal' },
        { metric: 'Intake', unit: 'cal' },
      ],
    },
  ],
  4: [
    {
      title: 'Body Composition',
      metrics: [{ metric: 'Weight', unit: 'kgs' }],
    },
    {
      title: 'Calories',
      metrics: [
        { metric: 'Burned', unit: 'cal' },
        { metric: 'Intake', unit: 'cal' },
      ],
    },
    {
      title: 'Fitness',
      metrics: [{ metric: 'Walking', unit: 'km' }],
    },
  ],
  5: [
    {
      title: 'Heart Health',
      metrics: [{ metric: 'HR', unit: 'bpm' }],
    },
    {
      title: 'Fitness',
      metrics: [{ metric: 'VO2 Max' }],
    },
    {
      title: 'Sleep Health',
      metrics: [{ metric: 'Efficiency', unit: '%' }],
    },
  ],
  6: [
    {
      title: 'Heart Health',
      metrics: [{ metric: 'HRV', unit: 'ms' }],
    },
    {
      title: 'Sleep Health',
      metrics: [{ metric: 'Duration', unit: 'minutes' }],
    },
    {
      title: 'Temperature',
      metrics: [{ metric: 'Temperature', unit: '°C' }],
    },
  ],
  7: [
    {
      title: 'Sleep Health',
      metrics: [{ metric: 'Duration', unit: 'minutes' }],
    },
    {
      title: 'Sleep Efficiency',
      metrics: [{ metric: 'Efficiency', unit: '%' }],
    },
    {
      title: 'Sleep Interruptions',
      metrics: [{ metric: 'Interruptions' }],
    },
  ],
  8: [
    {
      title: 'Fitness',
      metrics: [{ metric: 'VO2 Max' }],
    },
    {
      title: 'Heart Health',
      metrics: [{ metric: 'HR', unit: 'bpm' }],
    },
    {
      title: 'Activity',
      metrics: [{ metric: 'Duration', unit: 'minutes' }],
    },
  ],
  9: [
    {
      title: 'Body Composition',
      metrics: [{ metric: 'Weight', unit: 'kgs' }],
    },
    {
      title: 'Calories',
      metrics: [
        { metric: 'Burned', unit: 'cal' },
        { metric: 'Intake', unit: 'cal' },
      ],
    },
    {
      title: 'Fitness',
      metrics: [{ metric: 'Walking', unit: 'km' }],
    },
  ],
};

export const goalToMetrics: Record<string, string[]> = {
  'stress management': ['superfood', 'activity', 'supplement', 'sleep'],
  'weigth loss': ['superfood', 'activity', 'weight', 'calories'],
  'improve fitness': ['activity', 'fitness'],
  'build muscle': ['activity', 'weight', 'calories'],
  'increase heart health': ['heart_health', 'BP'],
  'improve meatabolic health': ['heart_health'],
  'recover from cancer': ['superfood', 'activity', 'sleep'],
  longevity: ['superfood', 'activity', 'supplement', 'heart_health', 'sleep'],
  'improve sleep': ['sleep'],
};
