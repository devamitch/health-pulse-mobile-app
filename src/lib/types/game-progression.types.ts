// ============================================================================
// GAME PROGRESSION TYPE SYSTEM
// ============================================================================

export type TaskAction =
  | 'capture_photo'
  | 'watch_video'
  | 'timer'
  | 'log_journal'
  | 'log_record';
export type TaskCategory = 'diet' | 'activity' | 'stress';
export type GameMode = 'recovery' | 'standard' | 'hero' | 'rehab';
export type TimerStatus =
  | 'idle'
  | 'active'
  | 'paused'
  | 'completed'
  | 'expired';
export type AgeRange =
  | '13-17'
  | '18-24'
  | '25-34'
  | '35-44'
  | '45-54'
  | '55-64'
  | '65+';
export type FitnessLevel =
  | 'beginner'
  | 'building'
  | 'intermediate'
  | 'advanced'
  | 'elite';
export type OnboardingStep =
  | 'not_started'
  | 'age_selected'
  | 'fitness_selected'
  | 'health_selected'
  | 'diet_selected'
  | 'goals_selected'
  | 'assessment_done'
  | 'completed';

// ============================================================================
// SAFE NUMBER UTILITY
// ============================================================================
export function safeNumber(val: any, fallback: number = 0): number {
  if (
    val === null ||
    val === undefined ||
    val === '' ||
    typeof val === 'boolean'
  )
    return fallback;
  const n = Number(val);
  return isNaN(n) || !isFinite(n) ? fallback : n;
}

// ============================================================================
// SCORES & TARGETS
// ============================================================================
export interface DayScores {
  diet: number;
  activity: number;
  stress: number;
}
export interface DayTargets {
  diet: number;
  activity: number;
  stress: number;
  metMinutes?: number;
  cleanMeals?: number;
  mindfulnessMin?: number;
}

// ============================================================================
// MACROS
// ============================================================================
export interface MacroData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

// ============================================================================
// AI VALIDATION
// ============================================================================
export interface AIValidationResult {
  isValid: boolean;
  confidence: number;
  detectedItems: string[];
  suggestions: string[];
  macros?: MacroData;
  feedback?: string;
  timestamp?: number;
}

// ============================================================================
// TASK PROOF (photo, timer, video, journal)
// ============================================================================
export interface TaskProof {
  type: 'photo' | 'timer' | 'manual' | 'video' | 'journal';
  uri?: string;
  thumbnailUri?: string;
  aiAnalysis?: AIValidationResult;
  macros?: MacroData;
  playDuration?: number;
  completionPercentage?: number;
  journalText?: string;
  submittedAt: number;
}

// ============================================================================
// TIMER — supports multiple concurrent timers
// ============================================================================
export interface TimerState {
  taskId: string;
  taskTitle: string;
  taskCategory: TaskCategory;
  startedAt: number;
  targetSeconds: number;
  status: TimerStatus;
  totalPausedTime: number;
  pausedAt?: number;
  lastForegroundAt: number;
}

/** Map of taskId → TimerState for concurrent timers */
export type ActiveTimersMap = Record<string, TimerState>;

/** Expired timer info — computed when app comes to foreground */
export interface ExpiredTimerInfo {
  taskId: string;
  taskTitle: string;
  taskCategory: TaskCategory;
  targetSeconds: number;
  elapsedSeconds: number;
  expiredAt: number;
}

/** User's decision for an expired timer */
export type ExpiredTimerAction = 'mark_done' | 'restart' | 'replace' | 'skip';

// ============================================================================
// GAME TASK
// ============================================================================
export interface GameTask {
  title: string;
  description?: string;
  coins: number;
  color?: string;
  category: TaskCategory;
  id: string;
  isDone: boolean;
  timings: string[];
  action: TaskAction;
  seconds?: number;
  videoUrl?: string;
  videoThumbnail?: string;
  videoId?: string;
  videoTitle?: string;
  xp?: number;
  points?: number;
  status?:
    | 'available'
    | 'in_progress'
    | 'completed'
    | 'failed'
    | 'waiting_completion'
    | 'skipped';
  startedAt?: number;
  completedAt?: number;
  failedReason?: string;
  proof?: TaskProof;
  generationReason?:
    | 'morning'
    | 'evening_booster'
    | 'onboarding'
    | 'recovery'
    | 'smart_reset'
    | 'booster'
    | 'replacement';
  scheduledFor?: 'morning' | 'evening';
  personalizedFor?: string;
  difficultyScore?: number;
}

// ============================================================================
// TASK LOG ENTRY
// ============================================================================
export interface TaskLogEntry {
  id: number;
  type: string;
  category: TaskCategory;
  points: number;
  completedAt: number;
  taskId?: string;
  proof?: TaskProof;
}

// ============================================================================
// USER PROFILE
// ============================================================================
export interface UserProfile {
  level: number;
  xp: number;
  xpToNextLevel: number;
  name: string;
  totalXP?: number;
  totalDaysPlaying?: number;
  daysAtCurrentLevel?: number;
  badges?: string[];
}

// ============================================================================
// USER IDENTITY
// ============================================================================
export interface UserIdentity {
  userId?: string;
  name?: string;
  ageRange?: AgeRange;
  gender?: string;
  country?: string;
  fitnessLevel?: FitnessLevel;
  healthConditions?: string[];
  dietaryRestrictions?: string[];
  goals?: string[];
  joinedAt?: string;
  lastActiveAt?: string;
  onboardingStep?: OnboardingStep;
}

