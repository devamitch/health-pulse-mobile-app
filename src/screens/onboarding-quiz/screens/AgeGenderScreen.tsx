// ============================================
// AgeGenderScreen - A Little About You
// ============================================

import { FONT_FAMILIES } from '@/constants/typography';
import {
  detectUserCountry,
  getCountryDisplayString,
  getCountryNameByCode,
} from '@/utils/countryUtils';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  LinearTransition,
} from 'react-native-reanimated';
import { ColorScheme } from '../../../constants/theme';
import { useAppTheme } from '../../../hooks/themeHook';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../services/mmkv-redux/hooks';
import { addQuiz, Quiz } from '../../../services/mmkv-redux/slices';
import { haptic } from '../../../utils';

// Components
import CountryPickerModal from '../components/CountryPickerModal';
import HeightPickerModal from '../components/HeightPickerModal';
import OptionPill from '../components/OptionPill';
import SelectCard from '../components/SelectCard';
import WeightPickerModal from '../components/WeightPickerModal';
import {
  DEFAULT_FORM_DATA,
  QuestionnaireScreenProps,
} from '../types/questionnaireSettings';

// Age categories
const AGE_CATEGORIES = [
  { value: 'less than 18', label: '<18' },
  { value: '18 to 30', label: '18-31' },
  { value: '31 to 50', label: '31-50' },
  { value: '51 to 70', label: '51-70' },
  { value: 'above 70', label: '>70' },
  { value: 'Not to say', label: 'Prefer not to say' },
] as const;

// Gender options
const GENDER_OPTIONS = [
  {
    key: 'Male',
    label: 'Male',
    image: require('../../../assets/images/questionare/male.png'),
  },
  {
    key: 'Female',
    label: 'Female',
    image: require('../../../assets/images/questionare/female.png'),
  },
] as const;

interface AgeGenderScreenProps extends QuestionnaireScreenProps {}

// Memoized Age Pill Component
const AgePill = memo<{
  age: (typeof AGE_CATEGORIES)[number];
  isSelected: boolean;
  onPress: (value: string) => void;
  delay: number;
}>(({ age, isSelected, onPress, delay }) => {
  const handlePress = useCallback(() => {
    onPress(age.value);
  }, [age.value, onPress]);

  return (
    <OptionPill
      label={age.label}
      isSelected={isSelected}
      onPress={handlePress}
      size="small"
      delay={delay}
    />
  );
});

AgePill.displayName = 'AgePill';

// Memoized Gender Card Component
const GenderCard = memo<{
  option: (typeof GENDER_OPTIONS)[number];
  isSelected: boolean;
  onPress: (key: 'Male' | 'Female') => void;
  delay: number;
}>(({ option, isSelected, onPress, delay }) => {
  const handlePress = useCallback(() => {
    onPress(option.key as 'Male' | 'Female');
  }, [option.key, onPress]);

  return (
    <SelectCard
      label={option.label}
      image={option.image}
      isSelected={isSelected}
      onPress={handlePress}
      variant="gender"
      delay={delay}
    />
  );
});

GenderCard.displayName = 'GenderCard';

