import { useMemo } from 'react';
import { GameProfile } from '@/services/mmkv-redux/slices';
import { xpCalculator } from '@/utils/gamification/calculations';

type AssessmentResponse = {
  id: number;
  question: string;
  answerString: string;
  questionTag: string;
  answer: string;
};

export const gameProfileAssesment = (
  responses: AssessmentResponse[]
): GameProfile | null => {
  const userProfile = useMemo(() => {
    if (!responses || responses.length === 0) return null;

    const parseRange = (value: string): number => {
      if (value.includes('-')) {
        const [min, max] = value.split('-').map(Number);
        return ((min ?? 0) + (max ?? 0)) / 2;
      }
      if (value.includes('+')) {
        return Number(value.replace('+', ''));
      }
      if (value.includes('<')) {
        return Number(value.replace('<', '')) - 1;
      }
      return Number(value);
    };

    const clamp = (v: number, min = 0, max = 100) =>
      Math.max(min, Math.min(max, v));

    const scale = (value: number, max: number) =>
      clamp((value / max) * 100);

    const get = (id: number) =>
      parseRange(responses.find(r => r.id === id)?.answer ?? '0');

    const activityScore = clamp(
      scale(get(101), 300) * 0.3 + // minutes/week
      scale(get(102), 40) * 0.25 + // push-ups
      scale(get(103), 7) * 0.25 +  // active days
      scale(get(104), 60) * 0.2    // jog duration
    );

    const dietScore = clamp(
      scale(get(201), 3) * 0.4 +   // balanced meals
      scale(get(202), 7) * 0.3 +   // junk-free days
      scale(get(203), 5) * 0.3     // fruits/veggies
    );

    const stressScore = clamp(
      scale(get(301), 8) * 0.4 +   // sleep hours
      scale(get(302), 20) * 0.3 +  // mindfulness
      scale(get(303), 7) * 0.3     // rested days
    );

    const overall =
      activityScore * 0.4 +
      dietScore * 0.35 +
      stressScore * 0.25;

    // Level 1-20 based on overall score (0-100)
    // Level 1-20 based on overall score (0-100)
    const level =
      overall >= 95 ? 20 :  // Exceptional
      overall >= 90 ? 19 :
      overall >= 85 ? 18 :
      overall >= 80 ? 17 :
      overall >= 75 ? 16 :  // Above average (15-16)
      overall >= 70 ? 15 :
      overall >= 65 ? 14 :
      overall >= 60 ? 13 :
      overall >= 55 ? 12 :
      overall >= 50 ? 11 :  // Intermediate (10-11)
      overall >= 45 ? 10 :
      overall >= 40 ? 9 :
      overall >= 35 ? 8 :
      overall >= 30 ? 7 :
      overall >= 25 ? 6 :
      overall >= 20 ? 5 :
      overall >= 15 ? 4 :
      overall >= 12 ?  2 : 1;  // Changed: anything below 5 (including 0-4.99) = 

    const profile: GameProfile = {
      userProfile: {
        name: 'Health Seeker',
        level,
        xp: 0,
        xpToNextLevel: xpCalculator(level) * 100,
      },
      history: [],
      today: {
        date: new Date().toDateString(),
        mode: 'STANDARD',
        scores: {
          activity: Math.round(activityScore),
          diet: Math.round(dietScore),
          stress: Math.round(stressScore),
        },
        logs: [],
        targets: {
          activity: 100,
          diet: 100,
          stress: 100,
        },
        boosterTaskCompleted: 0,
      },
      streak: 0,
      todayPlan: null,
      levelInfo: [],
      tasks: [],
    };

    return profile;
  }, [responses]);

  return userProfile;
};
