'use client';

import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useCallback, useMemo } from 'react';
import { InteractionManager, Platform } from 'react-native';

// Keep original imports exactly as provided by the user
import LoginScreen from '@/screens/auth/login_screen';
import RegisterScreen from '@/screens/auth/register_screen';
import WelcomeScreen from '@/screens/auth/welcome_screen';
import VitalScreen from '@/screens/vital_screen';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import ChatListcreen from '../LEGACY/check_list_screen';
import DailyScreen from '../LEGACY/daily_screen';
import EditProfileScreen from '../LEGACY/edit_profile_screen';
import FAQsScreen from '../LEGACY/faqs_screen';
import MonthyScreen from '../LEGACY/monthy_screen';
import MyTabs from '../LEGACY/tabbar_screen';
import YearlyScreen from '../LEGACY/yearly_screen';
import ForgotPasswordScreen from '../screens/auth/forgotpassword_screen';
import OnboardingScreen from '../screens/auth/onboarding_screen';
import PasswordChangedScreen from '../screens/auth/passwordChanged_screen';
import PasswordResetScreen from '../screens/auth/passwordReset_screen';
import BPScreen from '../screens/bp_screen';
import ChatScreen from '../screens/chat/chat_screen';
import FeedBackScreen from '../screens/feedback_screen';
import HealthScreen from '../screens/health_screen';
import HRScreen from '../screens/hr_screen';
import HRVScreen from '../screens/hrv_screen';
import MailCheckScreen from '../screens/mail_check_screen';
import ActivitiesChatScreen from '../screens/plan/activities_chat_screen';
import SuperfoodsChatScreen from '../screens/plan/superfoods_chat_screen';
import SupplementsChatScreen from '../screens/plan/supplements_chat_screen';
import ThemeScreen from '../screens/settings/appearance/theme_screen';
import ChangePasswordScreen from '../screens/settings/change-password/change_password_screen';
import ContactUsScreen from '../screens/settings/legal/contact_us_screen';
import PrivacyPolicyScreen from '../screens/settings/legal/privacy_policy_screen';
import TermsConditionScreen from '../screens/settings/legal/terms_condition_screen';
import Notifications from '../screens/settings/notification/notification_screen';
import ProfileScreen from '../screens/settings/setting_screen';
import ConnectDevice from '../screens/settings/health-connect/connect_device';
import HealthPulseConnect from '../screens/settings/health-connect/health_connect';
import SplashScreen from '../screens/splash_screen';
import FeminineScreen from '../screens/status_chat/feminine_screen';
import GymScreen from '../screens/status_chat/gym_screen';
import MindfulScreen from '../screens/status_chat/mindful_screen';
import SuperfoodScreen from '../screens/status_chat/superfood_screen';
import SupplementScreen from '../screens/status_chat/supplement_screen';
import WindScreen from '../screens/status_chat/wind_screen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import NavigationTab from './navigation-tab';

import ActivityProgressSummary from '@/LEGACY/ActivityProgressSummary';
import DietProgressSummary from '@/LEGACY/DietProgressSummary';
import DeleteAccountScreen from '@/screens/auth/delete-account-screen';
import OTPVerificationScreen from '@/screens/auth/otp-verify-screen';
import ActivityTaskScreen from '@/screens/game-tasks/activity-task-screen';
import DietTaskScreen from '@/screens/game-tasks/diet-task-screen';
import ActivityScannerScreen from '@/screens/home/ActivityScannerScreen';
import ProgressSummaryScreen from '@/screens/home/ProgressSummaryScreen';
import RoadmapScreen from '@/screens/home/roadmap_screen';
import OnboardingQuizFlow from '@/screens/onboarding-quiz';
import ADHDQuestionnaireScreen from '@/screens/settings/adhd/adhd_questinaries';
import ADHDDailyQuestionsScreen, {
  Question,
} from '@/screens/settings/adhd/ADHDDailyQuestionsScreen';
import QuizScreen from '@/screens/settings/heath-questionaire/quiz_screen';
import { SimplifiedTask } from '@/utils/gamification/game-plan-generator';
import { ScreenGroup } from './navigation-types';
// import TabBars from './tab-bars';
/**
 * Type definitions for navigation
 */
