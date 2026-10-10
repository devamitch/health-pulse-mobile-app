import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import useGameProgression from '@/hooks/useGameProgression';
import { xpCalculator } from '@/utils/gamification/calculations';
import { BlurView } from '@react-native-community/blur';
import React, { useMemo } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from '../base/LinearGradient';

const { width, height } = Dimensions.get('window');

interface LevelInfoModalProps {
  visible: boolean;
  onClose: () => void;
  level: number;
}

const LEVEL_TIERS = {
  bronze: {
    range: [1, 5],
    icon: 'shield-outline',
    gradient: ['#CD7F32', '#8B4513', '#A0522D'],
    glowColor: 'rgba(205, 127, 50, 0.4)',
    label: 'Bronze',
    description: 'Beginning your journey',
  },
  silver: {
    range: [6, 10],
    icon: 'shield-half-full',
    gradient: ['#E8E8E8', '#C0C0C0', '#A8A8A8'],
    glowColor: 'rgba(192, 192, 192, 0.4)',
    label: 'Silver',
    description: 'Rising through the ranks',
  },
  gold: {
    range: [11, 20],
    icon: 'shield',
    gradient: ['#FFD700', '#FFC107', '#DAA520'],
    glowColor: 'rgba(255, 215, 0, 0.4)',
    label: 'Gold',
    description: 'A proven champion',
  },
  platinum: {
    range: [21, 35],
    icon: 'shield-crown-outline',
    gradient: ['#E5E4E2', '#C9D1D9', '#A0B2C6'],
    glowColor: 'rgba(229, 228, 226, 0.5)',
    label: 'Platinum',
    description: 'Elite status achieved',
  },
  diamond: {
    range: [36, 50],
    icon: 'shield-crown',
    gradient: ['#B9F2FF', '#87CEEB', '#4FC3F7'],
    glowColor: 'rgba(185, 242, 255, 0.5)',
    label: 'Diamond',
    description: 'Legendary warrior',
  },
  master: {
    range: [51, Infinity],
    icon: 'shield-star',
    gradient: ['#E040FB', '#9C27B0', '#7B1FA2'],
    glowColor: 'rgba(156, 39, 176, 0.5)',
    label: 'Master',
    description: 'Ultimate mastery',
  },
};

const getTierForLevel = (level: number) => {
  for (const [key, tier] of Object.entries(LEVEL_TIERS)) {
    if (level >= tier.range[0] && level <= tier.range[1]) {
      return { key, ...tier };
    }
  }
  return { key: 'bronze', ...LEVEL_TIERS.bronze };
};

const AnimatedBadge: React.FC<{
  level: number;
  tier: typeof LEVEL_TIERS.bronze & { key: string };
}> = React.memo(({ level, tier }) => {
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.badgeContainer}>
      {/* Pulsing glow */}
      <Animated.View
        style={[
          styles.badgeGlow,
          glowStyle,
          { backgroundColor: tier.glowColor },
        ]}
      />

      {/* Main badge */}
      <View style={[styles.mainBadge]}>
        <LinearGradient
          colors={tier.gradient}
          style={[styles.mainBadge]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.badgeInner}>
            <MaterialCommunityIcons
              name={tier.icon}
              size={50}
              color="#FFFFFF"
            />
          </View>
        </LinearGradient>

        {/* Level number overlay */}
        <View style={[styles.levelNumberContainer, { zIndex: 100 }]}>
          <LinearGradient
            colors={['#1857C1', '#0D3D8F']}
            style={styles.levelNumberBadge}
          >
            <Text style={styles.levelNumber}>{level}</Text>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
});

const StatCard: React.FC<{
  icon: string;
  label: string;
  value: string | number;
  color: string;
}> = React.memo(({ icon, label, value, color }) => {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statCardInner, { backgroundColor: `${color}10` }]}>
        <View
          style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}
        >
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
});

