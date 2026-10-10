import {
  BehaviorMetrics,
  DayRecord,
  UserProfile,
  WeeklyReport,
} from '@/lib/types/game-progression.types';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_API } from '@env';

const client = new Anthropic({ apiKey: CLAUDE_API });

interface ReportInput {
  history: DayRecord[];
  behaviorMetrics: BehaviorMetrics;
  userProfile: UserProfile;
}

export class ReportGenerationService {
  static async generate(input: ReportInput): Promise<WeeklyReport> {
    const last7 = input.history.slice(-7);
    const now = new Date();
    const weekEnd = now.toISOString().split('T')[0];
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const stats = {
      totalTasksCompleted: last7.reduce((s, d) => s + d.tasksCompleted, 0),
      totalTasksGenerated: last7.reduce((s, d) => s + d.tasksGenerated, 0),
      completionRate: 0,
      totalXP: last7.reduce((s, d) => s + d.totalXPEarned, 0),
      streakMaintained: last7.every(d => d.completionRate >= 60),
      categoryBreakdown: {
        diet: Math.round(
          last7.reduce((s, d) => s + d.scores.diet, 0) /
            Math.max(last7.length, 1),
        ),
        activity: Math.round(
          last7.reduce((s, d) => s + d.scores.activity, 0) /
            Math.max(last7.length, 1),
        ),
        stress: Math.round(
          last7.reduce((s, d) => s + d.scores.stress, 0) /
            Math.max(last7.length, 1),
        ),
      },
      photosLogged: last7.reduce((s, d) => s + d.photosLogged, 0),
    };
    stats.completionRate =
      stats.totalTasksGenerated > 0
        ? Math.round(
            (stats.totalTasksCompleted / stats.totalTasksGenerated) * 100,
          )
        : 0;

    const daysWithMacros = last7.filter(d => d.totalMacros);
    const avgMacros =
      daysWithMacros.length > 0
        ? {
            calories: Math.round(
              daysWithMacros.reduce(
                (s, d) => s + (d.totalMacros?.calories ?? 0),
                0,
              ) / daysWithMacros.length,
            ),
            protein: Math.round(
              daysWithMacros.reduce(
                (s, d) => s + (d.totalMacros?.protein ?? 0),
                0,
              ) / daysWithMacros.length,
            ),
            carbs: Math.round(
              daysWithMacros.reduce(
                (s, d) => s + (d.totalMacros?.carbs ?? 0),
                0,
              ) / daysWithMacros.length,
            ),
            fats: Math.round(
              daysWithMacros.reduce(
                (s, d) => s + (d.totalMacros?.fats ?? 0),
                0,
              ) / daysWithMacros.length,
            ),
          }
        : undefined;

    let aiReport: string | undefined;
    let recommendations: string[] = [];

    try {
      const prompt = `Generate a 300-400 word weekly wellness report in markdown.

USER: Level ${input.userProfile.level} "${input.userProfile.name}"
WEEK: ${weekStart} to ${weekEnd}

STATS:
- Tasks: ${stats.totalTasksCompleted}/${stats.totalTasksGenerated} (${
        stats.completionRate
      }%)
- XP Earned: ${stats.totalXP}
- Streak: ${stats.streakMaintained ? 'Maintained' : 'Broken'}
- Diet Score: ${stats.categoryBreakdown.diet}/100
- Activity Score: ${stats.categoryBreakdown.activity}/100
- Stress Score: ${stats.categoryBreakdown.stress}/100
- Photos Logged: ${stats.photosLogged}
${
  avgMacros
    ? `- Avg Macros: ${avgMacros.calories}cal, ${avgMacros.protein}g protein, ${avgMacros.carbs}g carbs, ${avgMacros.fats}g fats`
    : ''
}

BEHAVIOR:
- Peak Activity: ${input.behaviorMetrics.peakActivityTime}
- Completion Rate: ${input.behaviorMetrics.completionRate}%

Sections: Achievements, Category Analysis, Dietary Insights (if macros available), Patterns Observed, Looking Ahead.
Tone: Encouraging, specific, actionable.

After the report, add a JSON block with recommendations:
\`\`\`json
{"recommendations": ["rec1", "rec2", "rec3"]}
\`\`\``;

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        const text = content.text;
        const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            recommendations = parsed.recommendations || [];
          } catch {}
          aiReport = text.replace(/```json[\s\S]*?```/, '').trim();
        } else {
          aiReport = text;
        }
      }
    } catch {
      aiReport = this.generateFallbackReport(stats, input.userProfile);
      recommendations = this.generateFallbackRecommendations(stats);
    }

    return {
      weekStart,
      weekEnd,
      generatedAt: now.toISOString(),
      ...stats,
      averageMacros: avgMacros,
      aiGeneratedReport: aiReport,
      recommendations,
    };
  }

  private static generateFallbackReport(
    stats: any,
    profile: UserProfile,
  ): string {
    const greeting =
      stats.completionRate >= 80
        ? 'Outstanding week!'
        : stats.completionRate >= 60
        ? 'Good progress this week!'
        : 'Every step counts.';

    const strongest = Object.entries(stats.categoryBreakdown).sort(
      ([, a], [, b]) => (b as number) - (a as number),
    )[0];
    const weakest = Object.entries(stats.categoryBreakdown).sort(
      ([, a], [, b]) => (a as number) - (b as number),
    )[0];

    return `## Weekly Report\n\n${greeting}\n\nYou completed ${
      stats.totalTasksCompleted
    } tasks and earned ${stats.totalXP} XP.\n\nYour strongest area was **${
      strongest![0]
    }** at ${strongest![1]}/100. Focus next week on **${weakest![0]}** (${
      weakest![1]
    }/100) to level up faster.`;
  }

  private static generateFallbackRecommendations(stats: any): string[] {
    const recs: string[] = [];
    if (stats.categoryBreakdown.diet < 70)
      recs.push('Try logging at least 2 meals with photos daily');
    if (stats.categoryBreakdown.activity < 70)
      recs.push('Start with 10-minute walks to build consistency');
    if (stats.categoryBreakdown.stress < 70)
      recs.push('Add a 5-minute breathing session before bed');
    if (stats.completionRate < 80)
      recs.push('Focus on completing morning tasks early for momentum');
    if (recs.length === 0)
      recs.push('Keep up the great work! Try hero mode for extra challenge');
    return recs;
  }
}

export default ReportGenerationService;
