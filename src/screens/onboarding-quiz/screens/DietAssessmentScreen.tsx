// ============================================
// DietAssessmentScreen - Your Food Habits
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

const DietAssessmentScreen = memo(() => {
  const dispatch = useAppDispatch();
  const { Colors } = useAppTheme();
  const { haptic_level } = useAppSelector(state => state.message);
  const quizData = useAppSelector(state => state.message.quiz);

  const { mealCountQuiz, sugaryFoodQuiz, snacksQuiz } = useMemo(
    () => ({
      mealCountQuiz: quizData.find(q => q.questionTag === 'Meals Per Day'),
      sugaryFoodQuiz: quizData.find(
        q => q.questionTag === 'Sugary Drinks Frequency',
      ),
      snacksQuiz: quizData.find(q => q.questionTag === 'Snacks Frequency'),
    }),
    [quizData],
  );

  const [mealCount, setMealCount] = useState(
    () => (mealCountQuiz?.answer as string) || '',
  );
  const [sugaryDrinksDays, setSugaryDrinksDays] = useState(() =>
    sugaryFoodQuiz?.answer ? parseInt(sugaryFoodQuiz.answer as string) : 2,
  );
  const [snacksFrequency, setSnacksFrequency] = useState(
    () => (snacksQuiz?.answer as string) || '',
  );

  const handleMealCountSelect = useCallback(
    async (value: string) => {
      await haptic(haptic_level);
      setMealCount(value);
      const meal_data: Quiz = {
        id: 201,
        question: 'How many meals do you usually have in a day?',
        answerString: `I have ${value} meals per day.`,
        questionTag: 'Meals Per Day',
        answer: value,
      };
      dispatch(addQuiz(meal_data));
    },
    [haptic_level, dispatch],
  );

  const handleSugaryDrinksSelect = useCallback(
    async (value: number) => {
      await haptic(haptic_level);
      const rounded = Math.round(value);
      setSugaryDrinksDays(rounded);
      const sugary_data: Quiz = {
        id: 202,
        question:
          'On most weeks, how often do you have sugary drinks or junk food?',
        answerString: `I have sugary drinks or junk food ${rounded} days per week.`,
        questionTag: 'Sugary Drinks Frequency',
        answer: rounded.toString(),
      };
      dispatch(addQuiz(sugary_data));
    },
    [haptic_level, dispatch],
  );

  const handleSnacksSelect = useCallback(
    async (value: string) => {
      await haptic(haptic_level);
      setSnacksFrequency(value);
      const snacks_data: Quiz = {
        id: 203,
        question:
          'In a typical week, how often do sugary drinks or snacks show up?',
        answerString: `Sugary drinks or snacks show up ${value} times per week.`,
        questionTag: 'Snacks Frequency',
        answer: value,
      };
      dispatch(addQuiz(snacks_data));
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
          Your Food Habits
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(100).duration(400)}
          style={styles.subtitle}
        >
          Let's understand how you usually eat.
        </Animated.Text>

        {/* Question 1 */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={styles.questionBlock}
        >
          <Text style={styles.questionText}>
            How many meals do you usually have in a day?
          </Text>

          <View style={styles.optionsRow}>
            {['0-1', '2', '3', '4+'].map((option, index) => (
              <OptionPill
                key={index}
                option={option}
                isSelected={mealCount === option}
                onPress={() => handleMealCountSelect(option)}
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
            On most weeks, how often do you have sugary drinks or junk food?
          </Text>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={7}
              step={1}
              value={sugaryDrinksDays}
              onValueChange={handleSugaryDrinksSelect}
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
                    sugaryDrinksDays === num && styles.sliderLabelActive,
                  ]}
                >
                  {num}
                </Text>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Question 3 */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={styles.questionBlock}
        >
          <Text style={styles.questionText}>
            In a typical week, how often do sugary drinks or snacks show up?
          </Text>

          <View style={styles.optionsRow}>
            {['0-1', '2', '3-4', '5+'].map((option, index) => (
              <OptionPill
                key={index}
                option={option}
                isSelected={snacksFrequency === option}
                onPress={() => handleSnacksSelect(option)}
              />
            ))}
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
});

DietAssessmentScreen.displayName = 'DietAssessmentScreen';

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

export default DietAssessmentScreen;
