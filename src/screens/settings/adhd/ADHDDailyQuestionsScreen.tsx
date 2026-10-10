import BackButton from '@/components/ui/buttons/back-button';
import Button from '@/components/ui/buttons/button';
import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import {
  ADHDAnswer,
  completeADHDDay,
  saveADHDAnswer,
  selectADHDDayAnswers,
} from '@/services/mmkv-redux/slices/adhd_slice';
import { haptic } from '@/utils';
import { Toast } from '@/utils/toast';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export interface Question {
  id: string;
  category: string;
  question: string;
  type: string;
  options?: string[];
  scale?: { min: number; max: number };
  labels?: { [key: string]: string };
  range?: { min: number; max: number };
  unit?: string;
  followUp?: any;
}

interface ADHDDailyQuestionsProps {
  navigation: any;
  route: {
    params: {
      day: number;
      questions: Question[];
    };
  };
}

const ADHDDailyQuestionsScreen: React.FC<ADHDDailyQuestionsProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);
  const { haptic_level } = useAppSelector(state => state.message);
  const dispatch = useAppDispatch();

  const { day, questions } = route.params;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [showFollowUp, setShowFollowUp] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load existing answers from Redux
  const savedAnswers = useAppSelector(selectADHDDayAnswers(day));

  // Initialize answers from Redux on mount
  useEffect(() => {
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      const answersMap: { [key: string]: any } = {};
      Object.values(savedAnswers).forEach((answer: ADHDAnswer) => {
        answersMap[answer.questionId] = answer.answer;
      });
      setAnswers(answersMap);
    }
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (currentQuestion.followUp && answers[currentQuestion.id]) {
      const shouldShow = checkFollowUpCondition(
        currentQuestion.followUp.condition,
        answers[currentQuestion.id],
      );
      setShowFollowUp(shouldShow);
    } else {
      setShowFollowUp(false);
    }
  }, [answers, currentQuestionIndex]);

  const checkFollowUpCondition = (condition: string, answer: any): boolean => {
    if (condition === 'true') return answer === true;
    if (condition === 'false') return answer === false;
    if (condition.startsWith('<')) {
      const value = parseInt(condition.substring(1).trim());
      return parseInt(answer) < value;
    }
    if (condition.startsWith('>')) {
      const value = parseInt(condition.substring(1).trim());
      return parseInt(answer) > value;
    }
    return false;
  };

  const handleAnswer = (answer: any) => {
    haptic(haptic_level);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));

    // Save answer to Redux
    dispatch(
      saveADHDAnswer({
        day,
        questionId: currentQuestion.id,
        answer,
        totalQuestions: questions.length,
      }),
    );
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id] && answers[currentQuestion.id] !== 0) {
      haptic(haptic_level);
      Toast('Please answer the question to continue');
      return;
    }

    if (showFollowUp && currentQuestion.followUp) {
      const followUpId = currentQuestion.followUp.question.id;
      if (!answers[followUpId] && answers[followUpId] !== 0) {
        haptic(haptic_level);
        Toast('Please answer the follow-up question');
        return;
      }
    }

    haptic(haptic_level);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      haptic(haptic_level);
      setCurrentQuestionIndex(prev => prev - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleComplete = () => {
    // Convert answers to ADHDAnswer format
    const allAnswers: { [questionId: string]: ADHDAnswer } = {};
    Object.entries(answers).forEach(([questionId, answer]) => {
      allAnswers[questionId] = {
        questionId,
        answer,
        answeredAt: new Date().toISOString(),
      };
    });

    // Save to Redux and mark day as completed
    dispatch(
      completeADHDDay({
        day,
        allAnswers,
      }),
    );

    Toast(`Day ${day} completed successfully! 🎉`);
    navigation.goBack();
  };

  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case 'boolean':
        return (
          <View style={styles.booleanContainer}>
            <TouchableOpacity
              style={[
                styles.booleanButton,
                answers[question.id] === true && styles.booleanButtonSelected,
              ]}
              onPress={() => handleAnswer(true)}
            >
              <MaterialCommunityIcons
                name="check-circle"
                size={28}
                color={
                  answers[question.id] === true
                    ? '#4CAF50'
                    : Colors.greyColor700
                }
              />
              <Text
                style={[
                  styles.booleanButtonText,
                  answers[question.id] === true &&
                    styles.booleanButtonTextSelected,
                ]}
              >
                Yes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.booleanButton,
                answers[question.id] === false && styles.booleanButtonSelected,
              ]}
              onPress={() => handleAnswer(false)}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={28}
                color={
                  answers[question.id] === false
                    ? '#F44336'
                    : Colors.greyColor700
                }
              />
              <Text
                style={[
                  styles.booleanButtonText,
                  answers[question.id] === false &&
                    styles.booleanButtonTextSelected,
                ]}
              >
                No
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 'rating':
        return (
          <View style={styles.ratingContainer}>
            <View style={styles.ratingScale}>
              {Array.from(
                { length: question.scale!.max - question.scale!.min + 1 },
                (_, i) => i + question.scale!.min,
              ).map(value => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.ratingButton,
                    answers[question.id] === value &&
                      styles.ratingButtonSelected,
                  ]}
                  onPress={() => handleAnswer(value)}
                >
                  <Text
                    style={[
                      styles.ratingButtonText,
                      answers[question.id] === value &&
                        styles.ratingButtonTextSelected,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {question.labels && (
              <View style={styles.ratingLabels}>
                <Text style={styles.ratingLabel}>
                  {question.labels[String(question.scale!.min)]}
                </Text>
                <Text style={styles.ratingLabel}>
                  {question.labels[String(question.scale!.max)]}
                </Text>
              </View>
            )}
          </View>
        );

      case 'multiple':
      case 'percentage':
      case 'frequency':
        return (
          <View style={styles.multipleContainer}>
            {question.options?.map((option, index) => (
              <Animated.View
                key={option}
                entering={FadeInRight.delay(index * 30).springify()}
              >
                <TouchableOpacity
                  style={[
                    styles.multipleOption,
                    answers[question.id] === option &&
                      styles.multipleOptionSelected,
                  ]}
                  onPress={() => handleAnswer(option)}
                >
                  <View
                    style={[
                      styles.multipleRadio,
                      answers[question.id] === option &&
                        styles.multipleRadioSelected,
                    ]}
                  >
                    {answers[question.id] === option && (
                      <View style={styles.multipleRadioInner} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.multipleOptionText,
                      answers[question.id] === option &&
                        styles.multipleOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        );

      case 'number':
        return (
          <View style={styles.numberContainer}>
            <TextInput
              style={styles.numberInput}
              keyboardType="numeric"
              placeholder={`Enter ${question.unit || 'number'}`}
              placeholderTextColor={Colors.greyColor700}
              value={
                answers[question.id] !== undefined
                  ? String(answers[question.id])
                  : ''
              }
              onChangeText={text => {
                const num = parseInt(text);
                if (!isNaN(num) || text === '') {
                  handleAnswer(text === '' ? undefined : num);
                }
              }}
            />
            {question.unit && (
              <Text style={styles.numberUnit}>{question.unit}</Text>
            )}
          </View>
        );

      case 'text':
        return (
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            placeholder="Type your answer here..."
            placeholderTextColor={Colors.greyColor700}
            value={answers[question.id] || ''}
            onChangeText={text => handleAnswer(text)}
          />
        );

      case 'time':
        return (
          <TextInput
            style={styles.numberInput}
            placeholder="HH:MM (e.g., 08:30)"
            placeholderTextColor={Colors.greyColor700}
            value={answers[question.id] || ''}
            onChangeText={text => handleAnswer(text)}
          />
        );

      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'activity':
        return 'run';
      case 'diet':
        return 'food-apple';
      case 'stress':
        return 'head-heart';
      default:
        return 'help-circle';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'activity':
        return '#4CAF50';
      case 'diet':
        return '#FF9800';
      case 'stress':
        return '#F44336';
      default:
        return Colors.textColor;
    }
  };

  const renderHeaderContent = () => (
    <View style={styles.headerWrapper}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} iconColor="white" />
        <Text style={styles.headerTitle}>Day {day} Questions</Text>
        <View style={{ width: 42 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1} / {questions.length}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={Colors.white} barStyle="light-content" />
      <View
        style={{
          height: insets.top + 120,
          backgroundColor: '#1857C1',
          paddingTop: insets.top,
          borderRadius: 24,
          marginBottom: 16,
        }}
      >
        {renderHeaderContent()}
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            key={currentQuestionIndex}
            entering={FadeInRight.springify()}
            style={styles.questionCard}
          >
            {/* Category Badge */}
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: getCategoryColor(currentQuestion.category),
                },
              ]}
            >
              <MaterialCommunityIcons
                name={getCategoryIcon(currentQuestion.category)}
                size={18}
                color="white"
              />
              <Text style={styles.categoryText}>
                {currentQuestion.category.charAt(0).toUpperCase() +
                  currentQuestion.category.slice(1)}
              </Text>
            </View>

            {/* Question */}
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            {/* Answer Input */}
            {renderQuestionInput(currentQuestion)}

            {/* Follow-up Question */}
            {showFollowUp && currentQuestion.followUp && (
              <Animated.View
                entering={FadeInDown.springify()}
                style={styles.followUpContainer}
              >
                <View style={styles.followUpDivider} />
                <Text style={styles.followUpLabel}>Follow-up Question</Text>
                <Text style={styles.followUpQuestion}>
                  {currentQuestion.followUp.question.question}
                </Text>
                {renderQuestionInput(currentQuestion.followUp.question)}
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Navigation Buttons */}
      </KeyboardAvoidingView>
      <View
        style={[
          styles.navigationContainer,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <Button
          text="Previous"
          variant="outlined"
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
          style={styles.navButton}
        />
        <Button
          text={
            currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Next'
          }
          variant="contained"
          onPress={handleNext}
          style={[styles.navButton, styles.nextButton]}
        />
      </View>
    </View>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
    headerWrapper: {
      width: '90%',
      marginLeft: 20,
      gap: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    headerTitle: {
      color: 'white',
      fontFamily: 'Inter-Medium',
      fontSize: 20,
      flex: 1,
      textAlign: 'center',
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 8,
    },
    progressBar: {
      flex: 1,
      height: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: 'white',
      borderRadius: 3,
    },
    progressText: {
      fontSize: 13,
      fontFamily: 'Nunito-SemiBold',
      color: 'white',
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      // paddingTop: 24,
      paddingHorizontal: 20,
    },
    questionCard: {
      backgroundColor: Colors.white,
      borderRadius: 24,
      padding: 24,
      ...DEffect,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 20,
      gap: 8,
    },
    categoryText: {
      fontSize: 12,
      fontFamily: 'Nunito-Bold',
      color: 'white',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    questionText: {
      fontSize: 19,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      marginBottom: 24,
      lineHeight: 28,
    },
    booleanContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    booleanButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
      backgroundColor: Colors.backgroundColor,
      borderWidth: 3,
      borderColor: 'transparent',
      gap: 10,
    },
    booleanButtonSelected: {
      backgroundColor: 'white',
      borderColor: '#1857C1',
    },
    booleanButtonText: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      color: Colors.greyColor700,
    },
    booleanButtonTextSelected: {
      color: Colors.textColor,
    },
    ratingContainer: {
      gap: 20,
      marginTop: 8,
    },
    ratingScale: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: 'flex-start',
    },
    ratingButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: Colors.backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: 'transparent',
    },
    ratingButtonSelected: {
      backgroundColor: '#1857C1',
      borderColor: '#1857C1',
    },
    ratingButtonText: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
    },
    ratingButtonTextSelected: {
      color: 'white',
    },
    ratingLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    ratingLabel: {
      fontSize: 12,
      fontFamily: 'Nunito-Regular',
      color: Colors.greyColor700,
      flex: 1,
      maxWidth: '48%',
    },
    multipleContainer: {
      gap: 10,
      marginTop: 8,
    },
    multipleOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor: Colors.backgroundColor,
      borderWidth: 3,
      borderColor: 'transparent',
      gap: 14,
    },
    multipleOptionSelected: {
      borderColor: '#1857C1',
      backgroundColor: 'white',
    },
    multipleRadio: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2.5,
      borderColor: Colors.greyColor700,
      alignItems: 'center',
      justifyContent: 'center',
    },
    multipleRadioSelected: {
      borderColor: '#1857C1',
    },
    multipleRadioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#1857C1',
    },
    multipleOptionText: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Nunito-Medium',
      color: Colors.textColor,
      lineHeight: 22,
    },
    multipleOptionTextSelected: {
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
    },
    numberContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginTop: 8,
    },
    numberInput: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 18,
      fontSize: 16,
      fontFamily: 'Nunito-Medium',
      color: Colors.textColor,
      borderWidth: 2,
      borderColor: Colors.greyColor700 + '40',
    },
    numberUnit: {
      fontSize: 14,
      fontFamily: 'Nunito-Bold',
      color: Colors.greyColor700,
    },
    textInput: {
      backgroundColor: Colors.backgroundColor,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 18,
      fontSize: 16,
      fontFamily: 'Nunito-Regular',
      color: Colors.textColor,
      borderWidth: 2,
      borderColor: Colors.greyColor700 + '40',
      minHeight: 120,
      textAlignVertical: 'top',
      marginTop: 8,
    },
    followUpContainer: {
      marginTop: 28,
      paddingTop: 24,
      borderTopWidth: 2,
      borderTopColor: Colors.greyColor700 + '20',
    },
    followUpDivider: {
      height: 0,
    },
    followUpLabel: {
      fontSize: 13,
      fontFamily: 'Nunito-Bold',
      color: '#1857C1',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      backgroundColor: '#1857C1' + '10',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    followUpQuestion: {
      fontSize: 17,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
      marginBottom: 16,
      lineHeight: 24,
    },
    navigationContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
      backgroundColor: Colors.white,
      borderTopWidth: 1,
      borderTopColor: Colors.greyColor700 + '15',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 8,
    },
    navButton: {
      flex: 1,
      borderRadius: 28,
      paddingVertical: 16,
    },
    nextButton: {
      backgroundColor: '#1857C1',
    },
  });

export default ADHDDailyQuestionsScreen;
