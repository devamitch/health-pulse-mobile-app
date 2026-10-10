import { generateClaudeResponseText } from '@/services/api/claude_client';
import { GameProfile } from '@/services/mmkv-redux/slices';
import taskGeneratorPrompt from '../task-generation-prompt';

export interface Task {
  id: string;
  name: string;
  description: string;
  reps?: number;
  duration?: number;
  count?: number;
  servings?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  category: 'diet' | 'activity' | 'stress';
  isCompleted: boolean;
  timings: string[];
  videoUrl?: string;
}

export interface SimplifiedTask {
  title: string;
  description?: string;
  coins: number;
  color?: string;
  category: 'diet' | 'activity' | 'stress';
  id: string;
  isDone: boolean;
  timings: string[];
  action?:
    | 'capture_photo'
    | 'watch_video'
    | 'timer'
    | 'log_journal'
    | 'log_record';
  seconds?: number;
}

interface Tasks {
  activity: Task[];
  diet: Task[];
  stress: Task[];
}

const categoryColors = {
  activity: '#DC0014',
  diet: '#4CAF50',
  stress: '#00BBFF',
};

export const convertToSimpleTasks = ({ tasks }: { tasks: Tasks }) => {
  const convertTask = (task: Task) => {
    let title = task.name;

    if (task.reps) {
      title += ` (${task.reps} reps)`;
    } else if (task.duration) {
      const mins = Math.floor(task.duration / 60);
      const secs = task.duration % 60;

      if (mins > 0 && secs > 0) title += ` (${mins}m ${secs}s)`;
      else if (mins > 0) title += ` (${mins} min)`;
      else title += ` (${secs} sec)`;
    } else if (task.count) {
      title += ` (${task.count} times)`;
    } else if (task.servings) {
      title += ` (${task.servings} servings)`;
    }

    return {
      ...task,
      title,
      coins: task.points,
      color: categoryColors[task.category],
      category: task.category,
      id: task.id,
      isDone: task.isCompleted,
      timings: task.timings,
    };
  };

  return [
    ...tasks.diet.map(convertTask),
    ...tasks.activity.map(convertTask),
    ...tasks.stress.map(convertTask),
  ];
};

