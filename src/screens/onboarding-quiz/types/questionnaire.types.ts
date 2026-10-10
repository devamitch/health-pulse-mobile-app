/**
 * QUESTIONNAIRE TYPES - COMPLETE DEFINITIONS
 * React Native Questionnaire System
 */

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ============================================
// NAVIGATION TYPES
// ============================================

export type QuestionnaireNavigationProp = NativeStackNavigationProp<{
  OnboardingQuizFlow: undefined;
  SettingsQuizScreen: undefined;
  NavigationTab: undefined;
  Home: undefined;
  NameScreen: undefined;
  AgeScreen: undefined;
  CountryScreen: undefined;
  DietQuestionScreen: undefined;
  AllergiesScreen: undefined;
  FoodPreferenceScreen: undefined;
  LifestyleQuestionScreenOne: undefined;
  LifestyleQuestionScreenTwo: undefined;
  GoalAssesmentScreen: undefined;
  StressQuestionScreen: undefined;
  QuestionAnswerScreen: undefined;
  AdditionalInfo: undefined;
  PromptGenerationSreen: undefined;
}>;

// ============================================
// COMPONENT PROPS
// ============================================

export interface QuestionnaireScreenProps {
  formData: QuestionnaireFormData;
  updateFormData: (updates: Partial<QuestionnaireFormData>) => void;
  onSkip?: () => void;
  onNext?: () => void;
  navigation?: QuestionnaireNavigationProp;
}

export interface CompletionScreenProps {
  onNext: () => void;
  formData: QuestionnaireFormData;
}

// ============================================
// FORM DATA STRUCTURE (COMPLETE)
// ============================================

export interface QuestionnaireFormData {
  // ============================================
  // SCREEN 1: NAME
  // ============================================
  name: string;

  // ============================================
  // SCREEN 2: AGE & GENDER
  // ============================================
  gender: 'Male' | 'Female' | 'prefer not to say' | '';
  age: string; // Numeric age from wheel picker
  ageCategory:
    | 'less than 18'
    | '18 to 30'
    | '31 to 50'
    | '51 to 70'
    | 'above 70'
    | 'Not to say'
    | '';
  height: string; // in cm, optional
  heightUnit: 'cm' | 'ft';
  weight: string; // in kg, optional
  weightUnit: 'kg' | 'lbs';

  // ============================================
  // SCREEN 3: COUNTRY
  // ============================================
  country: string; // Country name or "Prefer not to say"

  // ============================================
  // SCREEN 4: DIET
  // ============================================
  dietType: 'Vegetarian' | 'Keto' | 'Vegan' | 'None' | '';
  consumeSeafood: 'Yes' | 'No' | '';
  mealsPerDay: '1' | '2' | '3' | 'above 3' | '';
  mealRoutine: string[]; // ['Breakfast', 'Lunch', 'Dinner'] - if meals < 3
  specificDiet: string[]; // Multi-select: ['Vegan', 'Vegetarian', 'Keto', 'IF']
  otherDiet: string; // Custom diet text

  // ============================================
  // SCREEN 5: ALLERGIES & SUPPLEMENTS
  // ============================================
  allergies: string[]; // Multi-select allergies
  otherAllergy: string; // Custom allergy text
  supplements: string[]; // Multi-select supplements
  otherSupplement: string; // Custom supplement text

  // ============================================
  // SCREEN 6: FOOD PREFERENCES
  // ============================================
  favoriteCuisines: string[]; // Multi-select cuisines
  favoriteDishes: string[]; // Custom dishes array

  // ============================================
  // SCREEN 7: LIFESTYLE 1
  // ============================================
  exerciseFrequency:
    | 'Daily'
    | '3-5 times/week'
    | '1-2 times/week'
    | 'Rarely'
    | 'Never'
    | '';
  sleepHours: 'Less than 5' | '5-6 hours' | '7-8 hours' | 'More than 8' | '';
  waterIntake:
    | 'Less than 4 glasses'
    | '4-6 glasses'
    | '7-8 glasses'
    | 'More than 8 glasses'
    | '';

