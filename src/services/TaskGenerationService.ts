import {
  EVENING_WIND_DOWN,
  MINDFUL_MORNING,
  getAvailableVideoTitles,
  pickVideoForTime,
} from '@/data/gumlet';
import {
  AGE_TASK_CONFIG,
  SMART_SYSTEM,
  TOKEN_CONFIG,
  getPreferredActions,
  getWeakCategory,
} from '@/lib/constants/game-constants';
import {
  BoosterGenerationInput,
  DayScores,
  GameTask,
  TaskCategory,
  TaskGenerationInput,
  TaskGenerationOutput,
  safeNumber,
} from '@/lib/types/game-progression.types';
import taskGeneratorPrompt from '@/utils/task-generation-prompt';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_API } from '@env';

const client = new Anthropic({ apiKey: CLAUDE_API });

// ============================================================================
// REQUEST CACHE (prevent duplicate requests)
// ============================================================================

const requestCache = new Map<
  string,
  { timestamp: number; promise: Promise<any> }
>();
const CACHE_DURATION = 5000; // 5 seconds

function getCacheKey(input: TaskGenerationInput): string {
  return `${input.userProfile.level}-${input.mode}-${
    input.timeOfDay
  }-${new Date().toDateString()}`;
}

function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, value] of requestCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      requestCache.delete(key);
    }
  }
}

// ============================================================================
// COMPRESSED USER CONTEXT (sent as user message — token-efficient)
// ============================================================================

function buildUserContext(input: TaskGenerationInput): string {
  const {
    userProfile,
    userIdentity,
    behaviorMetrics,
    history,
    mode,
    todaysScores,
    timeOfDay,
  } = input;

  const last3 = (history ?? []).slice(-3);
  const avgCompletion =
    last3.length > 0
      ? last3.reduce((s, d) => s + safeNumber(d?.completionRate), 0) /
        last3.length
      : 0;

  const lines: string[] = [];

  // --- Core game state ---
  lines.push(`Level: ${userProfile.level}`);
  lines.push(`Days playing: ${safeNumber(userProfile.totalDaysPlaying)}`);
  lines.push(`Mode: ${(mode ?? 'standard').toUpperCase()}`);
  lines.push(`Time: ${timeOfDay ?? 'morning'}`);
  lines.push(`Completion rate (3-day avg): ${Math.round(avgCompletion)}%`);
  lines.push(
    `Today's scores: diet=${safeNumber(
      todaysScores?.diet,
    )}, activity=${safeNumber(todaysScores?.activity)}, stress=${safeNumber(
      todaysScores?.stress,
    )}`,
  );
  lines.push(
    `Adaptive difficulty: ${safeNumber(
      behaviorMetrics?.adaptiveDifficulty,
      5,
    )}/10`,
  );

  // --- User identity (personalization) ---
  if (userIdentity?.name) lines.push(`Name: ${userIdentity.name}`);
  if (userIdentity?.ageRange) lines.push(`Age range: ${userIdentity.ageRange}`);
  if (userIdentity?.gender) lines.push(`Gender: ${userIdentity.gender}`);
  if (userIdentity?.country) lines.push(`Country: ${userIdentity.country}`);
  if (userIdentity?.fitnessLevel)
    lines.push(`Fitness level: ${userIdentity.fitnessLevel}`);

  // --- Health & diet ---
  if (userIdentity?.healthConditions?.length) {
    lines.push(
      `Health conditions: ${userIdentity.healthConditions.join(', ')}`,
    );
  }
  if (userIdentity?.dietaryRestrictions?.length) {
    lines.push(
      `Dietary restrictions: ${userIdentity.dietaryRestrictions.join(', ')}`,
    );
  }
  if (userIdentity?.goals?.length) {
    lines.push(`Goals: ${userIdentity.goals.join(', ')}`);
  }

  // --- Behavior patterns ---
  const weakCat = getWeakCategory(behaviorMetrics);
  lines.push(`Weakest category: ${weakCat}`);

  if (safeNumber(behaviorMetrics?.dietCompletionRate) > 0) {
    lines.push(
      `Category rates: diet=${Math.round(
        safeNumber(behaviorMetrics?.dietCompletionRate),
      )}%, activity=${Math.round(
        safeNumber(behaviorMetrics?.activityCompletionRate),
      )}%, stress=${Math.round(
        safeNumber(behaviorMetrics?.stressCompletionRate),
      )}%`,
    );
  }

  const prefActions = getPreferredActions(behaviorMetrics);
  if (prefActions.length > 0) {
    lines.push(`Preferred actions: ${prefActions.slice(0, 3).join(', ')}`);
  }

  // --- Variety enforcement ---
  if (behaviorMetrics?.frequentlyCompletedTasks?.length) {
    lines.push(
      `AVOID repeating these (user has done them too often): ${behaviorMetrics.frequentlyCompletedTasks
        .slice(0, 5)
        .join(', ')}`,
    );
  }

  // --- Already completed today ---
  const todaysLogs = input.todaysLogs ?? [];
  if (todaysLogs.length > 0) {
    const completedTitles = todaysLogs
      .filter(l => l?.isDone)
      .map(l => l?.title)
      .filter(Boolean)
      .slice(0, 5);
    if (completedTitles.length > 0) {
      lines.push(`Already done today: ${completedTitles.join(', ')}`);
    }
  }

  // --- Video context ---
  const videoTitles = getAvailableVideoTitles();
  const videoPool =
    timeOfDay === 'evening' ? videoTitles.evening : videoTitles.morning;
  lines.push(
    `Available videos for watch_video tasks (use exact title): ${videoPool.join(
      ', ',
    )}`,
  );

  // --- New user flag ---
  if (safeNumber(userProfile.totalDaysPlaying) < SMART_SYSTEM.NEW_USER_DAYS) {
    lines.push(
      `\nNEW USER (day ${
        safeNumber(userProfile.totalDaysPlaying) + 1
      }): Keep ALL tasks very easy (4-8 coins). Focus on building the habit of opening the app and completing tasks. No fasting, no long timers. Make it feel fun and achievable.`,
    );
  }

  // --- Age-specific override ---
  if (userIdentity?.ageRange) {
    const ageConfig = AGE_TASK_CONFIG[userIdentity.ageRange];
    if (ageConfig) {
      lines.push(
        `\nAge-specific: Max timer ${
          ageConfig.maxTimerMinutes
        } min, activity intensity "${
          ageConfig.activityIntensity
        }", diet focus: ${ageConfig.dietFocus.slice(0, 2).join(', ')}`,
      );
    }
  }

  // --- Evening mode override ---
  if (timeOfDay === 'evening') {
    lines.push(
      `\nEVENING MODE: Wind-down tasks only. No exercise. No cooking. Calm activities under 3 minutes. Use evening videos (Northern Lights, The Milky Way, Stargazing).`,
    );
  }

  return lines.join('\n');
}

