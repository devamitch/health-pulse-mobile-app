import ProgressBar from '@/components/progress-bar';
import { ColorScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { useState } from 'react';
import {
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NameScreen from './screens/LEGACY/1_name_screen';
import AgeScreen from './screens/LEGACY/2_age_and_sex_screen';
import CountryScreen from './screens/LEGACY/3_country_screen';
import ActivityAssesmentComponent from './screens/LEGACY/4_activity_assesment_question';
import DietAssesmentComponent from './screens/LEGACY/5_diet_assesment_question';
import CalmAssessmentComponent from './screens/LEGACY/6_calm_assesment_question';
import GoalAssesmentScreen from './screens/LEGACY/7_goal_assesment_screen';
import PromptGenerationSreen from './screens/LEGACY/8_prompt_generation_screen';

const OnboardingQuiz = (props: any) => {
  const { Colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyle(Colors);

  const [progress, setProgress] = useState(1);
  const [name, setName] = useState('');

  const handleBackPress = () => {
    if (progress === 1) {
      props.navigation.goBack();
      return;
    }
    setProgress(prev => prev - 1);
  };

  const handleNext = () => {
    if (progress === 8) {
      props.navigation.navigate('NavigationTab');

      // props.navigation.reset({
      //     index: 0,
      //     routes: [{ name: 'NavigationTab' }],
      // });
    }
    setProgress(prev => prev + 1);
  };

  return (
    <View style={styles.mainContainer}>
      {!Colors.isDark ? (
        <StatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
      ) : (
        <StatusBar backgroundColor={Colors.white} barStyle={'light-content'} />
      )}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.backButtonWrapper}>
          <TouchableOpacity onPress={handleBackPress}>
            {Platform.OS === 'ios' ? (
              <Ionicons
                name="chevron-back"
                size={26}
                color={Colors.textColor}
              />
            ) : (
              <Image
                source={require('./../../assets/icons/back.png')}
                style={{ height: 30, width: 30, tintColor: Colors.textColor }}
              />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>HealthPulse</Text>
        <View style={{ width: 50 }} />
      </View>
      <View style={{ margin: 20 }}>
        <ProgressBar
          progress={progress / 8}
          color={Colors.primaryColor}
          style={styles.progressBar}
        />
      </View>
      {progress === 1 ? (
        <NameScreen
          onBack={handleBackPress}
          onNext={handleNext}
          name={name}
          setName={setName}
        />
      ) : null}
      {progress === 2 ? (
        <AgeScreen onNext={handleNext} onBack={handleBackPress} name={name} />
      ) : null}
      {progress === 3 ? (
        <CountryScreen onNext={handleNext} onBack={handleBackPress} />
      ) : null}
      {progress === 4 ? (
        <ActivityAssesmentComponent
          onBack={handleBackPress}
          onNext={handleNext}
        />
      ) : null}
      {progress === 5 ? (
        <DietAssesmentComponent onNext={handleNext} onBack={handleBackPress} />
      ) : null}
      {progress === 6 ? (
        <CalmAssessmentComponent onNext={handleNext} onBack={handleBackPress} />
      ) : null}
      {progress === 7 ? (
        <GoalAssesmentScreen onNext={handleNext} onBack={handleBackPress} />
      ) : null}
      {progress === 8 ? (
        <PromptGenerationSreen onNext={handleNext} onBack={handleBackPress} />
      ) : null}
    </View>
  );
};

const createStyle = (Colors: ColorScheme) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButtonWrapper: {
      flexDirection: 'row',
      marginHorizontal: 10,
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
  });

export default OnboardingQuiz;
