import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserData, UserState } from './interfaces';
export interface DisclaimerSettings {
  accepted: boolean;
  dontShowAgain: boolean;
  showMiniReminders: boolean;
}

const defaultDisclaimerSettings: Required<DisclaimerSettings> = {
  accepted: false,
  dontShowAgain: false,
  showMiniReminders: true,
};

export const shouldShowDisclaimer = (
  settings: DisclaimerSettings = {},
  context: string = '',
): boolean => {
  const {
    accepted = false,
    dontShowAgain = false,
    showMiniReminders = true,
  } = settings;

  // Never show if user opted out
  if (dontShowAgain && accepted) return false;

  // Always show if never accepted
  if (!accepted) return true;

  // Show for medical queries if user hasn't opted out
  if (context === 'medical_query' && showMiniReminders) return true;

  // Show for manual requests
  if (context === 'manual') return true;

  return false;
};

const initialState: UserState = {
  token: undefined,
  userData: undefined,
  isLogin: false,
  paymentStatus: false,
  isLaunched: false,
  isSyncEnabled: false,
  sessionTime: undefined,
  lastFetch: undefined,
  isNewUser: true,
  disclaimer: false,
  refreshToken: undefined,
  // disclaimerSettings: defaultDisclaimerSettings,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateLaunch: state => {
      state.isLaunched = true;
    },
    updateUser: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.userData)
        state.userData = {
          ...state.userData,
          ...action.payload,
        };
    },
    loginSuccess: (
      state,
      action: PayloadAction<{
        access_token?: string;
        data?: any;
        sync?: boolean;
        payment?: boolean;
        isNewUser?: boolean;
        refreshToken?: string;
      }> = { payload: {} },
    ) => {
      state.token = action.payload.access_token;
      state.userData = action.payload.data;
      state.isLogin = true;
      state.isSyncEnabled = action.payload.sync ?? false;
      state.paymentStatus = action.payload.payment ?? false;
      state.isNewUser = action.payload.isNewUser ?? true;
      state.refreshToken = action.payload.refreshToken;
    },
    storeUserDetails: (state, action: PayloadAction<UserData | undefined>) => {
      if (action.payload) {
        state.userData = action.payload;
      }
    },
    storePaymentStatus: (
      state,
      action: PayloadAction<{ has_active_subscription?: boolean }> = {
        payload: {},
      },
    ) => {
      state.paymentStatus = action.payload.has_active_subscription ?? false;
    },
    resetAllUser: state => {
      state.token = undefined;
      state.userData = undefined;
      state.isLogin = false;
      state.paymentStatus = false;
      state.isSyncEnabled = false;
      state.sessionTime = undefined;
    },
    updateSync: (state, action: PayloadAction<boolean | undefined>) => {
      state.isSyncEnabled = action.payload ?? false;
    },
    updateMenstrualTrackerVisiblity: (
      state,
      action: PayloadAction<boolean | undefined>,
    ) => {
      if (state.userData) {
        state.userData = {
          ...state.userData,
          isMenstrualCycleTracked: action.payload ?? false,
        };
      }
    },
    startSession: state => {
      const time = new Date().getTime();
      state.sessionTime = time;
    },
    removeSessionTime: state => {
      state.sessionTime = undefined;
    },
    setLastFetch: (state, action: PayloadAction<Date | undefined>) => {
      state.lastFetch = action.payload;
    },
    setIsNewUser: (state, action: PayloadAction<boolean | undefined>) => {
      state.isNewUser = action.payload ?? true;
    },
    setDisclaimer: (state, action: PayloadAction<boolean | undefined>) => {
      state.disclaimer = action.payload ?? true;
    },
    acceptDisclaimer: (
      state,
      action: PayloadAction<{
        dontShowAgain?: boolean;
        showMiniReminders?: boolean;
      }>,
    ) => {
      state.disclaimerSettings = {
        accepted: true,
        dontShowAgain: action.payload.dontShowAgain ?? false,
        showMiniReminders: action.payload.showMiniReminders ?? true,
      };
    },
    resetDisclaimer: state => {
      state.disclaimerSettings = initialState.disclaimerSettings;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload;
    },
    setFCMToken: (state, action: PayloadAction<string>) => {
      state.fcmToken = action.payload;
    },
  },
});

// Selectors with proper undefined handling
export const getUserData = (state?: UserState) => {
  return state ?? {};
};
export const selectDisclaimerSettings = (state: { user: UserState }) =>
  state?.user?.disclaimerSettings;

export const {
  loginSuccess,
  storeUserDetails,
  storePaymentStatus,
  updateLaunch,
  updateSync,
  updateMenstrualTrackerVisiblity,
  resetAllUser,
  startSession,
  removeSessionTime,
  setLastFetch,
  setIsNewUser,
  setDisclaimer,
  acceptDisclaimer,
  resetDisclaimer,
  setAccessToken,
  updateUser,
  setFCMToken,
  setRefreshToken,
} = userSlice.actions;

export default userSlice.reducer;
