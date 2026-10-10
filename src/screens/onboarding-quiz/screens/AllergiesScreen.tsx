/**
 * AllergiesScreen - Allergies and supplements selection
 * Used in: SettingsQuizFlow
 */

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { QuestionnaireScreenProps, DEFAULT_FORM_DATA } from '../types/questionnaireSettings';
import SelectCard from '../components/SelectCard';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../services/mmkv-redux/hooks';
import {
  addQuiz,
  Quiz,
} from '../../../services/mmkv-redux/slices';
import { haptic } from '../../../utils';

// Allergy options
const ALLERGY_OPTIONS = [
  { key: 'Gluten', label: 'Gluten', image: require('../../../assets/images/questionare/Vegetarian.png') },
  { key: 'Dairy', label: 'Dairy', image: require('../../../assets/images/questionare/Keto.png') },
  { key: 'Nuts', label: 'Nuts', image: require('../../../assets/images/questionare/Vegan.png') },
  { key: 'Seafood', label: 'Seafood', image: require('../../../assets/images/questionare/Non-Veg.png') },
  { key: 'Eggs', label: 'Eggs', image: require('../../../assets/images/questionare/Vegetarian.png') },
  { key: 'Soy', label: 'Soy', image: require('../../../assets/images/questionare/Keto.png') },
  { key: 'Other', label: 'Other', image: require('../../../assets/images/questionare/Vegan.png') },
  { key: 'None', label: 'None', image: require('../../../assets/images/questionare/Non-Veg.png') },
];

// Supplement options
const SUPPLEMENT_OPTIONS = [
  { key: 'Multivitamin', label: 'Multivitamin', image: require('../../../assets/images/questionare/Vegetarian.png') },
  { key: 'Vitamin D', label: 'Vitamin D', image: require('../../../assets/images/questionare/Keto.png') },
  { key: 'Omega-3', label: 'Omega-3', image: require('../../../assets/images/questionare/Vegan.png') },
  { key: 'Protein', label: 'Protein', image: require('../../../assets/images/questionare/Non-Veg.png') },
  { key: 'Probiotics', label: 'Probiotics', image: require('../../../assets/images/questionare/Vegetarian.png') },
  { key: 'Iron', label: 'Iron', image: require('../../../assets/images/questionare/Keto.png') },
  { key: 'Other', label: 'Other', image: require('../../../assets/images/questionare/Vegan.png') },
  { key: 'None', label: 'None', image: require('../../../assets/images/questionare/Non-Veg.png') },
];