  // ============================================
  // SCREEN 8: LIFESTYLE 2
  // ============================================
  smokingStatus: 'Non-smoker' | 'Occasionally' | 'Regularly' | '';
  alcoholConsumption: 'Non-drinker' | 'Occasionally' | 'Regularly' | '';
  cookingFrequency: 'Daily' | 'Few times a week' | 'Rarely' | 'Never' | '';
  mealPrepTime:
    | 'Less than 15 min'
    | '15-30 min'
    | '30-60 min'
    | 'More than 1 hour'
    | '';

  // ============================================
  // SCREEN 9: HEALTH GOALS
  // ============================================
  healthGoals: string[]; // Max 3 selections
  goalAssessments: GoalAssessment; // Sub-assessment data

  // ============================================
  // SCREEN 10: STRESS & CALMNESS
  // ============================================
  stressLevel: number; // 1-10 scale
  energyLevel: number; // 1-10 scale
  mentalStress: 'Yes' | 'No' | '';
  restfulSleep: 'Yes' | 'No' | '';
  stressSources: string[]; // Multi-select
  copingMechanisms: string[]; // Multi-select
  activityLevel:
    | 'Sedentary'
    | 'Lightly Active'
    | 'Moderately Active'
    | 'Very Active'
    | 'Extremely Active'
    | '';

  // ============================================
  // SCREEN 11: PERSONALITY Q&A
  // ============================================
  personalityAnswers: Record<string, string>;

  // ============================================
  // SCREEN 12: ADDITIONAL INFO
  // ============================================
  additionalInfo: string; // Free-form text, max 300 words
}

// ============================================
// GOAL SUB-ASSESSMENTS
// ============================================

export interface GoalAssessment {
  // FITNESS ASSESSMENT
  fitnessLevel: number; // 1-10 slider
  fitnessGoal: 'endurance' | 'strength' | 'flexibility' | '';

  // BUILD MUSCLE ASSESSMENT
  strengthTraining:
    | 'more than 4 times'
    | '2 to 4 times'
    | '1 time'
    | '0 time'
    | '';
  focusMuscle: 'core' | 'Lower Body' | 'Upper Body' | string;
  proteinGrams: string;
  proteinSupplement: 'protein' | 'Creatinine' | 'BCAA' | string;

  // HEART HEALTH ASSESSMENT
  heartMedication: 'Yes' | 'No' | '';
  BPMonitorFrequency:
    | 'Everyday'
    | '2 to 4 times a week'
    | 'Once a week'
    | 'Rarely'
    | '';
  sodiumDiet: 'Yes' | 'No' | '';

  // METABOLIC HEALTH ASSESSMENT
  metabolicIssueMedication: 'Yes' | 'No' | '';
  bloodSugarMonitorFrequency:
    | 'Everyday'
    | '2 to 4 times a week'
    | 'Once a week'
    | 'Rarely'
    | '';
  avoidSugar: 'Yes' | 'No' | '';

  // CANCER RECOVERY ASSESSMENT
  cancerTreatment: 'yes' | 'no' | '';
  cancerRecoverGoal: string;
  cancerSupportSystem: string;

  // LONGEVITY ASSESSMENT
  fastFoodFrequency: 'Everyday' | 'Few times a week' | 'Rarely' | 'Never' | '';
  vitaminSupplement:
    | 'Vitamins'
    | 'Omega - 3'
    | 'Antioxidant'
    | 'Resveratrol'
    | string;
  dietryPattern: 'Mediterranean' | 'Plant - based' | 'Sea food' | string;
}

// ============================================
// VALIDATION & SCREEN CONFIG
// ============================================

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface ScreenConfig {
  id: string;
  title: string;
  skipEnabled: boolean;
  validateFn?: (formData: QuestionnaireFormData) => ValidationResult;
}

// ============================================
// REDUX QUIZ DATA
// ============================================

export interface Quiz {
  id: number;
  question: string;
  answerString: string; // Natural language for AI prompt
  questionTag: string; // Category label
  answer: string | string[]; // Raw answer value
}

// ============================================
// GOAL & CUISINE OPTIONS
// ============================================

