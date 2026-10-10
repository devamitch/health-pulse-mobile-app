// ============================================
// QUESTIONNAIRE TYPES - COMPLETE DEFINITIONS
// ============================================

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ============================================
// NAVIGATION TYPES
// ============================================

export type QuestionnaireNavigationProp = NativeStackNavigationProp<{
  OnboardingQuiz: undefined;
  SettingsQuizScreen: undefined;
  NavigationTab: undefined;
  Home: undefined;
}>;

// ============================================
// SCREEN PROPS
// ============================================

export interface QuestionnaireScreenProps {
  formData?: QuestionnaireFormData;
  updateFormData?: (updates: Partial<QuestionnaireFormData>) => void;
  onSkip?: () => void;
  onNext?: () => void;
  navigation?: QuestionnaireNavigationProp;
}

export interface CompletionScreenProps {
  onNext: () => void;
  formData: QuestionnaireFormData;
}

// ============================================
// FORM DATA STRUCTURE
// ============================================

export interface QuestionnaireFormData {
  // Screen 1: Name
  name: string;

  // Screen 2: Gender & Age
  gender: 'Male' | 'Female' | 'prefer not to say' | '';
  ageCategory:
    | 'less than 18'
    | '18 to 30'
    | '31 to 50'
    | '51 to 70'
    | 'above 70'
    | 'Not to say'
    | '';
  height: string;
  weight: string;

  // Screen 3: Country
  country: string;

  // Screen 4: Diet
  dietType: 'Vegetarian' | 'Keto' | 'Vegan' | 'None' | '';
  consumeSeafood: 'Yes' | 'No' | '';
  mealsPerDay: '1' | '2' | '3' | 'above 3' | '';
  mealRoutine: string[];
  specificDiet: string[];
  otherDiet: string;

  // Screen 5: Allergies & Supplements
  allergies: string[];
  otherAllergy: string;
  supplements: string[];
  otherSupplement: string;

  // Screen 6: Food Preferences
  favoriteCuisines: string[];
  favoriteDishes: string[];

  // Screen 7-8: Lifestyle
  exerciseFrequency: string;
  waterIntake: string;
  smokingStatus: string;
  alcoholConsumption: string;
  cookingFrequency: string;
  mealPrepTime: string;
  sunlightExposure: string;
  aerobicExercise: string;
  preferredActivities: string[];

  // Physical Activity Assessment
  workoutMinutes: string;
  pushups: string;
  workoutDays: string;
  briskWalkMinutes: string;

  // Diet Assessment
  mealCount: string;
  sugaryFoodDays: string;
  fruitVegServings: string;

  // Calm Assessment (Sleep & Stress)
  sleepHours: string;
  relaxationTime: string;
  restedDays: string;

  // Screen 9: Health Goals
  healthGoals: string[];
  goalAssessments: GoalAssessment;

  // Screen 10: Stress & Energy
  stressLevel: number;
  energyLevel: number;
  stressSources: string[];
  copingMechanisms: string[];
  restfulSleep: 'Yes' | 'No' | '';
  mentalStress: 'Yes' | 'No' | '';

  // Screen 11: Personality Q&A
  personalityAnswers: Record<string, string>;

  // Screen 12: Additional Info
  additionalInfo: string;
}

// ============================================
// GOAL ASSESSMENTS
// ============================================

export interface GoalAssessment {
  // Fitness Assessment
  fitnessLevel: number;
  fitnessGoal: 'endurance' | 'strength' | 'flexibility' | '';

  // Build Muscle Assessment
  strengthTraining: string;
  focusMuscle: string;
  proteinGrams: string;
  proteinSupplement: string;

  // Heart Health Assessment
  heartMedication: 'Yes' | 'No' | '';
  BPMonitorFrequency: string;
  sodiumDiet: 'Yes' | 'No' | '';

  // Metabolic Health Assessment
  metabolicIssueMedication: 'Yes' | 'No' | '';
  bloodSugarMonitorFrequency: string;
  avoidSugar: 'Yes' | 'No' | '';

  // Cancer Recovery Assessment
  cancerTreatment: 'yes' | 'no' | '';
  cancerRecoverGoal: string;
  cancerSupportSystem: string;

  // Longevity Assessment
  fastFoodFrequency: string;
  vitaminSupplement: string;
  dietryPattern: string;
}

