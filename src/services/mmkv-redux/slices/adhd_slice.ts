import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ADHDAnswer {
  questionId: string;
  answer: any;
  answeredAt: string;
}

export interface ADHDDayProgress {
  day: number;
  completed: boolean;
  completedAt?: string;
  totalQuestions: number;
  answeredQuestions: number;
  answers: { [questionId: string]: ADHDAnswer };
  lastUpdated: string;
}

export interface ADHDState {
  currentDay: number;
  startedAt?: string;
  lastActivityAt?: string;
  dayProgress: { [day: number]: ADHDDayProgress };
  isActive: boolean;
  overallProgress: {
    completedDays: number;
    totalDays: 14;
    percentageComplete: number;
  };
}

const initialState: ADHDState = {
  currentDay: 1,
  startedAt: undefined,
  lastActivityAt: undefined,
  dayProgress: {},
  isActive: false,
  overallProgress: {
    completedDays: 0,
    totalDays: 14,
    percentageComplete: 0,
  },
};

const adhdSlice = createSlice({
  name: 'adhd',
  initialState,
  reducers: {
    // Initialize ADHD questionnaire
    startADHDQuestionnaire: (state, action: PayloadAction<number>) => {
      const totalQuestions = action.payload;
      state.isActive = true;
      state.startedAt = new Date().toISOString();
      state.lastActivityAt = new Date().toISOString();
      state.currentDay = 1;

      // Initialize day 1 progress
      if (!state.dayProgress[1]) {
        state.dayProgress[1] = {
          day: 1,
          completed: false,
          totalQuestions,
          answeredQuestions: 0,
          answers: {},
          lastUpdated: new Date().toISOString(),
        };
      }
    },

    // Save answer for a specific question
    saveADHDAnswer: (
      state,
      action: PayloadAction<{
        day: number;
        questionId: string;
        answer: any;
        totalQuestions: number;
      }>,
    ) => {
      const { day, questionId, answer, totalQuestions } = action.payload;

      // Initialize day progress if it doesn't exist
      if (!state.dayProgress[day]) {
        state.dayProgress[day] = {
          day,
          completed: false,
          totalQuestions,
          answeredQuestions: 0,
          answers: {},
          lastUpdated: new Date().toISOString(),
        };
      }

      const dayData = state.dayProgress[day];

      // Check if this is a new answer or update
      const isNewAnswer = !dayData.answers[questionId];

      // Save the answer
      dayData.answers[questionId] = {
        questionId,
        answer,
        answeredAt: new Date().toISOString(),
      };

      // Update answered questions count
      if (isNewAnswer) {
        dayData.answeredQuestions += 1;
      }

      dayData.lastUpdated = new Date().toISOString();
      state.lastActivityAt = new Date().toISOString();
    },

    // Complete a day
    completeADHDDay: (
      state,
      action: PayloadAction<{
        day: number;
        allAnswers: { [questionId: string]: ADHDAnswer };
      }>,
    ) => {
      const { day, allAnswers } = action.payload;

      if (state.dayProgress[day]) {
        state.dayProgress[day].completed = true;
        state.dayProgress[day].completedAt = new Date().toISOString();
        state.dayProgress[day].answers = allAnswers;
        state.dayProgress[day].answeredQuestions =
          Object.keys(allAnswers).length;
        state.dayProgress[day].lastUpdated = new Date().toISOString();
      }

      // Update current day to next day
      if (day < 14) {
        state.currentDay = day + 1;
      } else {
        // All days completed
        state.currentDay = 14;
        state.isActive = false;
      }

      // Update overall progress
      const completedDays = Object.values(state.dayProgress).filter(
        d => d.completed,
      ).length;
      state.overallProgress.completedDays = completedDays;
      state.overallProgress.percentageComplete = Math.round(
        (completedDays / 14) * 100,
      );

      state.lastActivityAt = new Date().toISOString();
    },

    // Initialize a specific day's progress
    initializeADHDDay: (
      state,
      action: PayloadAction<{ day: number; totalQuestions: number }>,
    ) => {
      const { day, totalQuestions } = action.payload;

      if (!state.dayProgress[day]) {
        state.dayProgress[day] = {
          day,
          completed: false,
          totalQuestions,
          answeredQuestions: 0,
          answers: {},
          lastUpdated: new Date().toISOString(),
        };
      }
    },

    // Update current day (for unlocking days)
    updateADHDCurrentDay: (state, action: PayloadAction<number>) => {
      state.currentDay = action.payload;
      state.lastActivityAt = new Date().toISOString();
    },

    // Reset specific day
    resetADHDDay: (state, action: PayloadAction<number>) => {
      const day = action.payload;
      if (state.dayProgress[day]) {
        const totalQuestions = state.dayProgress[day].totalQuestions;
        state.dayProgress[day] = {
          day,
          completed: false,
          totalQuestions,
          answeredQuestions: 0,
          answers: {},
          lastUpdated: new Date().toISOString(),
        };
      }

      // Update overall progress
      const completedDays = Object.values(state.dayProgress).filter(
        d => d.completed,
      ).length;
      state.overallProgress.completedDays = completedDays;
      state.overallProgress.percentageComplete = Math.round(
        (completedDays / 14) * 100,
      );
    },

    // Reset all ADHD data
    resetADHDQuestionnaire: state => {
      return initialState;
    },

    // Pause questionnaire
    pauseADHDQuestionnaire: state => {
      state.isActive = false;
      state.lastActivityAt = new Date().toISOString();
    },

    // Resume questionnaire
    resumeADHDQuestionnaire: state => {
      state.isActive = true;
      state.lastActivityAt = new Date().toISOString();
    },

    // Set overall progress manually (useful for migrations)
    setADHDOverallProgress: (
      state,
      action: PayloadAction<{ completedDays: number }>,
    ) => {
      state.overallProgress.completedDays = action.payload.completedDays;
      state.overallProgress.percentageComplete = Math.round(
        (action.payload.completedDays / 14) * 100,
      );
    },
  },
});

