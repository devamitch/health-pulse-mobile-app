// ============================================
// OnboardingQuizFlow - Complete Flow
// ============================================

import React, { useCallback, useMemo, useState } from 'react';
import {
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
import { initializeAfterOnboarding } from '../../services/mmkv-redux/slices/gameProgressionSlice';
import { haptic } from '../../utils';
import { ONBOARDING_SCREENS_CONFIG } from './types/questionnaire';

// Components
import BlurView from '@/components/base/BlurView';
import { FONT_FAMILIES } from '@/constants/typography';
import QuestionnaireButton from './components/QuestionnaireButton';
import QuestionnaireHeader from './components/QuestionnaireHeader';

// Screens
import GameProfileAssessmentService from '@/services/GameProfileAssessmentService';
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
  const { userData } = useAppSelector(state => state.user);

  // Optimized selectors with shallow comparison
  const haptic_level = useAppSelector(
    state => state.message.haptic_level,
    (prev, next) => prev === next,
  );

  // Refs
  const scrollX = useSharedValue(0);

  // State - simple progress counter
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessingAssessment, setIsProcessingAssessment] = useState(false);

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

  const overallScore = useMemo(() => {
    const avg = Math.round(
      (getDietScore.value + getActivityScore.value + getSleepScore.value) / 3,
    );
    if (avg >= 80) return { score: 'Excellent', color: '#4CAF50', value: avg };
    if (avg >= 60) return { score: 'Good', color: '#FF9800', value: avg };
    if (avg >= 40) return { score: 'Fair', color: '#FFC107', value: avg };
    return { score: 'Needs Work', color: '#F44336', value: avg };
  }, [getDietScore, getActivityScore, getSleepScore]);

  /**
   * Process assessment using Claude AI service
   */
  const processAssessment = useCallback(async () => {
    try {
      setIsProcessingAssessment(true);

      // Filter assessment-related quiz responses (id >= 101 and < 400)
      const assessmentResponses = quizData
        .filter(item => item.id >= 101 && item.id < 400)
        .map(item => ({
          id: item.id,
          question: item.question,
          answerString: item.answerString || '',
          questionTag: item.questionTag,
          answer: item.answer,
        }));

      // Call Claude assessment service
      const gameProfile = await GameProfileAssessmentService.assessWithClaude(
        assessmentResponses,
      );

      if (!gameProfile) {
        throw new Error('Failed to generate game profile');
      }

      // Determine game mode based on overall score
      let mode: 'standard' | 'hero' | 'recovery' | 'rehab' = 'standard';
      const avgScore = overallScore.value;

      if (avgScore >= 80) {
        mode = 'hero';
      } else if (avgScore >= 50) {
        mode = 'standard';
      } else {
        mode = 'recovery';
      }

      // Determine fitness level description
      let fitnessLevel = 'beginner';
      const assessedLevel = gameProfile.userProfile.level;

      if (assessedLevel >= 15) {
        fitnessLevel = 'advanced';
      } else if (assessedLevel >= 10) {
        fitnessLevel = 'intermediate';
      } else if (assessedLevel >= 5) {
        fitnessLevel = 'building';
      }

      // Dispatch initialization action to gameProgressionSlice
      dispatch(
        initializeAfterOnboarding({
          level: gameProfile.userProfile.level,
          mode,
          fitnessLevel,
        }),
      );

      console.log('✅ [ONBOARDING] Assessment completed:', {
        level: gameProfile.userProfile.level,
        mode,
        fitnessLevel,
        scores: gameProfile.today.scores,
      });

      return true;
    } catch (error) {
      console.error('❌ [ONBOARDING] Assessment failed:', error);
      Alert.alert(
        'Assessment Error',
        'Failed to process your assessment. Using default profile.',
      );

      // Fallback: initialize with basic profile
      dispatch(
        initializeAfterOnboarding({
          level: 1,
          mode: 'standard',
          fitnessLevel: 'beginner',
        }),
      );

      return false;
    } finally {
      setIsProcessingAssessment(false);
    }
  }, [quizData, overallScore, dispatch]);

  const handleNext = useCallback(async () => {
    haptic(haptic_level);
    const nextIndex = currentIndex + 1;

    // If moving to the finish screen (last screen before final)
    if (nextIndex === TOTAL_ONBOARDING_SCREENS - 1) {
      // Process assessment before showing finish screen
      await processAssessment();
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
    processAssessment,
  ]);

  // Button text - memoized
  const buttonText = useMemo(() => {
    if (currentIndex === 0) return "Let's Begin";
    if (currentIndex === 1) return "Let's Begin";
    if (currentIndex === 2) return "Let's Go";
    if (currentIndex === 3) return 'Continue';
    if (currentIndex === 4) return 'Continue';
    if (currentIndex === 5)
      return isProcessingAssessment ? 'Processing...' : 'View My Snapshot';
    return 'Continue';
  }, [currentIndex, isProcessingAssessment]);

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
  }, [currentIndex, handleFinishComplete, handleNext, goToPage]);

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
      {currentIndex === 0 ? (
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

      {currentIndex > 0 ? (
        <View style={styles.buttonContainer}>
          <QuestionnaireButton
            onPress={handleNext}
            isLastStep={currentIndex === TOTAL_ONBOARDING_SCREENS - 1}
            disabled={isProcessingAssessment}
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

      {/* Loading overlay during assessment processing */}
      {isProcessingAssessment && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingContainer}>
            <Text style={styles.processingText}>
              Analyzing your responses...
            </Text>
          </View>
        </View>
      )}
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
    processingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    processingContainer: {
      backgroundColor: Colors.surface,
      padding: 24,
      borderRadius: 16,
      alignItems: 'center',
    },
    processingText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textPrimaryColor,
    },
  });

export default OnboardingQuizFlow;
