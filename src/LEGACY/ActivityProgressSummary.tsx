import Trophy from '@/assets/svg/Trophy.svg';
import { ColorScheme } from '@/constants/theme';
import useGameProgression from '@/hooks/useGameProgression';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { fetchActivitiesRecordByDate } from '@/services/sqlite/message';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ActivityItem {
  name: string;
  checked: boolean;
}

interface ProgressComparison {
  today: number;
  yesterday: number;
  improvement: number;
}

interface CategoryWorkout {
  category: string;
  exercises: string[];
}

const convertRoutineToCategories = (data: any[]) => {
  const categoryMap: Record<string, string[]> = {};

  data.forEach(entry => {
    const category = entry.routine;

    try {
      const parsedList: { item: string; checked: boolean }[] = JSON.parse(
        entry.routine_list,
      );

      categoryMap[category] ??= [];

      parsedList.forEach(({ item }) => {
        categoryMap[category]?.push(item);
      });
    } catch (err) {
      console.error(`Invalid routine_list for ${category}`, err);
    }
  });

  return Object.entries(categoryMap).map(([category, exercises]) => ({
    category,
    exercises,
  }));
};

const ActivityProgressSummary: React.FC = () => {
  const navigation = useNavigation();
  const Colors: ColorScheme =
    useAppSelector((state: any) => state.theme.theme) ||
    ({
      primaryColor: '#1857C1',
      textColor: '#00050A',
      backgroundColor: 'rgba(249, 249, 249, 1)',
      greyColor: '#EFF0F2',
      isDark: false,
    } as ColorScheme);

  const { tasks, activityProgress, completedActivityTasksCount } =
    useGameProgression();

  const [recommendedExercises, setRecommendedExercises] =
    useState<CategoryWorkout[]>();

  const [loading, setLoading] = useState(true);
  const [todayProgress, setTodayProgress] = useState(0);
  const [todayStats, setTodayStats] = useState({
    total: 0,
    completed: 0,
    remaining: 0,
  });
  const [comparison, setComparison] = useState<ProgressComparison>({
    today: 0,
    yesterday: 0,
    improvement: 0,
  });
  useEffect(() => {
    loadActivityProgress();
  }, []);

  const loadActivityProgress = async () => {
    try {
      setLoading(true);
      const today = moment().format('YYYY-MM-DD');
      const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');

      // Fetch today's records
      const todayRecords = await fetchActivitiesRecordByDate(today);
      console.log(todayRecords);

      setRecommendedExercises(convertRoutineToCategories(todayRecords));
      const yesterdayRecords = await fetchActivitiesRecordByDate(yesterday);

      // Calculate today's progress
      const todayData = calculateProgress(todayRecords);
      const yesterdayData = calculateProgress(yesterdayRecords);

      setTodayProgress(todayData.progress);
      setTodayStats({
        total: todayData.total,
        completed: todayData.completed,
        remaining: todayData.remaining,
      });

      setComparison({
        today: todayData.progress,
        yesterday: yesterdayData.progress,
        improvement: todayData.progress - yesterdayData.progress,
      });
    } catch (error) {
      console.error('Error loading activity progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (
    records: any[],
  ): {
    progress: number;
    total: number;
    completed: number;
    remaining: number;
  } => {
    if (!records || records.length === 0) {
      return { progress: 0, total: 0, completed: 0, remaining: 0 };
    }

    let total = 0;
    let completed = 0;

    records.forEach(record => {
      try {
        const items = JSON.parse(record.routine_list);
        if (Array.isArray(items)) {
          total += items.length;
          completed += items.filter(
            (item: ActivityItem) => item.checked,
          ).length;
        }
      } catch (error) {
        console.warn('Failed to parse activity routine_list:', error);
      }
    });

    const progress = total > 0 ? (completed / total) * 100 : 0;
    return { progress, total, completed, remaining: total - completed };
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return '#4CAF50';
    if (progress >= 60) return '#8BC34A';
    if (progress >= 40) return '#FFC107';
    if (progress >= 20) return '#FF9800';
    return '#F44336';
  };

  const getPerformanceMessage = (): string => {
    if (todayProgress >= 90) return 'Outstanding performance! 🏆';
    if (todayProgress >= 70) return 'Excellent work! 💪';
    if (todayProgress >= 50) return 'Good job! 🚀';
    if (todayProgress >= 30) return 'Keep pushing! 🔥';
    return 'Time to get moving! 💚';
  };

  const getImprovementSuggestions = (): string[] => {
    const suggestions = [];

    if (todayProgress < 50) {
      suggestions.push(
        'Aim to complete at least 50% of your planned exercises today',
      );
    }

    if (todayStats.remaining > 3) {
      suggestions.push(
        'Break down remaining exercises into smaller sessions throughout the day',
      );
    }

    if (comparison.improvement < 0) {
      suggestions.push(
        'You were more active yesterday - try to regain that momentum',
      );
    }

    if (todayProgress >= 80) {
      suggestions.push('Maintain consistency to build long-term habits');
    } else {
      suggestions.push(
        'Schedule specific times for exercise to stay accountable',
      );
      suggestions.push('Start with easier exercises to build momentum');
    }

    suggestions.push(
      'Track your workout intensity and duration for better results',
    );
    suggestions.push('Stay hydrated before, during, and after exercise');

    return suggestions;
  };

  // const recommendedExercises = [
  //   {
  //     category: 'Morning Energizers',
  //     exercises: [
  //       '10-minute stretching routine',
  //       '15-minute brisk walk or jog',
  //       '5 minutes of yoga sun salutations',
  //       'Light bodyweight exercises (10 push-ups, 15 squats)',
  //     ],
  //   },
  //   {
  //     category: 'Cardio Workouts',
  //     exercises: [
  //       '30 minutes running or cycling',
  //       '20 minutes HIIT training',
  //       'Swimming laps for 25 minutes',
  //       'Jump rope intervals (10 min)',
  //     ],
  //   },
  //   {
  //     category: 'Strength Training',
  //     exercises: [
  //       'Upper body: Push-ups, pull-ups, dumbbell press',
  //       'Lower body: Squats, lunges, deadlifts',
  //       'Core: Planks, crunches, leg raises',
  //       'Full body circuit with compound movements',
  //     ],
  //   },
  //   {
  //     category: 'Flexibility & Recovery',
  //     exercises: [
  //       '15 minutes of dynamic stretching',
  //       'Yoga session (20-30 minutes)',
  //       'Foam rolling and mobility work',
  //       'Gentle walking for active recovery',
  //     ],
  //   },
  //   {
  //     category: 'Evening Wind-Down',
  //     exercises: [
  //       'Light stretching routine',
  //       'Gentle yoga or tai chi',
  //       'Breathing exercises',
  //       'Leisurely walk',
  //     ],
  //   },
  // ];

  const workoutTips = [
    {
      icon: 'clock-outline',
      title: 'Consistency is Key',
      tip: 'Exercise at the same time each day to build a habit',
    },
    {
      icon: 'water',
      title: 'Stay Hydrated',
      tip: 'Drink water before, during, and after workouts',
    },
    {
      icon: 'account-group',
      title: 'Find a Workout Buddy',
      tip: 'Exercise with a friend for motivation and accountability',
    },
    {
      icon: 'heart-pulse',
      title: 'Listen to Your Body',
      tip: 'Rest when needed and avoid overtraining',
    },
  ];

  const styles = createStyles(Colors);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primaryColor} />
        <Text style={styles.loadingText}>
          Loading your activity progress...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#D8E6FF', 'rgba(216, 230, 255, 0)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.5 }}
        pointerEvents="none"
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={Colors.textColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Progress Summary</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Overview Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Icon
              name="chart-box-outline"
              size={20}
              color={Colors.primaryColor}
            />{' '}
            Today's Progress
          </Text>
          <View style={styles.horizontalSeparator} />
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <Text
                style={[
                  styles.progressPercentage,
                  { color: getProgressColor(todayProgress) },
                ]}
              >
                {activityProgress * 100}%
                <Text style={styles.progressLabel}> Completed</Text>
              </Text>
              <Text
                style={{ textAlign: 'left', fontWeight: '600', fontSize: 16 }}
              >
                {getPerformanceMessage()}
              </Text>
            </View>
            <Trophy />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {completedActivityTasksCount}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {5 - completedActivityTasksCount}
              </Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Comparison with Yesterday */}
        {/* <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Icon name="chart-line" size={20} color={Colors.primaryColor} />{' '}
            Compared to Yesterday
          </Text>
          <View style={styles.horizontalSeparator} />
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonValue}>
                {comparison.yesterday.toFixed(0)}%
              </Text>
              <Text style={styles.comparisonLabel}>Yesterday</Text>
            </View>
            <Up />
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonValue}>
                {comparison.today.toFixed(0)}%
              </Text>
              <Text style={styles.comparisonLabel}>Today</Text>
            </View>
          </View>
          <View style={styles.improvementBadge}>
            <Text
              style={[
                styles.improvementText,
                {
                  color: comparison.improvement >= 0 ? '#4CAF50' : '#F44336',
                },
              ]}
            >
              {comparison.improvement >= 0 ? '+' : ''}
              {comparison.improvement.toFixed(1)}% change
            </Text>
          </View>
        </View> */}

        {/* How to Improve */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Icon name="lightbulb-on" size={20} color={Colors.primaryColor} />{' '}
            How to Improve
          </Text>
          <View style={styles.horizontalSeparator} />
          {getImprovementSuggestions().map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Icon name="check-circle" size={18} color={Colors.primaryColor} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          ))}
        </View>

        {/* Workout Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Icon name="trophy" size={20} color={Colors.primaryColor} /> Pro
            Tips for Success
          </Text>
          <View style={styles.horizontalSeparator} />
          {workoutTips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={styles.tipIconContainer}>
                <Icon name={tip.icon} size={24} color={Colors.primaryColor} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipText}>{tip.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recommended Exercises */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Icon name="dumbbell" size={20} color={Colors.primaryColor} />{' '}
            Recommended Exercises
          </Text>
          <View style={styles.horizontalSeparator} />
          {tasks
            .filter(task => task.category === 'activity')
            .map(task => (
              <View key={task.id} style={styles.suggestionItem}>
                <Icon
                  name={
                    task.isDone ? 'checkbox-marked' : 'checkbox-blank-outline'
                  }
                  size={18}
                  color={Colors.primaryColor}
                />
                <Text style={styles.suggestionText}>{task.title}</Text>
              </View>
            ))}
          {/* {(recommendedExercises && recommendedExercises.length) ? recommendedExercises.map((category, index) => (
            <View key={index} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category.category}</Text>
              {category.exercises.map((exercise, exerciseIndex) => (
                <View key={exerciseIndex} style={styles.exerciseItem}>
                  <Icon
                    name="circle-small"
                    size={16}
                    color={Colors.greyColor}
                  />
                  <Text style={styles.exerciseText}>{exercise}</Text>
                </View>
              ))}
            </View>
          )) : <Text style={[styles.categoryTitle, {alignSelf: 'center'}]}>Please generate workout routine for today.</Text>} */}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8F8F7',
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      fontFamily: 'Nunito-Regular',
      color: Colors.textColor,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
    },
    placeholder: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    card: {
      backgroundColor: Colors.isDark ? '#2C2C2E' : '#FFFFFF',
      borderRadius: 30,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 18,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      marginBottom: 12,
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    progressCircle: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressPercentage: {
      fontSize: 36,
      fontFamily: 'Nunito-Bold',
    },
    progressLabel: {
      fontSize: 14,
      fontFamily: 'Nunito-Regular',
      color: Colors.textColor,
      marginTop: 4,
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginTop: 16,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    separator: {
      width: 1,
      height: 40,
      backgroundColor: Colors.isDark ? '#555' : '#E0E0E0',
    },
    horizontalSeparator: {
      height: 1,
      backgroundColor: Colors.isDark ? '#555' : '#E0E0E0',
      marginBottom: 12,
      width: '100%',
    },
    statValue: {
      fontSize: 24,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
    },
    statLabel: {
      fontSize: 12,
      fontFamily: 'Nunito-Regular',
      color: Colors.textColor,
      marginTop: 4,
    },
    performanceMessage: {
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.primaryColor,
      textAlign: 'center',
      marginTop: 8,
    },
    comparisonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      marginVertical: 12,
    },
    comparisonItem: {
      alignItems: 'center',
    },
    comparisonLabel: {
      fontSize: 16,
      fontFamily: 'Nunito-Regular',
      color: Colors.greyColor700,
      marginBottom: 4,
    },
    comparisonValue: {
      fontSize: 28,
      fontFamily: 'Nunito-Bold',
      color: Colors.greyColor700,
    },
    improvementBadge: {
      alignItems: 'center',
      marginTop: 8,
    },
    improvementText: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
    },
    suggestionItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
      paddingRight: 8,
    },
    suggestionText: {
      flex: 1,
      fontSize: 14,
      fontFamily: 'Nunito-Regular',
      color: Colors.textColor,
      marginLeft: 8,
      lineHeight: 20,
    },
    categoryContainer: {
      marginBottom: 16,
    },
    categoryTitle: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      color: Colors.primaryColor,
      marginBottom: 8,
    },
    exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      marginLeft: 8,
    },
    exerciseText: {
      fontSize: 14,
      fontFamily: 'Nunito-Regular',
      color: Colors.textColor,
      marginLeft: 4,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
      paddingRight: 8,
    },
    tipIconContainer: {
      width: 40,
      alignItems: 'center',
      marginTop: 2,
    },
    tipContent: {
      flex: 1,
      marginLeft: 8,
    },
    tipTitle: {
      fontSize: 15,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      marginBottom: 4,
    },
    tipText: {
      fontSize: 14,
      fontFamily: 'Nunito-Regular',
      color: Colors.greyColor100,
      lineHeight: 20,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.primaryColor,
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
    },
    actionButtonText: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      color: '#FFFFFF',
      marginRight: 8,
    },
  });

export default ActivityProgressSummary;