export const generateDailyTasks = (profile: GameProfile) => {
  const level = profile.userProfile.level;
  const mode = profile.today.mode;

  const modeMultiplier = {
    RECOVERY: 0.7,
    STANDARD: 1.0,
    HERO: 1.3,
  }[mode];

  const baseDifficulty = Math.min(10, 1 + Math.floor(level / 3));

  const taskProgress = new Map<string, number>();
  profile.today.logs.forEach(item => {
    const percentage = (item.points / 20) * 100;
    taskProgress.set(item.id.toString(), percentage);
  });

  const taskCompleted = profile.today.logs
    .filter(item => item.points >= 20)
    .map(item => item.id);

  const sliceTimings = (timings: string[], taskId: string): string[] => {
    const percentage = taskProgress.get(taskId) || 0;
    const completedCount = Math.ceil((percentage / 100) * timings.length);
    return timings.slice(completedCount);
  };

  /* ---------------- ACTIVITY ---------------- */

  const activityTasks: Task[] = [
    {
      id: 'activity-1',
      name: 'Push-ups',
      description: 'Standard push-ups with proper form',
      reps: Math.ceil((5 * baseDifficulty * modeMultiplier) / 2),
      difficulty:
        baseDifficulty <= 3 ? 'easy' : baseDifficulty <= 6 ? 'medium' : 'hard',
      points: 20,
      category: 'activity',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/2b0ebe78-d732-424d-b9d1-a9ac67f402f8/watermarked_preview/watermarked_preview.mp4',
      isCompleted: taskCompleted.includes('activity-1'),
      timings: ['07:00', '17:00'],
    },
    {
      id: 'activity-2',
      name: 'Crunches',
      description: 'Abdominal crunches',
      reps: Math.ceil((5 * baseDifficulty * modeMultiplier) / 2),
      difficulty:
        baseDifficulty <= 3 ? 'easy' : baseDifficulty <= 6 ? 'medium' : 'hard',
      points: 20,
      category: 'activity',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/files/bc4901ed-a317-40ba-bdb5-4e83d62a76cf/video_preview_h264.mp4',
      isCompleted: taskCompleted.includes('activity-2'),
      timings: ['07:00', '17:00'],
    },
    {
      id: 'activity-3',
      name: 'Jumping Jacks',
      description: 'Cardio jumping jacks',
      reps: Math.ceil((20 * baseDifficulty * modeMultiplier) / 3),
      difficulty:
        baseDifficulty <= 3 ? 'easy' : baseDifficulty <= 6 ? 'medium' : 'hard',
      points: 20,
      category: 'activity',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/files/98b36244-bc94-49ee-abf3-e8bdaa197f83/video_preview_h264.mp4',
      isCompleted: taskCompleted.includes('activity-3'),
      timings: ['07:00', '17:00'],
    },
    {
      id: 'activity-4',
      name: 'Lunges',
      description: 'Alternating leg lunges',
      reps: Math.ceil((5 * baseDifficulty * modeMultiplier) / 2),
      difficulty:
        baseDifficulty <= 3 ? 'easy' : baseDifficulty <= 6 ? 'medium' : 'hard',
      points: 20,
      category: 'activity',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/files/7715d1e3-747f-4fbf-86ca-e6554eebfeda/video_preview_h264.mp4',
      isCompleted: taskCompleted.includes('activity-4'),
      timings: ['07:00', '17:00'],
    },
    {
      id: 'activity-5',
      name: 'Plank',
      description: 'Hold plank position',
      duration: Math.ceil((60 * baseDifficulty * modeMultiplier) / 3),
      difficulty:
        baseDifficulty <= 3 ? 'easy' : baseDifficulty <= 6 ? 'medium' : 'hard',
      points: 20,
      category: 'activity',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/files/df7f1cbb-0811-4153-a88c-e774d2b3d352/video_preview_h264.mp4',
      isCompleted: taskCompleted.includes('activity-5'),
      timings: ['07:00', '17:00'],
    },
  ];

  /* ---------------- DIET ---------------- */

  const dietTasks: Task[] = [
    {
      id: 'diet-1',
      name: 'Drink Water',
      description: 'Drink glasses of water',
      servings: Math.ceil(8 * modeMultiplier),
      difficulty: 'easy',
      points: 4,
      category: 'diet',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/4285b566-38fe-4827-9b6c-b247e006c5bb/watermarked_preview/watermarked_preview.mp4',
      isCompleted: taskCompleted.includes('diet-1'),
      timings: sliceTimings(
        ['07:00', '10:00', '13:00', '16:00', '19:00', '21:00'],
        'diet-1',
      ),
    },
    {
      id: 'diet-2',
      name: 'Eat Vegetables',
      description: 'Include vegetables in meals',
      servings: Math.ceil(3 * modeMultiplier),
      difficulty: baseDifficulty <= 4 ? 'easy' : 'medium',
      points: 10,
      category: 'diet',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/167d092d-7bb3-4b26-9be6-988314677335/watermarked_preview/watermarked_preview.mp4',
      isCompleted: taskCompleted.includes('diet-2'),
      timings: sliceTimings(['12:00', '19:00'], 'diet-2'),
    },
    {
      id: 'diet-3',
      name: 'Protein Intake',
      description: 'Consume protein-rich foods',
      servings: Math.ceil(2 * modeMultiplier),
      difficulty: 'medium',
      points: 10,
      category: 'diet',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/d4db809f-b37c-466f-84d0-d918e0f2171b/watermarked_preview/watermarked_preview.mp4',
      isCompleted: taskCompleted.includes('diet-3'),
      timings: sliceTimings(['13:00', '20:00'], 'diet-3'),
    },
    {
      id: 'diet-4',
      name: 'Avoid Processed Foods',
      description: 'Skip processed foods',
      difficulty: baseDifficulty <= 3 ? 'medium' : 'hard',
      points: 20,
      category: 'diet',
      isCompleted: taskCompleted.includes('diet-4'),
      timings: [],
    },
    {
      id: 'diet-5',
      name: 'Healthy Snack',
      description: 'Choose fruits or nuts',
      servings: Math.ceil(2 * modeMultiplier),
      difficulty: 'easy',
      points: 7,
      category: 'diet',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/5e9108c1-a0a8-40c4-8efa-b361043b747f/watermarked_preview/watermarked_preview.mp4',
      isCompleted: taskCompleted.includes('diet-5'),
      timings: sliceTimings(['10:00', '15:00', '17:00'], 'diet-5'),
    },
  ];

  /* ---------------- STRESS ---------------- */

  const stressTasks: Task[] = [
    {
      id: 'stress-1',
      name: 'Deep Breathing',
      description: 'Deep breathing exercise',
      duration: Math.ceil(5 * modeMultiplier),
      difficulty: 'easy',
      points: 5,
      category: 'stress',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/a1b22cdb-1c21-4695-a37b-9c9369422a31/watermarked_preview/watermarked_preview.mp4',
      isCompleted: taskCompleted.includes('stress-1'),
      timings: sliceTimings(['08:00', '12:00', '16:00', '20:00'], 'stress-1'),
    },
    {
      id: 'stress-2',
      name: 'Meditation',
      description: 'Meditation session',
      duration: Math.ceil(10 * modeMultiplier),
      difficulty: baseDifficulty <= 4 ? 'easy' : 'medium',
      points: 10,
      category: 'stress',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/e10635a0-254e-4425-9f99-5ffb275471bf/watermarked_preview/watermarked_preview.mp4',
      isCompleted: taskCompleted.includes('stress-2'),
      timings: sliceTimings(['06:30', '20:00'], 'stress-2'),
    },
    {
      id: 'stress-3',
      name: 'Gratitude Journal',
      description: 'Write gratitude notes',
      count: Math.ceil(3 * modeMultiplier),
      difficulty: 'easy',
      points: 20,
      category: 'stress',
      isCompleted: taskCompleted.includes('stress-3'),
      timings: ['21:00'],
    },
    {
      id: 'stress-4',
      name: 'Screen Break',
      description: 'Take screen breaks',
      duration: Math.ceil(15 * modeMultiplier),
      difficulty: 'medium',
      points: 7,
      category: 'stress',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/29fbdf69-2bc3-4e3d-b8de-88c89a96e762/watermarked_preview/watermarked_preview.mp4',
      isCompleted: taskCompleted.includes('stress-4'),
      timings: sliceTimings(['11:00', '15:00', '18:00'], 'stress-4'),
    },
    {
      id: 'stress-5',
      name: 'Stretch Session',
      description: 'Full body stretching',
      duration: Math.ceil(10 * modeMultiplier),
      difficulty: baseDifficulty <= 3 ? 'easy' : 'medium',
      points: 10,
      category: 'stress',
      videoUrl:
        'https://video-previews.elements.envatousercontent.com/6c8ee4fd-704f-4c34-a0e8-3c49c20c96c9/watermarked_preview/watermarked_preview.mp4',
      isCompleted: taskCompleted.includes('stress-5'),
      timings: sliceTimings(['07:00', '19:30'], 'stress-5'),
    },
  ];

  return {
    tasks: {
      activity: activityTasks,
      diet: dietTasks,
      stress: stressTasks,
    },
    booster: {},
  };
};

export const generateDailyTasksWithClaude = async (
  userProfile: GameProfile,
): Promise<SimplifiedTask[]> => {
  const userInput = JSON.stringify(userProfile);
  const response = await generateClaudeResponseText(
    userInput,
    taskGeneratorPrompt,
    [],
    'claude-sonnet-4-20250514',
    false,
  );

  const rawText =
    response?.content &&
    Array.isArray(response.content) &&
    response.content.length > 0 &&
    (response.content[0] as any).text
      ? (response.content[0] as any).text
      : null;

  if (!rawText) return [];

  try {
    const tasks = JSON.parse(rawText);
    return tasks;
  } catch (e) {
    console.warn('Failed to parse Claude response for daily tasks:', e);
    return [];
  }
};
