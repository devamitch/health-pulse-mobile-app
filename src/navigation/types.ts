export type TaskCategory = 'activity' | 'diet' | 'stress';


import { SimplifiedTask } from '@/utils/gamification/game-plan-generator';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';

// Main Tab Navigator Types
export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Plan: undefined;
};


type ActivityScannerType = SimplifiedTask & {
  taskId: string;
  taskType: 'activity' | 'diet' | 'stress';
  taskName: string;
  duration?: number;
  videoUrl?: string;
  targetPose?: string;
  isPremium?: boolean;
};

// Home Stack Navigator Types
export type HomeStackParamList = {
  
  HomeMain: undefined;
  TasksView: undefined;
  Profile: undefined;
  RoadMap: undefined;
  Activity: ActivityScannerType;

  TaskDetail: {
    taskId: string;
    task: TaskData;
    category: TaskCategory;
  };
  CategoryTasks: {
    category: TaskCategory;
    tasks: TaskData[];
  };
};

// Root Stack (for modals and other screens)
export type RootStackParamList = {
  Main: undefined;
  ChatScreen: undefined;
  ProfileScreen: undefined;
  Notifications: undefined;
  QuizScreen: undefined;
  // ... other screens
};

// Combined Navigation Types
export type HomeMainScreenNavigationProp = CompositeNavigationProp
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<MainTabParamList, 'HomeStack'>
>;

export type TaskDetailScreenNavigationProp = CompositeNavigationProp
  NativeStackNavigationProp<HomeStackParamList, 'TaskDetail'>,
  BottomTabNavigationProp<MainTabParamList>
>;

export type CategoryTasksScreenNavigationProp = CompositeNavigationProp
  NativeStackNavigationProp<HomeStackParamList, 'CategoryTasks'>,
  BottomTabNavigationProp<MainTabParamList>
>;

// Route Props
export type HomeMainScreenRouteProp = RouteProp<HomeStackParamList, 'HomeMain'>;
export type TaskDetailScreenRouteProp = RouteProp<HomeStackParamList, 'TaskDetail'>;
export type CategoryTasksScreenRouteProp = RouteProp<HomeStackParamList, 'CategoryTasks'>;

// Task Category Types

export interface TaskCategoryConfig {
  id: TaskCategory;
  title: string;
  subtitle: string;
  color: string;
  backgroundColor: string;
  icon: React.ReactNode;
}

// Task Data Types
export interface TaskData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  xpReward: number;
  category: TaskCategory;
  backgroundColor: string;
  accentColor: string;
  illustration?: React.ReactNode;
  isCompleted: boolean;
  completedAt?: Date;
  steps?: TaskStep[];
  benefits?: string[];
  tips?: string[];
  relatedTasks?: string[];
  videoUrl?:string
}

export interface TaskStep {
  id: string;
  title: string;
  description: string;
  duration?: string;
  isCompleted: boolean;
}

// Quest Card Types
export interface QuestCardData {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  xpReward: number;
  category: TaskCategory;
  illustration: React.ReactNode;
  backgroundColor: string;
  accentColor: string;
}

export interface StackCardConfig {
  cardHeight: number;
  cardWidth: number;
  stackOffset: number;
  maxVisibleCards: number;
  swipeThreshold: number;
  rotationAngle: number;
}

// Shared Transition Types
export type SharedTransitionTag = `task-${string}` | `category-${string}`;

export interface SharedElementConfig {
  id: string;
  animation: 'move' | 'fade' | 'fade-in' | 'fade-out';
  resize?: 'auto' | 'clip' | 'none';
}

// Modal State Types
export interface ModalState {
  hasPermission: boolean;
  imageUri: string;
  isImageModalVisible: boolean;
  currentMetric: MetricReport;
  isMetricsModalVisible: boolean;
  isInfoModalVisible: boolean;
  isAddMetricModalVisible: boolean;
  customMetrics: Metrics[];
}

export interface Metrics {
  metric: string;
  value: string;
  unit: string;
}

export interface MetricReport {
  description?: string;
  success: boolean;
  metrics?: Metrics[];
  type?: string;
  message?: string;
}

// Combined Navigation Types
export type HomeMainScreenNavigationProp2 = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>,
  BottomTabNavigationProp<MainTabParamList, 'Home'>
>;

export type ActivityScannerScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'ActivityScanner'>,
  BottomTabNavigationProp<MainTabParamList>
>;

export type ActivityScannerScreenRouteProp = RouteProp<HomeStackParamList, 'ActivityScanner'>;