import { TaskCardData } from "@/components/home/types";
import { SimplifiedTask } from "./game-plan-generator";

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

const getNowMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

const getNearestTimeDiff = (timings: string[], nowMin: number): number => {
  if (timings.length === 0) return Number.MAX_SAFE_INTEGER;

  return Math.min(
    ...timings.map(t => Math.abs(timeToMinutes(t) - nowMin))
  );
};

const getQuestNearestTimeDiff = (
  quest: TaskCardData,
  nowMin: number
): number => {
  const timings = quest?.task?.timings;
  if (!timings || timings.length === 0) return Number.MAX_SAFE_INTEGER;

  return Math.min(
    ...timings.map(t => Math.abs(timeToMinutes(t) - nowMin))
  );
};

export const sortQuestsByNearestTime = (
  quests: TaskCardData[]
): TaskCardData[] => {
  const nowMin = getNowMinutes();

  return [...quests].sort((a, b) => {
    const diffA = getQuestNearestTimeDiff(a, nowMin);
    const diffB = getQuestNearestTimeDiff(b, nowMin);
    return diffA - diffB;
  });
};

export const sortTasksByNearestTime = (tasks: SimplifiedTask[]): SimplifiedTask[] => {
  const nowMin = getNowMinutes();

  return [...tasks].sort((a, b) => {
    const diffA = getNearestTimeDiff(a.timings, nowMin);
    const diffB = getNearestTimeDiff(b.timings, nowMin);
    return diffA - diffB;
  });
};
