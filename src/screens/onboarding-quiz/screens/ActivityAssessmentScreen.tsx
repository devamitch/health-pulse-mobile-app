// ============================================
// ActivityAssessmentScreen - Your Movement Style
// ============================================

import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import Slider from '@react-native-community/slider';
import { memo, useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../services/mmkv-redux/hooks';
import { addQuiz, Quiz } from '../../../services/mmkv-redux/slices';
import { haptic } from '../../../utils';

// Memoized Option Pill Component
const OptionPill = memo<{
  option: string;
  isSelected: boolean;
  onPress: () => void;
}>(
  ({ option, isSelected, onPress }) => {
    return (
      <TouchableOpacity
        style={[styles.optionPill, isSelected && styles.optionPillSelected]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.optionPillText,
            isSelected && styles.optionPillTextSelected,
          ]}
        >
          {option}
        </Text>
      </TouchableOpacity>
    );
  },
  (prev, next) => prev.isSelected === next.isSelected,
);

OptionPill.displayName = 'OptionPill';

const ActivityAssessmentScreen = memo(() => {
  const dispatch = useAppDispatch();
  const { Colors } = useAppTheme();
  const { haptic_level } = useAppSelector(state => state.message);
  const quizData = useAppSelector(state => state.message.quiz);

  const { activityLevelQuiz, pushUpsQuiz, activeDaysQuiz, walkingQuiz } =
    useMemo(
      () => ({
        activityLevelQuiz: quizData.find(
          q => q.questionTag === 'Activity Level',
        ),
        pushUpsQuiz: quizData.find(q => q.questionTag === 'Push-ups Capacity'),
        activeDaysQuiz: quizData.find(
          q => q.questionTag === 'Active Days Per Week',
        ),
        walkingQuiz: quizData.find(q => q.questionTag === 'Walking Duration'),
      }),
      [quizData],
    );

  const [activityLevel, setActivityLevel] = useState(() =>
    activityLevelQuiz?.answer
      ? parseInt(activityLevelQuiz.answer as string)
      : 2,
  );
  const [pushUps, setPushUps] = useState(
    () => (pushUpsQuiz?.answer as string) || '',
  );
  const [activeDays, setActiveDays] = useState(
    () => (activeDaysQuiz?.answer as string) || '',
  );
  const [walkingDuration, setWalkingDuration] = useState(() =>
    walkingQuiz?.answer ? parseInt(walkingQuiz.answer as string) : 2,
  );

  const handleActivityLevelSelect = useCallback(
    async (value: number) => {
      await haptic(haptic_level);
      const rounded = Math.round(value);
      setActivityLevel(rounded);
      const activity_data: Quiz = {
        id: 101,
        question: 'How active are you in a typical week?',
        answerString: `My activity level is ${rounded} days per week.`,
        questionTag: 'Activity Level',
        answer: rounded.toString(),
      };
      dispatch(addQuiz(activity_data));
    },
    [haptic_level, dispatch],
  );

  const handlePushUpsSelect = useCallback(
    async (value: string) => {
      await haptic(haptic_level);
      setPushUps(value);
      const pushups_data: Quiz = {
        id: 102,
        question: 'About how many push-ups can you do in one go?',
        answerString: `I can do ${value} push-ups in one go.`,
        questionTag: 'Push-ups Capacity',
        answer: value,
      };
      dispatch(addQuiz(pushups_data));
    },
    [haptic_level, dispatch],
  );

  const handleActiveDaysSelect = useCallback(
    async (value: string) => {
      await haptic(haptic_level);
      setActiveDays(value);
      const active_data: Quiz = {
        id: 103,
        question: 'On average, how many days per week are you active?',
        answerString: `I am active ${value} days per week.`,
        questionTag: 'Active Days Per Week',
        answer: value,
      };
      dispatch(addQuiz(active_data));
    },
    [haptic_level, dispatch],
  );

  const handleWalkingSelect = useCallback(
    async (value: number) => {
      await haptic(haptic_level);
      const rounded = Math.round(value);
      setWalkingDuration(rounded);
      const walking_data: Quiz = {
        id: 104,
        question: 'How long can you comfortably brisk-walk or jog?',
        answerString: `I can walk or jog for ${rounded} minutes.`,
        questionTag: 'Walking Duration',
        answer: rounded.toString(),
      };
      dispatch(addQuiz(walking_data));
    },
    [haptic_level, dispatch],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header */}
        <Animated.Text
          entering={FadeInUp.delay(50).duration(400)}
          style={styles.title}
        >
          Your Movement Style
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.subtitle}
        >
          Help us understand how active your days usually are.
        </Animated.Text>

        {/* Question 1 */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={styles.questionBlock}
        >
          <Text style={styles.questionText}>
            How active are you in a typical week?
          </Text>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={7}
              step={1}
              value={activityLevel}
              onValueChange={handleActivityLevelSelect}
              minimumTrackTintColor="#1857C1"
              maximumTrackTintColor="#D6E4F5"
              thumbTintColor="#1857C1"
            />
            <View style={styles.sliderLabels}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(num => (
                <Text
                  key={num}
                  style={[
                    styles.sliderLabel,
                    activityLevel === num && styles.sliderLabelActive,
                  ]}
                >
                  {num}
                </Text>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Question 2 */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.questionBlock}
        >
          <Text style={styles.questionText}>
            About how many push-ups can you do in one go?
          </Text>

          <View style={styles.optionsRow}>
            {['0-1', '2', '3', '4+'].map((option, index) => (
              <OptionPill
                key={index}
                option={option}
                isSelected={pushUps === option}
                onPress={() => handlePushUpsSelect(option)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Question 3 */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={styles.questionBlock}
        >
          <Text style={styles.questionText}>
            On average, how many days per week are you active?
          </Text>

          <View style={styles.optionsRow}>
            {['0-1', '2', '3', '4+'].map((option, index) => (
              <OptionPill
                key={index}
                option={option}
                isSelected={activeDays === option}
                onPress={() => handleActiveDaysSelect(option)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Question 4 */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.questionBlock}
        >
          <Text style={styles.questionText}>
            How long can you comfortably brisk-walk or jog?
          </Text>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={7}
              step={1}
              value={walkingDuration}
              onValueChange={handleWalkingSelect}
              minimumTrackTintColor="#1857C1"
              maximumTrackTintColor="#D6E4F5"
              thumbTintColor="#1857C1"
            />
            <View style={styles.sliderLabels}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map(num => (
                <Text
                  key={num}
                  style={[
                    styles.sliderLabel,
                    walkingDuration === num && styles.sliderLabelActive,
                  ]}
                >
                  {num}
                </Text>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
});

ActivityAssessmentScreen.displayName = 'ActivityAssessmentScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#1857C1',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  questionBlock: {
    marginBottom: 32,
  },
  questionText: {
    fontSize: 15,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    color: '#212121',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  optionPill: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    minWidth: 70,
    alignItems: 'center',
  },
  optionPillSelected: {
    backgroundColor: '#1857C1',
    borderColor: '#1857C1',
  },
  optionPillText: {
    fontSize: 15,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    color: '#424242',
  },
  optionPillTextSelected: {
    color: '#FFFFFF',
  },
  sliderContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    color: '#9E9E9E',
    width: 24,
    textAlign: 'center',
  },
  sliderLabelActive: {
    color: '#1857C1',
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
});

export default ActivityAssessmentScreen;