const ProgressBar: React.FC<{
  progress: number;
  colors: string[];
}> = React.memo(({ progress, colors }) => {
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    progressWidth.value = withDelay(
      300,
      withTiming(progress, { duration: 800, easing: Easing.out(Easing.ease) }),
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%`,
  }));

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, animatedStyle]}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
});

const LevelInfoModal: React.FC<LevelInfoModalProps> = ({
  visible,
  onClose,
  level,
}) => {
  const insets = useSafeAreaInsets();
  const { Colors } = useAppTheme();
  const { userLevelInfo } = useGameProgression();

  const displayLevel = level + 1;
  const tier = useMemo(() => getTierForLevel(displayLevel), [displayLevel]);
  const xpToNextLevel = useMemo(
    () => xpCalculator(displayLevel + 1) * 100,
    [displayLevel],
  );

  const levelInfo = userLevelInfo[level];
  const isUnlocked = !!levelInfo;

  const currentXp = levelInfo?.xp ?? 0;
  const maxXp = levelInfo?.xpToNextLevel ?? xpToNextLevel;
  const progress = maxXp > 0 ? Math.min(currentXp / maxXp, 1) : 0;

  const isDark = Colors.isDark;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={250}
      animationOutTiming={200}
      backdropOpacity={0}
      statusBarTranslucent
      useNativeDriver
    >
      <View style={styles.fullScreenContainer}>
        {/* Blur background */}
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={isDark ? 'dark' : 'light'}
          blurAmount={15}
        />

        {/* Background gradient overlay */}
        <LinearGradient
          colors={[
            `${tier.gradient[0]}25`,
            isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)',
            `${tier.gradient[2]}15`,
          ]}
          style={StyleSheet.absoluteFill}
        />

        {/* Content */}
        <View
          style={[
            styles.content,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.05)',
                },
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={Colors.textColor}
              />
            </TouchableOpacity>

            <Text style={[styles.headerTitle, { color: Colors.textColor }]}>
              Level Details
            </Text>

            <View style={{ width: 44 }} />
          </View>

          <ScrollView
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Badge Section */}
            <View style={styles.badgeSection}>
              <AnimatedBadge level={displayLevel} tier={tier} />

              <View style={styles.tierInfo}>
                <View
                  style={[
                    styles.tierBadge,
                    {
                      backgroundColor: 'transparent',
                      position: 'relative',
                      overflow: 'hidden',
                    },
                  ]}
                >
                  <LinearGradient
                    colors={tier.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
                  ></LinearGradient>
                  <Text style={[styles.tierLabel]}>{tier.label}</Text>
                </View>

                <Text
                  style={[
                    styles.tierDescription,
                    { color: Colors.textSecondary || Colors.greyColor600 },
                  ]}
                >
                  {tier.description}
                </Text>
              </View>
            </View>

            {/* Progress Section */}
            {isUnlocked ? (
              <View
                style={[
                  styles.progressSection,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.03)',
                  },
                ]}
              >
                <View style={styles.progressHeader}>
                  <Text
                    style={[styles.progressTitle, { color: Colors.textColor }]}
                  >
                    Progress to Level {displayLevel + 1}
                  </Text>
                  <Text
                    style={[
                      styles.progressPercent,
                      { color: tier.gradient[0] },
                    ]}
                  >
                    {Math.round(progress * 100)}%
                  </Text>
                </View>

                <ProgressBar progress={progress} colors={tier.gradient} />

                <View style={styles.xpInfo}>
                  <Text
                    style={[
                      styles.xpText,
                      { color: Colors.textSecondary || Colors.greyColor600 },
                    ]}
                  >
                    {currentXp.toLocaleString()} / {maxXp.toLocaleString()} XP
                  </Text>
                  <Text
                    style={[styles.xpRemaining, { color: tier.gradient[0] }]}
                  >
                    {(maxXp - currentXp).toLocaleString()} XP to go
                  </Text>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.lockedSection,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(0,0,0,0.03)',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="lock"
                  size={40}
                  color={Colors.greyColor500}
                />
                <Text style={[styles.lockedTitle, { color: Colors.textColor }]}>
                  Level Locked
                </Text>
                <Text
                  style={[
                    styles.lockedDescription,
                    { color: Colors.textSecondary || Colors.greyColor600 },
                  ]}
                >
                  Gain {xpToNextLevel.toLocaleString()} XP to unlock this level
                </Text>
              </View>
            )}

            {/* Stats Grid */}
            {isUnlocked && (
              <View style={styles.statsGrid}>
                <StatCard
                  icon="star"
                  label="Level"
                  value={displayLevel}
                  color={tier.gradient[0]}
                />
                <StatCard
                  icon="lightning-bolt"
                  label="XP Earned"
                  value={currentXp.toLocaleString()}
                  color="#F59E0B"
                />
                <StatCard
                  icon="target"
                  label="XP Goal"
                  value={maxXp.toLocaleString()}
                  color="#10B981"
                />
                <StatCard
                  icon="trophy"
                  label="Tier"
                  value={tier.label}
                  color="#8B5CF6"
                />
              </View>
            )}
          </ScrollView>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
              <View
                style={[
                  styles.actionButton,
                  {
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: tier.gradient[0],
                  },
                ]}
              >
                <LinearGradient
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                  }}
                  colors={tier.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                ></LinearGradient>
                <Text style={styles.actionButtonText}>Continue Journey</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  fullScreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILIES.nunitoBold,
    letterSpacing: 0.5,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  badgeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.5,
  },
  mainBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  badgeInner: {
    width: '65%',
    height: '65%',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumberContainer: {
    position: 'absolute',
    bottom: -6,
    right: -6,
  },
  levelNumberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  levelNumber: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.interBold,
    color: '#FFFFFF',
  },
  tierInfo: {
    alignItems: 'center',
  },
  tierBadge: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 6,
  },
  tierLabel: {
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  tierDescription: {
    fontSize: 13,
    fontFamily: FONT_FAMILIES.nunitoRegular,
  },
  progressSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 15,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
  },
  progressPercent: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.interBold,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressTrack: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpText: {
    fontSize: 13,
    fontFamily: FONT_FAMILIES.nunitoMedium,
  },
  xpRemaining: {
    fontSize: 13,
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
  lockedSection: {
    borderRadius: 16,
    padding: 28,
    marginBottom: 20,
    alignItems: 'center',
  },
  lockedTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.nunitoBold,
    marginTop: 12,
    marginBottom: 6,
  },
  lockedDescription: {
    fontSize: 13,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  statCard: {
    width: '50%',
    padding: 5,
  },
  statCardInner: {
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONT_FAMILIES.nunitoMedium,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.interBold,
  },
  actionContainer: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#FFFFFF',
  },
});

export default React.memo(LevelInfoModal);
