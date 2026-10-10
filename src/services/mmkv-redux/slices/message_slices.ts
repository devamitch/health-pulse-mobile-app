import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessageData, PreferenceType, Quiz } from './interfaces';
import { prioritizingVitals } from './constants';

const initialState: MessageData = {
  pinYourStatus: [],
  weeklyWorkoutPlan: [],
  messageCount: {},
  prompt: undefined,
  preferences: [],
  quiz: [],
  haptic_level: 0,
  isPrefeencesOn: true,
  routineGeneratedAt: {},
  prioritizedVitals: prioritizingVitals[2],
  CategorisedPreferences: {
    Supplement: [],
    Diet: [],
    Activities: [],
    Meditation: [],
    Relaxation: [],
  },
};

const messageSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    pinMessageToStatus: (state, action: PayloadAction<string>) => {
      state.pinYourStatus.unshift(action.payload);
    },
    deletePinMessage: (state, action: PayloadAction<string>) => {
      state.pinYourStatus = state.pinYourStatus.filter(
        message => message !== action.payload,
      );
    },
    addWeeklyWorkoutPlan: (
      state,
      action: PayloadAction<{ day: string; routine: string }[]>,
    ) => {
      state.weeklyWorkoutPlan = action.payload;
    },
    updateMessageCount: (state, action: PayloadAction<string>) => {
      const date = new Date().toDateString();
      const messageCountEntry = state.messageCount[action.payload];
      if (messageCountEntry) {
        if (messageCountEntry.date === date) {
          messageCountEntry.count += 1;
        } else {
          state.messageCount[action.payload] = { date, count: 1 };
        }
      } else {
        state.messageCount[action.payload] = { date, count: 1 };
      }
    },
    addPreference: (
      state,
      action: PayloadAction<{
        preference: string;
        category?: PreferenceType | 'Other';
      }>,
    ) => {
      if (action.payload.category && action.payload.category !== 'Other') {
        if (!state.CategorisedPreferences) {
          state.CategorisedPreferences = {
            Supplement: [],
            Diet: [],
            Activities: [],
            Meditation: [],
            Relaxation: [],
          };
        }
        state.CategorisedPreferences[action.payload.category].push(
          action.payload.preference,
        );
      }
      state.preferences.push(action.payload.preference);
    },
    removePreference: (state, action: PayloadAction<string>) => {
      if (state.CategorisedPreferences) {
        const newCategorisedPreferences = { ...state.CategorisedPreferences };
        (
          [
            'Supplement',
            'Diet',
            'Activities',
            'Meditation',
            'Relaxation',
          ] as PreferenceType[]
        ).forEach(type => {
          newCategorisedPreferences[type] = newCategorisedPreferences[
            type
          ].filter(preference => preference !== action.payload);
        });
        state.CategorisedPreferences = newCategorisedPreferences;
      }
      state.preferences = state.preferences.filter(
        preference => preference !== action.payload,
      );
    },
    clearPreference: state => {
      state.preferences = [];
      state.CategorisedPreferences = {
        Supplement: [],
        Diet: [],
        Activities: [],
        Meditation: [],
        Relaxation: [],
      };
    },
    addQuiz: (state, action: PayloadAction<Quiz>) => {
      const index = state.quiz.findIndex(item => item.id === action.payload.id);
      if (index === -1) {
        state.quiz.push(action.payload);
      } else {
        state.quiz[index] = action.payload;
      }
    },
    updateUserPrompt: (state, action: PayloadAction<string>) => {
      state.prompt = action.payload;
    },
    updateHaptics: (state, action: PayloadAction<number>) => {
      state.haptic_level = action.payload;
    },
    resetAllApp: () => {
      return initialState;
    },
    changePreferenceOn: state => {
      state.isPrefeencesOn = !state.isPrefeencesOn;
    },
    updateRoutineDate: (
      state,
      action: PayloadAction<{
        routine: 'diet' | 'supplement' | 'activities' | 'userPlan';
        date: string;
      }>,
    ) => {
      state.routineGeneratedAt = {
        ...state.routineGeneratedAt,
        [action.payload.routine]: action.payload.date,
      };
    },
    updatePrioritizedVitals: (state, action: PayloadAction<number>) => {
      state.prioritizedVitals = prioritizingVitals[action.payload];
    },
  },
});

export const getAppData = (state: MessageData) => {
  return state;
};

export const {
  pinMessageToStatus,
  deletePinMessage,
  addWeeklyWorkoutPlan,
  updateMessageCount,
  addPreference,
  removePreference,
  clearPreference,
  addQuiz,
  updateUserPrompt,
  updateHaptics,
  resetAllApp,
  changePreferenceOn,
  updateRoutineDate,
  updatePrioritizedVitals,
} = messageSlice.actions;

export default messageSlice.reducer;
