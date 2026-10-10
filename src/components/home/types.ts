import { SimplifiedTask } from '@/utils/gamification/game-plan-generator';
import { ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';

export interface CategoryPillData {
  id: string;
  label: string;
  icon: ReactNode;
  color: string;
  backgroundColor: string;
  taskCount: number;
}
export interface TaskCardData {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  buttonText: string;
  image: any; // ImageSourcePropType
  accentColor: string;
  completed?: boolean;
  progress?: number;
  category: 'mind' | 'power' | 'fuel' | 'calm';
  relatedTasks?: string[]; // Task IDs related to this quest
  task?: SimplifiedTask;
}

export interface StackCardConfig {
  cardHeight: number;
  cardWidth: number;
  stackOffset: number;
  maxVisibleCards: number;
  swipeThreshold: number;
  rotationAngle: number;
}

export interface TaskCardData {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  buttonText: string;
  image: ImageSourcePropType;
  accentColor: string;
  category: 'activity' | 'diet' | 'stress';
  completed?: boolean;
}
