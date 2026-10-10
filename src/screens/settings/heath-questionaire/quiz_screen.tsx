import { ColorScheme } from '@/constants/theme';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppTheme } from '../../../hooks/themeHook';
import { useAppSelector } from '../../../services/mmkv-redux/hooks';
import { FONT_FAMILIES } from '@/constants/typography';
import LinearGradient from '@/components/base/LinearGradient';

const QuizScreen = (props: any) => {
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);

  const { prompt } = useAppSelector(state => state.message);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Health Questionnaire</Text>

        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/doctor_illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.instructionText}>
          Choose one of the options below to proceed with your health
          questionnaire
        </Text>

        <Text style={styles.disclaimerText}>
          We are not storing this data; it is only used to provide more personalized results.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              // props.navigation.navigate('NameScreen');
              props.navigation.navigate('OnboardingQuiz');
            }}
          >
               <LinearGradient
                      colors={[ '#2E70B3' ,'#1857C1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButton}
                    >
            <Text style={styles.primaryButtonText}>{`${
              prompt ? `Retake` : `Take`
            } Quiz`}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default QuizScreen;

const createStyle = (Colors: ColorScheme) => {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 70,
    },
    title: {
      fontSize: 24,
      color: Colors.textPrimaryColor,
      fontFamily: FONT_FAMILIES.nunitoBold,
      textAlign: 'center',
      marginTop: 10,
    },
    imageContainer: {
      flex: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    illustration: {
      width: 300,
      height: 300,
    },
    instructionText: {
      fontSize: 18,
      textAlign: 'center',
      color: Colors.textColor,
      paddingHorizontal: 20,
      lineHeight: 22,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      flex: 1,
    },
    disclaimerText: {
      fontSize: 11,
      textAlign: 'center',
      color: Colors.textColor,
      marginTop: 16,
      padding: 20,
      fontFamily: FONT_FAMILIES.nunitoRegular,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      width: '100%',
      paddingBottom: 50,
    },
     primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 28,
    shadowColor: '#1857C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#FFF',
    letterSpacing: 0.5,
  },
    secondaryButton: {
      flex: 1,
      backgroundColor: Colors.white,
      paddingVertical: 15,
      borderRadius: 30,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.primaryColor,
      marginHorizontal: 5,
    },
    secondaryButtonText: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoMedium,
    },
  });
};
