// ============================================
// SettingsQuizFlow - Simplified (Modals moved to screens)
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
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
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
import { SETTINGS_SCREENS_CONFIG } from './types/questionnaireSettings';

// Components
import QuestionnaireButton from './components/QuestionnaireButton';
import QuestionnaireHeader from './components/QuestionnaireHeader';

// Screens
import ActivityScreen from './screens/ActivityScreen';
import AdditionalInfoScreen from './screens/AdditionalInfoScreen';
import AgeGenderScreen from './screens/AgeGenderScreen';
import AllergiesScreen from './screens/AllergiesScreen';
import CalmAssessmentScreen from './screens/CalmAssessmentScreen';
import CuisinesScreen from './screens/CuisinesScreen';
import DietAssessmentScreen from './screens/DietAssessmentScreen';
import DietScreen from './screens/DietScreen';
import GoalsScreen from './screens/GoalsScreen';
import NameScreen from './screens/NameScreen';
import SmokeAndAlcoholScreen from './screens/SmokeAndAlcoholScreen';
import StressScreen from './screens/StressScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TOTAL_SETTINGS_SCREENS = 11 as const;

interface SettingsQuizFlowProps {
  navigation: any;
}

// Memoized screen components
const MemoizedNameScreen = React.memo(NameScreen);
const MemoizedAgeGenderScreen = React.memo(AgeGenderScreen);
const MemoizedDietScreen = React.memo(DietScreen);
const MemoizedDietAssessmentScreen = React.memo(DietAssessmentScreen);
const MemoizedCuisinesScreen = React.memo(CuisinesScreen);
const MemoizedAllergiesScreen = React.memo(AllergiesScreen);
const MemoizedActivityScreen = React.memo(ActivityScreen);
const MemoizedSmokeAndAlcoholScreen = React.memo(SmokeAndAlcoholScreen);
const MemoizedStressScreen = React.memo(StressScreen);
const MemoizedCalmAssessmentScreen = React.memo(CalmAssessmentScreen);
const MemoizedAdditionalInfoScreen = React.memo(AdditionalInfoScreen);
const MemoizedGoalsScreen = React.memo(GoalsScreen);

const SettingsQuizFlow: React.FC<SettingsQuizFlowProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);

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
    () => SETTINGS_SCREENS_CONFIG[currentIndex],
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
    if (nextIndex < TOTAL_SETTINGS_SCREENS) {
      goToPage(nextIndex);
    }
  }, [currentIndex, haptic_level, goToPage]);

  const handleFinishComplete = useCallback(() => {
    try {
      dispatch(setIsNewUser(false));
      // navigation.reset({
      //   index: 0,
      //   routes: [{ name: 'NavigationTab' }],
      // });

      navigation.navigate('NavigationTab');
    } catch (error) {
      console.error('❌ [SETTINGS] Error saving data:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  }, [dispatch, navigation]);

  const handleNext = useCallback(() => {
    haptic(haptic_level);
    const nextIndex = currentIndex + 1;
    if (nextIndex < TOTAL_SETTINGS_SCREENS) {
      goToPage(nextIndex);
    } else if (nextIndex === TOTAL_SETTINGS_SCREENS) {
      handleFinishComplete();
    }
  }, [currentIndex, haptic_level, goToPage, handleFinishComplete]);

  // Button text - memoized
  const buttonText = useMemo(() => {
    if (currentIndex === 0) return 'Next'; // Name screen
    if (currentIndex === 1) return 'Next'; // Age/Gender
    if (currentIndex === TOTAL_SETTINGS_SCREENS - 1) return 'Complete Setup';
    return 'Next';
  }, [currentIndex]);

  // Screen visibility - memoized
  const isFinishScreen = useMemo(
    () => currentIndex === TOTAL_SETTINGS_SCREENS - 1,
    [currentIndex],
  );
  const showHeader = useMemo(() => !isFinishScreen, [isFinishScreen]);

  // Render current screen based on index
  const renderScreen = useMemo(() => {
    switch (currentIndex) {
      case 0:
        return <MemoizedNameScreen />;
      case 1:
        return <MemoizedAgeGenderScreen />;
      case 2:
        return <MemoizedDietScreen />;
      case 3:
        return <MemoizedDietAssessmentScreen />;
      case 4:
        return <MemoizedCuisinesScreen />;
      case 5:
        return <MemoizedAllergiesScreen />;
      case 6:
        return <MemoizedActivityScreen />;
      case 7:
        return <MemoizedSmokeAndAlcoholScreen />;
      case 8:
        return <MemoizedStressScreen />;
      case 9:
        return <MemoizedCalmAssessmentScreen />;
      case 10:
        return <MemoizedAdditionalInfoScreen />;
      case 11:
        return <MemoizedGoalsScreen />;
      default:
        return <MemoizedNameScreen />;
    }
  }, [currentIndex]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={Colors.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={Colors.backgroundColor}
      />

      <Animated.View style={styles.fixedHeaderGradient}>
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
      </Animated.View>

      {/* Header with Progress Bar */}
      {showHeader && (
        <QuestionnaireHeader
          onBack={handleBack}
          onSkip={handleSkip}
          showSkip={currentConfig?.skipEnabled ?? false}
          canGoBack={true}
          scrollX={scrollX}
          totalScreens={TOTAL_SETTINGS_SCREENS}
          screenWidth={SCREEN_WIDTH}
        />
      )}

      {/* Current Screen */}
      <View style={styles.screenContainer}>{renderScreen}</View>

      <View style={styles.buttonContainer}>
        <QuestionnaireButton
          onPress={handleNext}
          isLastStep={currentIndex === TOTAL_SETTINGS_SCREENS - 1}
          label={
            currentIndex !== TOTAL_SETTINGS_SCREENS - 1 ? (
              buttonText
            ) : (
              <>
                {' '}
                <Ionicons name="rocket" size={22} color="#FFFFFF" />
                <Text style={{ color: '#FFFFFF' }}>Complete Setup</Text>
              </>
            )
          }
        />
      </View>
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
  });

export default React.memo(SettingsQuizFlow);
