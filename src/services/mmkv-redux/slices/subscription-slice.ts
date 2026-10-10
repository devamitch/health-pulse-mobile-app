import { SubscriptionPlan } from '@/constants/subscriptions';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SubscriptionState {
  availableSubscriptions: SubscriptionPlan[];
  activeSubscription: SubscriptionPlan | null;
  isLoading: boolean;
  error: string | null;
  isPurchasing: boolean;
  restoreLoading: boolean;
}

const initialState: SubscriptionState = {
  availableSubscriptions: [],
  activeSubscription: null,
  isLoading: false,
  error: null,
  isPurchasing: false,
  restoreLoading: false,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    loadSubscriptionsStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loadSubscriptionsSuccess(state, action: PayloadAction<SubscriptionPlan[]>) {
      state.availableSubscriptions = action.payload;
      state.isLoading = false;
    },
    loadSubscriptionsFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    purchaseStart(state) {
      state.isPurchasing = true;
      state.error = null;
    },
    purchaseSuccess(state, action: PayloadAction<SubscriptionPlan>) {
      state.activeSubscription = action.payload;
      state.isPurchasing = false;
    },
    purchaseFailure(state, action: PayloadAction<string>) {
      state.isPurchasing = false;
      state.error = action.payload;
    },
    restoreStart(state) {
      state.restoreLoading = true;
      state.error = null;
    },
    restoreSuccess(state, action: PayloadAction<SubscriptionPlan | null>) {
      state.activeSubscription = action.payload;
      state.restoreLoading = false;
    },
    restoreFailure(state, action: PayloadAction<string>) {
      state.restoreLoading = false;
      state.error = action.payload;
    },
    setActiveSubscription(
      state,
      action: PayloadAction<SubscriptionPlan | null>,
    ) {
      state.activeSubscription = action.payload;
    },
  },
});

export const {
  loadSubscriptionsStart,
  loadSubscriptionsSuccess,
  loadSubscriptionsFailure,
  purchaseStart,
  purchaseSuccess,
  purchaseFailure,
  restoreStart,
  restoreSuccess,
  restoreFailure,
  setActiveSubscription,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
