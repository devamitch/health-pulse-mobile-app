'use client';

/**
 * SmokeAndAlcoholScreen
 *
 * PURPOSE: Collect smoking and alcohol consumption habits
 * Questions: Smoking/second-hand smoke exposure, alcohol consumption
 * USED IN: SettingsQuizFlow lifestyle section
 */

import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../services/mmkv-redux/hooks';
import { addQuiz, Quiz } from '../../../services/mmkv-redux/slices';
import { haptic } from '../../../utils';
import OptionPill from '../components/OptionPill';
import {
  DEFAULT_FORM_DATA,
  QuestionnaireScreenProps,
} from '../types/questionnaireSettings';

interface SmokeAndAlcoholScreenProps extends QuestionnaireScreenProps {}

const SmokeAndAlcoholScreen: React.FC<SmokeAndAlcoholScreenProps> = () => {
  const { Colors } = useAppTheme();
  const { haptic_level } = useAppSelector(state => state.message);
  const quizData = useAppSelector(state => state.message.quiz);
  const smokeQuiz = quizData.find(q => q.questionTag === 'Smoking Habit');
  const alcoholQuiz = quizData.find(
    q => q.questionTag === 'Alcohol Consumption',
  );

  const [localSmoke, setLocalSmoke] = useState<'Yes' | 'No' | ''>(
    (smokeQuiz?.answer as 'Yes' | 'No') ||
      (DEFAULT_FORM_DATA.smokingStatus as 'Yes' | 'No' | ''),
  );
  const [localAlcohol, setLocalAlcohol] = useState<
    'Often' | 'Rarely' | 'Never' | ''
  >(
    (alcoholQuiz?.answer as 'Often' | 'Rarely' | 'Never') ||
      (DEFAULT_FORM_DATA.alcoholConsumption as
        | 'Often'
        | 'Rarely'
        | 'Never'
        | ''),
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    setLocalSmoke(
      (smokeQuiz?.answer as 'Yes' | 'No') ||
        (DEFAULT_FORM_DATA.smokingStatus as 'Yes' | 'No' | ''),
    );
    setLocalAlcohol(
      (alcoholQuiz?.answer as 'Often' | 'Rarely' | 'Never') ||
        (DEFAULT_FORM_DATA.alcoholConsumption as
          | 'Often'
          | 'Rarely'
          | 'Never'
          | ''),
    );
  }, [smokeQuiz, alcoholQuiz]);

  const handleSmokeSelect = async (smoke: 'Yes' | 'No') => {
    await haptic(haptic_level);
    setLocalSmoke(smoke);
    const smoke_data: Quiz = {
      id: 14,
      question: 'Do you smoke or are you exposed to second-hand smoke?',
      answerString: `I ${
        smoke === 'Yes' ? 'do' : "don't"
      } expose to smoke or second hand smoke.`,
      questionTag: 'Smoking Habit',
      answer: smoke,
    };
    dispatch(addQuiz(smoke_data));
  };

  const handleAlcoholSelect = async (alcohol: 'Often' | 'Rarely' | 'Never') => {
    await haptic(haptic_level);
    setLocalAlcohol(alcohol);
    const alcohol_data: Quiz = {
      id: 15,
      question: 'Do you consume alcohol?',
      questionTag: 'Alcohol Consumption',
      answerString: `I ${alcohol} consume alcohol.`,
      answer: alcohol,
    };
    dispatch(addQuiz(alcohol_data));
  };

  const smokeOptions = ['Yes', 'No'];
  const alcoholOptions = ['Often', 'Rarely', 'Never'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        bounces={false}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Smoking Question */}
        <Animated.Text
          entering={FadeInUp.delay(200).duration(400)}
          style={[styles.questionTitle, { color: Colors.textPrimaryColor }]}
        >
          Do you smoke or are you exposed to second-hand smoke?
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={styles.optionsContainer}
        >
          {smokeOptions.map((option, index) => (
            <OptionPill
              key={option}
              label={option}
              isSelected={localSmoke === option}
              onPress={() => handleSmokeSelect(option as 'Yes' | 'No')}
              size="medium"
              delay={index * 40}
            />
          ))}
        </Animated.View>

        {/* Alcohol Question */}
        <Animated.Text
          entering={FadeInUp.delay(300).duration(400)}
          style={[styles.questionTitle, { color: Colors.textPrimaryColor }]}
        >
          Do you consume Alcohol?
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(350).duration(400)}
          style={styles.optionsContainer}
        >
          {alcoholOptions.map((option, index) => (
            <OptionPill
              key={option}
              label={option}
              isSelected={localAlcohol === option}
              onPress={() =>
                handleAlcoholSelect(option as 'Often' | 'Rarely' | 'Never')
              }
              size="medium"
              color={option === 'Often' ? 'warning' : 'primary'}
              delay={index * 40}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },

  questionTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.nunitoBold,
    alignSelf: 'flex-start',
    textAlign: 'left',
    marginBottom: 24,
    marginTop: 16,
    marginHorizontal: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
});

export default SmokeAndAlcoholScreen;
