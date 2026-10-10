'use client';

/**
 * CountryScreen - Screen 3
 *
 * PURPOSE: Country selection with wheel picker
 * USES: Custom CountryWheelPicker for smooth scrolling selection
 * USED IN: SettingsQuizScreen (Edit)
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppDispatch, useAppSelector } from '../../../services/mmkv-redux/hooks';
import { addQuiz, Quiz } from '../../../services/mmkv-redux/slices';
import { haptic } from '../../../utils';
import { QuestionnaireScreenProps, DEFAULT_FORM_DATA } from '../types/questionnaireSettings';
import { CountryWheelPicker } from '../components/WheelPicker';
import OptionPill from '../components/OptionPill';

const CountryScreen: React.FC<QuestionnaireScreenProps> = () => {
  const { Colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const { haptic_level } = useAppSelector((state) => state.message);
  const quizData = useAppSelector(state => state.message.quiz);
  
  const countryQuiz = quizData.find(q => q.questionTag === 'Country');
  const [selectedCountry, setSelectedCountry] = useState(
    countryQuiz?.answer as string || DEFAULT_FORM_DATA.country || 'United States'
  );

  useEffect(() => {
    setSelectedCountry(countryQuiz?.answer as string || DEFAULT_FORM_DATA.country || 'United States');
  }, [countryQuiz]);

  const handleCountryChange = (country: string) => {
    haptic(haptic_level);
    setSelectedCountry(country);
    const country_data: Quiz = {
      id: 6,
      question: 'Where are you located?',
      answerString: `I am located in ${country}.`,
      questionTag: 'Country',
      answer: country,
    };
    dispatch(addQuiz(country_data));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.Text
        entering={FadeInDown.delay(100).duration(400)}
        style={[styles.title, { color: Colors.textPrimaryColor }]}
      >
        Where are you located?
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(200).duration(400)}
        style={[styles.subtitle, { color: Colors.textSecondary }]}
      >
        This helps us provide region-specific health recommendations and recipes.
      </Animated.Text>

      {/* Country Wheel Picker */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(400)}
        style={styles.pickerContainer}
      >
        <CountryWheelPicker
          selectedCountry={selectedCountry}
          onCountryChange={handleCountryChange}
          showLabel={false}
          showSearch={true}
        />
      </Animated.View>

      {/* Selected Country Display */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        style={styles.selectedContainer}
      >
        <Text style={[styles.selectedLabel, { color: Colors.textTertiary }]}>Selected Country</Text>
        <OptionPill
          label={selectedCountry}
          isSelected={true}
          onPress={() => {}}
          size="medium"
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginHorizontal: 28,
  },
  title: {
    fontSize: 22,
    fontFamily: FONT_FAMILIES.nunitoBold,
    textAlign: 'left',
     marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    textAlign: 'left',
    lineHeight: 24,
  },
  pickerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  selectedLabel: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    marginBottom: 8,
  },
});

export default CountryScreen;
