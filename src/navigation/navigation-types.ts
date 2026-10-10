export type AuthScreens = {
  SplashScreen: undefined;
  OnboardingScreen: undefined;
  WelcomeScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  ForgotPasswordScreen: undefined;
  MailCheckScreen: undefined;
  PasswordResetScreen: undefined;
  PasswordChanged: undefined;
  ChangePasswordScreen: undefined;
  DeleteAccountScreen: undefined;
  OTPVerifyScreen: { email: string };
};

// Main app screens
export type MainScreens = {
  NavigationTab: undefined;
  MyTabs: undefined;
  ProfileScreen: undefined;
  EditProfileScreen: undefined;
  ThemeScreen: undefined;
  Notifications: undefined;
  AboutScreen: undefined;
  ContactUsScreen: undefined;
  FeedBackScreen: undefined;
  TermsConditionScreen: undefined;
  PrivacyPolicyScreen: undefined;
  FAQsScreen: undefined;
  HealthPulseConnect: undefined;
  ConnectDevice: undefined;
};

// Health monitoring screens
export type HealthScreens = {
  BPScreen: undefined;
  HRScreen: undefined;
  HRVScreen: undefined;
  DailyScreen: undefined;
  MonthyScreen: undefined;
  YearlyScreen: undefined;
  VitalScreen: undefined;
  HealthScreen: undefined;
  DietProgressSummary: undefined;
  ActivityProgressSummary: undefined;
};

// Chat related screens
export type ChatScreens = {
  ChatScreen: undefined;
  ChatListcreen: undefined;
  SuperfoodsChatScreen: undefined;
  SupplementsChatScreen: undefined;
  ActivitiesChatScreen: undefined;
};

// Status screens
export type StatusScreens = {
  SupplementScreen: undefined;
  MindfulScreen: undefined;
  SuperfoodScreen: undefined;
  WindScreen: undefined;
  GymScreen: undefined;
  FeminineScreen: undefined;
};

// Questionnaire screens
export type QuestionnaireScreens = {
  QuizScreen: undefined;
  AdditionalInfo: undefined;
  AgeScreen: undefined;
  AllergiesScreen: undefined;
  CountryScreen: undefined;
  DietQuestionScreen: undefined;
  GoalAssesmentScreen: undefined;
  FoodPreferenceScreen: undefined;
  LifestyleQuestionScreenOne: undefined;
  LifestyleQuestionScreenTwo: undefined;
  NameScreen: undefined;
  StressQuestionScreen: undefined;
  QuestionAnswerScreen: undefined;
  ThemeScreenQuiz: undefined;
  PromptGenerationSreen: undefined;
  EditQuizPage: undefined;
  // Task: First time Onboarding Quiz Screen make a refactored screen , dont need this other screens
  MainOnboardingQuiz: undefined;
  // it will be main srcroll view after aon boarding i will face this screen
  OnboardingQuizFlow: undefined;
  // it will be quiz screen with edit questions on if i miss or skip any questions on OnboardingQuizFlow
  SettingsQuizScreen: undefined;
};

// Other screens
export type OtherScreens = {
  SubscriptionScreen: undefined;
};

// Combined app navigation type
export type AppStackParamList = AuthScreens &
  MainScreens &
  HealthScreens &
  ChatScreens &
  StatusScreens &
  QuestionnaireScreens &
  OtherScreens;

export interface ScreenGroup {
  screens: {
    name: keyof AppStackParamList;
    component: React.ComponentType<any>;
    options?: {
      headerShown?: boolean;
      contentStyle?: {
        backgroundColor: string;
      };
      animation?:
        | 'default'
        | 'fade'
        | 'slide_from_right'
        | 'slide_from_bottom'
        | 'none';
      gestureEnabled?: boolean;
      animationDuration?: number;
    };
  }[];
}
