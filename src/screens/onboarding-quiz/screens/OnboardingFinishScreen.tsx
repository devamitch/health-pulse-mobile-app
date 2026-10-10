import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import React, { memo, useMemo } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import WellnessBubbles from '../components/Wellnessbubbles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnboardingFinishScreen: React.FC<{
  onComplete: () => void;
  onBack: () => void;
}> = memo(({ onBack }) => {
  const { Colors } = useAppTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const gameProfile = useAppSelector(
    state => state.gameProgression.userProfile,
  );

  const currentLevel = gameProfile?.level ?? 1;
  const currentXP = gameProfile?.xp ?? 0;
  const xpToNextLevel = gameProfile?.xpToNextLevel ?? 1000;
  const progressPercentage = Math.min((currentXP / xpToNextLevel) * 100, 15);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={onBack}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={Colors.textPrimaryColor}
          />
        </TouchableOpacity>

        {/* Header */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(600)}
          style={styles.header}
        >
          <Text style={styles.title}>Your Wellness Snapshot</Text>
          <Text style={styles.subtitle}>
            Based on your answers, we've set things{'\n'}up just for you.
          </Text>
          <Text style={styles.subtitleSecond}>
            You can change this anytime.
          </Text>
        </Animated.View>

        {/* Wellness Bubbles SVG */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(800)}
          style={styles.bubblesContainer}
        >
          <WellnessBubbles width={SCREEN_WIDTH - 40} height={240} />
        </Animated.View>

        {/* Level Section */}
        <Animated.View
          entering={FadeInDown.delay(600).duration(600)}
          style={styles.levelSection}
        >
          <Text style={styles.levelTitle}>Your Level</Text>
          <Text style={styles.levelNumber}>Level - {currentLevel}</Text>
          <Text style={styles.levelSubtitle}>Getting started</Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <LinearGradient
                colors={['#1857C1', '#2266DD']}
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%` },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>

          <Text style={styles.progressText}>Progress unlock as you go</Text>
        </Animated.View>
      </ScrollView>

      {/* Start Button - Fixed at Bottom */}
      <Animated.View
        entering={FadeInUp.delay(800).duration(600)}
        style={styles.buttonWrapper}
      ></Animated.View>
    </View>
  );
});

OnboardingFinishScreen.displayName = 'OnboardingFinishScreen';

const createStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.isDark ? Colors.backgroundColor : '#E8EEF8',
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 120,
    },
    backButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 60 : 20,
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.isDark ? Colors.surface : '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    header: {
      paddingHorizontal: 40,
      paddingTop: Platform.OS === 'ios' ? 120 : 80,
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 26,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.primaryColor,
      textAlign: 'center',
      marginBottom: 16,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    subtitleSecond: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginTop: 2,
    },
    bubblesContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginBottom: 32,
      marginTop: 8,
    },
    levelSection: {
      paddingHorizontal: 40,
      alignItems: 'center',
      marginTop: 8,
    },
    levelTitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textPrimaryColor,
      marginBottom: 8,
      letterSpacing: -0.2,
    },
    levelNumber: {
      fontSize: 40,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.primaryColor,
      marginBottom: 4,
      letterSpacing: -0.8,
    },
    levelSubtitle: {
      fontSize: 15,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      marginBottom: 24,
    },
    progressBarContainer: {
      width: '100%',
      maxWidth: 560,
      marginBottom: 12,
    },
    progressBarTrack: {
      height: 8,
      backgroundColor: Colors.isDark
        ? 'rgba(24, 87, 193, 0.2)'
        : 'rgba(24, 87, 193, 0.15)',
      borderRadius: 100,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 100,
      minWidth: 60,
    },
    progressText: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      textAlign: 'center',
    },
    buttonWrapper: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: Platform.OS === 'ios' ? 40 : 24,
      backgroundColor: Colors.isDark ? Colors.backgroundColor : '#E8EEF8',
    },
    startButton: {
      borderRadius: 28,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#1857C1',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    startButtonGradient: {
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    startButtonText: {
      fontSize: 17,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
      letterSpacing: -0.2,
    },
  });

export default OnboardingFinishScreen;
