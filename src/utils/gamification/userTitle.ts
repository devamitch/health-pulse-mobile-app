import { USER_TITLES } from './constants';

// Get user title based on level
export const getUserTitle = (level: number): string => {
  // Find the highest title that matches the user's level
  let title = 'Beginner';

  for (const titleData of USER_TITLES) {
    if (level >= titleData.level) {
      title = titleData.title;
    }
  }

  return title;
};

// Get next title and level needed
export const getNextTitle = (
  currentLevel: number,
): { title: string; levelNeeded: number } | null => {
  for (const titleData of USER_TITLES) {
    if (currentLevel < titleData.level) {
      return {
        title: titleData.title,
        levelNeeded: titleData.level,
      };
    }
  }

  return null; // Already at max title
};
