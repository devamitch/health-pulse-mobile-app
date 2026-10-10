import { Routine } from "@/services/mmkv-redux/slices";

const getRandomMessage = (messages: string[]): string => {
  if (messages.length === 0) {
    return '';
  }
  return messages[Math.floor(Math.random() * messages.length)] ?? '';
};

export const summarizeDayRoutines = (routines: Routine[]): string => {
  const currentDateTime = new Date();
  const currentDateString = currentDateTime.toISOString().split('T')[0];

  let summary = '';
  const upcomingReminders: string[] = [];

  routines.forEach(routine => {
    // Create proper DateTime object for comparison
    const routineDateTime = new Date(`${routine.date}T${routine.time}:00`);
    const isPastDue = routineDateTime <= currentDateTime;
    const isToday = routine.date === currentDateString;
    const isFuture = routineDateTime > currentDateTime;

    const taken = routine.routine_items
      .filter(item => item.checked)
      .map(item => item.item);
    const missed = routine.routine_items
      .filter(item => !item.checked)
      .map(item => item.item);
    const allTaken = taken.length === routine.routine_items.length;
    const noneTaken = taken.length === 0;

    // Only summarize routines that are due (today and past the scheduled time)
    if (isToday && isPastDue) {
      if (allTaken) {
        summary +=
          getRandomMessage([
            `Great job! You completed all your ${routine.routine.toLowerCase()}!`,
            `Awesome work! You didn't miss any of your ${routine.routine.toLowerCase()}. Keep it up!`,
            `You're on track! All your ${routine.routine.toLowerCase()} were done as planned. Well done!`,
            `Fantastic effort! You stayed consistent with your ${routine.routine.toLowerCase()} today.`,
            `Excellent discipline! You completed every part of your ${routine.routine.toLowerCase()}!`,
          ]) + '\n';
      } else if (!noneTaken && missed.length > 0) {
        summary +=
          getRandomMessage([
            `You completed ${taken.join(', ')}, but missed ${missed.join(
              ', ',
            )}. Stay consistent for the best results!`,
            `Almost there! You managed ${taken.join(
              ', ',
            )}, but don't forget ${missed.join(', ')} next time.`,
            `Keep going! You took care of ${taken.join(
              ', ',
            )}, but ${missed.join(', ')} was skipped. Aim for full completion!`,
            `You're improving! You checked off ${taken.join(
              ', ',
            )}, but don't forget ${missed.join(', ')} next time.`,
            `Nice effort! You followed through with ${taken.join(
              ', ',
            )}, but try to include ${missed.join(
              ', ',
            )} as well for the best results!`,
          ]) + '\n';
      } else {
        summary +=
          getRandomMessage([
            `Oops! You didn't complete any of your ${routine.routine.toLowerCase()}. Make sure to stay on schedule!`,
            `Time to refocus! Your ${routine.routine.toLowerCase()} was skipped today. Prioritize your progress!`,
            `Don't let it slip! You missed all your ${routine.routine.toLowerCase()}. Try to stick to your routine.`,
            `Health and consistency matter! You skipped your ${routine.routine.toLowerCase()} today. Stay committed!`,
            `Remember, consistency is key! You didn't complete your ${routine.routine.toLowerCase()}. Make it a habit!`,
          ]) + '\n';
      }
    } else if (isFuture) {
      // Only add truly upcoming routines (future ones)
      upcomingReminders.push(routine.routine.toLowerCase());
    }
  });

  if (upcomingReminders.length > 0) {
    summary += `Don't forget to complete your ${upcomingReminders.join(
      ', ',
    )}!\n`;
  }

  return summary.trim();
};

