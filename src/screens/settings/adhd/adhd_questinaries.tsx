import BackButton from '@/components/ui/buttons/back-button';
import { ADHD_QUESTIONS } from '@/constants/adhd-questions';
import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import {
  initializeADHDDay,
  selectADHDAllDaysProgress,
  selectADHDOverallProgress,
  startADHDQuestionnaire,
} from '@/services/mmkv-redux/slices/adhd_slice';
import { haptic } from '@/utils';
import { Toast } from '@/utils/toast';
import React, { useEffect } from 'react';
import {
  Image,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface ADHDQuestionnaireScreenProps {
  navigation: any;
  route: any;
}

const ADHDQuestionnaireScreen: React.FC<ADHDQuestionnaireScreenProps> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const { Colors, DEffect } = useAppTheme();
  const { haptic_level } = useAppSelector(state => state.message);
  const dispatch = useAppDispatch();
  const styles = createStyle(Colors, DEffect);

  // Get ADHD state from Redux
  const overallProgress = useAppSelector(selectADHDOverallProgress);
  const allDaysProgress = useAppSelector(selectADHDAllDaysProgress);

  // Initialize ADHD questionnaire on first load
  useEffect(() => {
    if (ADHD_QUESTIONS.days.length > 0 && allDaysProgress.length === 0) {
      dispatch(startADHDQuestionnaire(ADHD_QUESTIONS.days[0].questions.length));
    }

    ADHD_QUESTIONS.days.forEach(day => {
      dispatch(
        initializeADHDDay({
          day: day.day,
          totalQuestions: day.questions.length,
        }),
      );
    });
  }, []);

  // Group days into weeks using Redux data
  const sections = [
    {
      title: 'Week 1',
      data: allDaysProgress.slice(0, 7),
    },
    {
      title: 'Week 2',
      data: allDaysProgress.slice(7, 14),
    },
  ];

  const handleDayPress = (day: (typeof allDaysProgress)[0]) => {
    if (day.isLocked) {
      haptic(haptic_level);
      Toast('This day is locked. Complete previous days first.');
      return;
    }

    haptic(haptic_level);
    navigation.navigate('ADHDDailyQuestions', {
      day: day.day,
      questions: ADHD_QUESTIONS.days[day.day - 1].questions,
    });
  };

  const DayCard = ({
    item,
    index,
  }: {
    item: (typeof allDaysProgress)[0];
    index: number;
  }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      if (!item.isLocked) {
        scale.value = withSpring(0.98);
      }
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    const progressPercentage = Math.round(
      (item.answeredQuestions / item.totalQuestions) * 100,
    );

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 30).springify()}
        style={animatedStyle}
      >
        <RectButton
          style={styles.dayCard}
          onPress={() => handleDayPress(item)}
          enabled={!item.isLocked}
          rippleColor="rgba(24, 87, 193, 0.1)"
          underlayColor="transparent"
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <View style={styles.dayCardContent}>
            {/* Day Badge */}
            <View
              style={[
                styles.dayBadge,
                item.completed && styles.dayBadgeCompleted,
                item.isToday && styles.dayBadgeToday,
                item.isLocked && styles.dayBadgeLocked,
              ]}
            >
              {item.completed ? (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={28}
                  color="#4CAF50"
                />
              ) : item.isLocked ? (
                <MaterialCommunityIcons
                  name="lock"
                  size={24}
                  color={Colors.greyColor700}
                />
              ) : (
                <Text
                  style={[
                    styles.dayNumber,
                    item.isToday && styles.dayNumberToday,
                  ]}
                >
                  {item.day}
                </Text>
              )}
            </View>

            {/* Day Info */}
            <View style={styles.dayInfo}>
              <View style={styles.dayTitleRow}>
                <Text style={styles.dayTitle}>Day {item.day}</Text>
                {item.isToday && <Text style={styles.todayBadge}>Today</Text>}
              </View>
              <Text style={styles.daySubtitle}>
                {item.completed
                  ? 'Completed ✓'
                  : item.isLocked
                  ? 'Locked'
                  : `${item.answeredQuestions}/${item.totalQuestions} questions`}
              </Text>

              {/* Progress Bar */}
              {!item.isLocked && (
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progressPercentage}%`,
                          backgroundColor: item.completed
                            ? '#4CAF50'
                            : '#1857C1',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{progressPercentage}%</Text>
                </View>
              )}
            </View>

            {/* Arrow */}
            {!item.isLocked && (
              <Image
                source={require('@/assets/icons/arrows.png')}
                style={styles.arrowStyle}
              />
            )}
          </View>
        </RectButton>
      </Animated.View>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <Text style={styles.sectionTitle}>{section.title}</Text>
  );

  const renderHeader = () => (
    <Animated.View
      entering={FadeInDown.springify()}
      style={{ position: 'absolute', top: 100, left: 24, right: 24 }}
    >
      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <LinearGradient
            colors={['#1857C1', '#4A90E2']}
            style={styles.infoIconGradient}
          >
            <MaterialCommunityIcons name="brain" size={36} color="#FFF" />
          </LinearGradient>
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>ADHD Assessment</Text>
          <Text style={styles.infoSubtitle}>
            14-Day Journey to Better Understanding
          </Text>
        </View>
      </View>

      {/* Overall Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressCardHeader}>
          <Text style={styles.progressCardTitle}>Overall Progress</Text>
          <Text style={styles.progressCardValue}>
            {overallProgress.completedDays} / {overallProgress.totalDays} Days
          </Text>
        </View>
        <View style={styles.overallProgressBar}>
          <View
            style={[
              styles.overallProgressFill,
              {
                width: `${overallProgress.percentageComplete}%`,
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderHeaderContent = () => (
    <View style={styles.headerWrapper}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} iconColor="white" />
        <Text style={styles.headerTitle}>ADHD Questionnaire</Text>
        <View style={{ width: 42 }} />
      </View>
    </View>
  );

  const renderListFooter = () => (
    <View style={styles.footer}>
      <MaterialCommunityIcons
        name="information-outline"
        size={20}
        color={Colors.greyColor700}
      />
      <Text style={styles.footerText}>
        Complete one day at a time. You can only access today's or past day's
        questions.
      </Text>
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
          marginBottom: 120,
        }}
      >
        <BackButton onPress={() => navigation.goBack()} iconColor="white" />

        {renderHeader()}
      </View>
      <SectionList
        sections={sections}
        keyExtractor={item => `day-${item.day}`}
        renderItem={({ item, index }) => <DayCard item={item} index={index} />}
        renderSectionHeader={renderSectionHeader}
        ListFooterComponent={renderListFooter}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
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
      gap: 10,
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
    listContent: {
      paddingTop: 20,
    },
    infoCard: {
      backgroundColor: Colors.white,
      borderRadius: 20,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 16,
      ...DEffect,
    },
    infoIconContainer: {
      marginRight: 16,
    },
    infoIconGradient: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoTextContainer: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 20,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      marginBottom: 4,
    },
    infoSubtitle: {
      fontSize: 14,
      fontFamily: 'Nunito-Regular',
      color: Colors.greyColor700,
      lineHeight: 20,
    },
    progressCard: {
      backgroundColor: Colors.white,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 8,
      ...DEffect,
    },
    progressCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    progressCardTitle: {
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
    },
    progressCardValue: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      color: '#1857C1',
    },
    overallProgressBar: {
      height: 8,
      backgroundColor: Colors.greyColor700 + '30',
      borderRadius: 4,
      overflow: 'hidden',
    },
    overallProgressFill: {
      height: '100%',
      backgroundColor: '#1857C1',
      borderRadius: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      letterSpacing: 0.5,
      marginHorizontal: 28,
      marginTop: 24,
      marginBottom: 12,
    },
    dayCard: {
      backgroundColor: Colors.white,
      marginHorizontal: 20,
      marginBottom: 8,
      borderRadius: 16,
      overflow: 'hidden',
      ...DEffect,
    },
    dayCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    dayBadge: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: Colors.backgroundColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      borderWidth: 2,
      borderColor: Colors.greyColor700 + '30',
    },
    dayBadgeCompleted: {
      backgroundColor: '#4CAF50' + '15',
      borderColor: '#4CAF50',
    },
    dayBadgeToday: {
      backgroundColor: '#1857C1' + '15',
      borderColor: '#1857C1',
    },
    dayBadgeLocked: {
      backgroundColor: Colors.greyColor700 + '15',
      borderColor: Colors.greyColor700 + '40',
    },
    dayNumber: {
      fontSize: 22,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
    },
    dayNumberToday: {
      color: '#1857C1',
    },
    dayInfo: {
      flex: 1,
    },
    dayTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 8,
    },
    dayTitle: {
      fontSize: 17,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
    },
    todayBadge: {
      fontSize: 11,
      fontFamily: 'Nunito-Bold',
      color: '#1857C1',
      backgroundColor: '#1857C1' + '15',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      overflow: 'hidden',
    },
    daySubtitle: {
      fontSize: 13,
      fontFamily: 'Nunito-Regular',
      color: Colors.greyColor700,
      marginBottom: 8,
    },
    progressBarContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    progressBarBackground: {
      flex: 1,
      height: 5,
      backgroundColor: Colors.greyColor700 + '30',
      borderRadius: 2.5,
      overflow: 'hidden',
      marginRight: 8,
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 2.5,
    },
    progressText: {
      fontSize: 11,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
      minWidth: 35,
    },
    arrowStyle: {
      height: 30,
      width: 30,
      resizeMode: 'contain',
      tintColor: Colors.textColor,
      marginLeft: 8,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginTop: 16,
      padding: 16,
      backgroundColor: Colors.backgroundColor,
      borderRadius: 12,
      gap: 12,
    },
    footerText: {
      flex: 1,
      fontSize: 13,
      fontFamily: 'Nunito-Regular',
      color: Colors.greyColor700,
      lineHeight: 18,
    },
  });

export default ADHDQuestionnaireScreen;
