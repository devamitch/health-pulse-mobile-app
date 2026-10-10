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

interface SmokeAndAlcoholProps {
  onNext: () => void;
  onBack: () => void;
}

const SmokeAndAlcohol: React.FC<SmokeAndAlcoholProps> = ({
  onNext
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);

  const [smoke, setSmoke] = useState('');
  const [alcohol, setAlcohol] = useState('');
  const { haptic_level } = useAppSelector(state => state.message);

  const dispatch = useAppDispatch();

  const handleNext = async () => {
    try {
      haptic(haptic_level);
      if (smoke && alcohol) {
        const smoke_data: Quiz = {
          id: 14,
          question: 'Do you smoke or are you exposed to second-hand smoke?',
          answerString: `I ${
            smoke === 'Yes' ? 'do' : `don't`
          } expose to smoke or second hand smoke.`,
          questionTag: 'Smoking Habit',
          answer: smoke,
        };
        const alcohol_data: Quiz = {
          id: 15,
          question: 'Do you consume alcohol?',
          questionTag: 'Alcohol Consumption',
          answerString: `I ${alcohol} consume alcohol.`,
          answer: alcohol,
        };
        dispatch(addQuiz(smoke_data));
        dispatch(addQuiz(alcohol_data));
        onNext();
      } else {
        Toast('Please answer all questions.');
      }
    } catch {
      Toast('Error');
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
          <Text style={styles.text}>Lifestyle</Text>
          <View style={styles.modalTextViewLabelWrapper}>
            <Text style={styles.labeltext}>
              Do you smoke or are you exposed to second-hand smoke?
            </Text>
          </View>
          <View style={{ height: 20 }} />
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                smoke === 'Yes' && styles.selectedOptionButton,
              ]}
              onPress={() => {
                setSmoke('Yes');
                haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  smoke === 'Yes' && styles.selectedOptionText,
                ]}
              >{`Yes`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                smoke === 'No' && styles.selectedOptionButton,
              ]}
              onPress={() => {
                setSmoke('No');
                haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  smoke === 'No' && styles.selectedOptionText,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 20 }} />
          <View style={styles.modalTextViewLabelWrapper}>
            <Text style={styles.labeltext}>Do you consume Alcohol?</Text>
          </View>
          <View style={{ height: 20 }} />
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                alcohol === 'Often' && styles.selectedOptionButton,
              ]}
              onPress={() => {
                setAlcohol('Often');
                haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  alcohol === 'Often' && styles.selectedOptionText,
                ]}
              >{`Often`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                alcohol === 'Rarely' && styles.selectedOptionButton,
              ]}
              onPress={() => {
                setAlcohol('Rarely');
                haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  alcohol === 'Rarely' && styles.selectedOptionText,
                ]}
              >
                Rarely
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                alcohol === 'Never' && styles.selectedOptionButton,
              ]}
              onPress={() => {
                setAlcohol('Never');
                haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  alcohol === 'Never' && styles.selectedOptionText,
                ]}
              >
                Never
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 20 }} />
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
      alignItems: 'center',
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
      marginLeft: 8,
      marginRight: 8,
      backgroundColor: Colors.white,
      minHeight: 45,
    },
    selectedOptionButton: {
      borderWidth: 1,
      backgroundColor: '#FFAF02',
      borderColor: '#FFAF02',
    },
    optionText: {
      fontSize: 14,
      color: Colors.textColor,
      textAlign: 'center',
      fontFamily: 'Nunito-Regular',
      justifyContent: 'center',
      alignItems: 'center',
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

export default SmokeAndAlcohol;
