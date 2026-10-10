import {
  QuestionnaireFormData,
  ScreenConfig,
  ValidationResult,
} from '../types/questionnaire.types';

console.log('🔧 [CONFIG] Loading screens configuration...');

export const SCREENS_CONFIG: ScreenConfig[] = [
  {
    id: 'name',
    title: 'Welcome',
    skipEnabled: true,
    // validateFn: (data: QuestionnaireFormData): ValidationResult => {
    //   console.log('🔍 [VALIDATION] Validating name screen:', data.name);
    //   return {
    //     isValid: data.name.trim().length > 0,
    //     message: 'Please enter your name',
    //   };
    // },
  },
  {
    id: 'age_gender',
    title: 'About You',
    skipEnabled: true,
    validateFn: (data: QuestionnaireFormData): ValidationResult => {
      console.log('🔍 [VALIDATION] Validating age/gender:', {
        gender: data.gender,
        age: data.ageCategory,
      });
      return {
        isValid: !!data.gender && !!data.ageCategory,
        message: 'Please complete all required fields',
      };
    },
  },
  {
    id: 'country',
    title: 'Location',
    skipEnabled: true,
  },
  {
    id: 'diet',
    title: 'Diet & Nutrition',
    skipEnabled: false,
    validateFn: (data: QuestionnaireFormData): ValidationResult => {
      console.log('🔍 [VALIDATION] Validating diet:', {
        seafood: data.consumeSeafood,
        water: data.waterIntake,
        sugar: data.sugarConsumption,
      });
      return {
        isValid:
          !!data.consumeSeafood &&
          !!data.waterIntake &&
          !!data.sugarConsumption,
        message: 'Please answer all diet questions',
      };
    },
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle',
    skipEnabled: false,
    validateFn: (data: QuestionnaireFormData): ValidationResult => {
      console.log('🔍 [VALIDATION] Validating lifestyle:', {
        smoking: data.smoking,
        alcohol: data.alcohol,
      });
      return {
        isValid: !!data.smoking && !!data.alcohol,
        message: 'Please answer all lifestyle questions',
      };
    },
  },
  {
    id: 'wellness',
    title: 'Wellness',
    skipEnabled: false,
    validateFn: (data: QuestionnaireFormData): ValidationResult => {
      console.log('🔍 [VALIDATION] Validating wellness:', {
        energy: data.energyLevel,
        stress: data.stress,
        sleep: data.sleep,
      });
      return {
        isValid: data.energyLevel > 0 && !!data.stress && !!data.sleep,
        message: 'Please answer all wellness questions',
      };
    },
  },
  {
    id: 'goals',
    title: 'Health Goals',
    skipEnabled: false,
    validateFn: (data: QuestionnaireFormData): ValidationResult => {
      console.log('🔍 [VALIDATION] Validating goals:', data.healthGoals);
      return {
        isValid: data.healthGoals.length > 0,
        message: 'Please select at least one health goal',
      };
    },
  },
  {
    id: 'completion',
    title: 'Finalizing',
    skipEnabled: false,
  },
];

export const TOTAL_SCREENS = SCREENS_CONFIG.length;

// Default form data with skip-friendly defaults
export const DEFAULT_FORM_DATA: QuestionnaireFormData = {
  name: '',
  gender: '',
  ageCategory: '',
  height: '',
  weight: '',
  country: 'Prefer not to say',
  consumeSeafood: '',
  waterIntake: '',
  sugarConsumption: '',
  smoking: '',
  alcohol: '',
  energyLevel: 5,
  stress: '',
  sleep: '',
  healthGoals: [],
  goalDetails: [],
};

console.log(`✅ [CONFIG] Loaded ${TOTAL_SCREENS} screens configuration`);
console.log('📋 [CONFIG] Default form data initialized:', DEFAULT_FORM_DATA);
