import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  LinearTransition,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../services/mmkv-redux/hooks';
import { getFlagEmoji } from '../components/CountryPickerBottomSheet';
import { QuestionnaireScreenProps } from '../types/questionnaireSettings';

interface FinishScreenProps extends QuestionnaireScreenProps {
  onComplete: () => void;
}

const FinishScreen: React.FC<FinishScreenProps> = ({ onComplete }) => {
  const dispatch = useAppDispatch();
  const quizData = useAppSelector(state => state.message.quiz);
  const { userData } = useAppSelector(state => state.user);

  // Extract user data from quiz
  const nameQuiz = quizData.find(q => q.questionTag === 'Name');
  const genderQuiz = quizData.find(q => q.questionTag === 'Gender');
  const ageQuiz = quizData.find(q => q.questionTag === 'Age Range');
  const heightQuiz = quizData.find(q => q.questionTag === 'Height');
  const weightQuiz = quizData.find(q => q.questionTag === 'Weight');
  const countryQuiz = quizData.find(q => q.questionTag === 'Country');

  // Assessment data
  const mealCountQuiz = quizData.find(
    q => q.questionTag === 'Balanced Meals Per Day',
  );
  const exerciseMinutesQuiz = quizData.find(
    q => q.questionTag === 'Weekly Exercise Minutes',
  );
  const sleepHoursQuiz = quizData.find(
    q => q.questionTag === 'Average Sleep Hours Per Night',
  );

  // Calculate assessment scores (simplified)
  const getDietScore = () => {
    if (!mealCountQuiz) return 'Not assessed';
    const meals = parseInt(mealCountQuiz.answer as string);
    if (meals >= 3) return 'Excellent';
    if (meals >= 2) return 'Good';
    return 'Needs improvement';
  };

  const getActivityScore = () => {
    if (!exerciseMinutesQuiz) return 'Not assessed';
    const minutes = parseInt(exerciseMinutesQuiz.answer as string);
    if (minutes >= 150) return 'Excellent';
    if (minutes >= 75) return 'Good';
    return 'Needs improvement';
  };

  const getSleepScore = () => {
    if (!sleepHoursQuiz) return 'Not assessed';
    const hours = parseInt(sleepHoursQuiz.answer as string);
    if (hours >= 7) return 'Excellent';
    if (hours >= 6) return 'Good';
    return 'Needs improvement';
  };

  const handleComplete = () => {
    onComplete();
  };

  const assessmentData = [
    {
      title: 'Diet',
      score: getDietScore(),
      icon: 'nutrition',
      color: '#4CAF50',
      description: mealCountQuiz
        ? `${mealCountQuiz.answer} balanced meals per day`
        : 'Not assessed',
    },
    {
      title: 'Activity',
      score: getActivityScore(),
      icon: 'fitness',
      color: '#2196F3',
      description: exerciseMinutesQuiz
        ? `${exerciseMinutesQuiz.answer} minutes exercise per week`
        : 'Not assessed',
    },
    {
      title: 'Sleep',
      score: getSleepScore(),
      icon: 'moon',
      color: '#9C27B0',
      description: sleepHoursQuiz
        ? `${sleepHoursQuiz.answer} hours sleep per night`
        : 'Not assessed',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Celebration Header */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(500)}
          layout={LinearTransition}
          style={styles.header}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          </View>
          <Text style={styles.title}>Assessment Complete!</Text>
          <Text style={styles.subtitle}>
            Your personalized health profile is ready
          </Text>
        </Animated.View>

        {/* Personal Information */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Your Profile</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>
                {userData?.displayName || nameQuiz?.answer || 'Not provided'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>
                {genderQuiz?.answer || 'Not provided'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Age</Text>
              <Text style={styles.infoValue}>
                {ageQuiz?.answer || 'Not provided'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Location</Text>
              <View style={styles.countryRow}>
                {countryQuiz?.answer && (
                  <Text style={styles.flag}>
                    {getFlagEmoji(countryQuiz.answer as string)}
                  </Text>
                )}
                <Text style={styles.infoValue}>
                  {countryQuiz?.answer || 'Not provided'}
                </Text>
              </View>
            </View>

            {heightQuiz && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Height</Text>
                <Text style={styles.infoValue}>{heightQuiz.answer}</Text>
              </View>
            )}

            {weightQuiz && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Weight</Text>
                <Text style={styles.infoValue}>{weightQuiz.answer}</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Assessment Results */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Assessment Results</Text>

          <View style={styles.assessmentContainer}>
            {assessmentData.map((item, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(400 + index * 100).duration(500)}
                style={styles.assessmentCard}
              >
                <View style={styles.assessmentHeader}>
                  <View
                    style={[
                      styles.assessmentIcon,
                      { backgroundColor: item.color + '15' },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={item.color}
                    />
                  </View>
                  <Text style={styles.assessmentTitle}>{item.title}</Text>
                  <View
                    style={[
                      styles.scoreBadge,
                      { backgroundColor: item.color + '20' },
                    ]}
                  >
                    <Text style={[styles.scoreText, { color: item.color }]}>
                      {item.score}
                    </Text>
                  </View>
                </View>

                <Text style={styles.assessmentDescription}>
                  {item.description}
                </Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Next Steps */}
        <Animated.View
          entering={FadeInDown.delay(700).duration(500)}
          style={styles.nextSteps}
        >
          <Text style={styles.nextStepsTitle}>What's Next?</Text>

          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Ionicons name="sparkles" size={20} color="#FF9800" />
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepTextBold}>Personalized Plan:</Text> Your
                AI health companion will create a customized plan
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Ionicons name="trending-up" size={20} color="#4CAF50" />
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepTextBold}>Track Progress:</Text> Monitor
                improvements in diet, activity, and sleep
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepIcon}>
                <Ionicons name="settings" size={20} color="#2196F3" />
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepTextBold}>Adjust Anytime:</Text> Update
                your preferences anytime in settings
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Complete Button */}
        <Animated.View
          entering={FadeInDown.delay(800).duration(500)}
          style={styles.buttonContainer}
        >
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <Ionicons name="rocket" size={24} color="#FFFFFF" />
            <Text style={styles.completeButtonText}>
              Launch Your Health Journey
            </Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            Your data is secure and will be used only to personalize your
            experience
          </Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito-Bold',
    color: '#2E70B3',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#222',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Nunito-SemiBold',
    color: '#222',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  assessmentContainer: {
    gap: 12,
  },
  assessmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  assessmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assessmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assessmentTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#222',
    flex: 1,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  assessmentDescription: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#666',
    lineHeight: 20,
  },
  nextSteps: {
    backgroundColor: '#F0F8FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  nextStepsTitle: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#1976D2',
    marginBottom: 16,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: '#555',
    flex: 1,
    lineHeight: 20,
  },
  stepTextBold: {
    fontFamily: 'Nunito-Bold',
    color: '#333',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: '#2E70B3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#2E70B3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButtonText: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  note: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});

export default FinishScreen;