// Auth related screens
export type AuthScreens = {
  SplashScreen: undefined;
  OnboardingScreen: undefined;
  WelcomeScreen: undefined;
  LoginScreen: undefined;
  RegisterScreen: undefined;
  ForgotPasswordScreen: undefined;
  MailCheckScreen: undefined;
  PasswordResetScreen: { email: string; resetToken?: string };
  PasswordChanged: undefined;
  ChangePasswordScreen: undefined;
  DeleteAccountScreen: undefined;
  OTPVerifyScreen: { email: string };
};

type ActivityScannerType = SimplifiedTask & {
  taskId: string;
  taskType: 'activity' | 'diet' | 'stress';
  taskName: string;
  duration?: number;
  videoUrl?: string;
  targetPose?: string;
  isPremium?: boolean;
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
  ADHDQuestionnaireScreen: undefined;
  ActivityScanner: ActivityScannerType;
  ProgressSummaryScreen: {
    type: 'diet' | 'activity' | 'stress';
  };
  ADHDDailyQuestionsScreen: {
    day: number;
    questions: Question[];
  };
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
  RoadmapScreen: { currentLevel?: number };
};

// Combined app navigation type
export type AppStackParamList = AuthScreens &
  MainScreens &
  HealthScreens &
  ChatScreens &
  StatusScreens &
  QuestionnaireScreens &
  OtherScreens;

// Create the typed navigator
const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Utility functions for navigation performance
 */
const runAfterInteractions = (task: () => any, timeout = 300): void => {
  InteractionManager.runAfterInteractions(() => {
    setTimeout(() => {
      task();
    }, timeout);
  });
};

/**
 * Type-safe navigation hook with performance optimizations
 */
export const useAppNavigation = () => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const navigateTo = useCallback(
    <T extends keyof AppStackParamList>(
      screenName: T,
      params?: AppStackParamList[T],
    ) => {
      runAfterInteractions(
        () => {
          navigation.navigate(screenName as any, params as any);
        },
        Platform.OS === 'ios' ? 50 : 30,
      );
    },
    [navigation],
  );

  const resetTo = useCallback(
    <T extends keyof AppStackParamList>(
      screenName: T,
      params?: AppStackParamList[T],
    ) => {
      navigation.reset({
        index: 0,
        routes: [{ name: screenName, params }],
      });
    },
    [navigation],
  );

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  return {
    ...navigation,
    navigateTo,
    resetTo,
    goBack,
  };
};

/**
 * Get animation type based on screen category
 */
const getAnimationForScreen = (screenName: keyof AppStackParamList): string => {
  // Auth screens
  if (
    screenName === 'SplashScreen' ||
    screenName === 'OnboardingScreen' ||
    screenName === 'WelcomeScreen'
  ) {
    return 'fade';
  }

  // Modal-like screens
  if (
    screenName === 'ProfileScreen' ||
    screenName === 'EditProfileScreen' ||
    screenName === 'SubscriptionScreen' ||
    screenName === 'Notifications'
  ) {
    return 'slide_from_bottom';
  }

  // Chat screens
  if (
    screenName === 'ChatScreen' ||
    screenName === 'ChatListcreen' ||
    screenName === 'SuperfoodsChatScreen' ||
    screenName === 'SupplementsChatScreen' ||
    screenName === 'ActivitiesChatScreen'
  ) {
    return 'fade';
  }

  // Default for all other screens
  return 'slide_from_right';
};

/**
 * Enhanced MainRoute component with optimized animations and performance
 */
