import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationState, NotificationItem } from './interfaces';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Morning Mindfulness',
    channel: 'morning',
    time: '07:00 AM',
    enabled: true,
  },
  {
    id: '2',
    title: 'Breakfast',
    channel: 'breakfast',
    time: '08:00 AM',
    enabled: true,
  },
  {
    id: '3',
    title: 'Lunch',
    channel: 'lunch',
    time: '12:30 PM',
    enabled: true,
  },
  {
    id: '4',
    title: 'Dinner',
    channel: 'dinner',
    time: '07:00 PM',
    enabled: false,
  },
  {
    id: '5',
    title: 'Evening Wind Down',
    channel: 'evening',
    time: '09:00 PM',
    enabled: true,
  },
];

const initialState: NotificationState = {
  notifications: INITIAL_NOTIFICATIONS,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
      state.notifications = action.payload;
    },
    updateNotification: (state, action: PayloadAction<NotificationItem>) => {
      const index = state.notifications.findIndex(
        n => n.id === action.payload.id,
      );
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }
    },
    toggleNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        n => n.id === action.payload,
      );
      if (notification) {
        notification.enabled = !notification.enabled;
      }
    },
  },
});

export const { setNotifications, updateNotification, toggleNotification } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
