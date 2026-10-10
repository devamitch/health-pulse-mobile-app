import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Button from '@/components/ui/buttons/button';
import TextBox from '../../../../components/TextBox';
import { ColorScheme } from '../../../../constants/theme';
import { useAppTheme } from '../../../../hooks/themeHook';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../services/mmkv-redux/hooks';
import {
  addQuiz,
  Quiz,
} from '../../../../services/mmkv-redux/slices';
import { haptic } from '../../../../utils';
import { Toast } from '../../../../utils/toast';

interface AgeScreenProps {
  onNext: () => void;
  onBack: () => void;
  name: string;
}

const AgeScreen: React.FC<AgeScreenProps> = ({
  name,
  onNext,
}) => {
  const dispatch = useAppDispatch();

  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);
  const { haptic_level } = useAppSelector(state => state.message);

  const [birth, setBirth] = useState('');
  const [ageCategory, setAgeCategory] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  const handleNext = async () => {
    await haptic(haptic_level);
    try {
      if (ageCategory && birth) {
        const age_data: Quiz = {
          id: 2,
          question: 'What is your age category?',
          answerString: `My age category is ${ageCategory}.`,
          questionTag: 'Age Range',
          answer: ageCategory,
        };
        dispatch(addQuiz(age_data));
        const gender_data: Quiz = {
          id: 3,
          question: 'What is your gender?',
          answerString: ` My gender is ${birth}.`,
          questionTag: 'Gender',
          answer: birth,
        };
        dispatch(addQuiz(gender_data));
        if (height) {
          const height_data: Quiz = {
            id: 4,
            question: 'What is your height?',
            answerString: `My height is ${height + 'cm'}.`,
            questionTag: 'Height',
            answer: `${height} cm`,
          };
          dispatch(addQuiz(height_data));
        }
        if (weight) {
          const weight_data: Quiz = {
            id: 5,
            question: 'What is your weight?',
            answerString: `My weight is ${weight + 'kg'}.`,
            questionTag: 'Weight',
            answer: `${weight} kg`,
          };
          dispatch(addQuiz(weight_data));
        }
        onNext();
      } else {
        Toast('Please answer all questions.');
      }
    } catch (error) {
      Toast('An error occured');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          bounces={false}
          overScrollMode="never"
          scrollToOverflowEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        >
            <View style={styles.content}>
              <Text style={styles.text}>{`Nice to meet you, ${name}!`}</Text>
              <Text
                style={styles.subText}
              >{`Let’s get to know you better, so I can help you reach your health and fitness goals.`}</Text>
              <Text
                style={styles.subText}
              >{`What is your assigned sex at your birth?`}</Text>
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    birth === 'Male' && styles.selectedOptionButton,
                  ]}
                  onPress={async () => {
                    await haptic(haptic_level);
                    setBirth('Male');
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      birth === 'Male' && styles.selectedOptionText,
                    ]}
                  >
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    birth === 'Female' && styles.selectedOptionButton,
                  ]}
                  onPress={async () => {
                    await haptic(haptic_level);
                    setBirth('Female');
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      birth === 'Female' && styles.selectedOptionText,
                    ]}
                  >
                    Female
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    birth === 'prefer not to say' &&
                      styles.selectedOptionButton,
                  ]}
                  onPress={async () => {
                    await haptic(haptic_level);
                    setBirth('prefer not to say');
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      birth === 'prefer not to say' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Prefer not to say
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }} />
              <Text style={styles.subText}>{`How old are you?`}</Text>
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    ageCategory === 'less than 18' &&
                      styles.selectedOptionButton,
                  ]}
                  onPress={async () => {
                    await haptic(haptic_level);
                    setAgeCategory('less than 18');
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      ageCategory === 'less than 18' &&
                        styles.selectedOptionText,
                    ]}
                  >{`< 18`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    ageCategory === '18 to 30' && styles.selectedOptionButton,
                  ]}
                  onPress={async () => {
                    await haptic(haptic_level);
                    setAgeCategory('18 to 30');
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      ageCategory === '18 to 30' && styles.selectedOptionText,
                    ]}
                  >{`18-30`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    ageCategory === '31 to 50' && styles.selectedOptionButton,
                  ]}
                  onPress={async () => {
                    await haptic(haptic_level);
                    setAgeCategory('31 to 50');
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      ageCategory === '31 to 50' && styles.selectedOptionText,
                    ]}
                  >{`31-50`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    ageCategory === '51 to 70' && styles.selectedOptionButton,
                  ]}
                  onPress={async () => {
                    await haptic(haptic_level);
                    setAgeCategory('51 to 70');
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      ageCategory === '51 to 70' && styles.selectedOptionText,
                    ]}
                  >{`51-70`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    ageCategory === 'above 70' && styles.selectedOptionButton,
                  ]}
                  onPress={async () => {
                    await haptic(haptic_level);
                    setAgeCategory('above 70');
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      ageCategory === 'above 70' && styles.selectedOptionText,
                    ]}
                  >{`> 70`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    ageCategory === 'Not to say' && styles.selectedOptionButton,
                  ]}
                  onPress={async () => {
                    await haptic(haptic_level);
                    setAgeCategory('Not to say');
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      ageCategory === 'Not to say' && styles.selectedOptionText,
                    ]}
                  >{`Prefer not to say`}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }} />
              <Text
                style={styles.subText}
              >{`What's your height? (optional)`}</Text>
              <View style={{ width: '40%' }}>
                <TextBox
                  value={height}
                  onChangeText={(text) =>
                    setHeight(text.replace(/[^0-9]/g, ''))
                  }
                  placeholder="in cm"
                  keyboardType='decimal-pad'
                />
              </View>
              <View style={{ height: 20 }} />
              <Text
                style={styles.subText}
              >{`What's your weight? (optional)`}</Text>
              <View style={{ width: '40%' }}>
                <TextBox
                  value={weight}
                  onChangeText={(text) =>
                    setWeight(text.replace(/[^0-9]/g, ''))
                  }
                  placeholder="in kgs"
                  keyboardType='decimal-pad'
                />
              </View>
              <View style={{ height: 20 }} />
              <Button
                text="Next"
                variant="contained"
                onPress={handleNext}
              />
              <View style={{ height: 60 }} />
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyle = (Colors: ColorScheme) => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      top: 40,
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
    date: {
      backgroundColor: Colors.white,
      padding: 8,
      borderColor: '#bbb',
      borderWidth: 1,
      borderRadius: 20,
      width: '90%',
      height: 50,
      justifyContent: 'center',
      marginLeft: 24,
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
      color: Colors.textColor,
      textAlign: 'center',
      marginBottom: 20,
    },
    subText: {
      fontSize: 16,
      fontFamily: 'Nunito-Regular',
      textAlign: 'center',
      marginBottom: 20,
      color: Colors.textColor,
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
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
    },
    ageGridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
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
    selectedOptionText: {
      color: 'white',
    },
    optionText: {
      fontSize: 14,
      color: Colors.textColor,
      textAlign: 'center',
      fontFamily: 'Nunito-Regular',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  return styles;
};

export default AgeScreen;