// ============================================================================
// POST-PROCESSING: Attach real video data to watch_video tasks
// ============================================================================

function attachVideoData(tasks: GameTask[], timeOfDay: string): GameTask[] {
  const videoPool =
    timeOfDay === 'evening' ? EVENING_WIND_DOWN : MINDFUL_MORNING;
  let videoIndex = 0;

  return tasks.map(task => {
    if (task?.action !== 'watch_video') return task;

    // Try to match by videoTitle from AI response
    const matchedVideo = (task as any).videoTitle
      ? videoPool.find(
          v =>
            v.title.toLowerCase() ===
            String((task as any).videoTitle).toLowerCase(),
        )
      : undefined;

    const video = matchedVideo ?? videoPool[videoIndex % videoPool.length];
    videoIndex++;

    return {
      ...task,
      title: `Watch: ${video.title}`,
      videoUrl: video.playbackUrl,
      seconds: Math.round(video.duration),
    };
  });
}

// ============================================================================
// VALIDATION & SANITIZATION
// ============================================================================

const VALID_ACTIONS: Record<TaskCategory, string[]> = {
  diet: ['capture_photo', 'timer', 'log_record'],
  activity: ['timer'],
  stress: ['watch_video', 'timer', 'log_journal'],
};

function sanitizeTasks(raw: any[]): GameTask[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter(t => t && typeof t === 'object')
    .map((t, i) => {
      const category: TaskCategory =
        t.category === 'diet' ||
        t.category === 'activity' ||
        t.category === 'stress'
          ? t.category
          : 'stress';

      let action = t.action ?? 'timer';
      if (!VALID_ACTIONS[category].includes(action)) {
        action = VALID_ACTIONS[category][0];
      }

      const coins = Math.max(
        4,
        Math.min(20, Math.round(safeNumber(t.coins, 8))),
      );

      const task: GameTask = {
        title:
          typeof t.title === 'string' ? t.title.slice(0, 60) : 'Complete quest',
        coins,
        category,
        id: t.id || `${category}-${action}-${Date.now()}-${i}`,
        isDone: false,
        timings: Array.isArray(t.timings) ? t.timings : ['09:00'],
        action: action as any,
      };

      if (action === 'timer') {
        task.seconds = Math.max(
          30,
          Math.min(7200, Math.round(safeNumber(t.seconds, 120))),
        );
      }

      // Preserve videoTitle for post-processing
      if (action === 'watch_video' && t.videoTitle) {
        (task as any).videoTitle = t.videoTitle;
      }

      return task;
    });
}