const MainRoute = () => {
  // Platform-specific animation duration
  const animationDuration = Platform.OS === 'ios' ? 350 : 300;
  const { isLogin, isLaunched } = useAppSelector(state => state.user);

  // Get screen options with appropriate animation
  const getScreenOptions = useCallback(
    (name: keyof AppStackParamList, backgroundColor = '#FFFFFF') => {
      const animation = getAnimationForScreen(name);

      return {
        headerShown: false,
        contentStyle: { backgroundColor },
        gestureEnabled: true,
        animation: animation as
          | 'default'
          | 'fade'
          | 'slide_from_right'
          | 'slide_from_bottom'
          | 'none',
        animationDuration,
      };
    },
    [animationDuration],
  );

  // Organize screens into logical groups with optimized options
  const screenGroups = useMemo<Record<string, ScreenGroup>>(
    () => ({
      auth: {
        screens: [
          { name: 'SplashScreen', component: SplashScreen },
          { name: 'OnboardingScreen', component: OnboardingScreen },
          { name: 'WelcomeScreen', component: WelcomeScreen },
          { name: 'LoginScreen', component: LoginScreen },
          { name: 'RegisterScreen', component: RegisterScreen },
          { name: 'ForgotPasswordScreen', component: ForgotPasswordScreen },
          { name: 'MailCheckScreen', component: MailCheckScreen },
          { name: 'PasswordResetScreen', component: PasswordResetScreen },
          { name: 'PasswordChanged', component: PasswordChangedScreen },
          { name: 'ChangePasswordScreen', component: ChangePasswordScreen },
          { name: 'DeleteAccountScreen', component: DeleteAccountScreen },
          { name: 'OTPVerifyScreen', component: OTPVerificationScreen },
        ],
      },
      main: {
        screens: [
          { name: 'NavigationTab', component: NavigationTab },
          {
            name: 'MyTabs',
            component: MyTabs,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'ProfileScreen',
            component: ProfileScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'ADHDQuestionnaireScreen',
            component: ADHDQuestionnaireScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'ADHDDailyQuestions',
            component: ADHDDailyQuestionsScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'EditProfileScreen',
            component: EditProfileScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          { name: 'ThemeScreen', component: ThemeScreen },
          { name: 'Notifications', component: Notifications },
          {
            name: 'ContactUsScreen',
            component: ContactUsScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'FeedBackScreen',
            component: FeedBackScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'TermsConditionScreen',
            component: TermsConditionScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'PrivacyPolicyScreen',
            component: PrivacyPolicyScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'FAQsScreen',
            component: FAQsScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'ActivityScanner',
            component: ActivityScannerScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'HealthPulseConnect',
            component: HealthPulseConnect,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'ConnectDevice',
            component: ConnectDevice,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'ProgressSummaryScreen',
            component: ProgressSummaryScreen,
            options: { headerShown: false },
          },
        ],
      },
      health: {
        screens: [
          { name: 'BPScreen', component: BPScreen },
          {
            name: 'HRScreen',
            component: HRScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'HRVScreen',
            component: HRVScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'DailyScreen',
            component: DailyScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'MonthyScreen',
            component: MonthyScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'YearlyScreen',
            component: YearlyScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'VitalScreen',
            component: VitalScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'HealthScreen',
            component: HealthScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'DietProgressSummary',
            component: DietProgressSummary,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'ActivityProgressSummary',
            component: ActivityProgressSummary,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          {
            name: 'DietTaskScreen',
            component: DietTaskScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
          ,
          {
            name: 'ActivityTaskScrren',
            component: ActivityTaskScreen,
            options: { contentStyle: { backgroundColor: '#1857C1' } },
          },
        ],
      },
      chat: {
        screens: [
          {
            name: 'ChatScreen',
            component: ChatScreen,
            options: {
              contentStyle: { backgroundColor: '#1857C1' },
              headerShown: false,
            },
          },
          {
            name: 'ChatListcreen',
            component: ChatListcreen,
            options: {
              contentStyle: { backgroundColor: '#1857C1' },
              headerShown: false,
            },
          },
          {
            name: 'SuperfoodsChatScreen',
            component: SuperfoodsChatScreen,
            options: {
              contentStyle: { backgroundColor: '#1857C1' },
              headerShown: false,
            },
          },
          {
            name: 'SupplementsChatScreen',
            component: SupplementsChatScreen,
            options: {
              contentStyle: { backgroundColor: '#1857C1' },
              headerShown: false,
            },
          },
          {
            name: 'ActivitiesChatScreen',
            component: ActivitiesChatScreen,
            options: {
              contentStyle: { backgroundColor: '#1857C1' },
              headerShown: false,
            },
          },
        ],
      },
      status: {
        screens: [
          {
            name: 'SupplementScreen',
            component: SupplementScreen,
            options: {
              contentStyle: { backgroundColor: '#1857C1' },
              headerShown: false,
            },
          },
          {
            name: 'MindfulScreen',
            component: MindfulScreen,
            options: {
              contentStyle: { backgroundColor: '#1857C1' },
              headerShown: false,
            },
          },
          {
            name: 'SuperfoodScreen',
            component: SuperfoodScreen,
            options: {
              contentStyle: { backgroundColor: '#1857C1' },
              headerShown: false,
            },
          },
          {
            name: 'WindScreen',
            component: WindScreen,
            options: {
              headerTransparent: true,
            },
          },
          {
            name: 'GymScreen',
            component: GymScreen,
            options: {
              contentStyle: { backgroundColor: '#1857C1' },
              headerShown: false,
            },
          },
          {
            name: 'FeminineScreen',
            component: FeminineScreen,
            options: {
              contentStyle: { backgroundColor: '#1857C1' },
              headerShown: false,
            },
          },
        ],
      },
      questionnaire: {
        screens: [
          { name: 'NameScreen', component: OnboardingQuizFlow },
          { name: 'QuizScreen', component: QuizScreen },
          // { name: 'OnboardingQuiz', component: OnboardingQuiz },
          { name: 'OnboardingQuiz', component: OnboardingQuizFlow },
          { name: 'MainOnboardingQuiz', component: OnboardingQuizFlow },
        ],
      },
      other: {
        screens: [
          {
            name: 'SubscriptionScreen',
            component: SubscriptionScreen,
            options: {
              contentStyle: { backgroundColor: '#fff' },
              headerShown: true,
              headerTransparent: true,
            },
          },
          {
            name: 'RoadmapScreen',
            component: RoadmapScreen,
            options: {
              headerShown: false,
            },
          },
        ],
      },
    }),
    [],
  );

  // Memoize the navigator to prevent unnecessary re-renders
  return useMemo(
    () => (
      <Stack.Navigator
        initialRouteName={
          isLogin
            ? 'NavigationTab'
            : isLaunched
            ? 'WelcomeScreen'
            : 'OnboardingScreen'
        }
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'default',
          animationDuration,
        }}
      >
        {/* Render all screen groups with optimized animations */}
        {Object.entries(screenGroups).map(([groupKey, group]) => (
          <React.Fragment key={groupKey}>
            {group.screens.map(screen => (
              <Stack.Screen
                key={screen.name}
                name={screen.name}
                component={screen.component}
                options={({ route }) => ({
                  ...getScreenOptions(
                    screen.name,
                    screen.options?.contentStyle?.backgroundColor || '#FFFFFF',
                  ),
                  // headerTransparent: true,

                  ...screen.options,
                  headerBackTitle: '',
                  headerShadowVisible: false,
                  headerBackButtonDisplayMode: 'minimal',
                  headerTitle: '',
                })}
              />
            ))}
          </React.Fragment>
        ))}
      </Stack.Navigator>
    ),
    [screenGroups, getScreenOptions],
  );
};

// Export a memoized version of the component to prevent unnecessary re-renders
export default React.memo(MainRoute);
