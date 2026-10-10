// ============================================
// AssessmentInfoScreen - Your Wellness Snapshot
// ============================================

import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  LinearTransition,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// Custom SVG Icons
const AppleIcon = ({ color }: { color: string }) => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 13.2308C17 13.2308 16.0909 12.7693 15.1818 12.7693C13.8182 12.7693 12 14.6154 12 17.3846C12 20.1537 14.4896 22 17 22C19.5104 22 22 20.1537 22 17.3846C22 14.6154 20.1818 12.7693 18.8182 12.7693C17.9091 12.7693 17 13.2308 17 13.2308ZM17 13.2308C17 11.8462 17.9091 10 19.7273 10"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.655 5C11.5512 5 12.2778 4.32843 12.2778 3.5C12.2778 2.67157 11.5512 2 10.655 2H5.24561C4.34936 2 3.6228 2.67157 3.6228 3.5C3.6228 4.32843 4.34936 5 5.24561 5M11.1693 4.92311C12.1247 6.68943 12.9095 8.28337 13.3888 10C13.4279 10.1401 13.465 10.281 13.5 10.4229M10.428 22H6.32748C2.74721 22 2 21.3093 2 18V13.7771C2 10.3773 3.09757 7.88562 4.70467 4.91465"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ActivityIcon = ({ color }: { color: string }) => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <Path
      d="M4.31802 19.682C3 18.364 3 16.2426 3 12C3 7.75736 3 5.63604 4.31802 4.31802C5.63604 3 7.75736 3 12 3C16.2426 3 18.364 3 19.682 4.31802C21 5.63604 21 7.75736 21 12C21 16.2426 21 18.364 19.682 19.682C18.364 21 16.2426 21 12 21C7.75736 21 5.63604 21 4.31802 19.682Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 12H8.5L10.5 8L13.5 16L15.5 12H18"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MoonIcon = ({ color }: { color: string }) => (
  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
    <Path
      d="M21.5 14.0784C20.3003 14.7189 18.9301 15.0821 17.4751 15.0821C12.7491 15.0821 8.91792 11.2509 8.91792 6.52485C8.91792 5.06986 9.28105 3.69968 9.92163 2.5C5.66765 3.49698 2.5 7.31513 2.5 11.8731C2.5 17.1899 6.8101 21.5 12.1269 21.5C16.6849 21.5 20.503 18.3324 21.5 14.0784Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PILLARS = [
  {
    id: 1,
    title: 'Food Habits',
    icon: 'apple',
    color: '#27A864',
    backgroundColor: '#E8F5E9',
    description: 'Understand your eating patterns to personalize your plan.',
    questions: 3,
  },
  {
    id: 2,
    title: 'Movement',
    icon: 'activity',
    color: '#C63F2C',
    backgroundColor: '#FFEBEE',
    description:
      'Learn how active your days are so we can match your energy level.',
    questions: 4,
  },
  {
    id: 3,
    title: 'Rest & Calm',
    icon: 'moon',
    color: '#7C60C8',
    backgroundColor: '#EDE7F6',
    description:
      'Understand how you rest and recharge to support your overall balance.',
    questions: 3,
  },
] as const;

// Icon renderer
const IconComponent = ({ name, color }: { name: string; color: string }) => {
  switch (name) {
    case 'apple':
      return <AppleIcon color={color} />;
    case 'activity':
      return <ActivityIcon color={color} />;
    case 'moon':
      return <MoonIcon color={color} />;
    default:
      return null;
  }
};

// Memoized Pillar Card
const PillarCard = memo<{
  pillar: (typeof PILLARS)[number];
  index: number;
}>(({ pillar, index }) => {
  const styles = createStyles();
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
        <IconComponent name={pillar.icon} color={pillar.color} />
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
  const styles = createStyles();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.background }]}
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
          We'll ask a few simple questions about food, movement, and rest.{'\n'}
          There are no right or wrong answers; this just helps us personalise
          things for you.
        </Animated.Text>

        {/* Pillars */}
        <View style={styles.pillarsContainer}>
          {PILLARS.map((pillar, index) => (
            <PillarCard key={pillar.id} pillar={pillar} index={index} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
});

AssessmentInfoScreen.displayName = 'AssessmentInfoScreen';

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F7FA',
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 180,
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
      color: '#1E6FD9',
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 36,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#9E9E9E',
      textAlign: 'center',
      lineHeight: 24,
    },
    description: {
      fontSize: 15,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#212121',
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
      color: '#757575',
      lineHeight: 20,
    },
  });

export default AssessmentInfoScreen;