export interface GoalOption {
  key: string;
  label: string;
  icon: any; // require('../assets/icons/xxx.png')
  priority: number;
  hasSubAssessment: boolean;
}

export interface CuisineOption {
  id: string;
  name: string;
  image: any; // require('../assets/icons/xxx.png')
}

// ============================================
// SETTINGS CATEGORY CARD
// ============================================

export interface SettingsCategoryCard {
  id: string;
  title: string;
  icon: string; // Ionicons name
  color: string; // Card accent color
  screens: string[]; // Screen names to navigate to
  description: string;
}

// ============================================
// DEFAULT FORM DATA
// ============================================

export const DEFAULT_FORM_DATA: QuestionnaireFormData = {
  name: '',
  gender: '',
  age: '',
  ageCategory: '',
  height: '',
  heightUnit: 'cm',
  weight: '',
  weightUnit: 'kg',
  country: '',
  dietType: '',
  consumeSeafood: '',
  mealsPerDay: '',
  mealRoutine: [],
  specificDiet: [],
  otherDiet: '',
  allergies: [],
  otherAllergy: '',
  supplements: [],
  otherSupplement: '',
  favoriteCuisines: [],
  favoriteDishes: [],
  exerciseFrequency: '',
  sleepHours: '',
  waterIntake: '',
  smokingStatus: '',
  alcoholConsumption: '',
  cookingFrequency: '',
  mealPrepTime: '',
  healthGoals: [],
  goalAssessments: {
    fitnessLevel: 5,
    fitnessGoal: '',
    strengthTraining: '',
    focusMuscle: '',
    proteinGrams: '',
    proteinSupplement: '',
    heartMedication: '',
    BPMonitorFrequency: '',
    sodiumDiet: '',
    metabolicIssueMedication: '',
    bloodSugarMonitorFrequency: '',
    avoidSugar: '',
    cancerTreatment: '',
    cancerRecoverGoal: '',
    cancerSupportSystem: '',
    fastFoodFrequency: '',
    vitaminSupplement: '',
    dietryPattern: '',
  },
  stressLevel: 5,
  energyLevel: 5,
  mentalStress: '',
  restfulSleep: '',
  stressSources: [],
  copingMechanisms: [],
  personalityAnswers: {},
  additionalInfo: '',
  activityLevel: '',
};

// ============================================
// SCREEN CONFIGURATIONS
// ============================================

export const ONBOARDING_SCREENS_CONFIG: ScreenConfig[] = [
  {
    id: 'name',
    title: "What's your name?",
    skipEnabled: false,
    validateFn: data => ({
      isValid: data.name.trim().length > 0,
      message: 'Please enter your name',
    }),
  },
  {
    id: 'age-gender',
    title: 'Tell us about yourself',
    skipEnabled: false,
    validateFn: data => ({
      isValid: data.gender !== '' && data.age !== '',
      message: 'Please select your gender and age',
    }),
  },
  {
    id: 'country',
    title: 'Where are you from?',
    skipEnabled: true,
    validateFn: data => ({
      isValid: data.country !== '',
      message: 'Please select your country',
    }),
  },
  {
    id: 'diet',
    title: 'Your dietary preferences',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'allergies',
    title: 'Any food allergies?',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'cuisines',
    title: 'Favorite cuisines',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'lifestyle1',
    title: 'Your lifestyle',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'lifestyle2',
    title: 'More about you',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'goals',
    title: 'Health goals',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'stress',
    title: 'Stress & Energy',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'calm',
    title: 'Calmness assessment',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'diet-assessment',
    title: 'Diet assessment',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'smoke-alcohol',
    title: 'Lifestyle habits',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'activity',
    title: 'Activity level',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'qa',
    title: 'Quick questions',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'additional',
    title: 'Anything else?',
    skipEnabled: true,
    validateFn: () => ({ isValid: true }),
  },
  {
    id: 'completion',
    title: 'All done!',
    skipEnabled: false,
    validateFn: () => ({ isValid: true }),
  },
];

export const TOTAL_ONBOARDING_SCREENS = ONBOARDING_SCREENS_CONFIG.length;

export default {};
