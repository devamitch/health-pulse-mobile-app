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

interface DietQuestionScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const DietQuestionScreen: React.FC<DietQuestionScreenProps> = ({
  onNext,
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);
  const { haptic_level } = useAppSelector(state => state.message);

  const [food, setFood] = useState('');
  const [hydration, setHydration] = useState('');
  const [sugar, setSugar] = useState('');

  const dispatch = useAppDispatch();

  const handleNext = async () => {
    await haptic(haptic_level);
    if (food && hydration && sugar) {
        const food_data: Quiz = {
          id: 7,
          question:
            'Do you consume seafood, fruits, and vegetables at least 3 times a week?',
          answerString: `I ${
            food === 'Yes' ? 'do' : `don't`
          } consume seafood, fruits, and vegetables at least 3 times a week.`,
          questionTag: 'Seafood, fruits and vegetables consumption',
          answer:
            food === 'Yes'
              ? 'Atleast 3 times a week'
              : 'Less than 3 times a week',
        };
        const sugar_data: Quiz = {
          id: 8,
          question: 'How often do you consume foods or drinks with added sugar?',
          answerString: `I consume sugar ${sugar}`,
          questionTag: 'Sugar Consumption',
          answer: sugar,
        };
        const water_consumption_data: Quiz = {
          id: 9,
          question: 'How much water do you usually drink in a day?',
          answerString: `I consume ${hydration} water per day.`,
          questionTag: 'Water Consumption',
          answer: hydration,
        };
        dispatch(addQuiz(food_data));
        dispatch(addQuiz(sugar_data));
        dispatch(addQuiz(water_consumption_data));
        onNext();
    } else {
      Toast('Please answer all questions.');
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
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.text}>Diet</Text>
          <View style={styles.modalTextViewLabelWrapper}>
            <Text style={styles.labeltext}>
              Do you consume seafood, fruits, and vegetables at least 3 times a
              week?
            </Text>
          </View>
          <View style={{ height: 20 }} />
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                food === 'Yes' && styles.selectedOptionButton,
              ]}
              onPress={async () => {
                setFood('Yes');
                await haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  food === 'Yes' && styles.selectedOptionText,
                ]}
                numberOfLines={1}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                food === 'No' && styles.selectedOptionButton,
              ]}
              onPress={async () => {
                setFood('No');
                await haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  food === 'No' && styles.selectedOptionText,
                ]}
                numberOfLines={1}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalTextViewLabelWrapper}>
            <Text style={styles.labeltext}>
              How much water do you usually drink in a day?
            </Text>
          </View>
          <View style={{ height: 20 }} />
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                hydration === 'Less than 1 liter' && styles.selectedOptionButton,
              ]}
              onPress={async () => {
                setHydration('Less than 1 liter');
                await haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  hydration === 'Less than 1 liter' && styles.selectedOptionText,
                ]}
                numberOfLines={1}
              >
                Less than 1 liter
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                hydration === '1–2 liters' && styles.selectedOptionButton,
              ]}
              onPress={async () => {
                setHydration('1–2 liters');
                await haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  hydration === '1–2 liters' && styles.selectedOptionText,
                ]}
                numberOfLines={1}
              >
                1–2 liters
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                hydration === '2–3 liters' && styles.selectedOptionButton,
              ]}
              onPress={async () => {
                setHydration('2–3 liters');
                await haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  hydration === '2–3 liters' && styles.selectedOptionText,
                ]}
                numberOfLines={1}
              >
                2–3 liters
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                hydration === 'More than 3 liters' && styles.selectedOptionButton,
              ]}
              onPress={async () => {
                setHydration('More than 3 liters');
                await haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  hydration === 'More than 3 liters' && styles.selectedOptionText,
                ]}
                numberOfLines={1}
              >
                More than 3 liters
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalTextViewLabelWrapper}>
            <Text style={styles.labeltext}>
              How often do you consume foods or drinks with added sugar?
            </Text>
          </View>
          <View style={{ height: 20 }} />
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                sugar === 'Less than once a week' && styles.selectedOptionButton,
              ]}
              onPress={async () => {
                setSugar('Less than once a week');
                await haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  sugar === 'Less than once a week' && styles.selectedOptionText,
                ]}
                numberOfLines={1}
              >
                Less than once a week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                sugar === '1–3 times a week' && styles.selectedOptionButton,
              ]}
              onPress={async () => {
                setSugar('1–3 times a week');
                await haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  sugar === '1–3 times a week' && styles.selectedOptionText,
                ]}
                numberOfLines={1}
              >
                1–3 times a week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                sugar === '4–6 times a week' && styles.selectedOptionButton,
              ]}
              onPress={async () => {
                setSugar('4–6 times a week');
                await haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  sugar === '4–6 times a week' && styles.selectedOptionText,
                ]}
                numberOfLines={1}
              >
                4–6 times a week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                sugar === 'Daily' && styles.selectedOptionButton,
              ]}
              onPress={async () => {
                setSugar('Daily');
                await haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  sugar === 'Daily' && styles.selectedOptionText,
                ]}
                numberOfLines={1}
              >
                Daily
              </Text>
            </TouchableOpacity>
          </View>
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

export default DietQuestionScreen;