const AgeGenderScreen = memo<AgeGenderScreenProps>(() => {
  const dispatch = useAppDispatch();
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);

  const haptic_level = useAppSelector(state => state.message.haptic_level);
  const quizData = useAppSelector(state => state.message.quiz);

  // Get stored quiz data - memoized
  const { genderQuiz, ageQuiz, heightQuiz, weightQuiz, countryQuiz } = useMemo(
    () => ({
      genderQuiz: quizData.find(q => q.questionTag === 'Gender'),
      ageQuiz: quizData.find(q => q.questionTag === 'Age Range'),
      heightQuiz: quizData.find(q => q.questionTag === 'Height'),
      weightQuiz: quizData.find(q => q.questionTag === 'Weight'),
      countryQuiz: quizData.find(q => q.questionTag === 'Country'),
    }),
    [quizData],
  );

  // Local state
  const [localGender, setLocalGender] = useState(
    () =>
      (genderQuiz?.answer as typeof DEFAULT_FORM_DATA.gender) ||
      DEFAULT_FORM_DATA.gender,
  );
  const [localAge, setLocalAge] = useState(
    () =>
      (ageQuiz?.answer as typeof DEFAULT_FORM_DATA.ageCategory) ||
      DEFAULT_FORM_DATA.ageCategory,
  );
  const [localHeight, setLocalHeight] = useState<number>(() =>
    heightQuiz?.answer ? parseInt(heightQuiz.answer as string) : 170,
  );
  const [localWeight, setLocalWeight] = useState<number>(() =>
    weightQuiz?.answer ? parseFloat(weightQuiz.answer as string) : 70,
  );
  const [localCountry, setLocalCountry] = useState<string>(() => {
    if (countryQuiz?.answer) {
      const answer = countryQuiz.answer as string;
      if (answer.length <= 3 && answer === answer.toUpperCase()) {
        return getCountryNameByCode(answer) || 'United States';
      }
      return answer;
    }
    return '';
  });

  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>(() => {
    if (heightQuiz?.answer) {
      const heightStr = heightQuiz.answer.toString();
      return heightStr.includes('ft') || heightStr.includes("'") ? 'ft' : 'cm';
    }
    return 'cm';
  });

  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(() => {
    if (weightQuiz?.answer) {
      const weightStr = weightQuiz.answer.toString();
      return weightStr.includes('lbs') ? 'lbs' : 'kg';
    }
    return 'kg';
  });

  const [isCountryLoading, setIsCountryLoading] = useState(
    !countryQuiz?.answer,
  );

  // Modal states
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showHeightModal, setShowHeightModal] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);

  // Auto-detect country on mount
  useEffect(() => {
    if (!countryQuiz?.answer) {
      detectUserCountry()
        .then(detectedCountry => {
          setLocalCountry(detectedCountry.name);
          const country_data: Quiz = {
            id: 6,
            question: 'Where are you located?',
            answerString: `I am located in ${detectedCountry.name}.`,
            questionTag: 'Country',
            answer: detectedCountry.name,
          };
          dispatch(addQuiz(country_data));
        })
        .catch(error => {
          console.log('[AgeGenderScreen] Error detecting country:', error);
          setLocalCountry('United States');
        })
        .finally(() => setIsCountryLoading(false));
    } else {
      setIsCountryLoading(false);
    }
  }, [countryQuiz?.answer, dispatch]);

  // Gender selection handler
  const handleGenderSelect = useCallback(
    async (gender: 'Male' | 'Female') => {
      await haptic(haptic_level);
      setLocalGender(gender);
      const gender_data: Quiz = {
        id: 3,
        question: 'What is your gender?',
        answerString: `My gender is ${gender}.`,
        questionTag: 'Gender',
        answer: gender,
      };
      dispatch(addQuiz(gender_data));
    },
    [haptic_level, dispatch],
  );

  // "Prefer not to say" handler
  const handleOthersSelect = useCallback(async () => {
    await haptic(haptic_level);
    const gender: 'prefer not to say' = 'prefer not to say';
    setLocalGender(gender);
    const gender_data: Quiz = {
      id: 3,
      question: 'What is your gender?',
      answerString: `My gender is ${gender}.`,
      questionTag: 'Gender',
      answer: gender,
    };
    dispatch(addQuiz(gender_data));
  }, [haptic_level, dispatch]);

  // Age selection handler
  const handleAgeSelect = useCallback(
    async (age: string) => {
      await haptic(haptic_level);
      setLocalAge(age as any);
      const age_data: Quiz = {
        id: 2,
        question: 'What is your age category?',
        answerString: `My age category is ${age}.`,
        questionTag: 'Age Range',
        answer: age,
      };
      dispatch(addQuiz(age_data));
    },
    [haptic_level, dispatch],
  );

  // Country change handler
  const handleCountryChange = useCallback(
    (countryName: string, _countryCode: string) => {
      setLocalCountry(countryName);
      setShowCountryModal(false);
      const country_data: Quiz = {
        id: 6,
        question: 'Where are you located?',
        answerString: `I am located in ${countryName}.`,
        questionTag: 'Country',
        answer: countryName,
      };
      dispatch(addQuiz(country_data));
    },
    [dispatch],
  );

  // Height save handler
  const handleSaveHeight = useCallback(
    (height: number, unit: 'cm' | 'ft') => {
      haptic(haptic_level);
      setLocalHeight(height);
      setHeightUnit(unit);
      setShowHeightModal(false);

      const displayValue =
        unit === 'ft'
          ? `${Math.floor(height / 2.54 / 12)}'${Math.round(
              (height / 2.54) % 12,
            )}"`
          : `${height} cm`;

      const height_data: Quiz = {
        id: 4,
        question: 'What is your height?',
        answerString: `My height is ${displayValue}.`,
        questionTag: 'Height',
        answer: displayValue,
      };
      dispatch(addQuiz(height_data));
    },
    [haptic_level, dispatch],
  );

  // Weight save handler
  const handleSaveWeight = useCallback(
    (weight: number, unit: 'kg' | 'lbs') => {
      haptic(haptic_level);
      setLocalWeight(weight);
      setWeightUnit(unit);
      setShowWeightModal(false);

      const weight_data: Quiz = {
        id: 5,
        question: 'What is your weight?',
        answerString: `My weight is ${weight} ${unit}.`,
        questionTag: 'Weight',
        answer: `${weight} ${unit}`,
      };
      dispatch(addQuiz(weight_data));
    },
    [haptic_level, dispatch],
  );

  // Display strings - memoized
  const getHeightDisplay = useCallback(() => {
    if (heightUnit === 'ft') {
      const totalInches = localHeight / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      return `${feet}'${inches}"`;
    }
    return `${localHeight} cm`;
  }, [localHeight, heightUnit]);

  const getWeightDisplay = useCallback(() => {
    return `${localWeight} ${weightUnit}`;
  }, [localWeight, weightUnit]);

  const getCountryDisplay = useCallback(() => {
    return getCountryDisplayString(localCountry, isCountryLoading);
  }, [localCountry, isCountryLoading]);

  // Sync country changes from external updates
  useEffect(() => {
    if (countryQuiz?.answer) {
      const answer = countryQuiz.answer as string;
      if (answer.length <= 3 && answer === answer.toUpperCase()) {
        const countryName = getCountryNameByCode(answer);
        if (countryName && countryName !== localCountry) {
          setLocalCountry(countryName);
        }
      } else if (answer !== localCountry) {
        setLocalCountry(answer);
      }
    }
  }, [countryQuiz?.answer, localCountry]);

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={styles.content} layout={LinearTransition}>
          {/* Header */}
          <Animated.Text
            entering={FadeInUp.delay(50).duration(400)}
            style={styles.headerTitle}
          >
            A Little About You
          </Animated.Text>
          <Animated.Text
            entering={FadeInUp.delay(100).duration(400)}
            style={styles.headerSubtitle}
          >
            These details help us personalize your experience.
          </Animated.Text>

          {/* Gender Question */}
          <Animated.Text
            entering={FadeInUp.delay(150).duration(400)}
            style={styles.questionTitle}
          >
            What is your gender?
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={styles.genderContainer}
          >
            {GENDER_OPTIONS.map((option, index) => (
              <GenderCard
                key={option.key}
                option={option}
                isSelected={localGender === option.key}
                onPress={handleGenderSelect}
                delay={index * 50}
              />
            ))}
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(250).duration(400)}
            style={styles.othersContainer}
          >
            <OptionPill
              label="Prefer not to say"
              isSelected={localGender === 'prefer not to say'}
              onPress={handleOthersSelect}
              size="medium"
              delay={100}
            />
          </Animated.View>

          {/* Age Question */}
          <Animated.Text
            entering={FadeInUp.delay(300).duration(400)}
            style={styles.questionTitle}
          >
            How old are you?
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(350).duration(400)}
            style={styles.ageContainer}
          >
            {AGE_CATEGORIES.map((age, index) => (
              <AgePill
                key={age.value}
                age={age}
                isSelected={localAge === age.value}
                onPress={handleAgeSelect}
                delay={index * 40}
              />
            ))}
          </Animated.View>

          {/* Your Country */}
          <Animated.Text
            entering={FadeInUp.delay(400).duration(400)}
            style={styles.questionTitle}
          >
            Your country
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(450).duration(400)}
            style={styles.singleSelectContainer}
          >
            <OptionPill
              label={getCountryDisplay()}
              isSelected={!!localCountry && !isCountryLoading}
              onPress={() => {
                haptic(haptic_level);
                setShowCountryModal(true);
              }}
              size="large"
              style={styles.countryPill}
            />
          </Animated.View>

          {/* What's your height? */}
          <Animated.Text
            entering={FadeInUp.delay(500).duration(400)}
            style={styles.questionTitle}
          >
            What's your height?
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(550).duration(400)}
            style={styles.singleSelectContainer}
          >
            <OptionPill
              label={getHeightDisplay()}
              isSelected={!!localHeight}
              onPress={() => {
                haptic(haptic_level);
                setShowHeightModal(true);
              }}
              size="large"
              style={styles.valuePill}
            />
          </Animated.View>

          {/* What's your weight? */}
          <Animated.Text
            entering={FadeInUp.delay(600).duration(400)}
            style={styles.questionTitle}
          >
            What's your weight?
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(650).duration(400)}
            style={styles.singleSelectContainer}
          >
            <OptionPill
              label={getWeightDisplay()}
              isSelected={!!localWeight}
              onPress={() => {
                haptic(haptic_level);
                setShowWeightModal(true);
              }}
              size="large"
              style={styles.valuePill}
            />
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Country Picker Modal */}
      <CountryPickerModal
        visible={showCountryModal}
        selectedCountry={localCountry}
        onCountryChange={handleCountryChange}
        onClose={() => setShowCountryModal(false)}
      />

      {/* Height Picker Modal */}
      <HeightPickerModal
        visible={showHeightModal}
        onClose={() => setShowHeightModal(false)}
        selectedHeight={localHeight}
        unit={heightUnit}
        onSave={handleSaveHeight}
      />

      {/* Weight Picker Modal */}
      <WeightPickerModal
        visible={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        selectedWeight={localWeight}
        unit={weightUnit}
        onSave={handleSaveWeight}
      />
    </>
  );
});

AgeGenderScreen.displayName = 'AgeGenderScreen';

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 180,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 10,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.primaryColor,
      alignSelf: 'center',
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      alignSelf: 'center',
      textAlign: 'center',
      marginBottom: 30,
      paddingHorizontal: 20,
    },
    questionTitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
      alignSelf: 'flex-start',
      textAlign: 'left',
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 16,
    },
    genderContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 8,
      maxWidth: 350,
    },
    othersContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: 8,
    },
    ageContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 10,
      maxWidth: 350,
      gap: 10,
    },
    singleSelectContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 10,
    },
    countryPill: {
      minWidth: 200,
    },
    valuePill: {
      minWidth: 150,
    },
  });

export default AgeGenderScreen;
