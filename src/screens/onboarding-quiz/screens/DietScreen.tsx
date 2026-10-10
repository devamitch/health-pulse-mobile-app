import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
import SelectCard from '../components/SelectCard';
import {
  DEFAULT_FORM_DATA,
  QuestionnaireScreenProps,
} from '../types/questionnaireSettings';

// Diet type options matching the screenshot
const DIET_OPTIONS = [
  {
    key: 'Vegetarian',
    label: 'Vegetarian',
    image: require('../../../assets/images/questionare/Vegetarian.png'),
  },
  {
    key: 'Keto',
    label: 'Keto',
    image: require('../../../assets/images/questionare/Keto.png'),
  },
  {
    key: 'Vegan',
    label: 'Vegan',
    image: require('../../../assets/images/questionare/Vegan.png'),
  },
  {
    key: 'None',
    label: 'None',
    image: require('../../../assets/images/questionare/Non-Veg.png'),
  },
];

// Meal options
const MEAL_OPTIONS = ['1', '2', '3', '>3'];

const DietScreen: React.FC<QuestionnaireScreenProps> = () => {
  const { Colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const { haptic_level } = useAppSelector(state => state.message);
  const quizData = useAppSelector(state => state.message.quiz);

  const dietQuiz = quizData.find(q => q.questionTag === 'Diet Type');
  const mealsQuiz = quizData.find(q => q.questionTag === 'Meals Per Day');
  const seafoodQuiz = quizData.find(
    q => q.questionTag === 'Seafood Consumption',
  );

  const [localDietType, setLocalDietType] = useState(
    (dietQuiz?.answer as typeof DEFAULT_FORM_DATA.dietType) ||
      DEFAULT_FORM_DATA.dietType,
  );
  const [localMealsPerDay, setLocalMealsPerDay] = useState(
    (mealsQuiz?.answer as typeof DEFAULT_FORM_DATA.mealsPerDay) ||
      DEFAULT_FORM_DATA.mealsPerDay,
  );
  const [localSeafood, setLocalSeafood] = useState(
    (seafoodQuiz?.answer as typeof DEFAULT_FORM_DATA.consumeSeafood) ||
      DEFAULT_FORM_DATA.consumeSeafood,
  );

  useEffect(() => {
    setLocalDietType(
      (dietQuiz?.answer as typeof DEFAULT_FORM_DATA.dietType) ||
        DEFAULT_FORM_DATA.dietType,
    );
    setLocalMealsPerDay(
      (mealsQuiz?.answer as typeof DEFAULT_FORM_DATA.mealsPerDay) ||
        DEFAULT_FORM_DATA.mealsPerDay,
    );
    setLocalSeafood(
      (seafoodQuiz?.answer as typeof DEFAULT_FORM_DATA.consumeSeafood) ||
        DEFAULT_FORM_DATA.consumeSeafood,
    );
  }, [dietQuiz, mealsQuiz, seafoodQuiz]);

  const handleDietSelect = async (
    diet: 'Vegetarian' | 'Keto' | 'Vegan' | 'None',
  ) => {
    await haptic(haptic_level);
    setLocalDietType(diet);
    const diet_data: Quiz = {
      id: 6,
      question: 'Do you follow any of the specific diet?',
      answerString: `I follow ${diet} diet.`,
      questionTag: 'Diet Type',
      answer: diet,
    };
    dispatch(addQuiz(diet_data));
  };

  const handleMealsSelect = async (meals: string) => {
    await haptic(haptic_level);
    const value = meals === '>3' ? 'above 3' : meals;
    setLocalMealsPerDay(value as any);
    const meals_data: Quiz = {
      id: 7,
      question: 'How many meal do you eat daily?',
      answerString: `I eat ${value} meals daily.`,
      questionTag: 'Meals Per Day',
      answer: value,
    };
    dispatch(addQuiz(meals_data));
  };

  const handleSeafoodSelect = async (answer: 'Yes' | 'No') => {
    await haptic(haptic_level);
    setLocalSeafood(answer);
    const seafood_data: Quiz = {
      id: 8,
      question:
        'Do you consume seafood, fruits and vegetables at least 3 times a week?',
      answerString:
        answer === 'Yes'
          ? 'I consume seafood, fruits and vegetables at least 3 times a week.'
          : 'I do not consume seafood, fruits and vegetables at least 3 times a week.',
      questionTag: 'Seafood Consumption',
      answer: answer,
    };
    dispatch(addQuiz(seafood_data));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Diet Type Question */}
        <Animated.Text
          entering={FadeInUp.delay(100).duration(400)}
          style={[styles.questionTitle, { color: Colors.textPrimaryColor }]}
        >
          Do you follow any of the specific diet?
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={styles.dietContainer}
        >
          {DIET_OPTIONS.map((option, index) => (
            <SelectCard
              key={option.key}
              label={option.label}
              image={option.image}
              isSelected={localDietType === option.key}
              onPress={() => handleDietSelect(option.key as any)}
              variant="diet"
              delay={index * 50}
            />
          ))}
        </Animated.View>

        {/* Meals Per Day Question */}
        <Animated.Text
          entering={FadeInUp.delay(300).duration(400)}
          style={[styles.questionTitle, { color: Colors.textPrimaryColor }]}
        >
          How many meal do you eat daily?
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(350).duration(400)}
          style={styles.mealsContainer}
        >
          {MEAL_OPTIONS.map((meal, index) => (
            <OptionPill
              key={meal}
              label={meal}
              isSelected={
                localMealsPerDay === meal ||
                (localMealsPerDay === 'above 3' && meal === '>3')
              }
              onPress={() => handleMealsSelect(meal)}
              size="medium"
              delay={index * 40}
            />
          ))}
        </Animated.View>

        {/* Seafood Question */}
        <Animated.Text
          entering={FadeInUp.delay(500).duration(400)}
          style={[styles.questionTitle, { color: Colors.textPrimaryColor }]}
        >
          Do you consume seafood, fruits and vegetables at least 3 times a week?
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(550).duration(400)}
          style={styles.yesNoContainer}
        >
          <OptionPill
            label="Yes"
            isSelected={localSeafood === 'Yes'}
            onPress={() => handleSeafoodSelect('Yes')}
            size="wide"
            delay={0}
          />
          <OptionPill
            label="No"
            isSelected={localSeafood === 'No'}
            onPress={() => handleSeafoodSelect('No')}
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
  questionTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.nunitoBold,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  dietContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  mealsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  yesNoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 300,
  },
});

export default DietScreen;
