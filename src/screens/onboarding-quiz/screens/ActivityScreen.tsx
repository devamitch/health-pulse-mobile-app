// ============================================
// ActivityScreen - Physical Activity Assessment (Screen 5/6)
// ============================================

import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import OptionPill from '../components/OptionPill';
import { QuestionnaireScreenProps, DEFAULT_FORM_DATA } from '../types/questionnaireSettings';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../services/mmkv-redux/hooks';
import {
  addQuiz,
  Quiz,
} from '../../../services/mmkv-redux/slices';
import { haptic } from '../../../utils';
import { activity_questions } from '@/constants/onboarding-questions';

const ActivityScreen: React.FC<QuestionnaireScreenProps> = () => {
  const dispatch = useAppDispatch();
  const { haptic_level } = useAppSelector(state => state.message);
  const quizData = useAppSelector(state => state.message.quiz);
  const { Colors } = useAppTheme();

  const workoutMinutesQuiz = quizData.find(q => q.questionTag === 'Exercise Minutes Per Week');
  const pushupsQuiz = quizData.find(q => q.questionTag === 'Continuous Push-ups');
  const workoutDaysQuiz = quizData.find(q => q.questionTag === 'Physical Activity Days Per Week');
  const briskWalkQuiz = quizData.find(q => q.questionTag === 'Brisk-walk/Jog Duration');

  const [workoutMinutes, setWorkoutMinutes] = useState(
    workoutMinutesQuiz?.answer as string || DEFAULT_FORM_DATA.workoutMinutes,
  );
  const [pushups, setPushups] = useState(pushupsQuiz?.answer as string || DEFAULT_FORM_DATA.pushups);
  const [workoutDays, setWorkoutDays] = useState(
    workoutDaysQuiz?.answer ? parseInt(workoutDaysQuiz.answer as string) : 3
  );
  const [briskWalkMinutes, setBriskWalkMinutes] = useState(
    briskWalkQuiz?.answer as string || DEFAULT_FORM_DATA.briskWalkMinutes,
  );

  useEffect(() => {
    setWorkoutMinutes(workoutMinutesQuiz?.answer as string || DEFAULT_FORM_DATA.workoutMinutes);
    setPushups(pushupsQuiz?.answer as string || DEFAULT_FORM_DATA.pushups);
    setWorkoutDays(workoutDaysQuiz?.answer ? parseInt(workoutDaysQuiz.answer as string) : 3);
    setBriskWalkMinutes(briskWalkQuiz?.answer as string || DEFAULT_FORM_DATA.briskWalkMinutes);
  }, [workoutMinutesQuiz, pushupsQuiz, workoutDaysQuiz, briskWalkQuiz]);

  const handleWorkoutMinutesSelect = async (value: string) => {
    await haptic(haptic_level);
    setWorkoutMinutes(value);
    const workout_data: Quiz = {
      id: 101,
      question: 'How many minutes do you exercise per week?',
      answerString: `I exercise for ${value} minutes per week.`,
      questionTag: 'Exercise Minutes Per Week',
      answer: value,
    };
    dispatch(addQuiz(workout_data));
  };

  const handlePushupsSelect = async (value: string) => {
    await haptic(haptic_level);
    setPushups(value);
    const pushups_data: Quiz = {
      id: 102,
      question: 'How many push-ups can you do continuously without stopping?',
      answerString: `I can do ${value} push-ups continuously without stopping.`,
      questionTag: 'Continuous Push-ups',
      answer: value,
    };
    dispatch(addQuiz(pushups_data));
  };

  const handleWorkoutDaysSelect = (value: number) => {
    const rounded = Math.round(value);
    setWorkoutDays(rounded);
    const workout_days_data: Quiz = {
      id: 103,
      question:
        'How many days per week do you do moderate or intense physical activity?',
      answerString: `I do physical activity for ${rounded} days per week.`,
      questionTag: 'Physical Activity Days Per Week',
      answer: rounded.toString(),
    };
    dispatch(addQuiz(workout_days_data));
  };

  const handleBriskWalkSelect = async (value: string) => {
    await haptic(haptic_level);
    setBriskWalkMinutes(value);
    const brisk_walk_data: Quiz = {
      id: 104,
      question: 'How long can you brisk-walk or jog without resting? (minutes)',
      answerString: `I can brisk-walk or jog for ${value} minutes without resting.`,
      questionTag: 'Brisk-walk/Jog Duration',
      answer: value,
    };
    dispatch(addQuiz(brisk_walk_data));
  };

  const getHandler = (index: number) => {
    switch (index) {
      case 0:
        return handleWorkoutMinutesSelect;
      case 1:
        return handlePushupsSelect;
      case 2:
        return (value: string) => handleWorkoutDaysSelect(Number(value));
      case 3:
        return handleBriskWalkSelect;
      default:
        return handleWorkoutMinutesSelect;
    }
  };

  const getSelectedValue = (index: number) => {
    switch (index) {
      case 0:
        return workoutMinutes;
      case 1:
        return pushups;
      case 2:
        return workoutDays;
      case 3:
        return briskWalkMinutes;
      default:
        return '';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Section Title */}
        <Animated.Text
          entering={FadeInUp.delay(50).duration(400)}
          style={[styles.sectionTitle, { color: Colors.primaryColor }]}
        >
          Physical Activity
        </Animated.Text>

        {/* Questions */}
        {activity_questions.map((item, index) => (
          <View key={index} style={styles.questionBlock}>
            <Animated.Text
              entering={FadeInUp.delay(100 + index * 50).duration(400)}
              style={[styles.questionTitle, { color: Colors.textPrimaryColor }]}
            >
              {item.question}
            </Animated.Text>

            {index === 2 ? (
              // Slider for workout days question
              <Animated.View
                entering={FadeInDown.delay(150 + index * 50).duration(400)}
                style={styles.sliderContainer}
              >
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={7}
                  step={1}
                  value={workoutDays}
                  onValueChange={handleWorkoutDaysSelect}
                  minimumTrackTintColor={'#1857C1'}
                  maximumTrackTintColor={'#1857C133'}
                  thumbTintColor={'#1857C1'}
                />
                <View style={styles.sliderLabels}>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(num => (
                    <Text
                      key={num}
                      style={[
                        styles.sliderLabel,
                        { color: Colors.textTertiary },
                        workoutDays === num && {
                          color: Colors.primaryColor,
                          fontFamily: FONT_FAMILIES.nunitoBold,
                        },
                      ]}
                    >
                      {num}
                    </Text>
                  ))}
                </View>
              </Animated.View>
            ) : (
              // OptionPills for other questions
              <Animated.View
                entering={FadeInDown.delay(150 + index * 50).duration(400)}
                style={styles.optionsContainer}
              >
                {item.options.map((option, optionIndex) => (
                  <OptionPill
                    key={optionIndex}
                    label={option}
                    isSelected={getSelectedValue(index) === option}
                    onPress={() => getHandler(index)(option)}
                    size="small"
                    delay={optionIndex * 40}
                  />
                ))}
              </Animated.View>
            )}
          </View>
        ))}

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: FONT_FAMILIES.nunitoBold,
    alignSelf: 'flex-start',
    textAlign: 'left',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  questionBlock: {
    width: '100%',
    paddingHorizontal: 16,
  },
  questionTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.nunitoBold,
    alignSelf: 'flex-start',
    textAlign: 'left',
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sliderContainer: {
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 10,
    alignSelf: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    width: 24,
    textAlign: 'center',
  },
});

export default ActivityScreen;
