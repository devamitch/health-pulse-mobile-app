import Slider from '@react-native-community/slider';
import { useState } from 'react';
import {
  Alert,
  Image,
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
  updatePrioritizedVitals,
} from '../../../../services/mmkv-redux/slices';
import { haptic } from '../../../../utils';
import { Toast } from '../../../../utils/toast';

interface GoalAssesmentScreenProps {
  onNext: () => void;
  onBack: () => void;
}

const GoalAssesmentScreen: React.FC<GoalAssesmentScreenProps> = ({ onNext }) => {
  const dispatch = useAppDispatch();

  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);

  const [goalIndex, setGoalIndex] = useState(-2);
  const [filledGoals, setFilledGoals] = useState([
    'weigth loss',
    'stress management',
    'improve sleep',
  ]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [goalsPrompt, setGoalsPrompt] = useState('');
  const [priorities, setPriorities] = useState<number[]>([]);

  const [fitnessAssesment, setFitnessAssesment] = useState<any[]>([]);
  const [buildMuscleAssesment, setBuildMuscleAssesment] = useState<any[]>([]);
  const [heartHealthAssesment, setHeartHealthAssesment] = useState<any[]>([]);
  const [generalAssesment, setGeneralAssesment] = useState<any[]>([]);
  const [cancerAssesment, setCancerAssesment] = useState<any[]>([]);
  const [diabetesAssesment, setDiabetesAssesment] = useState<any[]>([]);

  const [fitnessLevel, setFitnessLevel] = useState(1);
  const [fitnessGoal, setFitnessGoal] = useState('');

  const [strengthTraining, setStrengthTraining] = useState('');
  const [proteinGrams, setProteinGrams] = useState('');
  const [focusMuscle, setFocusMuscle] = useState('');
  const [otherFocusMuscle, setOtherFocusMuscle] = useState(false);
  const [proteinSupplement, setProteinSupplement] = useState('');
  const [otherProteinSupplement, setOtherProteinSupplement] = useState(false);

  const [heartMedication, setHeartMedication] = useState('');
  const [BPMonitorFrequency, setBPMonitorFrequency] = useState('');
  const [sodiumDiet, setSodiumDiet] = useState('');

  const [metabolicIssueMedication, setMetabolicIssueMedication] = useState('');
  const [bloodSugarMonitorFrequency, setBloodSugarMonitorFrequency] =
    useState('');
  const [avoidSugar, setAvoidSugar] = useState('');

  const [cancerTreatment, setCancerTreatment] = useState('');
  const [cancerRecoverGoal, setCancerRecoverGoal] = useState('');
  const [cancerSupportSystem, setCancerSupportSystem] = useState('');

  const [fastFoodFreqency, setFastFoodFrequency] = useState('');
  const [vitaminSupplement, setVitaminSupplement] = useState('');
  const [otherVitaminSupplement, setOtherVitaminSupplement] = useState(false);
  const [dietry, setDietry] = useState('');
  const [otherDietry, setOtherDietry] = useState(false);

  const finalAssesment: any[] = [];
  const generalGoals = ['weigth loss', 'stress management', 'improve sleep'];

  const { haptic_level } = useAppSelector(state => state.message);

  const allOptions = [
    {
      key: 'weigth loss',
      label: 'Healthy Weigth Loss',
      icon: require('../../assets/svg_to_png/weight-loss.png'),
      priority: 4,
    },
    {
      key: 'improve fitness',
      label: 'Improving Fitness',
      icon: require('../../assets/svg_to_png/boost-pre-workout.png'),
      priority: 8,
    },
    {
      key: 'build muscle',
      label: 'Build your Muscle',
      icon: require('../../assets/svg_to_png/recover-post-workout.png'),
      priority: 9,
    },
    {
      key: 'increase heart health',
      label: 'Improve Heart Health',
      icon: require('../../assets/svg_to_png/heart-health.png'),
      priority: 2,
    },
    {
      key: 'improve meatabolic health',
      label: 'Improve Metabolic Health',
      icon: require('../../assets/svg_to_png/diabetes.png'),
      priority: 3,
    },
    {
      key: 'recover from cancer',
      label: 'Recovering from Cancer',
      icon: require('../../assets/svg_to_png/cancer.png'),
      priority: 1,
    },
    {
      key: 'longevity',
      label: 'Longevity',
      icon: require('../../assets/svg_to_png/improve-general-health.png'),
      priority: 5,
    },
    {
      key: 'stress management',
      label: 'Stress Management',
      icon: require('../../assets/svg_to_png/stress.png'),
      priority: 6,
    },
    {
      key: 'improve sleep',
      label: 'Improve Sleep',
      icon: require('../../assets/svg_to_png/eye-healthstrain.png'),
      priority: 7,
    },
  ];

  const options = [
    {
      key: 'improve fitness',
      label: 'Improving Fitness',
      icon: require('../../assets/svg_to_png/boost-pre-workout.png'),
    },
    {
      key: 'build muscle',
      label: 'Build your Muscle',
      icon: require('../../assets/svg_to_png/recover-post-workout.png'),
    },
    {
      key: 'increase heart health',
      label: 'Improve Heart Health',
      icon: require('../../assets/svg_to_png/heart-health.png'),
    },
    {
      key: 'improve meatabolic health',
      label: 'Improve Metabolic Health',
      icon: require('../../assets/svg_to_png/diabetes.png'),
    },
    {
      key: 'recover from cancer',
      label: 'Recovering from Cancer',
      icon: require('../../assets/svg_to_png/cancer.png'),
    },
    {
      key: 'longevity',
      label: 'Longevity',
      icon: require('../../assets/svg_to_png/improve-general-health.png'),
    },
  ];

  const toggleSelection = (key: string, priority: number) => {
    if (selectedOptions.includes(key)) {
      setSelectedOptions(selectedOptions.filter(option => option !== key));
      setPriorities(priorities.filter(val => val !== priority));
    } else if (selectedOptions.length < 3) {
      setSelectedOptions([...selectedOptions, key]);
      setPriorities([...priorities, priority]);
    } else {
      Alert.alert('You can select up to 3 goals.');
    }
  };

  const finishAssesment = (index: number) => {
    try {
      if (index === 0) {
        if (fitnessGoal) {
          setGoalsPrompt(
            goalsPrompt +
              `I rate my fitness level ${fitnessLevel.toString()} out of 10. My fitness goal is ${fitnessGoal}. `,
          );
          console.log(goalsPrompt);
          setGoalIndex(-1);
          setFilledGoals([...filledGoals, 'improve fitness']);
          setFitnessAssesment([
            {
              question:
                'On a scale of 1 to 10 how would you rate your current fitness level?',
              answer: fitnessLevel.toString(),
            },
            {
              question: 'What are your fitness goals?',
              answer: fitnessGoal,
            },
          ]);
        } else Toast('Please fill all the fields');
      } else if (index === 1) {
        if (
          strengthTraining &&
          proteinGrams &&
          focusMuscle &&
          proteinSupplement
        ) {
          setGoalsPrompt(
            goalsPrompt +
              `I do strength training ${strengthTraining}. I target ${focusMuscle} muscle. I consume ${proteinGrams} grams of protein. I consume ${proteinSupplement} protein supplement. `,
          );
          setGoalIndex(-1);
          console.log(goalsPrompt);
          setFilledGoals([...filledGoals, 'build muscle']);
          setBuildMuscleAssesment([
            {
              question: 'How often do you engage in strength training weekly?',
              answer: strengthTraining,
            },
            {
              question: 'What are your target muscle groups?',
              answer: focusMuscle,
            },
            {
              question: 'How much protein do you consume daily?',
              answer: proteinGrams,
            },
            {
              question: 'Do you take any supplements to build muscles?',
              answer: proteinSupplement,
            },
          ]);
        } else Toast('Please fill all the fields');
      } else if (index === 2) {
        if (heartMedication && BPMonitorFrequency && sodiumDiet) {
          setGoalsPrompt(
            goalsPrompt +
              `I ${
                heartMedication === 'yes' ? `do` : `don't`
              } currently taking medication for heart health. I do monitor my BP ${BPMonitorFrequency}. I ${
                sodiumDiet === 'yes' ? 'do' : `doesn't`
              } follow low sodium diet. `,
          );
          setGoalIndex(-1);
          console.log(goalsPrompt);
          setFilledGoals([...filledGoals, 'increase heart health']);
          setHeartHealthAssesment([
            {
              question: 'Are you currently taking medication for heart health?',
              answer: heartMedication,
            },
            {
              question: 'How often do you monitor your blood pressure?',
              answer: BPMonitorFrequency,
            },
            {
              question: 'Do you follow a low-sodium diet?',
              answer: sodiumDiet,
            },
          ]);
        } else Toast('Please fill all the fields');
      } else if (index === 3) {
        if (
          metabolicIssueMedication &&
          bloodSugarMonitorFrequency &&
          avoidSugar
        ) {
          setGoalsPrompt(
            goalsPrompt +
              `I ${
                metabolicIssueMedication === 'yes' ? `do` : `don't`
              } currently taking medication for metabolic issues. I do check blood sugar level ${bloodSugarMonitorFrequency}. I ${
                avoidSugar === 'yes' ? `do` : `don't`
              } avoid sugary food and drinks.`,
          );
          setGoalIndex(-1);
          console.log(goalsPrompt);
          setFilledGoals([...filledGoals, 'improve meatabolic health']);
          setDiabetesAssesment([
            {
              question:
                'Are you currently taking medication for metabolic issues?',
              answer: metabolicIssueMedication,
            },
            {
              question: 'How often do you monitor your blood sugar?',
              answer: bloodSugarMonitorFrequency,
            },
            {
              question: 'Do you avoid sugary foods and drinks?',
              answer: avoidSugar,
            },
          ]);
        } else Toast('Please fill all the fields');
      } else if (index === 4) {
        if (cancerTreatment && cancerRecoverGoal && cancerSupportSystem) {
          setGoalsPrompt(
            goalsPrompt +
              `I'm ${
                cancerTreatment === 'yes' ? '' : 'not'
              } undergoing cancer treatment. My primary goal is ${cancerRecoverGoal}. I do have ${cancerSupportSystem} support. `,
          );
          setGoalIndex(-1);
          console.log(goalsPrompt);
          setFilledGoals([...filledGoals, 'recover from cancer']);
          setCancerAssesment([
            {
              question:
                'Are you currently undergoing treatment, or are you in remission?',
              answer: cancerTreatment,
            },
            {
              question: 'What is your primary goal for recovery?',
              answer: cancerRecoverGoal,
            },
            {
              question: 'Do you have a support system in place?',
              answer: cancerSupportSystem,
            },
          ]);
        } else Toast('Please fill all the fields');
      } else if (index === 5) {
        if (fastFoodFreqency && vitaminSupplement && dietry) {
          setGoalsPrompt(
            goalsPrompt +
              `I consume fast food and processed food ${fastFoodFreqency}. I do consume ${vitaminSupplement} for longevity. I do follow ${dietry} diet for longevity. `,
          );
          setGoalIndex(-1);
          console.log(goalsPrompt);
          setFilledGoals([...filledGoals, 'longevity']);
          setGeneralAssesment([
            {
              question: 'How often do you consume processed or fast food?',
              answer: fastFoodFreqency,
            },
            {
              question: 'Do you take any supplements for longevity?',
              answer: vitaminSupplement,
            },
            {
              question:
                'Do you follow any specific dietary patterns for longevity?',
              answer: dietry,
            },
          ]);
        } else Toast('Please fill all the fields');
      }
    } catch (error) {
      Toast('Error');
    }
  };

  const getRowColor = (index: number) => {
    if (index <= 2) return '#76D176'; // Row 1: green
    if (index <= 5) return '#FFAF02'; // Row 2: orange
    return '#FE3219'; // Row 3: red
  };

  const handleNext = async () => {
    haptic(haptic_level);
    if (selectedOptions.every((item: string) => filledGoals.includes(item))) {
      selectedOptions.map((item: string) => {
        if (item === 'improve fitness') {
          finalAssesment.push({
            goal: 'improve fitness',
            fitnessAssesment: { qnas: fitnessAssesment },
          });
        } else if (item === 'build muscle') {
          finalAssesment.push({
            goal: 'build muscle',
            buildMuscleAssesment: { qnas: buildMuscleAssesment },
          });
        } else if (item === 'increase heart health') {
          finalAssesment.push({
            goal: 'increase heart health',
            heartHealthAssesment: { qnas: heartHealthAssesment },
          });
        } else if (item === 'improve meatabolic health') {
          finalAssesment.push({
            goal: 'improve meatabolic health',
            diabetesAssesment: { qnas: diabetesAssesment },
          });
        } else if (item === 'cancer') {
          finalAssesment.push({
            goal: 'cancer',
            cancerAssesment: { qnas: cancerAssesment },
          });
        } else if (item === 'longevity') {
          finalAssesment.push({
            goal: 'longevity',
            generalAssesment: { qnas: generalAssesment },
          });
        }
      });
      const healthGoalData: Quiz = {
        id: 20,
        question: 'What are your health goals?',
        answerString: `My health goals are ${selectedOptions.join(', ')}`,
        answer: selectedOptions,
        questionTag: 'Health Goals',
      };
      const goalAssesmentData: Quiz = {
        id: 21,
        question: 'Goal Specific Questions',
        answerString: JSON.stringify(finalAssesment),
        answer: finalAssesment,
        questionTag: 'Goals Specific Information',
      };
      const goalSpecificData: Quiz = {
        id: 22,
        question: 'Give me more details about your goals',
        answerString: goalsPrompt,
        questionTag: 'Health Information',
        answer: goalsPrompt,
      };
      dispatch(addQuiz(healthGoalData));
      dispatch(addQuiz(goalAssesmentData));
      dispatch(addQuiz(goalSpecificData));
      onNext();
    } else {
      console.log(finalAssesment);
      console.log(selectedOptions);
      console.log(filledGoals);
      Alert.alert('Error', 'Please complete all assesments');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
    >
      <View style={styles.mainContainer}>
        <View style={styles.content}>
          {(goalIndex === -2) ? (
            <View style={styles.innerContent}>
              <Text style={styles.text}>Health goals</Text>
              <Text style={styles.subText}>Choose upto 3 goals</Text>

              <View style={styles.iconGridContainer}>
                {allOptions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedOptions.includes(item.key) && {
                        backgroundColor: getRowColor(index),
                        borderWidth: 1,
                        borderColor: getRowColor(index),
                      },
                    ]}
                    onPress={() => {
                      toggleSelection(item.key, item.priority);
                      haptic(haptic_level);
                    }}
                  >
                    <View
                      style={{
                        height: 45,
                        width: 45,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Image
                        source={item.icon}
                        style={[
                          selectedOptions.includes(item.key) && {
                            tintColor: 'white',
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        selectedOptions.includes(item.key) &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                text="Next"
                variant="contained"
                onPress={async () => {
                  haptic(haptic_level);
                  dispatch(updatePrioritizedVitals(Math.min(...priorities)));
                  if (selectedOptions.length && selectedOptions.length <= 3) {
                    console.log(
                      `[goal] Selected goals: ${selectedOptions.join(', ')}`,
                    );
                    const healthGoalData: Quiz = {
                      id: 20,
                      question: 'What are your health goals?',
                      answerString: `My health goals are ${selectedOptions.join(
                        ', ',
                      )}.`,
                      answer: selectedOptions,
                      questionTag: 'Health Goals',
                    };
                    dispatch(addQuiz(healthGoalData));
                    if (
                      selectedOptions.every((item: string) =>
                        generalGoals.includes(item),
                      )
                    )
                    onNext();
                    else setGoalIndex(-1);
                  } else {
                    Alert.alert(
                      'Please select atleast 1 goal before proceeding.',
                    );
                  }
                }}
                style={styles.nextButton}
              />
            </View>
          ): null}
          {goalIndex === -1 ? (
            <View style={styles.innerContent}>
              <Text style={styles.text}>Goal Assesment</Text>
              <View style={styles.iconGridContainer}>
                {options.map((item, index) => {
                  return (
                    selectedOptions.includes(item.key) && (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionButton,
                          filledGoals.includes(item.key) &&
                            styles.selectedOption,
                        ]}
                        onPress={() => {
                          haptic(haptic_level);
                          setGoalIndex(index);
                        }}
                      >
                        <Image
                          source={item.icon}
                          style={[
                            filledGoals.includes(item.key) && {
                              tintColor: 'white',
                            },
                          ]}
                        />
                        <Text
                          style={[
                            styles.optionText,
                            filledGoals.includes(item.key) &&
                              styles.selectedOptionText,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    )
                  );
                })}
              </View>
              <Button
                text="Next"
                variant="contained"
                onPress={handleNext}
                style={styles.nextButton}
              />
            </View>
          ): null}
          {goalIndex === 0 ? (
            <View style={styles.innerContent}>
              <Text style={styles.subText}>Fitness</Text>
              <View style={{ height: 20 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text
                  style={styles.labeltext}
                >{`On a scale of 1 to 10 how would you rate your current fitness level?`}</Text>
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
                value={fitnessLevel}
                onValueChange={setFitnessLevel}
              />
              {/*<Text style={styles.labeltext}>{`1    2    3    4    5    6    7    8    9    10`}</Text>*/}
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
              <View style={{ height: 50 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text
                  style={styles.labeltext}
                >{`What are your fitness goals?`}</Text>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    fitnessGoal === 'endurance' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    setFitnessGoal('endurance');
                    haptic(haptic_level);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      fitnessGoal === 'endurance' && styles.selectedOptionText,
                    ]}
                  >
                    Endurance
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    fitnessGoal === 'strength' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    setFitnessGoal('strength');
                    haptic(haptic_level);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      fitnessGoal === 'strength' && styles.selectedOptionText,
                    ]}
                  >
                    Strength
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    fitnessGoal === 'flexibility' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    setFitnessGoal('flexibility');
                    haptic(haptic_level);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      fitnessGoal === 'flexibility' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Flexibility
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 30 }} />
              <Button
                text="Next"
                variant="contained"
                onPress={async () => {
                  haptic(haptic_level);
                  finishAssesment(goalIndex);
                }}
                style={styles.nextButton}
              />
            </View>
          ): null}
          {goalIndex === 1 ? (
            <View style={styles.innerContent}>
              <Text style={styles.subText}>Build Muscle</Text>
              <View style={styles.modalTextViewLabelWrapper}>
                <Text
                  style={styles.labeltext}
                >{`How often do you engage in strength training weekly?`}</Text>
              </View>
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    strengthTraining === 'more than 4 times' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    setStrengthTraining('more than 4 times');
                    haptic(haptic_level);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      strengthTraining === 'more than 4 times' &&
                        styles.selectedOptionText,
                    ]}
                  >{`> 4 times`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    strengthTraining === '2 to 4 times' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    setStrengthTraining('2 to 4 times');
                    haptic(haptic_level);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      strengthTraining === '2 to 4 times' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    2 to 4 times
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    strengthTraining === '1 time' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    setStrengthTraining('1 time');
                    haptic(haptic_level);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      strengthTraining === '1 time' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    One time
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    strengthTraining === '0 time' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    setStrengthTraining('0 time');
                    haptic(haptic_level);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      strengthTraining === '0 time' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Not engaged
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text
                  style={styles.labeltext}
                >{`What are your target muscle groups?`}</Text>
              </View>
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    focusMuscle === 'core' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setFocusMuscle('core');
                    setOtherFocusMuscle(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      focusMuscle === 'core' && styles.selectedOptionText,
                    ]}
                  >{`Core`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    focusMuscle === 'Lower Body' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setFocusMuscle('Lower Body');
                    setOtherFocusMuscle(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      focusMuscle === 'Lower Body' && styles.selectedOptionText,
                    ]}
                  >
                    Lower Body
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    focusMuscle === 'Upper Body' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setFocusMuscle('Upper Body');
                    setOtherFocusMuscle(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      focusMuscle === 'Upper Body' && styles.selectedOptionText,
                    ]}
                  >
                    Upper Body
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    otherFocusMuscle && styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setOtherFocusMuscle(true);
                    setFocusMuscle('');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      otherFocusMuscle && styles.selectedOptionText,
                    ]}
                  >
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
              {otherFocusMuscle && (
                <View style={styles.textboxstyle}>
                  <TextBox
                    placeholder="specify here"
                    value={focusMuscle}
                    onChangeText={setFocusMuscle}
                  />
                </View>
              )}
              <View style={{ height: 20 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text
                  style={styles.labeltext}
                >{`How much protein do you consume daily?`}</Text>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.textboxstyle}>
                <TextBox
                  value={proteinGrams}
                  onChangeText={setProteinGrams}
                  keyboardType="number-pad"
                  placeholder="in grams"
                />
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text
                  style={styles.labeltext}
                >{`Do you take any supplements to build muscles?`}</Text>
              </View>
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    proteinSupplement === 'protein' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setProteinSupplement('protein');
                    setOtherProteinSupplement(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      proteinSupplement === 'protein' &&
                        styles.selectedOptionText,
                    ]}
                  >{`Protein`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    proteinSupplement === 'Creatinine' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setProteinSupplement('Creatinine');
                    setOtherProteinSupplement(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      proteinSupplement === 'Creatinine' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Creatinine
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    proteinSupplement === 'BCAA' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setProteinSupplement('BCAA');
                    setOtherProteinSupplement(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      proteinSupplement === 'BCAA' && styles.selectedOptionText,
                    ]}
                  >
                    BCAA
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    otherProteinSupplement &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setOtherProteinSupplement(true);
                    setProteinSupplement('');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      otherProteinSupplement && styles.selectedOptionText,
                    ]}
                  >
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
              {otherProteinSupplement && (
                <View style={styles.textboxstyle}>
                  <TextBox
                    placeholder="specify here"
                    value={proteinSupplement}
                    onChangeText={setProteinSupplement}
                  />
                </View>
              )}
              <Button
                text="Next"
                variant="contained"
                onPress={async () => {
                  haptic(haptic_level);
                  finishAssesment(goalIndex);
                }}
                style={styles.nextButton}
              />
            </View>
          ): null}
          {goalIndex === 2 ? (
            <View style={styles.innerContent}>
              <Text style={styles.subText}>Heart Health</Text>
              <View style={styles.modalTextViewLabelWrapper}>
                <Text style={styles.labeltext}>
                  Are you currently taking medication for heart health?
                </Text>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    heartMedication === 'yes' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setHeartMedication('yes');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      heartMedication === 'yes' && styles.selectedOptionText,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    heartMedication === 'no' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setHeartMedication('no');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      heartMedication === 'no' && styles.selectedOptionText,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text style={styles.labeltext}>
                  How often do you monitor your blood pressure?
                </Text>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    BPMonitorFrequency === 'Everyday' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setBPMonitorFrequency('Everyday');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      BPMonitorFrequency === 'Everyday' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Everyday
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    BPMonitorFrequency === '2 to 4 times a week' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setBPMonitorFrequency('2 to 4 times a week');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      BPMonitorFrequency === '2 to 4 times a week' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    2 to 4 times a week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    BPMonitorFrequency === 'Once a week' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setBPMonitorFrequency('Once a week');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      BPMonitorFrequency === 'Once a week' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Once a week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    BPMonitorFrequency === 'Once a month' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setBPMonitorFrequency('Once a month');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      BPMonitorFrequency === 'Once a month' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Once a month
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    BPMonitorFrequency === 'Rarely' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setBPMonitorFrequency('Rarely');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      BPMonitorFrequency === 'Rarely' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Rarely
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text style={styles.labeltext}>
                  Do you follow a low-sodium of Dash diet?
                </Text>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    sodiumDiet === 'yes' && styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setSodiumDiet('yes');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      sodiumDiet === 'yes' && styles.selectedOptionText,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    sodiumDiet === 'no' && styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setSodiumDiet('no');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      sodiumDiet === 'no' && styles.selectedOptionText,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
              <Button
                text="Next"
                variant="contained"
                onPress={async () => {
                  haptic(haptic_level);
                  finishAssesment(goalIndex);
                }}
                style={styles.nextButton}
              />
            </View>
          ): null}
          {goalIndex === 3 ? (
            <View style={styles.innerContent}>
              <Text style={styles.subText}>Metabolic Health</Text>
              <View style={styles.modalTextViewLabelWrapper}>
                <Text style={styles.labeltext}>
                  Are you on medication for metabolic issues?
                </Text>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    metabolicIssueMedication === 'yes' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setMetabolicIssueMedication('yes');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      metabolicIssueMedication === 'yes' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    metabolicIssueMedication === 'no' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setMetabolicIssueMedication('no');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      metabolicIssueMedication === 'no' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text style={styles.labeltext}>
                  How frequently do you check your blood sugar levels?
                </Text>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    bloodSugarMonitorFrequency === 'Everyday' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setBloodSugarMonitorFrequency('Everyday');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      bloodSugarMonitorFrequency === 'Everyday' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Everyday
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    bloodSugarMonitorFrequency === '2 to 4 times a week' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setBloodSugarMonitorFrequency('2 to 4 times a week');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      bloodSugarMonitorFrequency === '2 to 4 times a week' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    2 to 4 times a week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    bloodSugarMonitorFrequency === 'Once a week' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setBloodSugarMonitorFrequency('Once a week');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      bloodSugarMonitorFrequency === 'Once a week' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Once a week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    bloodSugarMonitorFrequency === 'Once a month' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setBloodSugarMonitorFrequency('Once a month');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      bloodSugarMonitorFrequency === 'Once a month' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Once a month
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    bloodSugarMonitorFrequency === 'Rarely' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setBloodSugarMonitorFrequency('Rarely');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      bloodSugarMonitorFrequency === 'Rarely' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Rarely
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text style={styles.labeltext}>
                  Do you avoid sugary foods or drinks?
                </Text>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    avoidSugar === 'yes' && styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setAvoidSugar('yes');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      avoidSugar === 'yes' && styles.selectedOptionText,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    avoidSugar === 'no' && styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setAvoidSugar('no');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      avoidSugar === 'no' && styles.selectedOptionText,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
              <Button
                text="Next"
                variant="contained"
                onPress={async () => {
                  haptic(haptic_level);
                  finishAssesment(goalIndex);
                }}
                style={styles.nextButton}
              />
            </View>
          ): null}
          {goalIndex === 4 ? (
            <View style={styles.innerContent}>
              <Text style={styles.subText}>Recover from Cancer</Text>
              <View style={styles.modalTextViewLabelWrapper}>
                <Text style={styles.labeltext}>
                  Are you currently undergoing treatment, or are you in
                  remission?
                </Text>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    cancerTreatment === 'yes' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setCancerTreatment('yes');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      cancerTreatment === 'yes' && styles.selectedOptionText,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    cancerTreatment === 'no' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setCancerTreatment('no');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      cancerTreatment === 'no' && styles.selectedOptionText,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text
                  style={styles.labeltext}
                >{`What are your primary recovery goals (e.g., regaining strength, improving immunity) ?`}</Text>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.textboxstyle}>
                <TextBox
                  value={cancerRecoverGoal}
                  onChangeText={setCancerRecoverGoal}
                  placeholder="Enter your goal here"
                />
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text
                  style={styles.labeltext}
                >{`Do you have a support system in place (e.g., family, support groups)?`}</Text>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.textboxstyle}>
                <TextBox
                  value={cancerSupportSystem}
                  onChangeText={setCancerSupportSystem}
                  placeholder="Enter type of support system you have"
                />
              </View>
              <Button
                text="Next"
                variant="contained"
                onPress={async () => {
                  haptic(haptic_level);
                  finishAssesment(goalIndex);
                }}
                style={styles.nextButton}
              />
            </View>
          ): null}
          {goalIndex === 5 ? (
            <View style={styles.innerContent}>
              <Text style={styles.subText}>Longevity</Text>
              <View style={styles.modalTextViewLabelWrapper}>
                <Text style={styles.labeltext}>
                  How often do you consume processed or fast foods?
                </Text>
              </View>
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    fastFoodFreqency === 'Everyday' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setFastFoodFrequency('Everyday');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      fastFoodFreqency === 'Everyday' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Everyday
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    fastFoodFreqency === 'Few times a week' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setFastFoodFrequency('Few times a week');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      fastFoodFreqency === 'Few times a week' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Few times a week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    fastFoodFreqency === 'Rarely' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setFastFoodFrequency('Rarely');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      fastFoodFreqency === 'Rarely' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Rarely
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    fastFoodFreqency === 'Never' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setFastFoodFrequency('Never');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      fastFoodFreqency === 'Never' && styles.selectedOptionText,
                    ]}
                  >
                    Never
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text style={styles.labeltext}>
                  Do you take any supplements for longevity?
                </Text>
              </View>
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    vitaminSupplement === 'Vitamins' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setVitaminSupplement('Vitamins');
                    setOtherVitaminSupplement(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      vitaminSupplement === 'Vitamins' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Vitamins
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    vitaminSupplement === 'Omega - 3' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setVitaminSupplement('Omega - 3');
                    setOtherVitaminSupplement(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      vitaminSupplement === 'Omega - 3' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Omega - 3
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    vitaminSupplement === 'Antioxidant' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setVitaminSupplement('Antioxidant');
                    setOtherVitaminSupplement(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      vitaminSupplement === 'Antioxidant' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Antioxidant
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    vitaminSupplement === 'Resveratrol' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setVitaminSupplement('Resveratrol');
                    setOtherVitaminSupplement(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      vitaminSupplement === 'Resveratrol' &&
                        styles.selectedOptionText,
                    ]}
                  >
                    Resveratrol
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    otherVitaminSupplement &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setOtherVitaminSupplement(true);
                    setVitaminSupplement('');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      otherVitaminSupplement && styles.selectedOptionText,
                    ]}
                  >
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
              {otherVitaminSupplement && (
                <View style={styles.textboxstyle}>
                  <TextBox
                    placeholder="specify here"
                    value={vitaminSupplement}
                    onChangeText={setVitaminSupplement}
                  />
                </View>
              )}
              <View style={{ height: 20 }} />
              <View style={styles.modalTextViewLabelWrapper}>
                <Text style={styles.labeltext}>
                  Do you follow any specific dietary patterns for longevity?
                </Text>
              </View>
              <View style={styles.gridContainer}>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    dietry === 'Mediterranean' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setDietry('Mediterranean');
                    setOtherDietry(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      dietry === 'Mediterranean' && styles.selectedOptionText,
                    ]}
                  >
                    Mediterranean
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    dietry === 'Plant - based' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setDietry('Plant - based');
                    setOtherDietry(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      dietry === 'Plant - based' && styles.selectedOptionText,
                    ]}
                  >
                    Plant - based
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    dietry === 'Sea food' &&
                      styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setDietry('Sea food');
                    setOtherDietry(false);
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      dietry === 'Sea food' && styles.selectedOptionText,
                    ]}
                  >
                    Sea food
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.questionOptionButton,
                    otherDietry && styles.questionSelectedOptionButton,
                  ]}
                  onPress={() => {
                    haptic(haptic_level);
                    setOtherDietry(true);
                    setDietry('');
                  }}
                >
                  <Text
                    style={[
                      styles.questionOptionText,
                      otherDietry && styles.selectedOptionText,
                    ]}
                  >
                    Other
                  </Text>
                </TouchableOpacity>
              </View>
              {otherDietry && (
                <View style={styles.textboxstyle}>
                  <TextBox
                    placeholder="specify here"
                    value={dietry}
                    onChangeText={setDietry}
                  />
                </View>
              )}
              <View style={{ height: 20 }} />
              <Button
                text="Next"
                variant="contained"
                onPress={async () => {
                  haptic(haptic_level);
                  finishAssesment(goalIndex);
                }}
                style={styles.nextButton}
              />
            </View>
          ): null}
        </View>
      </View>
    </ScrollView>
  );
};

const createStyle = (Colors: ColorScheme) => {
  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
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
    slider: {
      width: '80%',
      height: 40,
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
    textboxstyle: {
      width: '90%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    innerContent: {
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalTextViewLabelWrapper: {
      flexDirection: 'row',
      marginLeft: 20,
      marginRight: 20,
    },
    modalTextViewHeadingWrapper: {
      flexDirection: 'row',
      marginLeft: 20,
      marginRight: 20,
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
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    iconGridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      gap: 12,
    },
    content: {
      flex: 1,
      padding: 16,
      paddingTop: 0,
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
    subText: {
      fontSize: 18,
      fontFamily: 'Nunito-Regular',
      textAlign: 'center',
      marginBottom: 20,
      color: Colors.textPrimaryColor,
    },
    optionButton: {
      backgroundColor: Colors.white,
      padding: 8,
      borderColor: Colors.greyColor,
      borderWidth: 2,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      width: '30%',
    },
    optionText: {
      fontSize: 16,
      color: Colors.textPrimaryColor,
      textAlign: 'center',
      fontFamily: 'Nunito-Regular',
    },
    selectedOption: {
      borderWidth: 1,
      backgroundColor: '#0081EF',
      borderColor: '#0081EF',
    },
    nextButton: {
      marginVertical: 30,
    },
    questionOptionButton: {
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: Colors.greyColor700,
      borderRadius: 30,
      textAlign: 'center',
      paddingHorizontal: 10,
      width: '30%',
      marginVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 8,
      margin: 5,
      backgroundColor: Colors.white,
    },
    questionSelectedOptionButton: {
      borderWidth: 1,
      backgroundColor: Colors.primaryColor,
      borderColor: Colors.primaryColor,
    },
    questionOptionText: {
      fontSize: 14,
      color: Colors.textColor,
      textAlign: 'center',
      fontFamily: 'Nunito-Regular',
    },
    icon: {
      width: 25,
      height: 25,
    },
    selectedOptionText: {
      color: 'white',
    },
  });
  return styles;
};

export default GoalAssesmentScreen;
