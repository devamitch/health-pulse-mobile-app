import Trophy from '@/assets/svg/Trophy.svg';
import { ColorScheme } from '@/constants/theme';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { fetchDietRecordByDate } from '@/services/sqlite/message';
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

interface DietItem {
  name: string;
  checked: boolean;
}

interface ProgressComparison {
  today: number;
  yesterday: number;
  improvement: number;
}

interface CategoryFoods {
  category: string;
  foods: string[];
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

  return Object.entries(categoryMap).map(([category, foods]) => ({
    category,
    foods,
  }));
};

const DietProgressSummary: React.FC = () => {
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

  const { dietProgress, completedDietTasksCount, tasks } = useGameProgression();

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
  const [recommendedFoods, setRecommendedFoods] = useState<CategoryFoods[]>();
  useEffect(() => {
    loadDietProgress();
  }, []);

  const loadDietProgress = async () => {
    try {
      setLoading(true);
      const today = moment().format('YYYY-MM-DD');
      const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');

      // Fetch today's records
      const todayRecords = await fetchDietRecordByDate(today);
      setRecommendedFoods(convertRoutineToCategories(todayRecords));

      const yesterdayRecords = await fetchDietRecordByDate(yesterday);

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
      console.error('Error loading diet progress:', error);
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
          completed += items.filter((item: DietItem) => item.checked).length;
        }
      } catch (error) {
        console.warn('Failed to parse diet routine_list:', error);
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
    if (todayProgress >= 90) return 'Excellent work! 🌟';
    if (todayProgress >= 70) return 'Great progress! 💪';
    if (todayProgress >= 50) return 'Good effort! 👍';
    if (todayProgress >= 30) return 'Keep going! 🚀';
    return "Let's get started! 💚";
  };

  const getImprovementSuggestions = (): string[] => {
    const suggestions = [];

    if (todayProgress < 50) {
      suggestions.push('Try to complete at least 50% of your daily superfoods');
    }

    if (todayStats.remaining > 5) {
      suggestions.push('Focus on completing the remaining items today');
    }

    if (comparison.improvement < 0) {
      suggestions.push(
        'You did better yesterday - aim to match or exceed that performance',
      );
    }

    if (todayProgress >= 80) {
      suggestions.push('Maintain this excellent routine consistently');
    } else {
      suggestions.push('Set reminders for meal times to stay on track');
      suggestions.push('Prepare ingredients in advance for easier compliance');
    }

    return suggestions;
  };

  // const recommendedFoods = [
  //   {
  //     category: 'Breakfast',
  //     foods: [
  //       'Oatmeal with berries and nuts',
  //       'Greek yogurt with honey and fruits',
  //       'Whole grain toast with avocado',
  //       'Green smoothie with spinach and banana',
  //     ],
  //   },
  //   {
  //     category: 'Lunch',
  //     foods: [
  //       'Grilled salmon with vegetables',
  //       'Quinoa bowl with chickpeas',
  //       'Mixed greens salad with olive oil',
  //       'Lentil soup with whole grain bread',
  //     ],
  //   },
  //   {
  //     category: 'Dinner',
  //     foods: [
  //       'Lean protein (chicken/fish) with sweet potato',
  //       'Stir-fried vegetables with brown rice',
  //       'Turkey meatballs with zucchini noodles',
  //       'Baked cod with roasted Brussels sprouts',
  //     ],
  //   },
  //   {
  //     category: 'Snacks',
  //     foods: [
  //       'Mixed nuts and seeds',
  //       'Fresh fruit (apple, orange, berries)',
  //       'Hummus with carrot sticks',
  //       'Dark chocolate (70%+ cacao)',
  //     ],
  //   },
  // ];

  const styles = createStyles(Colors);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primaryColor} />
        <Text style={styles.loadingText}>Loading your diet progress...</Text>
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
        <Text style={styles.headerTitle}>Diet Progress Summary</Text>
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
                {dietProgress * 100}%
                <Text style={styles.progressLabel}> Completed</Text>
              </Text>
              <Text
                style={{ textAlign: 'left', fontWeight: '600', fontSize: 16 }}
              >
                Good Effort ! 🎉
              </Text>
            </View>
            <Trophy />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedDietTasksCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {5 - completedDietTasksCount}
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
            <Icon
              name="lightbulb-on-outline"
              size={20}
              color={Colors.primaryColor}
            />{' '}
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

        {/* Recommended Superfoods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            <Icon
              name="food-apple-outline"
              size={20}
              color={Colors.primaryColor}
            />{' '}
            Recommended Must-Have Foods
          </Text>
          <View style={styles.horizontalSeparator} />
          {tasks
            .filter(task => task.category === 'diet')
            .map((task, index) => (
              <View key={index} style={styles.foodItem}>
                <Icon
                  name={
                    task.isDone ? 'checkbox-marked' : 'checkbox-blank-outline'
                  }
                  size={16}
                  color={Colors.primaryColor}
                />
                <Text style={styles.foodText}>{task.title}</Text>
              </View>
            ))}
          {/* {(recommendedFoods && recommendedFoods.length) ? recommendedFoods.map((category, index) => (
            <View key={index} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category.category}</Text>
              {category.foods.map((food, foodIndex) => (
                <View key={foodIndex} style={styles.foodItem}>
                  <Icon
                    name="circle-small"
                    size={16}
                    color={Colors.greyColor}
                  />
                  <Text style={styles.foodText}>{food}</Text>
                </View>
              ))}
            </View>
          )) : <Text style={[styles.categoryTitle, {alignSelf: 'center'}]}>Please generate diet routine for today.</Text>} */}
        </View>

        {/* Action Button */}
        {/* <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            (navigation as any).navigate('SuperfoodScreen', {
              timeframe: 'day',
              date: new Date(),
            })
          }
        >
          <Text style={styles.actionButtonText}>View Full Diet Plan</Text>
          <Icon name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity> */}
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
    foodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
      marginLeft: 8,
    },
    foodText: {
      fontSize: 14,
      fontFamily: 'Nunito-Regular',
      color: Colors.textColor,
      marginLeft: 4,
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

export default DietProgressSummary;
