import { Platform } from 'react-native';

export type PricingPeriod = 'one_week' | 'monthly' | 'yearly';

export interface PricingPeriodOption {
  id: PricingPeriod;
  label: string;
  value: number;
  discount?: number;
  planCount: number;
}

export type SubscriptionPlan = {
  id: (typeof SUBSCRIPTION_SKUS)[keyof typeof SUBSCRIPTION_SKUS];
  title: string;
  description: string;
  price: string;
  period: string;
  features: SubscriptionFeature[];
  isFree: boolean;
  popular: boolean;
  icon: string;
};

export interface SubscriptionFeature {
  icon: string;
  title: string;
  description: string;
}

export const SUBSCRIPTION_SKUS = {
  FREE_TRIAL: 'free_trial',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

export const IAP_CONFIG = Platform.select({
  ios: {
    FREE_TRIAL: 'HealthPulse_subscription_free',
    MONTHLY: 'HealthPulseesubscription20',
    YEARLY: 'HealthPulseesubscription_yearly',
  },
  android: {
    // FREE_TRIAL: 'free_trial_subscription',
    // MONTHLY: 'monthly_subscription',
    // YEARLY: 'yearly_subscription',
  },
});

export type SubscriptionSku = keyof typeof SUBSCRIPTION_SKUS;
export type SubscriptionSkuValue = (typeof SUBSCRIPTION_SKUS)[SubscriptionSku];

export const SUBSCRIPTIONS: SubscriptionPlan[] = [
  {
    id: SUBSCRIPTION_SKUS.FREE_TRIAL,
    title: 'Basic Health',
    description: 'Essential health tracking and basic AI analysis',
    price: '$0.00',
    period: 'Trial',
    features: [
      {
        icon: 'heart-pulse',
        title: 'Basic health metrics',
        description: 'Track steps, sleep, and heart rate',
      },
      {
        icon: 'brain',
        title: 'Limited AI analysis',
        description: 'Weekly health insights and trends',
      },
      {
        icon: 'history',
        title: '7-day data history',
        description: 'Access to your last 7 days of health data',
      },
      {
        icon: 'message',
        title: 'Community support',
        description: 'Access to community forums for help',
      },
    ],
    isFree: true,
    popular: false,
    icon: 'health',
  },
  {
    id: SUBSCRIPTION_SKUS.MONTHLY,
    title: 'Pro Health',
    description: 'Advanced health tracking and daily AI insights',
    price: '$19',
    period: 'month',
    features: [
      {
        icon: 'activity',
        title: 'Advanced metrics',
        description: 'Track 50+ health biomarkers and vitals',
      },
      {
        icon: 'robot',
        title: 'Daily AI analysis',
        description: 'Personalized health recommendations daily',
      },
      {
        icon: 'database',
        title: '90-day data history',
        description: 'Full access to your last 3 months of data',
      },
      {
        icon: 'headset',
        title: 'Priority support',
        description: '24-hour response time from health experts',
      },
      {
        icon: 'report',
        title: 'Monthly health reports',
        description: 'Detailed PDF reports of your health progress',
      },
    ],
    isFree: false,
    popular: true,
    icon: 'health-pro',
  },
  {
    id: SUBSCRIPTION_SKUS.YEARLY,
    title: 'Premium Health',
    description: 'Comprehensive health monitoring with real-time AI coaching',
    price: '$200.88',
    period: 'year',
    features: [
      {
        icon: 'monitor-heart',
        title: 'Higher chat and plan limit',
        description: 'Track all health metrics with medical-grade accuracy',
      },
      {
        icon: 'ai',
        title: 'AI analysis and deep insights',
        description: 'Instant feedback and health optimization tips',
      },
      {
        icon: 'history',
        title: 'Multi device integration',
        description: 'Full access to all your historical health data',
      },
      {
        icon: 'doctor',
        title: 'AI health vault',
        description: 'Direct access to health professionals',
      },
    ],
    isFree: false,
    popular: false,
    icon: 'health-premium',
  },
];