// Selectors
export const selectADHDState = (state: { adhd: ADHDState }) => state.adhd;

export const selectADHDDayProgress =
  (day: number) => (state: { adhd: ADHDState }) =>
    state.adhd.dayProgress[day];

export const selectADHDCurrentDay = (state: { adhd: ADHDState }) =>
  state.adhd.currentDay;

export const selectADHDOverallProgress = (state: { adhd: ADHDState }) =>
  state.adhd.overallProgress;

export const selectADHDIsActive = (state: { adhd: ADHDState }) =>
  state.adhd.isActive;

export const selectADHDDayAnswers =
  (day: number) => (state: { adhd: ADHDState }) =>
    state.adhd.dayProgress[day]?.answers || {};

export const selectADHDAllProgress = (state: { adhd: ADHDState }) =>
  state.adhd.dayProgress;

// Check if a specific day is locked
export const selectIsADHDDayLocked =
  (day: number) => (state: { adhd: ADHDState }) => {
    return day > state.adhd.currentDay;
  };

// Check if a specific day is completed
export const selectIsADHDDayCompleted =
  (day: number) => (state: { adhd: ADHDState }) => {
    return state.adhd.dayProgress[day]?.completed || false;
  };

// Get progress for all days (useful for UI)
export const selectADHDAllDaysProgress = (state: { adhd: ADHDState }) => {
  const progress: {
    day: number;
    completed: boolean;
    completedAt?: string;
    totalQuestions: number;
    answeredQuestions: number;
    isToday: boolean;
    isLocked: boolean;
  }[] = [];

  for (let day = 1; day <= 14; day++) {
    const dayData = state.adhd.dayProgress[day];
    progress.push({
      day,
      completed: dayData?.completed || false,
      completedAt: dayData?.completedAt,
      totalQuestions: dayData?.totalQuestions || 0,
      answeredQuestions: dayData?.answeredQuestions || 0,
      isToday: day === state.adhd.currentDay,
      isLocked: day > state.adhd.currentDay,
    });
  }

  return progress;
};

export const {
  startADHDQuestionnaire,
  saveADHDAnswer,
  completeADHDDay,
  initializeADHDDay,
  updateADHDCurrentDay,
  resetADHDDay,
  resetADHDQuestionnaire,
  pauseADHDQuestionnaire,
  resumeADHDQuestionnaire,
  setADHDOverallProgress,
} = adhdSlice.actions;

export default adhdSlice.reducer;
