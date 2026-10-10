import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  LinearTransition,
} from 'react-native-reanimated';

const PILLARS = [
  {
    id: 1,
    title: 'Food Habits',
    icon: 'vegeterian-food',
    color: '#4CAF50',
    backgroundColor: '#E8F5E9',
    description: 'Understand your eating patterns to personalize your plan.',
    questions: 3,
  },
  {
    id: 2,
    title: 'Movement',
    icon: 'activity-03',
    color: '#E57373',
    backgroundColor: '#FFEBEE',
    description:
      'Learn how active your days are so we can match your energy level.',
    questions: 4,
  },
  {
    id: 3,
    title: 'Rest & Calm',
    icon: 'moon-02',
    color: '#9575CD',
    backgroundColor: '#EDE7F6',
    description:
      'Understand how you rest and recharge to support your overall balance.',
    questions: 3,
  },
] as const;

// Memoized Pillar Card
const PillarCard = memo<{
  pillar: (typeof PILLARS)[number];
  index: number;
  Colors: any;
}>(({ pillar, index, Colors }) => {
  const styles = createStyles(Colors);
  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 100).duration(500)}
      style={styles.pillarCard}
      layout={LinearTransition}
    >
      <View
        style={[
          styles.pillarIconContainer,
          { backgroundColor: pillar.backgroundColor },
        ]}
      >
        <HugeiconsIcon
          name={pillar.icon as any}
          size={32}
          color={pillar.color}
          variant="stroke"
        />
      </View>

      <View style={styles.pillarContent}>
        <View style={styles.pillarHeader}>
          <Text style={styles.pillarTitle}>{pillar.title}</Text>
          <View
            style={[
              styles.questionCount,
              { backgroundColor: pillar.backgroundColor },
            ]}
          >
            <Text style={[styles.questionCountText, { color: pillar.color }]}>
              {pillar.questions} questions
            </Text>
          </View>
        </View>

        <Text style={styles.pillarDescription}>{pillar.description}</Text>
      </View>
    </Animated.View>
  );
});

PillarCard.displayName = 'PillarCard';

const AssessmentInfoScreen = memo(() => {
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(500)}
          layout={LinearTransition}
          style={styles.headerContainer}
        >
          <Text style={styles.title}>Your Wellness Snapshot</Text>
          <Text style={styles.subtitle}>
            A quick look at the habits that shape your day.
          </Text>
        </Animated.View>

        {/* Description */}
        <Animated.Text
          entering={FadeInDown.delay(200).duration(500)}
          style={styles.description}
        >
          We'll ask a few simple questions about food, movement, and rest.
          {'\n'}There are no right or wrong answers; this just helps us
          personalise things for you.
        </Animated.Text>

        {/* Pillars */}
        <View style={styles.pillarsContainer}>
          {PILLARS.map((pillar, index) => (
            <PillarCard
              key={pillar.id}
              pillar={pillar}
              index={index}
              Colors={Colors}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
});

AssessmentInfoScreen.displayName = 'AssessmentInfoScreen';

const createStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background || '#F5F7FA',
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 40,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 32,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#1976D2',
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 36,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#757575',
      textAlign: 'center',
      lineHeight: 24,
    },
    description: {
      fontSize: 15,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#424242',
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 22,
      paddingHorizontal: 8,
    },
    pillarsContainer: {
      gap: 16,
    },
    pillarCard: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    pillarIconContainer: {
      width: 72,
      height: 72,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    pillarContent: {
      flex: 1,
      justifyContent: 'center',
    },
    pillarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    pillarTitle: {
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#212121',
      flex: 1,
    },
    questionCount: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    questionCountText: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
    },
    pillarDescription: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#616161',
      lineHeight: 20,
    },
  });

export default AssessmentInfoScreen;