export const summarizePeriodRoutines = (
  routines: Routine[],
  period: 'week' | 'month',
): string => {
  if (routines.length === 0) {
    return '';
  }

  // Group all routine items across all days
  const allItems = routines.flatMap(r => r.routine_items);
  const totalItems = allItems.length;
  
  // Prevent division by zero
  if (totalItems === 0) {
    return '';
  }

  const takenItems = allItems.filter(item => item.checked);
  const missedItems = allItems.filter(item => !item.checked);
  
  const completionRate = (takenItems.length / totalItems) * 100;
  const missedCount = missedItems.length;
  
  // Get unique item names for summary (avoid repetition)
  const takenNames = [...new Set(takenItems.map(item => item.item))];
  const missedNames = [...new Set(missedItems.map(item => item.item))];
  
  // Get routine type from first routine (assuming all are same type)
  const routineType = routines[0]?.routine.toLowerCase();
  
  let summary = '';

    if (completionRate === 100) {
      summary =
        getRandomMessage([
          `Fantastic job! Over the past ${period}, you completed all your ${routineType}! Keep up the amazing effort!`,
          `Outstanding consistency! Every item in your ${routineType} was completed this ${period}. You're on the right track!`,
          `Impressive! You successfully followed through with all your goals for ${routineType} this ${period}!`,
          `Perfect streak! You didn't miss a single item in your ${routineType} this ${period}. Keep it up!`,
          `Incredible discipline! You've been consistent with all your ${routineType} goals this ${period}. Keep going strong!`,
        ]);
    } else if (completionRate >= 75) {
      summary =
        getRandomMessage([
          `You're almost there! You completed most of your ${routineType} this ${period}, just missing ${missedCount} item(s): ${missedNames.join(
            ', ',
          )}. Keep pushing for full completion!`,
          `Great work! You've covered nearly everything this ${period}, but don't forget ${missedNames.join(
            ', ',
          )} next time!`,
          `You did well! Consistency is key—aim for a perfect record by including ${missedNames.join(
            ', ',
          )} in your next ${period}.`,
          `So close! You've built a great habit, but make sure to include ${missedNames.join(
            ', ',
          )} moving forward!`,
          `You're almost perfect! Just ${missedCount} more item(s) and you'll reach 100% completion in your next ${period}!`,
        ]);
    } else if (completionRate >= 50) {
      summary =
        getRandomMessage([
          `You're making progress! Over the past ${period}, you completed ${takenNames.join(
            ', ',
          )}, but missed ${missedCount} item(s): ${missedNames.join(
            ', ',
          )}. Keep aiming higher!`,
          `You're halfway there! Keep up the effort and try to complete everything next ${period}!`,
          `Good job starting, but improvement is needed! Try to include ${missedNames.join(
            ', ',
          )} for better results in the next ${period}.`,
          `You've reached a solid midpoint—push yourself to include ${missedNames.join(
            ', ',
          )} next ${period}!`,
          `Not bad! But you can do better by completing more of your routine next ${period}!`,
        ]);
    } else if (completionRate >= 25) {
      summary =
        getRandomMessage([
          `A small step forward! Over the past ${period}, you completed ${takenNames.join(
            ', ',
          )}, but missed ${missedCount} item(s): ${missedNames.join(
            ', ',
          )}. Work on staying consistent!`,
          `You've made a start! But remember, progress comes with consistency—try to complete ${missedNames.join(
            ', ',
          )} next ${period}.`,
          `Slow and steady progress! Keep improving and aim to complete your full routine next ${period}!`,
          `You're getting there! Try to be more consistent and complete all your items next ${period}!`,
          `A step in the right direction! Push yourself to complete everything for better results in the next ${period}!`,
        ]);
    } else if (completionRate > 0) {
      summary =
        getRandomMessage([
          `You barely got started this ${period}! You only took ${takenNames.join(
            ', ',
          )}. You missed ${missedCount} item(s): ${missedNames.join(
            ', ',
          )}. Aim for better consistency!`,
          `A minimal effort this ${period}! You took ${takenNames.join(
            ', ',
          )}, but missed most of your routine (${missedCount} item(s): ${missedNames.join(
            ', ',
          )}). Let's work on improving!`,
          `Next ${period}, try harder! Only ${takenNames.join(
            ', ',
          )} was completed—don't let ${missedNames.join(', ')} be skipped again!`,
          `This ${period} wasn't your best. Make sure to prioritize your ${routineType} routine moving forward!`,
          `This was a slow stretch—let's reset and aim for more consistency next ${period}!`,
        ]);
    } else {
      summary =
        getRandomMessage([
          `Oops! Over the past ${period}, you didn't complete any of your ${routineType}. You missed ${missedCount} item(s): ${missedNames.join(
            ', ',
          )}. Let's focus on consistency!`,
          `No progress recorded! You missed your entire ${routineType} this ${period}. Try to stick to your routine moving forward!`,
          `Uh-oh! Your ${routineType} routine was skipped completely this ${period}. Let's make a strong comeback!`,
          `You missed everything this ${period}—let's set a goal to improve next time!`,
          `This wasn't your best effort. Reset, refocus, and get back on track next ${period}!`,
        ]);
    }
  
  return summary.trim();
};
