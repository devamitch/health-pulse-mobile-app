import { createWindStyles } from '@/styles/windStyles';

export interface WindMessage {
  role: 'user' | 'system' | string;
  // role: 'user' | 'system';
  message: string;
}

export interface WindNotification {
  body: string;
  channel: string;
  frequency: string;
  id: number;
  notification_id: number[];
  time: string;
  title: string;
}

export interface WindScreenProps {
  navigation: any;
  route: any;
}

export type WindStyles = ReturnType<typeof createWindStyles>;
