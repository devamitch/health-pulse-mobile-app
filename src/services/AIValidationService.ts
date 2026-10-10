import { TOKEN_CONFIG } from '@/lib/constants/game-constants';
import {
  AIValidationResult,
  TaskCategory,
} from '@/lib/types/game-progression.types';
import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_API } from '@env';
import RNFS from 'react-native-fs';

const client = new Anthropic({ apiKey: CLAUDE_API });

// ============================================================================
// TYPES
// ============================================================================

interface ValidationInput {
  uri: string;
  expectedCategory: TaskCategory;
  taskDescription: string;
  taskName: string;
}

interface ValidationOutput {
  result: AIValidationResult;
  tokensUsed: number;
}

// ============================================================================
// IN-MEMORY CACHE (token reduction — avoid re-validating same photo)
// ============================================================================

interface CacheEntry {
  result: AIValidationResult;
  timestamp: number;
}

const validationCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCacheKey(uri: string, category: TaskCategory): string {
  // Use last 50 chars of URI + category as key
  const uriKey = uri.length > 50 ? uri.slice(-50) : uri;
  return `${category}:${uriKey}`;
}

function getCachedResult(key: string): AIValidationResult | null {
  const entry = validationCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    validationCache.delete(key);
    return null;
  }
  return entry.result;
}

// ============================================================================
// PROMPT BUILDERS (category-specific, token-optimized)
// ============================================================================

function buildPrompt(category: TaskCategory, taskName: string): string {
  if (category === 'diet') {
    return `Analyze this food/meal photo for task: "${taskName}".
Determine if this is actually food. Accept both healthy and unhealthy food — we want honest tracking.
Only mark isValid=false if this is NOT food at all.
Be lenient: accept blurry photos, awkward angles, photos of screens showing food.
Estimate macros from visible portions.
Respond ONLY with JSON (no markdown):
{
  "isValid": boolean,
  "confidence": number (0-100),
  "detectedItems": ["item1", "item2"],
  "feedback": "encouraging feedback",
  "macros": { "calories": number, "protein": number, "carbs": number, "fats": number },
  "foodType": "healthy|unhealthy|snack|drink|meal",
  "message": "brief encouraging message",
  "suggestions": ["optional suggestion"]
}`;
  }

  if (category === 'activity') {
    return `Analyze this photo for activity task: "${taskName}".
Check if it shows exercise, movement, related equipment, or an exercise environment.
Be lenient: accept gym selfies, outdoor shots, home workouts, even exercise equipment.
Respond ONLY with JSON (no markdown):
{
  "isValid": boolean,
  "confidence": number (0-100),
  "detectedItems": ["item1"],
  "feedback": "encouraging feedback",
  "message": "brief encouraging message",
  "suggestions": ["optional suggestion"]
}`;
  }

  // stress / calm
  return `Analyze this photo for calm/stress-relief task: "${taskName}".
Check for meditation, journaling, stretching, nature, tea, calming activities.
Be very lenient — any calm setting counts.
Respond ONLY with JSON (no markdown):
{
  "isValid": boolean,
  "confidence": number (0-100),
  "detectedItems": ["item1"],
  "feedback": "encouraging feedback",
  "message": "brief encouraging message"
}`;
}

// ============================================================================
// SAFE NUMBER HELPER
// ============================================================================

