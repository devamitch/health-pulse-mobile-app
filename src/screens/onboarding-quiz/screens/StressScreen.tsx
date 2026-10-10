// ============================================
// StressScreen - Energy, Sleep & Stress (Screen 5/6)
// ============================================

import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import OptionPill from '../components/OptionPill';
import { QuestionnaireScreenProps, DEFAULT_FORM_DATA } from '../types/questionnaireSettings';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../services/mmkv-redux/hooks';
import {
  addQuiz,
  Quiz,
} from '../../../services/mmkv-redux/slices';
import { haptic } from '../../../utils';

const StressScreen: React.FC<QuestionnaireScreenProps> = () => {
  const { Colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const { haptic_level } = useAppSelector(state => state.message);
  const quizData = useAppSelector(state => state.message.quiz);

  const energyQuiz = quizData.find(q => q.questionTag === 'Energy Level');
  const stressQuiz = quizData.find(q => q.questionTag === 'Mental Stress');
  const sleepQuiz = quizData.find(q => q.questionTag === 'Restful Sleep');

  const [energyLevel, setEnergyLevel] = useState(energyQuiz?.answer ? parseInt(energyQuiz.answer as string) : DEFAULT_FORM_DATA.energyLevel);
  const [mentalStress, setMentalStress] = useState(stressQuiz?.answer as typeof DEFAULT_FORM_DATA.mentalStress || DEFAULT_FORM_DATA.mentalStress);
  const [restfulSleep, setRestfulSleep] = useState(sleepQuiz?.answer as typeof DEFAULT_FORM_DATA.restfulSleep || DEFAULT_FORM_DATA.restfulSleep);

  useEffect(() => {
    setEnergyLevel(energyQuiz?.answer ? parseInt(energyQuiz.answer as string) : DEFAULT_FORM_DATA.energyLevel);
    setMentalStress(stressQuiz?.answer as typeof DEFAULT_FORM_DATA.mentalStress || DEFAULT_FORM_DATA.mentalStress);
    setRestfulSleep(sleepQuiz?.answer as typeof DEFAULT_FORM_DATA.restfulSleep || DEFAULT_FORM_DATA.restfulSleep);
  }, [energyQuiz, stressQuiz, sleepQuiz]);

  const handleEnergyChange = (value: number) => {
    const rounded = Math.round(value);
    setEnergyLevel(rounded);
    const energy_data: Quiz = {
      id: 11,
      question: 'On a scale of 1 to 10, how would you rate your day time energy?',
      answerString: `My day time energy level is ${rounded} out of 10.`,
      questionTag: 'Energy Level',
      answer: rounded.toString(),
    };
    dispatch(addQuiz(energy_data));
  };

  const handleStressSelect = async (answer: 'Yes' | 'No') => {
    await haptic(haptic_level);
    setMentalStress(answer);
    const stress_data: Quiz = {
      id: 12,
      question: 'Do you experience high levels of mental or emotional stress?',
      answerString: answer === 'Yes' ? 'I experience high levels of mental or emotional stress.' : 'I do not experience high levels of mental or emotional stress.',
      questionTag: 'Mental Stress',
      answer: answer,
    };
    dispatch(addQuiz(stress_data));
  };

  const handleSleepSelect = async (answer: 'Yes' | 'No') => {
    await haptic(haptic_level);
    setRestfulSleep(answer);
    const sleep_data: Quiz = {
      id: 13,
      question: 'Do you get at least 6 hours of restful sleep each night?',
      answerString: answer === 'Yes' ? 'I get at least 6 hours of restful sleep each night.' : 'I do not get at least 6 hours of restful sleep each night.',
      questionTag: 'Restful Sleep',
      answer: answer,
    };
    dispatch(addQuiz(sleep_data));
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
          Sleep, Energy, Stress
        </Animated.Text>

        {/* Energy Level Question */}
        <Animated.Text
          entering={FadeInUp.delay(100).duration(400)}
          style={[styles.questionTitle, { color: Colors.textPrimaryColor }]}
        >
          On a scale of 1 to 10, how would you rate your day time energy?
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={styles.sliderContainer}
        >
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={energyLevel}
            onValueChange={handleEnergyChange}
                 minimumTrackTintColor={'#1857C1'}
                  maximumTrackTintColor={'#1857C133'}
                  thumbTintColor={'#1857C1'}
          />
          <View style={styles.sliderLabels}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <Text
                key={num}
                style={[
                  styles.sliderLabel,
                  { color: Colors.textTertiary },
                  energyLevel === num && [
                    styles.sliderLabelActive,
                    { color: Colors.primaryColor },
                  ],
                ]}
              >
                {num}
              </Text>
            ))}
          </View>
        </Animated.View>

        {/* Mental Stress Question */}
        <Animated.Text
          entering={FadeInUp.delay(250).duration(400)}
          style={[styles.questionTitle, { color: Colors.textPrimaryColor }]}
        >
          Do you experience high levels of mental or emotional stress?
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(300).duration(400)}
          style={styles.yesNoContainer}
        >
          <OptionPill
            label="Yes"
            isSelected={mentalStress === 'Yes'}
            onPress={() => handleStressSelect('Yes')}
            size="wide"
            delay={0}
          />
          <OptionPill
            label="No"
            isSelected={mentalStress === 'No'}
            onPress={() => handleStressSelect('No')}
            size="wide"
            delay={50}
          />
        </Animated.View>

        {/* Sleep Question */}
        <Animated.Text
          entering={FadeInUp.delay(400).duration(400)}
          style={[styles.questionTitle, { color: Colors.textPrimaryColor }]}
        >
          Do you get at least 6 hours of restful sleep each night?
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(450).duration(400)}
          style={styles.yesNoContainer}
        >
          <OptionPill
            label="Yes"
            isSelected={restfulSleep === 'Yes'}
            onPress={() => handleSleepSelect('Yes')}
            size="wide"
            delay={0}
          />
          <OptionPill
            label="No"
            isSelected={restfulSleep === 'No'}
            onPress={() => handleSleepSelect('No')}
            size="wide"
            delay={50}
          />
        </Animated.View>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: FONT_FAMILIES.nunitoBold,
    alignSelf: 'flex-start',
    textAlign: 'left',
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  questionTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.nunitoBold,
      alignSelf: 'flex-start',
    textAlign: 'left',
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  sliderContainer: {
    width: '100%',
    maxWidth: 320,
    paddingHorizontal: 10,
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
  sliderLabelActive: {
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
  yesNoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 300,
  },
});

export default StressScreen;
