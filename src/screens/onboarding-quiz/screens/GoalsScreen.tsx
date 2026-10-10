// ============================================
// GoalsScreen - Health Goals Selection (Screen 6/6)
// ============================================

import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { QuestionnaireScreenProps, DEFAULT_FORM_DATA } from '../types/questionnaireSettings';
import {
  useAppDispatch,
  useAppSelector,
} from '../../../services/mmkv-redux/hooks';
import {
  addQuiz,
  Quiz,
} from '../../../services/mmkv-redux/slices';
import { haptic } from '../../../utils';

// Goal options matching the specification
const GOAL_OPTIONS = [
  {
    key: 'weight_loss',
    label: 'Healthy Weight Loss',
    icon: 'scale-outline',
    color: '#76D176',
    priority: 4,
  },
  {
    key: 'improve_fitness',
    label: 'Improving Fitness',
    icon: 'fitness-outline',
    color: '#76D176',
    priority: 8,
  },
  {
    key: 'build_muscle',
    label: 'Build your Muscle',
    icon: 'barbell-outline',
    color: '#76D176',
    priority: 9,
  },
  {
    key: 'heart_health',
    label: 'Improve Heart Health',
    icon: 'heart-outline',
    color: '#FFAF02',
    priority: 2,
  },
  {
    key: 'metabolic_health',
    label: 'Improve Metabolic Health',
    icon: 'pulse-outline',
    color: '#FFAF02',
    priority: 3,
  },
  {
    key: 'cancer_recovery',
    label: 'Recovering from Cancer',
    icon: 'ribbon-outline',
    color: '#FE3219',
    priority: 1,
  },
  {
    key: 'longevity',
    label: 'Longevity',
    icon: 'leaf-outline',
    color: '#76D176',
    priority: 5,
  },
  {
    key: 'stress_management',
    label: 'Stress Management',
    icon: 'sunny-outline',
    color: '#FFAF02',
    priority: 6,
  },
  {
    key: 'improve_sleep',
    label: 'Improve Sleep',
    icon: 'moon-outline',
    color: '#FFAF02',
    priority: 7,
  },
];

const GoalsScreen: React.FC<QuestionnaireScreenProps> = () => {
  const { Colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const { haptic_level } = useAppSelector(state => state.message);
  const quizData = useAppSelector(state => state.message.quiz);

  const goalsQuiz = quizData.find(q => q.questionTag === 'Health Goals');

  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    goalsQuiz?.answer ? (goalsQuiz.answer as string).split(', ').filter(g => g) : DEFAULT_FORM_DATA.healthGoals,
  );

  useEffect(() => {
    setSelectedGoals(goalsQuiz?.answer ? (goalsQuiz.answer as string).split(', ').filter(g => g) : DEFAULT_FORM_DATA.healthGoals);
  }, [goalsQuiz]);

  const handleGoalToggle = async (goalKey: string) => {
    await haptic(haptic_level);
    let updated: string[];

    if (selectedGoals.includes(goalKey)) {
      // Remove the goal
      updated = selectedGoals.filter(g => g !== goalKey);
    } else {
      // Add the goal (max 3)
      if (selectedGoals.length >= 3) {
        Alert.alert(
          'Maximum Goals Reached',
          'You can select up to 3 health goals. Please remove one to add another.',
          [{ text: 'OK' }],
        );
        return;
      }
      updated = [...selectedGoals, goalKey];
    }

    setSelectedGoals(updated);
    
    // Dispatch with goal keys, not labels
    const goals_data: Quiz = {
      id: 14,
      question: 'What are your health goals?',
      answerString: updated.length > 0 ? `My health goals are: ${updated.map(key => {
        const goal = GOAL_OPTIONS.find(g => g.key === key);
        return goal ? goal.label : key;
      }).join(', ')}.` : '',
      questionTag: 'Health Goals',
      answer: updated.join(', '), // Save keys, not labels
    };
    dispatch(addQuiz(goals_data));
  };

  const getRowColor = (index: number) => {
    if (index < 3) return '#76D176'; // Row 1: green
    if (index < 6) return '#FFAF02'; // Row 2: orange
    return '#FE3219'; // Row 3: red
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Section Title */}
        <Animated.Text
          entering={FadeInUp.delay(50).duration(400)}
          style={[styles.sectionTitle, { color: Colors.primaryColor }]}
        >
          Health Goals
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(100).duration(400)}
          style={[styles.subtitle, { color: Colors.textSecondary }]}
        >
          Choose up to 3 goals
        </Animated.Text>

        {/* Goals Grid */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={styles.goalsGrid}
        >
          {GOAL_OPTIONS.map((goal, index) => {
            const isSelected = selectedGoals.includes(goal.key);
            const rowColor = getRowColor(index);

            return (
              <TouchableOpacity
                key={goal.key}
                style={[
                  styles.goalCard,
                  {
                    backgroundColor: Colors.white,
                    borderColor: Colors.borderColor,
                  },
                  isSelected && {
                    backgroundColor: rowColor,
                    borderColor: rowColor,
                  },
                ]}
                onPress={() => handleGoalToggle(goal.key)}
                activeOpacity={0.8}
              >
                <View style={styles.goalIconContainer}>
                  <Ionicons
                    name={goal.icon as any}
                    size={28}
                    color={isSelected ? Colors.white : goal.color}
                  />
                </View>
                <Text
                  style={[
                    styles.goalLabel,
                    { color: Colors.textPrimaryColor },
                    isSelected && [
                      styles.goalLabelSelected,
                      { color: Colors.white },
                    ],
                  ]}
                  numberOfLines={2}
                >
                  {goal.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Selection Counter */}
        <Animated.Text
          entering={FadeInUp.delay(300).duration(400)}
          style={[styles.selectionCounter, { color: Colors.textSecondary }]}
        >
          {selectedGoals.length}/3 selected
        </Animated.Text>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: FONT_FAMILIES.nunitoBold,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginBottom: 24,
    marginHorizontal: 20,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    maxWidth: 360,
  },
  goalCard: {
    width: 105,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalLabel: {
    fontSize: 12,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    textAlign: 'center',
    lineHeight: 14,
  },
  goalLabelSelected: {
  },
  selectionCounter: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    marginTop: 20,
    alignSelf: 'flex-start',
    marginHorizontal: 20,
  },
});

export default GoalsScreen;