// ============================================================================
// BOOSTER HELPERS
// ============================================================================

function makeBoosterFallback(
  category: TaskCategory,
  missingXP: number,
  index: number,
): GameTask {
  const now = Date.now();
  const hour = new Date().getHours();
  const timing = `${String(hour).padStart(2, '0')}:00`;

  const templates: Record<TaskCategory, Partial<GameTask>> = {
    diet: { title: 'Log 1 glass of water', action: 'log_record' },
    activity: {
      title: 'Stand and stretch 1 min',
      action: 'timer',
      seconds: 60,
    },
    stress: {
      title: 'Take 3 slow breaths',
      action: 'timer',
      seconds: 45,
    },
  };

  const base = templates[category];
  return {
    title: base.title!,
    coins: Math.max(4, Math.min(20, missingXP)),
    category,
    id: `booster-${category}-${now}-${index}`,
    isDone: false,
    timings: [timing],
    action: base.action as any,
    seconds: base.seconds,
    generationReason: 'evening_booster',
    scheduledFor: 'evening',
  };
}

// ============================================================================
// MAIN SERVICE
// ============================================================================

export class TaskGenerationService {
  /**
   * Generate personalized daily tasks using Claude AI
   * @param input Task generation input parameters
   * @param signal AbortSignal to cancel the request
   */
  static async generate(
    input: TaskGenerationInput,
    signal?: AbortSignal,
  ): Promise<TaskGenerationOutput> {
    try {
      // Check if request was aborted before starting
      if (signal?.aborted) {
        throw new Error('Request aborted before generation started');
      }

      // Clean expired cache entries
      cleanExpiredCache();

      // Check cache for recent identical request
      const cacheKey = getCacheKey(input);
      const cached = requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('[TaskGen] Returning cached result');
        return cached.promise;
      }

      const isNewUser =
        safeNumber(input.userProfile?.totalDaysPlaying) <
        SMART_SYSTEM.NEW_USER_DAYS;

      const remainingBudget = safeNumber(
        input.tokenBudget,
        TOKEN_CONFIG.DAILY_BUDGET,
      );
      const useCompressed = remainingBudget < TOKEN_CONFIG.TASK_GENERATION_MAX;

      if (!CLAUDE_API || CLAUDE_API.trim() === '') {
        console.warn('[TaskGen] No API key, using fallback');
        return this.generateFallback(input, isNewUser);
      }

      // Create generation promise
      const generationPromise = this.callClaude(input, useCompressed, signal);

      // Cache the promise
      requestCache.set(cacheKey, {
        timestamp: Date.now(),
        promise: generationPromise,
      });

      const tasks = await generationPromise;

      // Check if aborted after Claude call
      if (signal?.aborted) {
        throw new Error('Request aborted after generation');
      }

      if (tasks.length >= 10) {
        const withVideos = attachVideoData(tasks, input.timeOfDay ?? 'morning');
        const enriched = this.enrichTasks(
          withVideos,
          input.timeOfDay === 'evening' ? 'evening_booster' : 'morning',
          input.userIdentity?.userId,
          safeNumber(input.behaviorMetrics?.adaptiveDifficulty, 5),
        );

        return {
          tasks: enriched,
          metadata: {
            algorithm: useCompressed ? 'claude-compressed' : 'claude',
            generatedAt: new Date().toISOString(),
            varietyEnforced: true,
            categoryBalance: this.calculateBalance(enriched),
            generationReason:
              input.timeOfDay === 'evening' ? 'evening_booster' : 'morning',
            tokensUsed: useCompressed
              ? TOKEN_CONFIG.TASK_GENERATION_COMPRESSED
              : TOKEN_CONFIG.TASK_GENERATION_MAX,
            personalizedForUser: input.userIdentity?.userId,
            difficultyLevel: safeNumber(
              input.behaviorMetrics?.adaptiveDifficulty,
              5,
            ),
          },
        };
      }

      return this.generateFallback(input, isNewUser);
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        console.log('[TaskGen] Generation aborted by user');
        throw error; // Re-throw abort errors
      }