// ============================================
// VALIDATION
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
  answerString: string;
  questionTag: string;
  answer: string | string[] | number | Record<string, any>;
}

// ============================================
// OPTION TYPES
// ============================================

export interface GenderOption {
  key: string;
  label: string;
  icon?: any;
}

export interface AgeOption {
  value: string;
  label: string;
}

export interface DietOption {
  key: string;
  label: string;
  icon?: any;
}

export interface CuisineOption {
  id: string;
  name: string;
  image?: any;
}

export interface GoalOption {
  key: string;
  label: string;
  icon?: any;
  priority: number;
  hasSubAssessment: boolean;
}

// ============================================
// DEFAULT FORM DATA
// ============================================

export const DEFAULT_FORM_DATA: QuestionnaireFormData = {
  // Name
  name: '',

  // Gender & Age
  gender: '',
  ageCategory: '',
  height: '',
  weight: '',

  // Country
  country: '',

  // Diet
  dietType: '',
  consumeSeafood: '',
  mealsPerDay: '',
  mealRoutine: [],
  specificDiet: [],
  otherDiet: '',

  // Allergies
  allergies: [],
  otherAllergy: '',
  supplements: [],
  otherSupplement: '',

  // Food Preferences
  favoriteCuisines: [],
  favoriteDishes: [],

  // Lifestyle
  exerciseFrequency: '',
  waterIntake: '',
  smokingStatus: '',
  alcoholConsumption: '',
  cookingFrequency: '',
  mealPrepTime: '',
  sunlightExposure: '',
  aerobicExercise: '',
  preferredActivities: [],

  // Physical Activity Assessment
  workoutMinutes: '',
  pushups: '',
  workoutDays: '',
  briskWalkMinutes: '',

  // Diet Assessment
  mealCount: '',
  sugaryFoodDays: '',
  fruitVegServings: '',

  // Calm Assessment
  sleepHours: '',
  relaxationTime: '',
  restedDays: '',

  // Goals
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

  // Stress
  stressLevel: 5,
  energyLevel: 5,
  stressSources: [],
  copingMechanisms: [],
  restfulSleep: '',
  mentalStress: '',

  // Personality
  personalityAnswers: {},

  // Additional
  additionalInfo: '',
};

// ============================================
// SCREEN CONFIGURATIONS
// ============================================

export const ONBOARDING_SCREENS_CONFIG: ScreenConfig[] = [
  {
    id: 'name',
    title: 'Welcome',
    skipEnabled: true,
    // validateFn: (data) => ({
    //   isValid: data.name.trim().length >= 2,
    //   message: 'Please enter your name (at least 2 characters)',
    // }),
  },
  {
    id: 'gender-age',
    title: 'About You',
    skipEnabled: true,
    validateFn: data => ({
      isValid: data.gender !== '' && data.ageCategory !== '',
      message: 'Please select your gender and age range',
    }),
  },
  {
    id: 'country',
    title: 'Location',
    skipEnabled: true,
    validateFn: data => ({
      isValid: data.country !== '',
      message: 'Please select your country',
    }),
  },
  {
    id: 'diet',
    title: 'Diet',
    skipEnabled: true,
    validateFn: data => ({
      isValid:
        data.dietType !== '' &&
        data.mealsPerDay !== '' &&
        data.consumeSeafood !== '',
      message: 'Please answer all diet questions',
    }),
  },
  {
    id: 'cuisines',
    title: 'Food Preferences',
    skipEnabled: true,
  },
  {
    id: 'stress',
    title: 'Wellness',
    skipEnabled: true,
  },
  {
    id: 'activity',
    title: 'Physical Activity',
    skipEnabled: true,
    validateFn: data => ({
      isValid:
        data.workoutMinutes !== '' &&
        data.pushups !== '' &&
        data.workoutDays !== '' &&
        data.briskWalkMinutes !== '',
      message: 'Please answer all activity questions',
    }),
  },
  {
    id: 'diet-assessment',
    title: 'Diet Assessment',
    skipEnabled: true,
    validateFn: data => ({
      isValid:
        data.mealCount !== '' &&
        data.sugaryFoodDays !== '' &&
        data.fruitVegServings !== '',
      message: 'Please answer all diet assessment questions',
    }),
  },
  {
    id: 'calm-assessment',
    title: 'Sleep & Stress',
    skipEnabled: true,
    validateFn: data => ({
      isValid:
        data.sleepHours !== '' &&
        data.relaxationTime !== '' &&
        data.restedDays !== '',
      message: 'Please answer all sleep and stress questions',
    }),
  },
  {
    id: 'allergies',
    title: 'Allergies & Supplements',
    skipEnabled: true,
  },
  {
    id: 'smoke-alcohol',
    title: 'Lifestyle',
    skipEnabled: true,
    validateFn: data => ({
      isValid: data.smokingStatus !== '' && data.alcoholConsumption !== '',
      message: 'Please answer all lifestyle questions',
    }),
  },
  {
    id: 'additional-info',
    title: 'Additional Info',
    skipEnabled: true,
  },
  {
    id: 'goals',
    title: 'Health Goals',
    skipEnabled: false,
    validateFn: data => ({
      isValid: data.healthGoals.length >= 1 && data.healthGoals.length <= 3,
      message: 'Please select 1 to 3 health goals',
    }),
  },
];

