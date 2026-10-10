import Anthropic from '@anthropic-ai/sdk';
import { CLAUDE_API as API_KEY } from '@env';

// Initialize Anthropic client
const claudeClient = new Anthropic({
  apiKey: API_KEY,
});

export interface FoodValidationResult {
  isValid: boolean;
  confidence: number;
  foodType: string;
  message: string;
  suggestions?: string[];
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
}

/**
 * Convert image file to base64
 */
const fileToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('[AI Validation] Error converting image:', error);
    throw new Error('Failed to process image');
  }
};

/**
 * Detect image media type from URI
 */
const getImageMediaType = (
  uri: string,
): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' => {
  const lowerUri = uri.toLowerCase();
  if (lowerUri.includes('.png')) return 'image/png';
  if (lowerUri.includes('.webp')) return 'image/webp';
  if (lowerUri.includes('.gif')) return 'image/gif';
  return 'image/jpeg'; // default
};

/**
 * System prompt for task validation
 */
const getValidationSystemPrompt =
  () => `You are a helpful and encouraging fitness/wellness task validator. Your job is to:

1. **Verify task completion** - Check if the user has completed their wellness task
2. **Be lenient with image quality** - Accept blurry, unclear, or low-quality photos as long as you can reasonably identify the task is being done
3. **Stay positive** - Always provide encouraging feedback, even when the task isn't clearly visible
4. **Focus on effort** - Recognize the user's effort to complete their wellness goals

**Image Quality Guidelines:**
- ✅ Accept blurry images if you can identify the general activity/item/food/meeal or combine source
- ✅ Accept partial views or unclear lighting
- ✅ Accept photos taken from awkward angles
- ✅ Accept photos taken from another screen
- ✅ Accept photos are macthing minimum 
- ✅ Give users the benefit of the doubt
- ❌ Only reject if you genuinely cannot tell what the image shows

**Response Format:**
Always respond with valid JSON (no markdown, no code blocks):
{
  "isValid": true/false,
  "confidence": 0-100,
  "foodType": "brief description of what you see",
  "message": "encouraging feedback message"
}`;

/**
 * Generate detailed user prompt for task validation
 */
const getUserValidationPrompt = (
  taskName: string,
  taskCategory: string,
  taskDescription?: string,
) => `**Task to Validate:**
- Name: "${taskName}"
- Category: ${taskCategory}
${taskDescription ? `- Description: ${taskDescription}` : ''}

**Your Mission:**
Look at the photo and determine if this wellness task has been completed or is in progress.

**Remember:**
- Be encouraging and positive
- Accept the photo unless it's completely unrelated
- If the image is blurry but you can make out the general activity or item, mark it as valid
- Focus on the user's effort and intention

**What to check for ${taskCategory} tasks:**
${
  taskCategory === 'diet'
    ? `- Is there food/drink visible?
- Does it align with healthy eating (vegetables, fruits, water, protein, etc.)?
- Even if unclear, can you identify it as a meal/drink?`
    : taskCategory === 'activity'
    ? `- Is the person exercising or in an active pose?
- Can you identify physical activity happening?
- Are they at a gym, outdoors exercising, or doing bodyweight exercises?`
    : `- Is the person in a relaxed/meditative state?
- Can you see stretching, breathing exercises, or calm activities?
- Is there evidence of stress-relief activities (journal, meditation, etc.)?`
}

Now analyze the image and provide your JSON response.`;

/**
 * Validate photo using Claude Vision API
 */
