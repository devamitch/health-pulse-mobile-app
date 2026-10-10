import { Action, combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import persistStore from 'redux-persist/es/persistStore';
import { PersistConfig } from 'redux-persist/es/types';

import adhdSlice from './slices/adhd_slice';
import gameEngineSlice from './slices/game_engine_slice';
import gameProgressionReducer from './slices/gameProgressionSlice';
import gamificationSlice from './slices/gamification_slice';
import messageSlice from './slices/message_slices';
import notificationsSlice from './slices/notification_slice';
import themeSlice from './slices/theme_slice';
import userSlice from './slices/user_slice';

import { fileApi } from './apis';
import { authApi } from './apis/auth';
import { gumletApi } from './apis/gumlet';
import { spikeApi } from './apis/spike';
import subscriptionSlice from './slices/subscription-slice';
import { reduxStorage } from './storage';

const rootReducer = combineReducers({
  user: userSlice,
  message: messageSlice,
  theme: themeSlice,
  subscription: subscriptionSlice,
  notifications: notificationsSlice,
  gamification: gamificationSlice, // NEW
  game: gameEngineSlice,
  adhd: adhdSlice,
  gameProgression: gameProgressionReducer,

  [fileApi.reducerPath]: fileApi.reducer,
  [spikeApi.reducerPath]: spikeApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [gumletApi.reducerPath]: gumletApi.reducer,
});

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage: reduxStorage,
  version: 1,
  whitelist: [
    'user',
    'message',
    'theme',
    'subscription',
    'notifications',
    'gamification',
    'game',
    'gameProgression',
  ],
};

const persistedReducer = persistReducer<RootState, Action>(
  persistConfig,
  rootReducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(fileApi.middleware)
      .concat(spikeApi.middleware)
      .concat(authApi.middleware)
      .concat(gumletApi.middleware);
    return middlewares;
  },
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
