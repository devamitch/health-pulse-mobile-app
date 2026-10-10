export interface AssessmentQuestion {
  question: string;
  options: string[];
}

export const activity_questions: AssessmentQuestion[] = [
  {
    question: 'How many minutes do you exercise per week?',
    options: ['0-30', '31-90', '91-180', '180+'],
  },
  {
    question: 'How many push-ups can you do continuously without stopping?',
    options: ['0-5', '6-15', '16-30', '30+'],
  },
  {
    question: 'How many days per week do you do moderate or intense physical activity?',
    options: ['0-1', '2-3', '4-5', '6-7'],
  },
  {
    question: 'How long can you brisk-walk or jog without resting? (minutes)',
    options: ['0-10', '11-25', '26-45', '45+'],
  },
] as const;

export const diet_questions: AssessmentQuestion[] = [
  {
    question: 'How many balanced meals do you eat per day?',
    options: ['0-1', '2', '3', '4+'],
  },
  {
    question: 'How many days per week do you avoid sugary drinks or junk food?',
    options: ['0-1', '2-3', '4-5', '6-7'],
  },
  {
    question: 'How many servings of fruits or vegetables do you eat per day?',
    options: ['0-1', '2', '3-4', '5+'],
  },
] as const;

export const stress_questions: AssessmentQuestion[] = [
  {
    question: 'How many hours do you sleep on average per night?',
    options: ['<5', '5-6', '7-8', '9+'],
  },
  {
    question: 'How many minutes per day do you spend on mindfulness or relaxation?',
    options: ['0-5', '6-15', '16-30', '30+'],
  },
  {
    question: 'How many days per week do you feel well-rested?',
    options: ['0-1', '2-3', '4-5', '6-7'],
  },
] as const;
