import { SimplifiedTask } from '@/utils/gamification/game-plan-generator';
import { ColorScheme, ElevationScheme } from '../../../constants/theme';
import { DisclaimerSettings } from './user_slice';

export interface UserData {
  displayName: string | null;
  lastName?: string;
  email: string | null;
  emailVerified: boolean;
  phoneNumber: null | string;
  photoURL: null | string;
  providerId: string;
  uid: string;
  isMenstrualCycleTracked: boolean;
}

export interface UserState {
  token?: string;
  userData?: UserData;
  isLogin: boolean;
  paymentStatus: boolean;
  isLaunched: boolean;
  isSyncEnabled: boolean;
  sessionTime?: number;
  lastFetch?: Date;
  isNewUser?: boolean;
  disclaimerSettings: DisclaimerSettings;
  disclaimer?: boolean;
  fcmToken?: string;
  refreshToken?: string;
}

export interface Quiz {
  id: number;
  question: string;
  answer: any;
  questionTag: string;
  answerString: string;
}

export interface PriorityVital {
  title: string;
  metrics: {
    metric: string;
    unit?: string;
  }[];
}

export interface CategorisedPreferencesProps {
  Supplement: string[];
  Diet: string[];
  Activities: string[];
  Meditation: string[];
  Relaxation: string[];
}

export type PreferenceType = keyof CategorisedPreferencesProps;

export interface MessageData {
  pinYourStatus: string[];
  weeklyWorkoutPlan: { day: string; routine: string }[];
  messageCount: Record<string, { date: string; count: number }>;
  preferences: string[];
  quiz: Quiz[];
  prompt?: string | undefined;
  haptic_level: number;
  isPrefeencesOn: boolean;
  routineGeneratedAt: {
    diet?: string;
    supplement?: string;
    activities?: string;
    userPlan?: string;
  };
  prioritizedVitals?: PriorityVital[] | undefined;
  CategorisedPreferences?: CategorisedPreferencesProps;
}

export interface ThemeType {
  colorScheme: 'light' | 'dark' | 'system';
  elevationScheme: 'plain' | '3d' | 'ultra_3d';
  colors: ColorScheme;
  elevation: ElevationScheme;
}

export interface Message {
  role: 'user' | 'system';
  message: string;
  type?: 'loading_system'; // Add a type to differentiate loading messages
}

export interface Metrics {
  metric: string;
  value: string;
  unit: string;
}

export interface MetricReport {
  description: string;
  success: boolean;
  type?: string;
  metrics?: Metrics[];
  message?: string;
}

export interface Plan {
  topic: string;
  items: string[];
  time: string;
  notification_message: string;
}

export interface Routine {
  id?: number;
  date?: string;
  routine: string;
  routine_items: { item: string; checked: boolean }[];
  time: string;
  notification_message: string;
  notification_days: string[];
}

export interface RoutineRecord {
  date: string;
  routines: {
    routine: string;
    suggested_items: string[];
    done_items: string[];
  }[];
}

export interface MediaData {
  createdAt: string;
  fileName: string;
  fileUrl: string;
  other: string;
  updatedAt: string;
  __v: number;
  _id: string;
  title: string;
  description: string;
}

export interface NotificationData {
  _id: string;
  type: string;
  time: string;
  device_token: string;
  title: string;
  body: string;
  userId: string;
  channel: string;
  frequency: (0 | 1 | 2 | 3 | 4 | 5 | 6)[];
  status: string;
  sentAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type NotificationChannel =
  | 'morning'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'evening';

export interface NotificationItem {
  id: string;
  title: string;
  channel: NotificationChannel;
  time: string;
  enabled: boolean;
}

export interface NotificationState {
  notifications: NotificationItem[];
}

export type PlanMode = 'STANDARD' | 'RECOVERY' | 'HERO' | null;

export interface UserProfile {
  level: number;
  xp: number;
  xpToNextLevel: number;
  name: string;
}

export interface Scores {
  diet: number;
  activity: number;
  stress: number;
}

export interface ScoreHistory {
  date: string,
  average: number,
  scores: Scores,
  mode: PlanMode;
}

export interface DayRecord {
  date: string;
  mode: PlanMode;
  scores: Scores;
  logs: TaskInfo[];
  targets: {
    diet: number,
    activity: number,
    stress: number,
    metMinutes?: number,
    cleanMeals?: number,
    mindfulnessMin?: number,
  };
  boosterTaskCompleted: number,
}

export interface GameProfile {
  userProfile: UserProfile;
  history: ScoreHistory[];
  today: DayRecord;
  streak: number;
  todayPlan: null | GamePlan;
  levelInfo: UserProfile[];
  tasks: SimplifiedTask[];
  tasksGeneratedAt?: string;
}

export interface GamePlan{
  mode: PlanMode;
  message: string;
  focus: string;
}

export interface TaskInfo{
  id: string | number,
  type: string,
  category: 'diet' | 'activity' | 'stress',
  points: number,
}