      console.error('[TaskGen] Generation failed:', error);
      const isNewUser =
        safeNumber(input.userProfile?.totalDaysPlaying) <
        SMART_SYSTEM.NEW_USER_DAYS;
      return this.generateFallback(input, isNewUser);
    }
  }

  /**
   * Generate evening booster tasks for missing categories
   * @param input Booster generation input
   * @param signal AbortSignal to cancel the request
   */
  static async generateEveningBoosters(
    input: BoosterGenerationInput,
    signal?: AbortSignal,
  ): Promise<GameTask[]> {
    try {
      // Check if aborted before starting
      if (signal?.aborted) {
        throw new Error('Booster generation aborted');
      }

      if (!CLAUDE_API || CLAUDE_API.trim() === '') {
        return this.fallbackBoosters(input);
      }

      const missingInfo = (input.missingCategories ?? [])
        .map(
          c => `${c}: needs ${100 - safeNumber(input.currentScores?.[c])} XP`,
        )
        .join(', ');

      const prompt = `Generate ${
        (input.missingCategories ?? []).length
      } quick evening rescue tasks.
User level: ${safeNumber(input.userLevel)}
Missing: ${missingInfo}

Rules:
- 1 task per missing category
- Under 2 minutes each
- Evening-appropriate (calm, low effort)
- coins = missing XP (capped at 20)
- Use EXACT video titles for watch_video: "Northern Lights", "The Milky Way", "Stargazing"

Return ONLY JSON array:
[{"title":"...","coins":N,"category":"...","id":"booster-cat-ts","isDone":false,"timings":["HH:00"],"action":"timer|log_record|watch_video|log_journal","seconds":N,"videoTitle":"exact title"}]`;

      const response = await client.messages.create(
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: TOKEN_CONFIG.EVENING_BOOSTER_MAX,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          signal: signal as any, // Add abort signal to Anthropic request
        },
      );

      // Check if aborted after API call
      if (signal?.aborted) {
        throw new Error('Booster generation aborted after API call');
      }

      const content = response.content[0];
      if (content?.type !== 'text') throw new Error('Invalid response');

      let text = content.text.trim();
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        text = text.substring(jsonStart, jsonEnd + 1);
      }

      const raw = JSON.parse(text);
      const sanitized = sanitizeTasks(raw);
      const withVideos = attachVideoData(sanitized, 'evening');

      const now = Date.now();
      return withVideos.map((t, i) => ({
        ...t,
        id: `booster-${t.category}-${now}-${i}`,
        isDone: false,
        coins: Math.max(
          4,
          Math.min(20, 100 - safeNumber(input.currentScores?.[t.category])),
        ),
        generationReason: 'evening_booster' as const,
        scheduledFor: 'evening' as const,
      }));
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        console.log('[Booster] Generation aborted');
        throw error; // Re-throw abort errors
      }

      console.error('[TaskGen] Booster generation failed:', error);
      return this.fallbackBoosters(input);
    }
  }

  // ============================================================================
  // PRIVATE: Claude API call
  // ============================================================================

  private static async callClaude(
    input: TaskGenerationInput,
    useCompressed: boolean,
    signal?: AbortSignal,
  ): Promise<GameTask[]> {
    const userContext = buildUserContext(input);
    const maxTokens = useCompressed
      ? TOKEN_CONFIG.TASK_GENERATION_COMPRESSED
      : TOKEN_CONFIG.TASK_GENERATION_MAX;

    console.log('[TaskGen] Calling Claude, compressed:', useCompressed);

    const response = await client.messages.create(
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: taskGeneratorPrompt,
        messages: [{ role: 'user', content: userContext }],
      },
      {
        signal: signal as any, // Add abort signal to Anthropic request
      },
    );

    // Check if aborted after API call
    if (signal?.aborted) {
      throw new Error('Task generation aborted after API call');
    }

    const content = response.content[0];
    if (content?.type !== 'text') return [];

    let text = content.text.trim();
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1);
    }

    const raw = JSON.parse(text);
    return sanitizeTasks(raw);
  }

  // ============================================================================
  // PRIVATE: Fallback (no AI)
  // ============================================================================

  private static generateFallback(
    input: TaskGenerationInput,
    isNewUser: boolean,
  ): TaskGenerationOutput {
    const timeOfDay = input.timeOfDay ?? 'morning';
    const pool = this.buildFallbackPool(input, isNewUser, timeOfDay);
    const withVideos = attachVideoData(pool, timeOfDay);

    return {
      tasks: this.enrichTasks(
        withVideos,
        'morning',
        input.userIdentity?.userId,
        safeNumber(input.behaviorMetrics?.adaptiveDifficulty, 5),
      ),
      metadata: {
        algorithm: 'fallback',
        generatedAt: new Date().toISOString(),
        varietyEnforced: false,
        categoryBalance: this.calculateBalance(withVideos),
        generationReason: 'morning',
        tokensUsed: 0,
      },
    };
  }

  private static buildFallbackPool(
    input: TaskGenerationInput,
    _isNewUser: boolean,
    timeOfDay: string,
  ): GameTask[] {
    const now = Date.now();
    const ageRange = input.userIdentity?.ageRange;
    const ageConfig = ageRange ? AGE_TASK_CONFIG[ageRange] : undefined;
    const maxTimerMin = ageConfig?.maxTimerMinutes ?? 10;
    const intensity = ageConfig?.activityIntensity ?? 'gentle';
    const fitnessLevel = input.userIdentity?.fitnessLevel ?? 'beginner';

    const mode = input.mode ?? 'standard';
    const coinBase =
      mode === 'recovery' || mode === 'rehab' ? 4 : mode === 'hero' ? 10 : 6;
    const c = (offset: number) => Math.max(4, Math.min(20, coinBase + offset));

    // --- Diet ---
    const diet: GameTask[] = [
      {
        title: 'Photo your morning meal',
        coins: c(0),
        category: 'diet',
        id: `diet-photo-1-${now}`,
        isDone: false,
        timings: ['08:00'],
        action: 'capture_photo',
      },
      {
        title: 'Snap your lunch plate',
        coins: c(0),
        category: 'diet',
        id: `diet-photo-2-${now}`,
        isDone: false,
        timings: ['12:30'],
        action: 'capture_photo',
      },
      {
        title: 'Capture dinner',
        coins: c(1),
        category: 'diet',
        id: `diet-photo-3-${now}`,
        isDone: false,
        timings: ['19:00'],
        action: 'capture_photo',
      },
      {
        title: `Skip sugary drinks ${Math.min(30, maxTimerMin * 2)} min`,
        coins: c(3),
        category: 'diet',
        id: `diet-timer-1-${now}`,
        isDone: false,
        timings: ['14:00'],
        action: 'timer',
        seconds: Math.min(30, maxTimerMin * 2) * 60,
      },
      {
        title: 'Log 1 glass of water',
        coins: c(-1),
        category: 'diet',
        id: `diet-log-1-${now}`,
        isDone: false,
        timings: ['10:00'],
        action: 'log_record',
      },
    ];

    // --- Activity (scaled by fitness + age) ---
    const walkMin =
      fitnessLevel === 'beginner' ? 3 : fitnessLevel === 'building' ? 5 : 8;
    const stretchMin = 2;
    const activeMin =
      fitnessLevel === 'advanced' || fitnessLevel === 'elite' ? 10 : 5;

    type ActTemplate = {
      title: string;
      seconds: number;
      coinOffset: number;
    };
    let activityTemplates: ActTemplate[];

    if (intensity === 'gentle' || intensity === 'very_gentle') {
      activityTemplates = [
        {
          title: `Walk for ${walkMin} min`,
          seconds: walkMin * 60,
          coinOffset: 2,
        },
        { title: 'Gentle arm stretches', seconds: 90, coinOffset: 0 },
        { title: 'Stand up and move', seconds: 60, coinOffset: -1 },
        { title: 'Seated leg raises', seconds: 90, coinOffset: 0 },
        {
          title: `Stretch ${stretchMin} min`,
          seconds: stretchMin * 60,
          coinOffset: 1,
        },
      ];
    } else if (intensity === 'moderate') {
      activityTemplates = [
        {
          title: `Brisk walk ${walkMin} min`,
          seconds: walkMin * 60,
          coinOffset: 3,
        },
        { title: 'Desk stretch break', seconds: 120, coinOffset: 1 },
        { title: 'Stair climb 2 min', seconds: 120, coinOffset: 2 },
        {
          title: `Light jog ${activeMin} min`,
          seconds: activeMin * 60,
          coinOffset: 4,
        },
        { title: 'Dance to 1 song', seconds: 180, coinOffset: 2 },
      ];
    } else {
      activityTemplates = [
        {
          title: `Jog ${activeMin} min`,
          seconds: activeMin * 60,
          coinOffset: 5,
        },
        { title: 'Bodyweight squats 2 min', seconds: 120, coinOffset: 3 },
        { title: 'Push-ups 90 sec', seconds: 90, coinOffset: 3 },
        {
          title: `Run ${Math.min(activeMin + 5, maxTimerMin)} min`,
          seconds: Math.min(activeMin + 5, maxTimerMin) * 60,
          coinOffset: 6,
        },
        { title: 'Jump rope 2 min', seconds: 120, coinOffset: 4 },
      ];
    }

    const actTimings = ['07:30', '09:00', '13:00', '17:00', '18:30'];
    const activity: GameTask[] = activityTemplates.map((t, i) => ({
      title: t.title,
      coins: c(t.coinOffset),
      category: 'activity' as const,
      id: `act-${i}-${now}`,
      isDone: false,
      timings: [actTimings[i]],
      action: 'timer' as const,
      seconds: t.seconds,
    }));

    // --- Stress ---
    const video = pickVideoForTime(
      timeOfDay === 'evening' ? 'evening' : 'morning',
    );
    const stress: GameTask[] = [
      {
        title: `Watch: ${video.title}`,
        coins: c(2),
        category: 'stress',
        id: `stress-video-1-${now}`,
        isDone: false,
        timings: [timeOfDay === 'evening' ? '20:30' : '08:00'],
        action: 'watch_video',
        videoUrl: video.playbackUrl,
        seconds: Math.round(video.duration),
      },
      {
        title: 'Box breathing 4-4-4',
        coins: c(1),
        category: 'stress',
        id: `stress-breath-1-${now}`,
        isDone: false,
        timings: ['09:30'],
        action: 'timer',
        seconds: 60,
      },
      {
        title: 'Body scan 2 min',
        coins: c(2),
        category: 'stress',
        id: `stress-scan-1-${now}`,
        isDone: false,
        timings: ['15:00'],
        action: 'timer',
        seconds: 120,
      },
      {
        title: 'Write 1 gratitude',
        coins: c(1),
        category: 'stress',
        id: `stress-journal-1-${now}`,
        isDone: false,
        timings: ['21:00'],
        action: 'log_journal',
      },
      {
        title: 'Name 3 good things today',
        coins: c(2),
        category: 'stress',
        id: `stress-journal-2-${now}`,
        isDone: false,
        timings: ['21:30'],
        action: 'log_journal',
      },
    ];

    return [...diet, ...activity, ...stress];
  }

  private static fallbackBoosters(input: BoosterGenerationInput): GameTask[] {
    return (input.missingCategories ?? []).map((cat, i) => {
      const missingXP = 100 - safeNumber(input.currentScores?.[cat]);
      return makeBoosterFallback(cat, missingXP, i);
    });
  }

  // ============================================================================
  // PRIVATE: Enrich & balance
  // ============================================================================

  private static enrichTasks(
    tasks: GameTask[],
    reason: string,
    userId?: string,
    difficultyLevel?: number,
  ): GameTask[] {
    const now = Date.now();
    return tasks.map((t, i) => ({
      ...t,
      id: t?.id || `task-${t?.category ?? 'diet'}-${now}-${i}`,
      isDone: false,
      status: 'available' as const,
      generationReason: reason as any,
      scheduledFor: (reason === 'evening_booster'
        ? 'evening'
        : 'morning') as const,
      points: t?.coins ?? 10,
      personalizedFor: userId,
      difficultyScore: difficultyLevel,
    }));
  }

  private static calculateBalance(tasks: GameTask[]): DayScores {
    return {
      diet: tasks.filter(t => t?.category === 'diet').length,
      activity: tasks.filter(t => t?.category === 'activity').length,
      stress: tasks.filter(t => t?.category === 'stress').length,
    };
  }
}

export default TaskGenerationService;
