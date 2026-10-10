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
import { activity_questions } from '@/constants/onboarding-questions';

interface DietQuestionScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const ActivityAssesmentComponent: React.FC<DietQuestionScreenProps> = ({
  onNext,
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);
  const { haptic_level } = useAppSelector(state => state.message);

  const [workoutMinutes, setWorkoutMinutes] = useState('');
  const [pushups, setPushups] = useState('');
  const [workoutDays, setWorkoutDays] = useState('');
  const [briskWalkMinutes, setBriskWalkMinutes] = useState('');

  const dispatch = useAppDispatch();

  const handleNext = async () => {
    await haptic(haptic_level);
    if (
      workoutMinutes &&
      pushups &&
      workoutDays &&
      briskWalkMinutes
    ) {
      const workout_minutes_data: Quiz = {
        id: 101,
        question: 'How many minutes do you exercise per week?',
        answerString: `I exercise for ${workoutMinutes} minutes per week.`,
        questionTag: 'Exercise Minutes Per Week',
        answer: workoutMinutes,
      };
      const pushups_data: Quiz = {
        id: 102,
        question:
          'How many push-ups can you do continuously without stopping?',
        answerString: `I can do ${pushups} push-ups continuously without stopping.`,
        questionTag: 'Continuous Push-ups',
        answer: pushups,
      };
      const workout_days_data: Quiz = {
        id: 103,
        question:
          'How many days per week do you do moderate or intense physical activity?',
        answerString: `I do physical activity for ${workoutDays} days per week.`,
        questionTag: 'Physical Activity Days Per Week',
        answer: workoutDays,
      };
      const brisk_walk_data: Quiz = {
        id: 104,
        question:
          'How long can you brisk-walk or jog without resting? (minutes)',
        answerString: `I can brisk-walk or jog for ${briskWalkMinutes} minutes without resting.`,
        questionTag: 'Brisk-walk/Jog Duration',
        answer: briskWalkMinutes,
      };
      dispatch(addQuiz(workout_minutes_data));
      dispatch(addQuiz(pushups_data));
      dispatch(addQuiz(workout_days_data));
      dispatch(addQuiz(brisk_walk_data));
      onNext();
    } else {
      Toast('Please answer all the questions.');
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
          {activity_questions.map((item, index) => (
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
                    (index === 0 && workoutMinutes === option) ||
                    (index === 1 && pushups === option) ||
                    (index === 2 && workoutDays === option) ||
                    (index === 3 && briskWalkMinutes === option)
                      ? styles.selectedOptionButton
                      : {},
                  ]}
                  onPress={async () => {
                    if (index === 0) setWorkoutMinutes(option);
                    else if (index === 1) setPushups(option);
                    else if (index === 2) setWorkoutDays(option);
                    else if (index === 3) setBriskWalkMinutes(option);
                    await haptic(haptic_level);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (index === 0 && workoutMinutes === option) ||
                      (index === 1 && pushups === option) ||
                      (index === 2 && workoutDays === option) ||
                      (index === 3 && briskWalkMinutes === option)
                        ? styles.selectedOptionText
                        : {},
                    ]}
                    numberOfLines={1}
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

export default ActivityAssesmentComponent;
