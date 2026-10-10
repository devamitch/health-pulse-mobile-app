import { TaskCardData } from '../types';
import { sortQuestsByNearestTime } from '@/utils/gamification/task-sorter';

export const getCollapsedCard = (
  data: TaskCardData[],
): TaskCardData | undefined => {
  const incompleteData = sortQuestsByNearestTime(data.filter(card => !card.completed));

  return incompleteData[0] || data[0];
};
