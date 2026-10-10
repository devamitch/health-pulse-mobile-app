import { calculateDailyTarget } from './calculations';
import { MODE_COLORS, XP_REWARDS } from './constants';
import { DailyMission, ModeType, PillarType } from './types';

// Generate daily mission based on mode and weakest pillar
export const generateDailyMission = (
  mode: ModeType,
  userLevel: number,
  weakestPillar: PillarType,
): DailyMission => {
  const baseTarget = calculateDailyTarget(userLevel);

  switch (mode) {
    case 'RECOVERY':
      return {
        title: 'Recovery Day',
        description: 'Focus on rest and gentle movement',
        target: `${Math.floor(baseTarget * 0.7)} points (Reduced Target)`,
        mode: 'RECOVERY',
        xpReward: XP_REWARDS.RECOVERY_DAY,
        backgroundColor: MODE_COLORS.RECOVERY,
      };

    case 'HERO':
      return {
        title: 'Challenge Day! 🔥',
        description: 'Push your limits - Double XP available!',
        target: `${Math.floor(baseTarget * 1.3)} points (Challenge Mode)`,
        mode: 'HERO',
        xpReward: XP_REWARDS.HERO_DAY,
        backgroundColor: MODE_COLORS.HERO,
      };

    default:
      return {
        title: 'Daily Mission',
        description: `Focus on strengthening your ${weakestPillar}`,
        target: `${baseTarget} points`,
        mode: 'STANDARD',
        xpReward: XP_REWARDS.STANDARD_DAY,
        backgroundColor: MODE_COLORS.STANDARD,
      };
  }
};

// Get mission tips based on weakest pillar
export const getMissionTips = (weakestPillar: PillarType): string[] => {
  switch (weakestPillar) {
    case 'diet':
      return [
        'Start with a protein-rich breakfast',
        'Drink water before each meal',
        'Add vegetables to every meal',
        'Avoid processed sugars',
      ];

    case 'activity':
      return [
        'Take the stairs today',
        'Do 20 squats during breaks',
        'Walk while on phone calls',
        'Stretch every 2 hours',
      ];

    case 'calm':
      return [
        'Practice 5 minutes of deep breathing',
        'No phone 1 hour before bed',
        `Write 3 things you're grateful for`,
        'Try box breathing technique',
      ];
  }
};