function safeNum(val: unknown): number {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

// ============================================================================
// MAIN SERVICE
// ============================================================================

export class AIValidationService {
  /**
   * Check if we have enough token budget for AI validation
   */
  static canValidate(remainingBudget: number): boolean {
    return remainingBudget >= TOKEN_CONFIG.MIN_BUDGET_FOR_AI;
  }

  /**
   * Core validation — calls Claude Vision API
   */
  static async validatePhoto(
    input: ValidationInput,
  ): Promise<AIValidationResult> {
    try {
      // Check API key
      if (!CLAUDE_API || CLAUDE_API.trim() === '') {
        console.warn('[AIValidation] No API key, using fallback');
        return AIValidationService.getFallbackResult(
          input.taskName,
          input.expectedCategory,
        );
      }

      // Check cache first
      const cacheKey = getCacheKey(input.uri, input.expectedCategory);
      const cached = getCachedResult(cacheKey);
      if (cached) {
        console.log('[AIValidation] Cache hit');
        return cached;
      }

      // Read image as base64
      const cleanUri = input.uri.replace('file://', '');
      const base64 = await RNFS.readFile(cleanUri, 'base64');
      const mediaType: 'image/jpeg' | 'image/png' = input.uri
        .toLowerCase()
        .includes('.png')
        ? 'image/png'
        : 'image/jpeg';

      const prompt = buildPrompt(input.expectedCategory, input.taskName);

      // Call Claude API
      console.log('[AIValidation] Calling Claude API...');
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: TOKEN_CONFIG.PHOTO_VALIDATION_MAX,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64,
                },
              },
              { type: 'text', text: prompt },
            ],
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') throw new Error('Invalid response type');

      // Parse JSON from response
      let text = content.text.trim();
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        text = text.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(text);

      // Normalize result with safe numbers
      const result: AIValidationResult = {
        isValid: !!parsed.isValid,
        confidence: safeNum(parsed.confidence),
        detectedItems: Array.isArray(parsed.detectedItems)
          ? parsed.detectedItems
          : [],
        feedback: parsed.feedback ?? parsed.message ?? '',
        macros: parsed.macros
          ? {
              calories: safeNum(parsed.macros.calories),
              protein: safeNum(parsed.macros.protein),
              carbs: safeNum(parsed.macros.carbs),
              fats: safeNum(parsed.macros.fats),
            }
          : undefined,
        foodType: parsed.foodType,
        message: parsed.message ?? parsed.feedback ?? '',
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions
          : [],
        validatedAt: Date.now(),
        modelUsed: 'claude-sonnet-4-20250514',
      };

      // Cache result
      validationCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });

      console.log('[AIValidation] Result:', {
        isValid: result.isValid,
        confidence: result.confidence,
        macros: result.macros,
      });

      return result;
    } catch (error: any) {
      console.error('[AIValidation] Error:', error?.message ?? error);

      // Handle specific HTTP errors
      if (error?.status === 401) {
        return {
          isValid: true,
          confidence: 50,
          message: `Task "${input.taskName}" recorded! (API key issue)`,
          feedback: 'Auto-accepted',
        };
      }
      if (error?.status === 429) {
        return {
          isValid: true,
          confidence: 50,
          message: `Great job on "${input.taskName}"! (Rate limited — auto-accepted) ⭐`,
          feedback: 'Rate limited',
        };
      }

      return AIValidationService.getFallbackResult(
        input.taskName,
        input.expectedCategory,
      );
    }
  }

  /**
   * Validate photo and return token usage for budget tracking
   */
  static async validatePhotoWithTokens(
    input: ValidationInput,
  ): Promise<ValidationOutput> {
    // Check cache first — 0 tokens if cached
    const cacheKey = getCacheKey(input.uri, input.expectedCategory);
    const cached = getCachedResult(cacheKey);
    if (cached) {
      return { result: cached, tokensUsed: 0 };
    }

    const result = await AIValidationService.validatePhoto(input);

    // Estimate tokens used (prompt + response)
    const tokensUsed = TOKEN_CONFIG.PHOTO_VALIDATION_MAX;

    return { result, tokensUsed };
  }

  /**
   * Fallback result when API is unavailable or budget exhausted
   */
  static getFallbackResult(
    taskName: string,
    category: TaskCategory,
  ): AIValidationResult {
    const messages = [
      `Amazing work on "${taskName}"! Your dedication is inspiring! 🎉`,
      `Fantastic effort completing "${taskName}"! Keep it up! 💪`,
      `Well done on "${taskName}"! Excellent progress! 🌟`,
      `Great job with "${taskName}"! Consistency pays off! ⭐`,
      `Awesome work on "${taskName}"! You're on fire today! 🔥`,
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return {
      isValid: true,
      confidence: 60,
      feedback: randomMessage,
      message: randomMessage,
      macros:
        category === 'diet'
          ? { calories: 0, protein: 0, carbs: 0, fats: 0 }
          : undefined,
      validatedAt: Date.now(),
    };
  }

  /** Clear in-memory cache (for testing/reset) */
  static clearCache(): void {
    validationCache.clear();
  }
}

export default AIValidationService;
