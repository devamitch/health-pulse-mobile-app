import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
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

interface CalmfulnessScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const CalmfulnessScreen: React.FC<CalmfulnessScreenProps> = ({
  onNext,
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);

  const [energyLevel, setEnergyLevel] = useState(1);
  const [stressLevel, setStressLevel] = useState('');
  const [sleepData, setSleepData] = useState('');

  const dispatch = useAppDispatch();
  const { haptic_level } = useAppSelector(state => state.message);

  const handleNext = async () => {
    try {
      haptic(haptic_level);
      if (energyLevel && stressLevel && sleepData) {
        const energy_level_data: Quiz = {
          id: 17,
          question:
            'On a scale of 1 to 10, how would you rate your day time energy?',
          answerString: `I rate my energy level ${energyLevel} out of 10.`,
          questionTag: 'Energy Level',
          answer: `${energyLevel} / 10`,
        };
        const stress_data: Quiz = {
          id: 18,
          question:
            'Do you experience high levels of mental or emotional stress?',
          answerString: `I ${
            stressLevel === 'Yes' ? 'do' : `don't`
          } experience mental stress.`,
          questionTag: 'Experiencing Mental Stress',
          answer: stressLevel,
        };
        const sleep_data: Quiz = {
          id: 19,
          question: 'Do you get at least 6 hours of restful sleep each night?',
          answerString: `I ${
            sleepData ? 'do' : `don't`
          } get 6 hours of restful sleep each night.`,
          questionTag: 'Getting Enough Sleep',
          answer: sleepData,
        };
        dispatch(addQuiz(energy_level_data));
        dispatch(addQuiz(stress_data));
        dispatch(addQuiz(sleep_data));
        onNext();
      } else {
        Toast('Please answer all questions.');
      }
    } catch (err) {
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
          <Text style={styles.text}>Calmfulness</Text>
          <View style={styles.modalTextViewLabelWrapper}>
            <Text style={styles.labeltext}>
              On a scale of 1 to 10, how would you rate your day time energy?
            </Text>
          </View>
          <View style={{ height: 20 }} />
          <Slider
            minimumTrackTintColor={Colors.primaryColor}
            maximumTrackTintColor={Colors.primaryColor}
            thumbTintColor={Colors.primaryColor}
            style={styles.slider}
            step={1}
            minimumValue={1}
            maximumValue={10}
            value={energyLevel}
            onValueChange={setEnergyLevel}
          />
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              width: '75%',
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <Text style={styles.labeltext}>{num}</Text>
            ))}
          </View>
          <View style={{ height: 20 }} />
          <View style={styles.modalTextViewLabelWrapper}>
            <Text style={styles.labeltext}>
              Do you experience high levels of mental or emotional stress?
            </Text>
          </View>
          <View style={{ height: 20 }} />
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                stressLevel === 'Yes' && styles.selectedOptionButton,
              ]}
              onPress={() => {
                setStressLevel('Yes');
                haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  stressLevel === 'Yes' && styles.selectedOptionText,
                ]}
              >{`Yes`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                stressLevel === 'No' && styles.selectedOptionButton,
              ]}
              onPress={() => {
                setStressLevel('No');
                haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  stressLevel === 'No' && styles.selectedOptionText,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 20 }} />
          <View style={styles.modalTextViewLabelWrapper}>
            <Text style={styles.labeltext}>
              Do you get at least 6 hours of restful sleep each night?
            </Text>
          </View>
          <View style={{ height: 20 }} />
          <View style={styles.gridContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                sleepData === 'Yes' && styles.selectedOptionButton,
              ]}
              onPress={() => {
                setSleepData('Yes');
                haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  sleepData === 'Yes' && styles.selectedOptionText,
                ]}
              >{`Yes`}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                sleepData === 'No' && styles.selectedOptionButton,
              ]}
              onPress={() => {
                setSleepData('No');
                haptic(haptic_level);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  sleepData === 'No' && styles.selectedOptionText,
                ]}
              >
                No
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
    modalTextViewLabelWrapper: {
      flexDirection: 'row',
      width: '85%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    slider: {
      width: '80%',
      height: 40,
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
      backgroundColor: '#FE3219',
      borderColor: '#FE3219',
    },
    optionText: {
      fontSize: 14,
      color: Colors.textColor,
      textAlign: 'center',
      fontFamily: 'Nunito-Regular',
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

export default CalmfulnessScreen;