// ============================================================================
// PHOTO PROOF ENTRY
// ============================================================================
export interface PhotoProofEntry {
  taskId: string;
  uri: string;
  thumbnailUri?: string;
  category: TaskCategory;
  aiAnalysis?: AIValidationResult;
  macros?: MacroData;
  capturedAt: number;
  validated: boolean;
}

// ============================================================================
// TODAY STATE
// ============================================================================
export interface TodayMetadata {
  tasksGeneratedAt?: string;
  missedMorning: boolean;
  recoveryDaysRemaining: number;
  /** @deprecated — backward compat only, use activeTimers */
  activeTimer?: TimerState;
  /** Multiple concurrent timers keyed by taskId */
  activeTimers: ActiveTimersMap;
  eveningBoosterGenerated?: boolean;
  nextDayTasksPreloaded?: boolean;
}

export interface TodayState {
  date: string;
  tasks: GameTask[];
  scores: DayScores;
  targets: DayTargets;
  mode: GameMode;
  logs: TaskLogEntry[];
  boosterTaskCompleted: number;
  metadata: TodayMetadata;
  photoProofs: PhotoProofEntry[];
}

// ============================================================================
// DAY RECORD (history)
// ============================================================================
export interface DayRecord {
  date: string;
  mode: GameMode | null;
  tasksGenerated: number;
  tasksCompleted: number;
  completionRate: number;
  scores: DayScores;
  totalXPEarned: number;
  streak: number;
  photosLogged?: number;
  totalMacros?: MacroData;
  average?: number;
  photoProofs?: PhotoProofEntry[];
  taskDetails?: {
    id: string;
    title: string;
    category: TaskCategory;
    status: string;
    completedAt?: number;
    failedReason?: string;
    proof?: TaskProof;
  }[];
}

// ============================================================================
// BEHAVIOR METRICS
// ============================================================================
export interface BehaviorMetrics {
  dietCompletionRate?: number;
  activityCompletionRate?: number;
  stressCompletionRate?: number;
  overallCompletionRate?: number;
  adaptiveDifficulty?: number;
  preferredActions?: TaskAction[];
  frequentlyCompletedTasks?: string[];
  averageSessionLength?: number;
  photoLogFrequency?: number;
  journalFrequency?: number;
}

// ============================================================================
// STREAK / PLAN / TOKEN / CACHE / SMART RESET / ONBOARDING
// ============================================================================
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompleteDay: string | null;
}
export interface GamePlan {
  mode: GameMode;
  reason: string;
  focusCategory?: TaskCategory;
  suggestedTasks?: number;
}
export interface TokenBudget {
  dailyLimit: number;
  usedToday: number;
  lastResetDate: string;
}
export interface PromptCacheEntry {
  key: string;
  response: string;
  tokensSaved: number;
  createdAt: number;
  expiresAt: number;
}
export interface SmartResetInfo {
  shouldReset: boolean;
  missedDays: number;
  lastActiveDate?: string;
  recoveryPlan?: { targetMode: GameMode; duration: number; reason: string };
}
export interface OnboardingState {
  currentStep: OnboardingStep;
  assessmentCompleted: boolean;
  assessmentLevel?: number;
  quizAnswers?: Record<string, any>;
}
export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  summary: string;
  metrics: {
    averageCompletion: number;
    bestDay: string;
    worstDay: string;
    totalXP: number;
    streakDays: number;
    photosLogged: number;
    categoryBreakdown: DayScores;
  };
  aiInsights?: string;
  tokensUsed?: number;
}

// ============================================================================
// TASK GENERATION INPUT/OUTPUT
// ============================================================================
export interface TaskGenerationInput {
  userProfile: UserProfile;
  userIdentity?: UserIdentity;
  behaviorMetrics?: BehaviorMetrics;
  history?: DayRecord[];
  mode?: string;
  todaysScores?: DayScores;
  timeOfDay?: 'morning' | 'evening';
  tokenBudget?: number;
  todaysLogs?: GameTask[];
}
export interface TaskGenerationOutput {
  tasks: GameTask[];
  metadata: {
    algorithm: string;
    generatedAt: string;
    varietyEnforced: boolean;
    categoryBalance: DayScores;
    generationReason: string;
    tokensUsed: number;
    personalizedForUser?: string;
    difficultyLevel?: number;
  };
}
export interface BoosterGenerationInput {
  missingCategories?: TaskCategory[];
  currentScores?: DayScores;
  userLevel?: number;
  tokenBudget?: number;
}
export interface AssessmentResult {
  suggestedLevel: number;
  suggestedMode: GameMode;
  reason: string;
  fitnessLevel: FitnessLevel;
  tokensUsed: number;
}

// ============================================================================
// ROOT STATE
// ============================================================================
export interface GameProgressionState {
  userProfile: UserProfile;
  userIdentity: UserIdentity;
  today: TodayState;
  todayPlan: GamePlan | null;
  history: DayRecord[];
  streakData: StreakData;
  streak?: number;
  tasks?: GameTask[];
  tasksGeneratedAt?: string;
  nextDayTasks?: GameTask[];
  behaviorMetrics: BehaviorMetrics;
  weeklyReports: WeeklyReport[];
  levelInfo: UserProfile[];
  onboarding: OnboardingState;
  smartReset: SmartResetInfo;
  tokenBudget: TokenBudget;
  promptCache: PromptCacheEntry[];
}

export type CelebrationEvent = any;
