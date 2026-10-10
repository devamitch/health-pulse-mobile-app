// ============================================
// OnboardingQuizFlow - Complete Flow
// ============================================

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Custom imports
import { ColorScheme } from '../../constants/theme';
import { useAppTheme } from '../../hooks/themeHook';
import {
  useAppDispatch,
  useAppSelector,
} from '../../services/mmkv-redux/hooks';
import { setIsNewUser } from '../../services/mmkv-redux/slices';
import { haptic } from '../../utils';
import { ONBOARDING_SCREENS_CONFIG } from './types/questionnaire';

// Components
import QuestionnaireButton from './components/QuestionnaireButton';
import QuestionnaireHeader from './components/QuestionnaireHeader';

// Screens
import BlurView from '@/components/base/BlurView';
import { FONT_FAMILIES } from '@/constants/typography';
import { gameProfileAssesment } from '@/hooks/use-gameprofile-calc';
import { GameProfileAssessmentService } from '@/services/GameProfileAssessmentService';
import { setUserGameProfile } from '@/services/mmkv-redux/slices/game_engine_slice';
import { initializeAfterOnboarding } from '@/services/mmkv-redux/slices/gameProgressionSlice';
import { Toast } from '@/utils/toast';
import ActivityAssessmentScreen from './screens/ActivityAssessmentScreen';
import AgeGenderScreen from './screens/AgeGenderScreen';
import AssessmentInfoScreen from './screens/AssessmentInfoScreen';
import CalmAssessmentScreen from './screens/CalmAssessmentScreen';
import DietAssessmentScreen from './screens/DietAssessmentScreen';
import NameScreen from './screens/NameScreen';
import OnboardingFinishScreen from './screens/OnboardingFinishScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_ONBOARDING_SCREENS = 7 as const;

interface OnboardingQuizFlowProps {
  navigation: any;
}

// Memoized screen components
const MemoizedNameScreen = NameScreen;
const MemoizedAgeGenderScreen = AgeGenderScreen;
const MemoizedAssessmentInfoScreen = AssessmentInfoScreen;
const MemoizedDietAssessmentScreen = DietAssessmentScreen;
const MemoizedActivityAssessmentScreen = ActivityAssessmentScreen;
const MemoizedCalmAssessmentScreen = CalmAssessmentScreen;
const MemoizedOnboardingFinishScreen = OnboardingFinishScreen;

