import {
  GamePlan,
  GameProfile,
  PlanMode,
  ScoreHistory,
} from "@/services/mmkv-redux/slices";

const createInitialState = (): GameProfile => ({
  userProfile: {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    name: "Health Seeker",
  },
  history: [],
  today: {
    date: new Date().toDateString(),
    mode: "STANDARD",
    scores: { diet: 0, stress: 0, activity: 0 },
    logs: [],
    targets: {
      diet: 35,
      activity: 35,
      stress: 30,
    },
    boosterTaskCompleted: 0,
  },
  streak: 0,
  todayPlan: null,
  levelInfo: []
});

const getLevelMultiplier = (level: number) =>
  1 + (level - 1) * 0.05;

const calculateDailyTargets = (
  level: number,
  mode: PlanMode
) => {
  const difficulty = getLevelMultiplier(level);

  const baseMetMinutes = 150;
  const baseCleanEating = 3;
  const baseMindfulness = 10;

  let modeModifier = 1;
  if (mode === "RECOVERY") modeModifier = 0.6;
  if (mode === "HERO") modeModifier = 1.3;

  return {
    metMinutes: Math.round(baseMetMinutes * difficulty * modeModifier),
    cleanMeals: Math.round(baseCleanEating * difficulty),
    mindfulnessMin: Math.round(baseMindfulness * difficulty),
    diet: 100,
    stress: 100,
    activity: 100,
  };
};

const generateNextDayPlan = (
  lastDay: ScoreHistory,
  history: ScoreHistory[]
): GamePlan => {
  if (history.length >= 3) {
    const last3 = history.slice(-3);
    const heroStreak = last3.every(
      d => d.scores.activity === 100
    );

    if (heroStreak) {
      return {
        mode: "HERO",
        message: "You are on fire! Tomorrow is a Challenge Day.",
        focus: "High Intensity Interval Training",
      };
    }
  }

  if (lastDay.scores.activity >= 80) {
    return {
      mode: "STANDARD",
      message: "Let's keep the momentum going.",
      focus: "Balanced Health",
    };
  }

  return {
    mode: "RECOVERY",
    message: "Time to rest and recharge.",
    focus: "Sleep & Stretching",
  };
};

const getMissedDays = (
  today: string,
  lastLogged?: string
): string[] => {
  if (!lastLogged) return [];

  const missed: string[] = [];
  const todayDate = new Date(today);
  const lastDate = new Date(lastLogged);

  const diff = Math.floor(
    (todayDate.getTime() - lastDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  for (let i = 1; i < diff; i++) {
    const d = new Date(lastDate);
    d.setDate(d.getDate() + i);
    missed.push(d.toDateString());
  }

  return missed;
};

const completeDay = (state: GameProfile): void => {
  const lastLoggedDate =
  state.history.length > 0
    ? state.history[state.history.length - 1]?.date
    : undefined;


  const missedDays = getMissedDays(
    state.today.date,
    lastLoggedDate
  );

  missedDays.forEach(date =>
    state.history.push({
      date,
      average: 0,
      scores: { diet: 0, activity: 0, stress: 0 },
      mode: null,
    })
  );

  const { diet, activity, stress } = state.today.scores;
  const average = (diet + activity + stress) / 3;

  let xpGained = diet + activity + stress;
  if (average >= 80) xpGained += 50;

  state.userProfile.xp += xpGained;

  if (state.userProfile.xp >= state.userProfile.xpToNextLevel) {
    state.userProfile.level++;
    state.userProfile.xp = 0;
    state.userProfile.xpToNextLevel = state.userProfile.xpToNextLevel + (state.userProfile.level * 100);
  }

  const summary: ScoreHistory = {
    date: state.today.date,
    average,
    scores: { ...state.today.scores },
    mode: state.today.mode,
  };

  state.history.push(summary);
  if (state.history.length > 7) state.history.shift();

  const nextPlan = generateNextDayPlan(summary, state.history);
  state.todayPlan = nextPlan;

  state.today = {
    date: new Date().toDateString(),
    mode: nextPlan.mode,
    scores: { diet: 0, activity: 0, stress: 0 },
    logs: [],
    targets: calculateDailyTargets(
      state.userProfile.level,
      nextPlan.mode
    ),
    boosterTaskCompleted: 0,
  };
};

export const useGameProfileSimulation = () => {
  const simulate365Days = (
    persona: 1 | 2 | 3 | 4 | 5
  ): GameProfile => {
    const state = createInitialState();

    const followsPlan = (day: number): boolean => {
      switch (persona) {
        case 1:
          return true;
        case 2:
          return Math.random() > 0.4;
        case 3:
          return day % 15 < 10;
        case 4:
          return day < 30;
        case 5:
          return day % 2 === 0;
      }
    };

    for (let day = 0; day < 365; day++) {
      if (followsPlan(day)) {
        state.today.scores = {
          diet: 100,
          activity: 100,
          stress: 100,
        };
      }

      completeDay(state);
    }

    return state;
  };

  return { simulate365Days };
};
