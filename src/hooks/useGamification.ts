/**
 * GAMIFICATION HOOK
 *
 * Easy-to-use React hook for integrating the gamification system
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  GamificationManager,
  createDefaultUserProfile,
} from '@/systems/GamificationManager';
import {
  UserProfile,
  ActivityCategory,
  CelebrationEvent,
  ActivityRing,
  Achievement,
  DailyChallenge,
} from '@/systems/gamificationEngine';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'gamification' });
const STORAGE_KEY = 'gamification_profile';

interface UseGamificationResult {
  // State
  profile: UserProfile | null;
  levelInfo: ReturnType<
    typeof GamificationManager.prototype.getLevelInfo
  > | null;
  rings: ActivityRing[];
  celebrations: CelebrationEvent[];
  dailyChallenges: DailyChallenge[];
  achievements: Achievement[];
  isLoading: boolean;

  // Quick feedback
  quickFeedback: {
    visible: boolean;
    message: string;
    xpEarned?: number;
    emoji?: string;
  } | null;

  // Actions
  completeTask: (
    category: ActivityCategory,
    taskType: string,
    context?: { isEarly?: boolean; inCombo?: boolean },
  ) => Promise<void>;
  updateRings: (tasksData: {
    diet: { completed: number; total: number };
    exercise: { completed: number; total: number };
    supplement: { completed: number; total: number };
  }) => Promise<void>;
  updateStreak: (category: ActivityCategory, completed: boolean) => void;
  dismissCelebration: () => void;
  dismissQuickFeedback: () => void;
  refreshProfile: () => Promise<void>;
}

export const useGamification = (): UseGamificationResult => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [levelInfo, setLevelInfo] = useState<ReturnType<
    typeof GamificationManager.prototype.getLevelInfo
  > | null>(null);
  const [rings, setRings] = useState<ActivityRing[]>([]);
  const [celebrations, setCelebrations] = useState<CelebrationEvent[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickFeedback, setQuickFeedback] = useState<{
    visible: boolean;
    message: string;
    xpEarned?: number;
    emoji?: string;
  } | null>(null);

  const managerRef = useRef<GamificationManager | null>(null);

  // Initialize
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const stored = storage.getString(STORAGE_KEY);
      let userProfile: UserProfile;

      if (stored) {
        userProfile = JSON.parse(stored);
      } else {
        userProfile = createDefaultUserProfile();
        await saveProfile(userProfile);
      }

      managerRef.current = new GamificationManager(userProfile);
      setProfile(userProfile);
      setLevelInfo(managerRef.current.getLevelInfo());
      setDailyChallenges(managerRef.current.getDailyChallenges());
      setAchievements(managerRef.current.getAllAchievements());
    } catch (error) {
      console.error('Failed to load gamification profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: UserProfile) => {
    try {
      storage.set(STORAGE_KEY, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to save gamification profile:', error);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!managerRef.current) return;

    const updatedProfile = managerRef.current.getUserProfile();
    await saveProfile(updatedProfile);
    setLevelInfo(managerRef.current.getLevelInfo());

    // Check for new celebrations
    const newCelebrations = managerRef.current.getCelebrations();
    if (newCelebrations.length > 0) {
      setCelebrations(prev => [...prev, ...newCelebrations]);
    }
  }, []);

  const completeTask = useCallback(
    async (
      category: ActivityCategory,
      taskType: string,
      context?: { isEarly?: boolean; inCombo?: boolean },
    ) => {
      if (!managerRef.current) return;

      const result = managerRef.current.completeTask(
        category,
        taskType,
        context,
      );

      // Show quick feedback
      setQuickFeedback({
        visible: true,
        message: result.feedback,
        xpEarned: result.xpEarned,
        emoji: getCategoryEmoji(category),
      });

      // Add celebrations
      if (result.celebrations.length > 0) {
        setCelebrations(prev => [...prev, ...result.celebrations]);
      }

      await refreshProfile();
    },
    [refreshProfile],
  );

  const updateRings = useCallback(
    async (tasksData: {
      diet: { completed: number; total: number };
      exercise: { completed: number; total: number };
      supplement: { completed: number; total: number };
    }) => {
      if (!managerRef.current) return;

      const updatedRings = await managerRef.current.calculateActivityRings(
        new Date(),
        tasksData,
      );

      setRings(updatedRings);

      // Check for new celebrations
      const newCelebrations = managerRef.current.getCelebrations();
      if (newCelebrations.length > 0) {
        setCelebrations(prev => [...prev, ...newCelebrations]);
      }

      await refreshProfile();
    },
    [refreshProfile],
  );

  const updateStreak = useCallback(
    (category: ActivityCategory, completed: boolean) => {
      if (!managerRef.current) return;

      managerRef.current.updateStreak(category, completed, new Date());
      refreshProfile();
    },
    [refreshProfile],
  );

  const dismissCelebration = useCallback(() => {
    setCelebrations(prev => prev.slice(1));
  }, []);

  const dismissQuickFeedback = useCallback(() => {
    setQuickFeedback(null);
  }, []);

  return {
    profile,
    levelInfo,
    rings,
    celebrations,
    dailyChallenges,
    achievements,
    isLoading,
    quickFeedback,
    completeTask,
    updateRings,
    updateStreak,
    dismissCelebration,
    dismissQuickFeedback,
    refreshProfile,
  };
};

// Helper function
const getCategoryEmoji = (category: ActivityCategory): string => {
  const emojiMap: Record<ActivityCategory, string> = {
    diet: '🍎',
    exercise: '💪',
    supplement: '💊',
    vital: '❤️',
    sleep: '😴',
  };
  return emojiMap[category] || '⭐';
};

export default useGamification;