const AllergiesScreen: React.FC<QuestionnaireScreenProps> = () => {
  const { Colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const { haptic_level } = useAppSelector(state => state.message);
  const quizData = useAppSelector(state => state.message.quiz);

  const allergiesQuiz = quizData.find(q => q.questionTag === 'Food Allergies');
  const supplementsQuiz = quizData.find(q => q.questionTag === 'Supplements');
  const otherAllergyQuiz = quizData.find(q => q.questionTag === 'Other Allergy');
  const otherSupplementQuiz = quizData.find(q => q.questionTag === 'Other Supplement');

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    allergiesQuiz?.answer ? (allergiesQuiz.answer as string).split(', ').filter(a => a) : DEFAULT_FORM_DATA.allergies
  );
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>(
    supplementsQuiz?.answer ? (supplementsQuiz.answer as string).split(', ').filter(s => s) : DEFAULT_FORM_DATA.supplements
  );
  const [otherAllergy, setOtherAllergy] = useState(otherAllergyQuiz?.answer as string || DEFAULT_FORM_DATA.otherAllergy);
  const [otherSupplement, setOtherSupplement] = useState(otherSupplementQuiz?.answer as string || DEFAULT_FORM_DATA.otherSupplement);

  useEffect(() => {
    setSelectedAllergies(allergiesQuiz?.answer ? (allergiesQuiz.answer as string).split(', ').filter(a => a) : DEFAULT_FORM_DATA.allergies);
    setSelectedSupplements(supplementsQuiz?.answer ? (supplementsQuiz.answer as string).split(', ').filter(s => s) : DEFAULT_FORM_DATA.supplements);
    setOtherAllergy(otherAllergyQuiz?.answer as string || DEFAULT_FORM_DATA.otherAllergy);
    setOtherSupplement(otherSupplementQuiz?.answer as string || DEFAULT_FORM_DATA.otherSupplement);
  }, [allergiesQuiz, supplementsQuiz, otherAllergyQuiz, otherSupplementQuiz]);

  const handleAllergyToggle = async (allergy: string) => {
    await haptic(haptic_level);
    let newSelection: string[];

    if (allergy === 'None') {
      newSelection = ['None'];
      setOtherAllergy('');
    } else {
      const filtered = selectedAllergies.filter(a => a !== 'None');
      if (filtered.includes(allergy)) {
        newSelection = filtered.filter(a => a !== allergy);
        if (allergy === 'Other') {
          setOtherAllergy('');
        }
      } else {
        newSelection = [...filtered, allergy];
      }
    }

    setSelectedAllergies(newSelection);
    const allergy_data: Quiz = {
      id: 20,
      question: 'Do you have any food allergies or intolerances?',
      answerString: newSelection.length > 0 ? `My allergies: ${newSelection.join(', ')}` : 'No allergies',
      questionTag: 'Food Allergies',
      answer: newSelection.join(', '),
    };
    dispatch(addQuiz(allergy_data));
  };

  const handleSupplementToggle = async (supplement: string) => {
    await haptic(haptic_level);
    let newSelection: string[];

    if (supplement === 'None') {
      newSelection = ['None'];
      setOtherSupplement('');
    } else {
      const filtered = selectedSupplements.filter(s => s !== 'None');
      if (filtered.includes(supplement)) {
        newSelection = filtered.filter(s => s !== supplement);
        if (supplement === 'Other') {
          setOtherSupplement('');
        }
      } else {
        newSelection = [...filtered, supplement];
      }
    }

    setSelectedSupplements(newSelection);
    const supplement_data: Quiz = {
      id: 21,
      question: 'Do you take any supplements regularly?',
      answerString: newSelection.length > 0 ? `My supplements: ${newSelection.join(', ')}` : 'No supplements',
      questionTag: 'Supplements',
      answer: newSelection.join(', '),
    };
    dispatch(addQuiz(supplement_data));
  };

  const handleOtherAllergyChange = (text: string) => {
    setOtherAllergy(text);
    const other_allergy_data: Quiz = {
      id: 22,
      question: 'Other allergy details',
      answerString: `Other allergy: ${text}`,
      questionTag: 'Other Allergy',
      answer: text,
    };
    dispatch(addQuiz(other_allergy_data));
  };

  const handleOtherSupplementChange = (text: string) => {
    setOtherSupplement(text);
    const other_supplement_data: Quiz = {
      id: 23,
      question: 'Other supplement details',
      answerString: `Other supplement: ${text}`,
      questionTag: 'Other Supplement',
      answer: text,
    };
    dispatch(addQuiz(other_supplement_data));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
      {/* Allergies Section */}
      <Animated.Text
        entering={FadeInUp.delay(100).duration(400)}
        style={[styles.questionTitle, { color: Colors.textPrimaryColor }]}
      >
        Do you have any food allergies or intolerances?
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(150).duration(400)}
        style={[styles.hint, { color: Colors.textSecondary }]}
      >
        Select all that apply
      </Animated.Text>

      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.allergyGrid}
      >
        {ALLERGY_OPTIONS.map((option, index) => (
          <SelectCard
            key={option.key}
            label={option.label}
            image={option.image}
            isSelected={selectedAllergies.includes(option.key)}
            onPress={() => handleAllergyToggle(option.key)}
            variant="diet"
            delay={index * 50}
          />
        ))}
      </Animated.View>

      {selectedAllergies.includes('Other') && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.otherContainer}
        >
          <TextInput
            value={otherAllergy}
            onChangeText={handleOtherAllergyChange}
            placeholder="Please specify your allergy"
            placeholderTextColor={Colors.textTertiary}
            maxLength={100}
            style={[
              styles.textInput,
              {
                backgroundColor: Colors.backgroundSecondary,
                borderColor: Colors.borderColor,
                color: Colors.textPrimaryColor,
              },
            ]}
            multiline
          />
        </Animated.View>
      )}

      {/* Supplements Section */}
      <Animated.Text
        entering={FadeInUp.delay(300).duration(400)}
        style={[styles.questionTitle, styles.sectionMargin, { color: Colors.textPrimaryColor }]}
      >
        Do you take any supplements regularly?
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(350).duration(400)}
        style={[styles.hint, { color: Colors.textSecondary }]}
      >
        Select all that apply
      </Animated.Text>

      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        style={styles.supplementGrid}
      >
        {SUPPLEMENT_OPTIONS.map((option, index) => (
          <SelectCard
            key={option.key}
            label={option.label}
            image={option.image}
            isSelected={selectedSupplements.includes(option.key)}
            onPress={() => handleSupplementToggle(option.key)}
            variant="diet"
            delay={index * 50}
          />
        ))}
      </Animated.View>

      {selectedSupplements.includes('Other') && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.otherContainer}
        >
          <TextInput
            value={otherSupplement}
            onChangeText={handleOtherSupplementChange}
            placeholder="Please specify your supplement"
            placeholderTextColor={Colors.textTertiary}
            maxLength={100}
            style={[
              styles.textInput,
              {
                backgroundColor: Colors.backgroundSecondary,
                borderColor: Colors.borderColor,
                color: Colors.textPrimaryColor,
              },
            ]}
            multiline
          />
        </Animated.View>
      )}

      <View style={{ height: 100 }} />
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
  },
  content: {
    flex: 1,
    padding:20,

  },
  questionTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILIES.nunitoBold,
    textAlign: 'left',
    marginBottom: 8,
    lineHeight: 28,
  },
  hint: {
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    textAlign: 'left',
    marginBottom: 12,
  },
  allergyGrid: {
       flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  supplementGrid: {
     flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionMargin: {
    marginTop: 40,
  },
  otherContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default AllergiesScreen;
