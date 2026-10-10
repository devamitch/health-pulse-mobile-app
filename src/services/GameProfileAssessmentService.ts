import { GameProfile } from '@/services/mmkv-redux/slices';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_API } from '@env';

const client = new Anthropic({ apiKey: CLAUDE_API });

interface AssessmentResponse {
  id: number;
  question: string;
  answerString: string;
  questionTag: string;
  answer: string;
}

export class GameProfileAssessmentService {
  /**
   * Generate game profile using Claude AI for more nuanced assessment
   */
  static async assessWithClaude(
    responses: AssessmentResponse[],
  ): Promise<GameProfile | null> {
    try {
      const prompt = this.buildAssessmentPrompt(responses);

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Invalid response from Claude');
      }

      const result = JSON.parse(content.text);
      return this.buildGameProfile(result);
    } catch (error) {
      console.error('[GameProfileAssessment] Claude failed:', error);
      // Fallback to local calculation
      return this.assessLocally(responses);
    }
  }

  private static buildAssessmentPrompt(
    responses: AssessmentResponse[],
  ): string {
    const formattedResponses = responses
      .map(r => `Q${r.id}: ${r.question}\nAnswer: ${r.answer}`)
      .join('\n\n');

    return `You are a wellness assessment AI. Based on the user's questionnaire responses, determine their fitness level and assign them to the appropriate starting level (1-20).

USER RESPONSES:
${formattedResponses}

ASSESSMENT CRITERIA:
- Activity Level (40% weight): Exercise frequency, intensity, endurance
- Diet Quality (35% weight): Meal balance, nutrition awareness, consistency
- Stress Management (25% weight): Sleep quality, mindfulness, mental health

LEVEL RANGES:
- Level 1-4: Beginner (needs foundational habits)
- Level 5-9: Building (developing consistency)
- Level 10-14: Intermediate (established routines)
- Level 15-19: Advanced (optimizing performance)
- Level 20: Elite (exceptional across all areas)

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "level": number (1-20),
  "activityScore": number (0-100),
  "dietScore": number (0-100),
  "stressScore": number (0-100),
  "overallScore": number (0-100),
  "reasoning": "Brief explanation of level assignment",
  "strengthAreas": ["area1", "area2"],
  "improvementAreas": ["area1", "area2"]
}`;
  }

  private static buildGameProfile(assessment: any): GameProfile {
    const xpToNextLevel = this.calculateXPThreshold(assessment.level);

    return {
      userProfile: {
        name: 'Health Seeker',
        level: assessment.level,
        xp: 0,
        xpToNextLevel,
        totalXP: 0,
        daysAtCurrentLevel: 0,
        totalDaysPlaying: 0,
      },
      history: [],
      today: {
        date: new Date().toISOString().split('T')[0],
        mode: 'standard',
        scores: {
          diet: Math.round(assessment.dietScore),
          activity: Math.round(assessment.activityScore),
          stress: Math.round(assessment.stressScore),
        },
        logs: [],
        targets: {
          diet: 100,
          activity: 100,
          stress: 100,
        },
        boosterTaskCompleted: 0,
        tasks: [],
        metadata: {
          missedMorning: false,
          recoveryDaysRemaining: 0,
          activeTimer: undefined,
        },
      },
      streak: 0,
      todayPlan: null,
      levelInfo: [],
      tasks: [],
      streakData: {
        currentStreak: 0,
        longestStreak: 0,
        lastCompleteDay: '',
      },
      behaviorMetrics: {
        completionRate: 0,
        averageTaskCompletionTime: 0,
        categoryPreferences: { diet: 0, activity: 0, stress: 0 },
        frequentlyCompletedTasks: [],
        peakActivityTime: '18:00',
        lastActivityDate: '',
        morningCompletionRate: 0,
        eveningCompletionRate: 0,
        mostActiveTimeWindow: 'evening',
      },
      weeklyReports: [],
      onboarding: {
        completed: false,
        startingLevel: assessment.level,
        questionnaireAnswers: {},
        determinedAt: new Date().toISOString(),
      },
    };
  }

  private static calculateXPThreshold(level: number): number {
    return 500 + (level - 1) * 100;
  }

  /**
   * Fallback local assessment (your original logic)
   */
  static assessLocally(responses: AssessmentResponse[]): GameProfile | null {
    if (!responses || responses.length === 0) return null;

    const parseRange = (value: string): number => {
      if (value.includes('-')) {
        const [min, max] = value.split('-').map(Number);
        return ((min ?? 0) + (max ?? 0)) / 2;
      }
      if (value.includes('+')) return Number(value.replace('+', ''));
      if (value.includes('<')) return Number(value.replace('<', '')) - 1;
      return Number(value);
    };

    const clamp = (v: number, min = 0, max = 100) =>
      Math.max(min, Math.min(max, v));
    const scale = (value: number, max: number) => clamp((value / max) * 100);
    const get = (id: number) =>
      parseRange(responses.find(r => r.id === id)?.answer ?? '0');

    const activityScore = clamp(
      scale(get(101), 300) * 0.3 +
        scale(get(102), 40) * 0.25 +
        scale(get(103), 7) * 0.25 +
        scale(get(104), 60) * 0.2,
    );

    const dietScore = clamp(
      scale(get(201), 3) * 0.4 +
        scale(get(202), 7) * 0.3 +
        scale(get(203), 5) * 0.3,
    );

    const stressScore = clamp(
      scale(get(301), 8) * 0.4 +
        scale(get(302), 20) * 0.3 +
        scale(get(303), 7) * 0.3,
    );

    const overall = activityScore * 0.4 + dietScore * 0.35 + stressScore * 0.25;

    const level =
      overall >= 95
        ? 20
        : overall >= 90
        ? 19
        : overall >= 85
        ? 18
        : overall >= 80
        ? 17
        : overall >= 75
        ? 16
        : overall >= 70
        ? 15
        : overall >= 65
        ? 14
        : overall >= 60
        ? 13
        : overall >= 55
        ? 12
        : overall >= 50
        ? 11
        : overall >= 45
        ? 10
        : overall >= 40
        ? 9
        : overall >= 35
        ? 8
        : overall >= 30
        ? 7
        : overall >= 25
        ? 6
        : overall >= 20
        ? 5
        : overall >= 15
        ? 4
        : overall >= 12
        ? 2
        : 1;

    const xpToNextLevel = this.calculateXPThreshold(level);

    return {
      userProfile: {
        name: 'Health Seeker',
        level,
        xp: 0,
        xpToNextLevel,
        totalXP: 0,
        daysAtCurrentLevel: 0,
        totalDaysPlaying: 0,
      },
      history: [],
      today: {
        date: new Date().toISOString().split('T')[0],
        mode: 'standard',
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
        tasks: [],
        metadata: {
          missedMorning: false,
          recoveryDaysRemaining: 0,
        },
      },
      streak: 0,
      todayPlan: null,
      levelInfo: [],
      tasks: [],
      streakData: {
        currentStreak: 0,
        longestStreak: 0,
        lastCompleteDay: '',
      },
      behaviorMetrics: {
        completionRate: 0,
        averageTaskCompletionTime: 0,
        categoryPreferences: { diet: 0, activity: 0, stress: 0 },
        frequentlyCompletedTasks: [],
        peakActivityTime: '18:00',
        lastActivityDate: '',
        morningCompletionRate: 0,
        eveningCompletionRate: 0,
        mostActiveTimeWindow: 'evening',
      },
      weeklyReports: [],
      onboarding: {
        completed: false,
        startingLevel: level,
        questionnaireAnswers: {},
        determinedAt: new Date().toISOString(),
      },
    };
  }
}

export default GameProfileAssessmentService;