export const validateFoodPhoto = async (
  photoUri: string,
  taskName: string,
  taskCategory: string,
  taskDescription?: string,
): Promise<FoodValidationResult> => {
  console.log('[AI Validation] Starting validation for task:', taskName);

  // Check if API key is configured
  if (!API_KEY || API_KEY.trim() === '') {
    console.warn('[AI Validation] API key not configured, using fallback');
    return {
      isValid: true,
      confidence: 75,
      foodType: 'Task verification skipped (no API key)',
      message: `Great job completing "${taskName}"! Keep up the excellent work! 💪`,
    };
  }

  try {
    // Convert image to base64
    console.log('[AI Validation] Converting image to base64...');
    const base64Image = await fileToBase64(photoUri);
    const mediaType = getImageMediaType(photoUri);
    console.log('[AI Validation] Image converted, media type:', mediaType);

    // Prepare prompts
    const systemPrompt = getValidationSystemPrompt();
    const userPrompt = getUserValidationPrompt(
      taskName,
      taskCategory,
      taskDescription,
    );

    // Call Claude API using SDK
    console.log('[AI Validation] Calling Claude API...');
    const response = await claudeClient.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: userPrompt,
            },
          ],
        },
      ],
    });

    console.log('[AI Validation] Response received from Claude');

    // Extract text from response
    const textContent = response.content.find(
      block => block.type === 'text',
    ) as Anthropic.TextBlock | undefined;

    if (!textContent || !textContent.text) {
      console.warn('[AI Validation] No text content in response');
      return createPositiveFallback(taskName, 75);
    }

    const responseText = textContent.text;
    console.log('[AI Validation] Raw response:', responseText);

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.warn('[AI Validation] Could not parse JSON from response');
      // Try to extract validation from text
      const seemsValid =
        responseText.toLowerCase().includes('valid') ||
        responseText.toLowerCase().includes('completed') ||
        responseText.toLowerCase().includes('good') ||
        responseText.toLowerCase().includes('great');

      return {
        isValid: seemsValid,
        confidence: 70,
        foodType: 'Task identified',
        message:
          responseText.substring(0, 150) ||
          createPositiveFallback(taskName, 70).message,
      };
    }

    // Parse and validate JSON
    const result: FoodValidationResult = JSON.parse(jsonMatch[0]);

    // Ensure positive messaging
    if (!result.message || result.message.trim() === '') {
      result.message = result.isValid
        ? `Excellent work on "${taskName}"! You're crushing your wellness goals! 🌟`
        : `Good effort on "${taskName}"! Try capturing a clearer photo and try again. You've got this! 💪`;
    }

    console.log('[AI Validation] Validation result:', {
      isValid: result.isValid,
      confidence: result.confidence,
      foodType: result.foodType,
    });

    return result;
  } catch (error: any) {
    console.error('[AI Validation] Error during validation:', error);

    // Handle specific error types
    if (error.status === 401) {
      console.error('[AI Validation] Invalid API key');
      return {
        isValid: true,
        confidence: 50,
        foodType: 'Authentication error',
        message: `Task "${taskName}" recorded! (Note: Please check your API key configuration)`,
      };
    }

    if (error.status === 429) {
      console.error('[AI Validation] Rate limit exceeded');
      return {
        isValid: true,
        confidence: 50,
        foodType: 'Rate limit reached',
        message: `Great job on "${taskName}"! (Too many requests - task auto-validated) ⭐`,
      };
    }

    if (error.status === 400) {
      console.error('[AI Validation] Bad request - possibly invalid image');
      return {
        isValid: false,
        confidence: 0,
        foodType: 'Invalid image',
        message:
          'The image could not be processed. Please try taking a new photo with better lighting.',
      };
    }

    // Generic error fallback - always positive
    return createPositiveFallback(taskName, 50);
  }
};

/**
 * Create a positive fallback response
 */
const createPositiveFallback = (
  taskName: string,
  confidence: number,
): FoodValidationResult => {
  const messages = [
    `Amazing work on "${taskName}"! Your dedication is inspiring! 🎉`,
    `Fantastic effort completing "${taskName}"! Keep up the great work! 💪`,
    `Well done on "${taskName}"! You're making excellent progress! 🌟`,
    `Great job with "${taskName}"! Your consistency is paying off! ⭐`,
    `Awesome work on "${taskName}"! You're on fire today! 🔥`,
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return {
    isValid: true,
    confidence: confidence,
    foodType: `Task ~${confidence}% analyzed - accepted`,
    message: randomMessage,
  };
};

/**
 * Simple text-only validation for task completion
 */
export const validateTaskCompletion = async (
  taskName: string,
  taskType: 'activity' | 'diet' | 'stress',
  context: string,
): Promise<{ isValid: boolean; message: string }> => {
  console.log('[AI Validation] Validating task completion:', taskName);

  if (!API_KEY || API_KEY.trim() === '') {
    return {
      isValid: true,
      message: `Excellent work completing "${taskName}"! You're doing amazing! 🌟`,
    };
  }

  try {
    const prompt = `User completed this ${taskType} task: "${taskName}"

Context: ${context}

Provide brief, enthusiastic, and encouraging feedback (1-2 sentences). Make the user feel proud of their achievement.`;

    const response = await claudeClient.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = response.content.find(
      block => block.type === 'text',
    ) as Anthropic.TextBlock | undefined;

    const message =
      textContent?.text.trim() ||
      `Amazing job completing "${taskName}"! Keep up the fantastic work! 💪`;

    return { isValid: true, message };
  } catch (error) {
    console.error('[AI Validation] Error in text validation:', error);
    return {
      isValid: true,
      message: `Task completed! You're making incredible progress! 🎉`,
    };
  }
};

export default {
  validateFoodPhoto,
  validateTaskCompletion,
};
