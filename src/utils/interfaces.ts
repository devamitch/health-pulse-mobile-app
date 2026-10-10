export type StatusScreenType =
  | 'SuperfoodScreen'
  | 'SupplementScreen'
  | 'GymScreen'
  | 'MindfulScreen'
  | 'WindScreen'
  | 'FeminineScreen';

export interface NotificationProps {
  body: string;
  channel: string;
  frequency: string;
  id: number;
  notification_id: number[];
  time: string;
  title: string;
}

export interface DayRoutineProps {
  description: string;
  screen: StatusScreenType;
  data: { topic: string };
  time: string;
  id: number;
  message: string;
  colors: (string | number)[];
  component?: React.ReactNode;
  title?: string;
  isCompleted?: boolean;
}

export interface TooltipType {
  id: number;
  target: string;
  text: string;
  placement: 'center' | 'left' | 'right' | 'bottom' | 'top';
}
