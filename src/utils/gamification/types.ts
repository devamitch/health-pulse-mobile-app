// Simple TypeScript types for gamification

export type PillarType = 'diet' | 'activity' | 'calm';
export type ModeType = 'STANDARD' | 'RECOVERY' | 'HERO';
export type StatusType = 'excellent' | 'good' | 'warning' | 'critical';

export interface MicroBooster {
  id: string;
  name: string;
  icon: string;
  points: number;
  pillar: PillarType;
  description: string;
}

export interface PillarScore {
  current: number; // Current points earned
  target: number; // Target points for the day
  percentage: number; // current/target * 100
  status: StatusType; // How you're doing
}

export interface UserProfile {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  shields: number;
  mode: ModeType;
}

export interface DailyMission {
  title: string;
  description: string;
  target: string;
  mode: ModeType;
  xpReward: number;
  backgroundColor: string;
}
