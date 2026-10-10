import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '@/components/ui/buttons/button';
import { ColorScheme } from '../../../../constants/theme';
import { useAppTheme } from '../../../../hooks/themeHook';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../services/mmkv-redux/hooks';
import { addQuiz, Quiz } from '../../../../services/mmkv-redux/slices';
import { haptic } from '../../../../utils';
import { Toast } from '../../../../utils/toast';
import { diet_questions } from '@/constants/onboarding-questions';

interface DietQuestionScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const DietAssesmentComponent: React.FC<DietQuestionScreenProps> = ({
  onNext,
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);
  const { haptic_level } = useAppSelector(state => state.message);
  
  const [mealCount, setMealCount] = useState('');
  const [sugaryFoodDays, setSugaryFoodDays] = useState('');
  const [fruitVegServings, setFruitVegServings] = useState('');

  const dispatch = useAppDispatch();

  const handleNext = async () => {
    await haptic(haptic_level);
    if (mealCount && sugaryFoodDays && fruitVegServings) {
        const meal_count_data: Quiz = {
            id: 201,
            question: 'How many balanced meals do you eat per day?',
            answerString: `I eat ${mealCount} balanced meals per day.`,
            questionTag: 'Balanced Meals Per Day',
            answer: mealCount,
        };
        const sugary_food_days_data: Quiz = {
            id: 202,
            question: 'How many days per week do you avoid sugary drinks or junk food?',
            answerString: `I avoid sugary drinks or junk food for ${sugaryFoodDays} days per week.`,
            questionTag: 'Days Avoiding Sugary Drinks or Junk Food',
            answer: sugaryFoodDays,
        };
        const fruit_veg_servings_data: Quiz = {
            id: 203,
            question: 'How many servings of fruits or vegetables do you eat per day?',
            answerString: `I eat ${fruitVegServings} servings of fruits or vegetables per day.`,
            questionTag: 'Servings of Fruits or Vegetables Per Day',
            answer: fruitVegServings,
        };
        dispatch(addQuiz(meal_count_data));
        dispatch(addQuiz(sugary_food_days_data));
        dispatch(addQuiz(fruit_veg_servings_data));
        onNext();
    } else {
        Toast('Please answer all questions before proceeding.');
    }

  };

  return (
    <ScrollView
      bounces={false}
      overScrollMode="never"
      scrollToOverflowEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.text}>Diet</Text>
          {diet_questions.map((item, index) => (
            <>
            <View style={styles.modalTextViewLabelWrapper}>
                <Text style={styles.labeltext}>{item.question}</Text>
            </View>
            <View style={{ height: 20 }} />
            <View style={styles.gridContainer} key={index}>
              {item.options.map((option, optionIndex) => (
                <TouchableOpacity
                  key={optionIndex}
                    style={[
                        styles.optionButton,
                        (index === 0 && mealCount === option) ||
                        (index === 1 && sugaryFoodDays === option) ||
                        (index === 2 && fruitVegServings === option)
                            ? styles.selectedOptionButton
                            : {},
                    ]}
                  onPress={async () => {
                    if (index === 0) setMealCount(option);
                    else if (index === 1) setSugaryFoodDays(option);
                    else if (index === 2) setFruitVegServings(option);
                    await haptic(haptic_level);
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                        styles.optionText,
                        (index === 0 && mealCount === option) ||
                        (index === 1 && sugaryFoodDays === option) ||
                        (index === 2 && fruitVegServings === option)
                            ? styles.selectedOptionText
                            : {},
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ height: 20 }} />
            </>
          ))}
          <Button
            text="Next"
            variant="contained"
            onPress={handleNext}
            style={{ marginVertical: 30 }}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const createStyle = (Colors: ColorScheme) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: Colors.white,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Aquatico-Regular',
      color: Colors.textColor,
      paddingTop: 8,
    },
    progressBar: {
      height: 12,
      width: '100%',
      backgroundColor: Colors.textPrimaryColor + 50,
      borderRadius: 10,
    },
    modalTextViewLabelWrapper: {
      flexDirection: 'row',
      width: '85%',
      justifyContent: 'center',
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    optionButton: {
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: Colors.greyColor700,
      borderRadius: 30,
      textAlign: 'center',
      paddingHorizontal: 12,
      width: '45%',
      marginVertical: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 4,
      marginRight: 4,
      backgroundColor: Colors.white,
      minHeight: 45,
    },
    selectedOptionButton: {
      borderWidth: 1,
      backgroundColor: '#0081EF',
      borderColor: Colors.primaryColor,
    },
    veganSelectedButton: {
      borderWidth: 1,
      backgroundColor: '#76D176',
      borderColor: '#76D176',
    },
    ketoSelectedButton: {
      borderWidth: 1,
      backgroundColor: '#FFAF02',
      borderColor: '#FFAF02',
    },
    optionText: {
      fontSize: 14,
      color: Colors.textColor,
      fontFamily: 'Nunito-Regular',
      textAlign: 'center',
    },
    labeltext: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      letterSpacing: 0.7,
      textAlign: 'center',
    },
    backButtonWrapper: {
      flexDirection: 'row',
      marginHorizontal: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    content: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 20,
      fontFamily: 'Nunito-Bold',
      color: Colors.textPrimaryColor,
      textAlign: 'center',
      marginBottom: 20,
    },
    textInput: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      width: '100%',
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    selectedOptionText: {
      color: 'white',
    },
  });
  return styles;
};

export default DietAssesmentComponent;