export const TOTAL_ONBOARDING_SCREENS = ONBOARDING_SCREENS_CONFIG.length;

// types/questionnaireSettings.ts
import { QuestionnaireScreenConfig } from './types';

export const TOTAL_SETTINGS_SCREENS = 13;

export const SETTINGS_SCREENS_CONFIG: QuestionnaireScreenConfig[] = [
  {
    title: 'What should we call you?',
    subtitle: 'This helps us personalize your experience',
    step: 1,
    skipEnabled: false,
    validateFn: quizData => {
      // Validate name
      return true;
    },
  },
  {
    title: 'Tell us about yourself',
    subtitle: 'Basic information to get started',
    step: 2,
    skipEnabled: false,
    validateFn: quizData => {
      // Validate age and gender
      return true;
    },
  },
  {
    title: 'Where are you from?',
    subtitle: 'This helps with dietary recommendations',
    step: 3,
    skipEnabled: false,
    validateFn: quizData => {
      // Validate country
      return true;
    },
  },
  {
    title: 'Dietary Preferences',
    subtitle: 'Tell us about your eating habits',
    step: 4,
    skipEnabled: false,
    validateFn: quizData => {
      // Validate diet type
      return true;
    },
  },
  {
    title: 'Diet Assessment',
    subtitle: 'How would you rate your current diet?',
    step: 5,
    skipEnabled: false,
    validateFn: quizData => {
      // Validate diet assessment
      return true;
    },
  },
  {
    title: 'Favorite Cuisines',
    subtitle: 'Select your preferred cuisines',
    step: 6,
    skipEnabled: false,
    validateFn: quizData => {
      // Validate cuisines
      return true;
    },
  },
  {
    title: 'Food Allergies',
    subtitle: 'Any food allergies or intolerances?',
    step: 7,
    skipEnabled: true,
    validateFn: quizData => {
      // Validate allergies (optional)
      return true;
    },
  },
  {
    title: 'Activity Level',
    subtitle: 'How active are you?',
    step: 8,
    skipEnabled: false,
    validateFn: quizData => {
      // Validate activity level
      return true;
    },
  },
  {
    title: 'Lifestyle Habits',
    subtitle: 'Smoking and alcohol consumption',
    step: 9,
    skipEnabled: true,
    validateFn: quizData => {
      // Validate lifestyle habits (optional)
      return true;
    },
  },
  {
    title: 'Stress Level',
    subtitle: 'How would you rate your stress?',
    step: 10,
    skipEnabled: false,
    validateFn: quizData => {
      // Validate stress level
      return true;
    },
  },
  {
    title: 'Sleep & Relaxation',
    subtitle: 'How do you manage calmness?',
    step: 11,
    skipEnabled: false,
    validateFn: quizData => {
      // Validate calm assessment
      return true;
    },
  },
  {
    title: 'Additional Information',
    subtitle: 'Any other health considerations?',
    step: 12,
    skipEnabled: true,
    validateFn: quizData => {
      // Validate additional info (optional)
      return true;
    },
  },
  {
    title: 'Health Goals',
    subtitle: 'What are you looking to achieve?',
    step: 13,
    skipEnabled: false,
    validateFn: quizData => {
      // Validate goals
      return true;
    },
  },
];
