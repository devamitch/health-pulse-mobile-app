// ============================================
// CalmAssessmentScreen - Rest & Calm
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

const CalmAssessmentScreen = memo(() => {
  const dispatch = useAppDispatch();
  const { Colors } = useAppTheme();
  const { haptic_level } = useAppSelector(state => state.message);
  const quizData = useAppSelector(state => state.message.quiz);

  const { sleepQuiz, wellRestedQuiz, relaxQuiz } = useMemo(
    () => ({
      sleepQuiz: quizData.find(q => q.questionTag === 'Sleep Duration'),
      wellRestedQuiz: quizData.find(
        q => q.questionTag === 'Well-Rested Frequency',
      ),
      relaxQuiz: quizData.find(q => q.questionTag === 'Relaxation Time'),
    }),
    [quizData],
  );

  const [sleepHours, setSleepHours] = useState(
    () => (sleepQuiz?.answer as string) || '',
  );
  const [wellRestedFrequency, setWellRestedFrequency] = useState(
    () => (wellRestedQuiz?.answer as string) || '',
  );
  const [relaxationDays, setRelaxationDays] = useState(() =>
    relaxQuiz?.answer ? parseInt(relaxQuiz.answer as string) : 2,
  );

  const handleSleepSelect = useCallback(
    async (value: string) => {
      await haptic(haptic_level);
      setSleepHours(value);
      const sleep_data: Quiz = {
        id: 301,
        question: 'On most nights, how much sleep do you get?',
        answerString: `I get ${value} hours of sleep on most nights.`,
        questionTag: 'Sleep Duration',
        answer: value,
      };
      dispatch(addQuiz(sleep_data));
    },
    [haptic_level, dispatch],
  );

  const handleWellRestedSelect = useCallback(
    async (value: string) => {
      await haptic(haptic_level);
      setWellRestedFrequency(value);
      const rested_data: Quiz = {
        id: 302,
        question: 'How often do you feel well-rested when you wake up?',
        answerString: `I feel well-rested ${value} times per week.`,
        questionTag: 'Well-Rested Frequency',
        answer: value,
      };
      dispatch(addQuiz(rested_data));
    },
    [haptic_level, dispatch],
  );

  const handleRelaxationSelect = useCallback(
    async (value: number) => {
      await haptic(haptic_level);
      const rounded = Math.round(value);
      setRelaxationDays(rounded);
      const relax_data: Quiz = {
        id: 303,
        question: 'Do you usually take time to relax or unwind during the day?',
        answerString: `I relax or unwind ${rounded} days per week.`,
        questionTag: 'Relaxation Time',
        answer: rounded.toString(),
      };
      dispatch(addQuiz(relax_data));
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
          Rest & Calm
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.subtitle}
        >
          Let's understand how your body and mind recharge.
        </Animated.Text>

        {/* Question 1 */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={styles.questionBlock}
        >
          <Text style={styles.questionText}>
            On most nights, how much sleep do you get?
          </Text>

          <View style={styles.optionsRow}>
            {['0-1', '2', '3', '4+'].map((option, index) => (
              <OptionPill
                key={index}
                option={option}
                isSelected={sleepHours === option}
                onPress={() => handleSleepSelect(option)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Question 2 */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.questionBlock}
        >
          <Text style={styles.questionText}>
            How often do you feel well-rested when you wake up?
          </Text>

          <View style={styles.optionsRow}>
            {['0-1', '2', '3', '4+'].map((option, index) => (
              <OptionPill
                key={index}
                option={option}
                isSelected={wellRestedFrequency === option}
                onPress={() => handleWellRestedSelect(option)}
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
            Do you usually take time to relax or unwind during the day?
          </Text>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={7}
              step={1}
              value={relaxationDays}
              onValueChange={handleRelaxationSelect}
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
                    relaxationDays === num && styles.sliderLabelActive,
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

CalmAssessmentScreen.displayName = 'CalmAssessmentScreen';

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

export default CalmAssessmentScreen;
