// ============================================
// CuisinesScreen - Food Preferences (Screen 4/6)
// Matches the right screenshot exactly
// ============================================

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import SelectCard from '../components/SelectCard';
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

// Cuisine options matching the screenshot (3x2 grid)
const CUISINE_OPTIONS = [
  {
    id: 'italian',
    name: 'Italian Cuisine',
      image: require('../../../assets/images/questionare/italian.png'),
  },
  {
    id: 'indian',
    name: 'Indian Cuisine',
      image: require('../../../assets/images/questionare/indian.png'),
  },
  {
    id: 'japanese',
    name: 'Japanese Cuisine',
      image: require('../../../assets/images/questionare/japanese.png'),
  },
  {
    id: 'mexican',
    name: 'Mexican Cuisine',
     image: require('../../../assets/images/questionare/mexican.png'),
  },
  {
    id: 'chinese',
    name: 'Chinese Cuisine',
      image: require('../../../assets/images/questionare/chinese.png'),
  },
  {
    id: 'turkish',
    name: 'Turkish Cuisine',
      image: require('../../../assets/images/questionare/turkish.png'),
  },
];

const CuisinesScreen: React.FC<QuestionnaireScreenProps> = () => {
  const { Colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const { haptic_level } = useAppSelector(state => state.message);
  const quizData = useAppSelector(state => state.message.quiz);

  const cuisinesQuiz = quizData.find(q => q.questionTag === 'Favorite Cuisines');
  const dishesQuiz = quizData.find(q => q.questionTag === 'Favorite Dishes');

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(
    cuisinesQuiz?.answer ? (cuisinesQuiz.answer as string).split(', ').filter(c => c) : DEFAULT_FORM_DATA.favoriteCuisines,
  );
  const [dishes, setDishes] = useState<string[]>(
    dishesQuiz?.answer ? (dishesQuiz.answer as string).split(', ').filter(d => d) : DEFAULT_FORM_DATA.favoriteDishes
  );
  const [newDish, setNewDish] = useState('');

  useEffect(() => {
    setSelectedCuisines(cuisinesQuiz?.answer ? (cuisinesQuiz.answer as string).split(', ').filter(c => c) : DEFAULT_FORM_DATA.favoriteCuisines);
    setDishes(dishesQuiz?.answer ? (dishesQuiz.answer as string).split(', ').filter(d => d) : DEFAULT_FORM_DATA.favoriteDishes);
  }, [cuisinesQuiz, dishesQuiz]);

  const handleCuisineToggle = async (cuisineId: string) => {
    await haptic(haptic_level);
    const updated = selectedCuisines.includes(cuisineId)
      ? selectedCuisines.filter(c => c !== cuisineId)
      : [...selectedCuisines, cuisineId];

    setSelectedCuisines(updated);
    const cuisine_data: Quiz = {
      id: 9,
      question: 'What are your favorite cuisine?',
      answerString: `My favorite cuisines are ${updated.join(', ')}.`,
      questionTag: 'Favorite Cuisines',
      answer: updated.join(', '),
    };
    dispatch(addQuiz(cuisine_data));
  };

  const handleAddDish = () => {
    if (newDish.trim()) {
      const updated = [...dishes, newDish.trim()];
      setDishes(updated);
      const dishes_data: Quiz = {
        id: 10,
        question: 'What are your favorite dishes?',
        answerString: `My favorite dishes are ${updated.join(', ')}.`,
        questionTag: 'Favorite Dishes',
        answer: updated.join(', '),
      };
      dispatch(addQuiz(dishes_data));
      setNewDish('');
    }
  };

  const handleRemoveDish = (index: number) => {
    const updated = dishes.filter((_, i) => i !== index);
    setDishes(updated);
    const dishes_data: Quiz = {
      id: 10,
      question: 'What are your favorite dishes?',
      answerString: updated.length > 0 ? `My favorite dishes are ${updated.join(', ')}.` : '',
      questionTag: 'Favorite Dishes',
      answer: updated.join(', '),
    };
    dispatch(addQuiz(dishes_data));
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
        {/* Cuisine Question */}
        <Animated.Text
          entering={FadeInUp.delay(100).duration(400)}
          style={[styles.questionTitle, { color: Colors.textPrimaryColor }]}
        >
          What are your favorite cuisine?
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={styles.cuisineGrid}
        >
          {CUISINE_OPTIONS.map((cuisine, index) => (
            <SelectCard
              key={cuisine.id}
              label={cuisine.name}
              image={cuisine.image}
              isSelected={selectedCuisines.includes(cuisine.id)}
              onPress={() => handleCuisineToggle(cuisine.id)}
              variant="cuisine"
              delay={index * 60}
            />
          ))}
        </Animated.View>

        {/* Favorite Dishes Question */}
        <Animated.Text
          entering={FadeInUp.delay(400).duration(400)}
          style={[styles.questionTitle, { color: Colors.textPrimaryColor }]}
        >
          What are your favorite dishes?
        </Animated.Text>

        {/* Selected Dishes Tags */}
        {dishes.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(450).duration(400)}
            style={styles.dishesContainer}
          >
            {dishes.map((dish, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dishTag,
                  { backgroundColor: Colors.primaryColorLight },
                ]}
                onPress={() => handleRemoveDish(index)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dishTagText, { color: Colors.primaryColor }]}>{dish}</Text>
                <Ionicons name="close-circle" size={18} color={Colors.primaryColor} />
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Add Dish Input */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          style={[
            styles.inputContainer,
            {
              backgroundColor: Colors.white,
              borderColor: Colors.borderColor,
            },
          ]}
        >
          <TextInput
            style={[styles.textInput, { color: Colors.textPrimaryColor }]}
            value={newDish}
            onChangeText={text =>
              setNewDish(text.replace(/[^a-zA-Z0-9\s]/g, ''))
            }
            placeholder="Add your Preferences here..."
            placeholderTextColor={Colors.textTertiary}
            onSubmitEditing={handleAddDish}
            returnKeyType="done"
            maxLength={50}
          />
          <TouchableOpacity onPress={handleAddDish} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={28} color={Colors.textTertiary} />
          </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: 'center',
  },
  questionTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.nunitoBold,
    alignSelf: 'flex-start',
    textAlign: 'left',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
    maxWidth: 350,
  },
  dishesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  dishTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  dishTagText: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    maxWidth: 320,
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoRegular,
  },
});

export default CuisinesScreen;
