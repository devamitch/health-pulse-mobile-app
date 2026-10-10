import { useAppTheme } from '@/hooks/themeHook';
import {
  CategoryTasksScreenNavigationProp,
  CategoryTasksScreenRouteProp,
  TaskData,
} from '@/navigation/types';
import { logButtonTap } from '@/services/analyticsService';
import React, { useCallback } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface CategoryTasksScreenProps {
  navigation: CategoryTasksScreenNavigationProp;
  route: CategoryTasksScreenRouteProp;
}

const CategoryTasksScreen: React.FC<CategoryTasksScreenProps> = ({
  navigation,
  route,
}) => {
  const { category, tasks } = route.params;
  const { Colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const handleTaskPress = useCallback(
    async (task: TaskData) => {
      await logButtonTap(`Task Pressed: ${task.title}`);
      navigation.navigate('TaskDetail', {
        taskId: task.id,
        task,
        category,
      });
    },
    [category, navigation],
  );

  const renderTaskItem = useCallback(
    ({ item, index }: { item: TaskData; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
        <RectButton
          onPress={() => handleTaskPress(item)}
          style={styles.taskCard}
        >
          <View
            style={[
              styles.taskCardContent,
              { backgroundColor: item.backgroundColor },
            ]}
          >
            <View style={styles.taskCardLeft}>
              {item.illustration && (
                <View style={styles.taskIllustration}>{item.illustration}</View>
              )}
              <View style={styles.taskInfo}>
                <Text
                  style={[styles.taskTitle, { color: item.accentColor }]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text style={styles.taskSubtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
                <View style={styles.taskMetaRow}>
                  <View style={styles.taskMetaItem}>
                    <MaterialCommunityIcons
                      name="clock-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.taskMetaText}>{item.duration}</Text>
                  </View>
                  <View
                    style={[
                      styles.taskXpBadge,
                      { backgroundColor: item.accentColor },
                    ]}
                  >
                    <Text style={styles.taskXpText}>+{item.xpReward} XP</Text>
                    <Image
                      source={require('@/assets/images/coin-2.png')}
                      style={styles.taskXpIcon}
                    />
                  </View>
                </View>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={item.accentColor}
            />
          </View>
        </RectButton>
      </Animated.View>
    ),
    [handleTaskPress],
  );

  return (
    <View
      style={[styles.container, { backgroundColor: Colors.backgroundColor }]}
    >
      {/* Header */}
      <Animated.View
        entering={FadeInUp.duration(400)}
        style={[
          styles.header,
          {
            paddingTop: insets.top + 16,
            backgroundColor: tasks[0]?.accentColor || '#7C3AED',
          },
        ]}
      >
        <LinearGradient
          colors={[
            tasks[0]?.accentColor || '#7C3AED',
            (tasks[0]?.accentColor || '#7C3AED') + 'CC',
          ]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <RectButton
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#FFFFFF"
              />
            </RectButton>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {category.toUpperCase()} TASKS
              </Text>
              <Text style={styles.headerSubtitle}>
                {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'} Available
              </Text>
            </View>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 24,
  },
  headerGradient: {
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  taskCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  taskCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  taskCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  taskIllustration: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    marginBottom: 4,
  },
  taskSubtitle: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: '#6B7280',
  },
  taskXpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  taskXpText: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: '#FFFFFF',
  },
  taskXpIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
});

export default CategoryTasksScreen;
