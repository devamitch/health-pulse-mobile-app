export type TabType = 'plans' | 'features' | 'faq';

export interface PricingPeriod {
  id: string;
  label: string;
  value: number | 'forever';
  discount?: number;
}

export interface SubscriptionPlan {
  id: string;
  title: string;
  description?: string;
  price: string;
  priceDisplay: string;
  period: string;
  features: string[];
  isFree: boolean;
  popular?: boolean;
  color?: string;
  gradientColors?: string[];
  icon?: string;
  priceValue?: number;
}

export interface Testimonial {
  text: string;
  author: string;
  image: string;
  rating: number;
}

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

export interface FeatureHighlight {
  title: string;
  description: string;
  image: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
}