const OnboardingQuizFlow: React.FC<OnboardingQuizFlowProps> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);
  const quizData = useAppSelector(state => state.message.quiz);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);

  const assessmentResponses = useMemo(() => {
    return quizData.filter(item => item.id >= 101 && item.id < 400);
  }, [quizData]);

  const gameProfileAssessment = gameProfileAssesment(
    quizData.filter(item => item.id >= 101 && item.id < 400),
  );

  // Optimized selectors with shallow comparison
  const haptic_level = useAppSelector(
    state => state.message.haptic_level,
    (prev, next) => prev === next,
  );

  // Refs
  const scrollX = useSharedValue(0);

  // State - simple progress counter
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get current config - memoized
  const currentConfig = useMemo(
    () => ONBOARDING_SCREENS_CONFIG[currentIndex],
    [currentIndex],
  );

  // Memoized handlers
  const goToPage = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      // Update scroll animation
      scrollX.value = withTiming(index * SCREEN_WIDTH, { duration: 300 });
    },
    [scrollX],
  );

  const handleBack = useCallback(() => {
    haptic(haptic_level);
    if (currentIndex === 0) {
      navigation.goBack();
    } else {
      goToPage(currentIndex - 1);
    }
  }, [currentIndex, haptic_level, navigation, goToPage]);

  const handleSkip = useCallback(() => {
    haptic(haptic_level);
    const nextIndex = currentIndex + 1;
    if (nextIndex < TOTAL_ONBOARDING_SCREENS) {
      goToPage(nextIndex);
    }
  }, [currentIndex, haptic_level, goToPage]);

  const handleFinishComplete = useCallback(() => {
    try {
      dispatch(setIsNewUser(false));
      navigation.navigate('NavigationTab');
    } catch (error) {
      console.error('❌ [ONBOARDING] Error saving data:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  }, [dispatch, navigation]);

  const localGameProfileAssessment = useMemo(() => {
    return gameProfileAssesment(assessmentResponses);
  }, [assessmentResponses]);

  const performAssessment = useCallback(async () => {
    if (assessmentResponses.length === 0) {
      console.warn('[ONBOARDING] No assessment responses found');
      Toast.error('Please complete the questionnaire first');
      return false;
    }

    setIsAssessing(true);
    setAssessmentError(null);

    try {
      console.log('[ONBOARDING] Starting assessment with Claude AI...');

      // Try Claude AI assessment first
      const gameProfile = await GameProfileAssessmentService.assessWithClaude(
        assessmentResponses,
      );

      if (gameProfile) {
        console.log('[ONBOARDING] ✅ Claude assessment successful');

        // Add onboarding completion bonus
        const enhancedProfile = {
          ...gameProfile,
          userProfile: {
            ...gameProfile.userProfile,
            xp: gameProfile.userProfile.xp + 500, // Onboarding bonus
            totalXP: (gameProfile.userProfile.totalXP ?? 0) + 500,
          },
        };

        // Save to Redux (legacy slice)
        dispatch(setUserGameProfile(enhancedProfile));

        // Initialize game progression (new slice)
        dispatch(
          initializeAfterOnboarding({
            determinedLevel: enhancedProfile.userProfile.level,
            questionnaireAnswers: quizData.reduce(
              (acc, q) => ({
                ...acc,
                [q.questionTag]: q.answer,
              }),
              {},
            ),
            initialXP: 500,
          }),
        );

        Toast.success(
          `Welcome! You're starting at Level ${enhancedProfile.userProfile.level}`,
        );
        return true;
      }

      throw new Error('Claude assessment returned null');
    } catch (error: any) {
      console.error('[ONBOARDING] ❌ Claude assessment failed:', error);

      // Fallback to local assessment
      try {
        console.log('[ONBOARDING] Falling back to local assessment...');

        if (!localGameProfileAssessment) {
          throw new Error('Local assessment also failed');
        }

        const enhancedProfile = {
          ...localGameProfileAssessment,
          userProfile: {
            ...localGameProfileAssessment.userProfile,
            xp: localGameProfileAssessment.userProfile.xp + 500,
            totalXP:
              (localGameProfileAssessment.userProfile.totalXP ?? 0) + 500,
          },
        };

        // Save to Redux
        dispatch(setUserGameProfile(enhancedProfile));

        // Initialize game progression
        dispatch(
          initializeAfterOnboarding({
            determinedLevel: enhancedProfile.userProfile.level,
            questionnaireAnswers: quizData.reduce(
              (acc, q) => ({
                ...acc,
                [q.questionTag]: q.answer,
              }),
              {},
            ),
            initialXP: 500,
          }),
        );

        Toast.info(
          `Welcome! You're starting at Level ${enhancedProfile.userProfile.level} (Local Assessment)`,
        );
        return true;
      } catch (fallbackError: any) {
        console.error(
          '[ONBOARDING] ❌ Local assessment also failed:',
          fallbackError,
        );
        setAssessmentError('Failed to assess your profile. Please try again.');
        Toast.error('Assessment failed. Using default level.');

        // Last resort: Use level 1
        dispatch(
          initializeAfterOnboarding({
            determinedLevel: 1,
            questionnaireAnswers: {},
            initialXP: 500,
          }),
        );

        return false;
      }
    } finally {
      setIsAssessing(false);
    }
  }, [assessmentResponses, localGameProfileAssessment, quizData, dispatch]);

  // Memoized quiz data extraction
  const quizInfo = useMemo(() => {
    const extract = (tag: string) => quizData.find(q => q.questionTag === tag);
    return {
      name: extract('Name'),
      gender: extract('Gender'),
      age: extract('Age Range'),
      height: extract('Height'),
      weight: extract('Weight'),
      country: extract('Country'),
      meals: extract('Balanced Meals Per Day'),
      exercise: extract('Weekly Exercise Minutes'),
      sleep: extract('Average Sleep Hours Per Night'),
    };
  }, [quizData]);

  // Score calculation functions - memoized
  const getScore = useCallback(
    (value: number | undefined, thresholds: [number, number, number]) => {
      if (!value) return { score: 'Not assessed', color: '#CBD5E1', value: 0 };

      if (value >= thresholds[0])
        return { score: 'Excellent', color: '#4CAF50', value: 90 };
      if (value >= thresholds[1])
        return { score: 'Good', color: '#FF9800', value: 70 };
      return { score: 'Needs improvement', color: '#F44336', value: 40 };
    },
    [],
  );

  const getDietScore = useMemo(
    () =>
      getScore(
        parseInt(quizInfo.meals?.answer as string) || undefined,
        [3, 2, 0],
      ),
    [quizInfo.meals, getScore],
  );

  const getActivityScore = useMemo(
    () =>
      getScore(
        parseInt(quizInfo.exercise?.answer as string) || undefined,
        [150, 75, 0],
      ),
    [quizInfo.exercise, getScore],
  );

  const getSleepScore = useMemo(
    () =>
      getScore(
        parseInt(quizInfo.sleep?.answer as string) || undefined,
        [7, 6, 0],
      ),
    [quizInfo.sleep, getScore],
  );

  const handleNext = useCallback(async () => {
    haptic(haptic_level);
    const nextIndex = currentIndex + 1;
    if (nextIndex === TOTAL_ONBOARDING_SCREENS - 1) {
      const success = await performAssessment();
      if (!success) {
        // Assessment failed but we continue anyway (with fallback level)
        console.warn('[ONBOARDING] Continuing despite assessment failure');
      }
      goToPage(nextIndex);
    } else if (nextIndex < TOTAL_ONBOARDING_SCREENS) {
      goToPage(nextIndex);
    } else if (nextIndex === TOTAL_ONBOARDING_SCREENS) {
      handleFinishComplete();
    }
  }, [
    currentIndex,
    haptic_level,
    goToPage,
    handleFinishComplete,
    dispatch,
    gameProfileAssessment,
    getDietScore,
    getActivityScore,
    getSleepScore,
  ]);

  // Button text - memoized
  const buttonText = useMemo(() => {
    if (currentIndex === 0) return "Let's Begin";
    if (currentIndex === 1) return "Let's Begin";
    if (currentIndex === 2) return "Let's Go";
    if (currentIndex === 3) return 'Continue';
    if (currentIndex === 4) return 'Continue';
    if (currentIndex === 5) return 'View My Snapshot';
    return 'Continue';
  }, [currentIndex]);

  // Screen visibility - memoized
  const isFinishScreen = useMemo(
    () => currentIndex === TOTAL_ONBOARDING_SCREENS - 1,
    [currentIndex],
  );
  const showHeader = useMemo(
    () => currentIndex > 0 && !isFinishScreen,
    [isFinishScreen, currentIndex],
  );

  // Render current screen based on index
  const renderScreen = useMemo(() => {
    switch (currentIndex) {
      case 0:
        return <MemoizedNameScreen handleNext={handleNext} />;
      case 1:
        return <MemoizedAgeGenderScreen />;
      case 2:
        return <MemoizedAssessmentInfoScreen />;
      case 3:
        return <MemoizedDietAssessmentScreen />;
      case 4:
        return <MemoizedActivityAssessmentScreen />;
      case 5:
        return <MemoizedCalmAssessmentScreen />;
      case 6:
        return (
          <MemoizedOnboardingFinishScreen
            onComplete={handleFinishComplete}
            onBack={() => {
              goToPage(currentIndex - 1);
            }}
          />
        );
      default:
        return <MemoizedNameScreen handleNext={handleNext} />;
    }
  }, [currentIndex, handleFinishComplete]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={Colors.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={Colors.backgroundColor}
      />

      <View style={styles.fixedHeaderGradient}>
        <LinearGradient
          colors={[
            Colors.isDark
              ? 'rgba(34, 102, 221, 0.3)'
              : 'rgba(34, 102, 221, 0.2)',
            Colors.isDark
              ? 'rgba(34, 102, 221, 0.1)'
              : 'rgba(34, 102, 221, 0.05)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientFill}
        />
      </View>

      {/* Header with Progress Bar */}
      {showHeader && (
        <QuestionnaireHeader
          onBack={handleBack}
          onSkip={handleSkip}
          showSkip={currentConfig?.skipEnabled ?? false}
          canGoBack={true}
          scrollX={scrollX}
          totalScreens={TOTAL_ONBOARDING_SCREENS}
          screenWidth={SCREEN_WIDTH}
        />
      )}

      {/* Current Screen */}
      {currentIndex == 0 ? (
        <Animated.View
          style={{ flex: 1, overflow: 'hidden' }}
          entering={FadeIn}
          exiting={FadeOut}
        >
          <View style={styles.screenContainer}>
            <MemoizedAgeGenderScreen />
          </View>
          <View style={StyleSheet.absoluteFillObject}>
            <BlurView style={styles.screenContainer} blurAmount={30}>
              <NameScreen handleNext={handleNext} />
            </BlurView>
          </View>
        </Animated.View>
      ) : (
        <View style={styles.screenContainer}>{renderScreen}</View>
      )}

      {isAssessing && (
        <View style={styles.loadingOverlay}>
          <BlurView style={StyleSheet.absoluteFill} blurAmount={10} />
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primaryColor} />
            <Text style={styles.loadingTitle}>Analyzing Your Profile...</Text>
            <Text style={styles.loadingSubtitle}>
              We are determining your personalized starting level
            </Text>
          </View>
        </View>
      )}

      {/* Error Message */}
      {assessmentError && !isAssessing && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{assessmentError}</Text>
        </View>
      )}
      {currentIndex > 0 ? (
        <View style={styles.buttonContainer}>
          <QuestionnaireButton
            onPress={handleNext}
            isLastStep={currentIndex === TOTAL_ONBOARDING_SCREENS - 1}
            label={
              currentIndex !== TOTAL_ONBOARDING_SCREENS - 1 ? (
                buttonText
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 5,
                  }}
                >
                  <Ionicons name="rocket" size={22} color="#FFFFFF" />
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: FONT_FAMILIES.nunitoBold,
                      color: '#FFF',
                      letterSpacing: 0.5,
                    }}
                  >
                    Start My Journey
                  </Text>
                </View>
              )
            }
          />
        </View>
      ) : null}
    </View>
  );
};

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
    screenContainer: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    fixedHeaderGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 280,
      zIndex: 0,
      overflow: 'hidden',
    },
    gradientFill: {
      flex: 1,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingBottom: 20,
      backgroundColor: 'transparent',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingCard: {
      backgroundColor: Colors.white,
      borderRadius: 20,
      padding: 30,
      alignItems: 'center',
      maxWidth: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    loadingTitle: {
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
      marginTop: 16,
      textAlign: 'center',
    },
    loadingSubtitle: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      marginTop: 8,
      textAlign: 'center',
    },
    errorContainer: {
      position: 'absolute',
      top: 100,
      left: 20,
      right: 20,
      backgroundColor: '#FEE2E2',
      borderRadius: 12,
      padding: 16,
      zIndex: 999,
    },
    errorText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: '#DC2626',
      textAlign: 'center',
    },
    finishButtonContent: {
      flex: 1,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 5,
    },
    finishButtonText: {
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFF',
      letterSpacing: 0.5,
    },
  });

export default OnboardingQuizFlow;
