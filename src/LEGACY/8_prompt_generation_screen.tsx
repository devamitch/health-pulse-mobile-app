import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LoadingAnimation from '../../../../constants/loadingAnimation';
import { ColorScheme } from '../../../../constants/theme';
import { useAppTheme } from '../../../../hooks/themeHook';
// import { generateClaudeResponseText } from '../../services/api/claude_client';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../../services/mmkv-redux/hooks';
import {
  // addWeeklyWorkoutPlan,
  setIsNewUser,
  updateUserPrompt,
} from '../../../../services/mmkv-redux/slices';
import { gameProfileAssesment } from '@/hooks/use-gameprofile-calc';
import { setUserGameProfile } from '@/services/mmkv-redux/slices/game_engine_slice';
// import {
//   updatePrompt,
//   weeklyActivityPlanGenerationPrompt,
// } from '../../utils/llm_utils';

interface PromptGenerationSreenProps {
  onNext: () => void;
  onBack: () => void;
}

const PromptGenerationSreen: React.FC<PromptGenerationSreenProps> = ({
  onNext,
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);

  // const abortController = useRef<AbortController | null>(null);
  const { quiz } = useAppSelector(state => state.message);
  const dispatch = useAppDispatch();
  const levelAssessmentQuestions = quiz.filter(item => item.id >= 101 && item.id < 400);
  const gameProfileAssessment = gameProfileAssesment(levelAssessmentQuestions);

  // const generateActivitiesPlan = async (prompt: string) => {
  //   try {
  //     abortController.current = new AbortController();
  //     const userInput = updatePrompt(
  //       '',
  //       [],
  //       preferences,
  //       weeklyWorkoutPlan,
  //       prompt,
  //     );
  //     const response = await generateClaudeResponseText(
  //       userInput,
  //       weeklyActivityPlanGenerationPrompt,
  //       [],
  //       'claude-3-5-haiku-latest',
  //       false,
  //     );
  //     const workoutPlan = JSON.parse((response.content[0] as any).text);
  //     dispatch(addWeeklyWorkoutPlan(workoutPlan));
  //     console.log(workoutPlan);
  //     return (response.content[0] as any).text;
  //   } catch (error) {
  //     if (abortController.current?.signal.aborted) {
  //       console.log('Request was aborted');
  //     } else {
  //       console.error('Error:', error);
  //     }
  //     return '[]';
  //   } finally {
  //     abortController.current = null;
  //   }
  // };

  const redirectPage = async () => {
    const prompt = [...quiz]
      .sort((a, b) => a.id - b.id)
      .map(item => item.answerString)
      .join(' ');
    dispatch(updateUserPrompt(prompt));
    // await generateActivitiesPlan(prompt);
    if(gameProfileAssessment)
      dispatch(setUserGameProfile(gameProfileAssessment));
    dispatch(setIsNewUser(false));
    setTimeout(onNext, 5000);
  };

  useEffect(() => {
    redirectPage();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ margin: 50, height: 700 }}>
        <Text style={styles.subText}>
          Please give me a moment as I process all your health goals and
          preferences to generate a personalized profile for you.
        </Text>
        <LoadingAnimation />
      </View>
    </View>
  );
};

const createStyle = (Colors: ColorScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
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
    subText: {
      fontSize: 18,
      fontFamily: 'Nunito-Regular',
      textAlign: 'center',
      marginBottom: 20,
      color: Colors.textPrimaryColor,
    },
  });
};

export default PromptGenerationSreen;
