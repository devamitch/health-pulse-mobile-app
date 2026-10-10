import { BlurView } from '@react-native-community/blur';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from '../base/LinearGradient';

interface LevelBadgeProps {
  level: number;
  xp?: number;
  xpToNextLevel?: number;
  size?: '2xsmall' | 'xsmall' | 'small' | 'medium' | 'large';
  showXp?: boolean;
  showIcon?: boolean;
  showLevelOnly?: boolean;
  variant?: 'vertical' | 'horizontal';
}

const LEVEL_TIERS = {
  bronze: {
    range: [1, 5],
    icon: 'shield-outline',
    gradient: ['#CD7F32', '#8B4513'],
    glowColor: 'rgba(205, 127, 50, 0.4)',
    label: 'Bronze',
  },
  silver: {
    range: [6, 10],
    icon: 'shield-half-full',
    gradient: ['#C0C0C0', '#808080'],
    glowColor: 'rgba(192, 192, 192, 0.4)',
    label: 'Silver',
  },
  gold: {
    range: [11, 20],
    icon: 'shield',
    gradient: ['#FFD700', '#DAA520'],
    glowColor: 'rgba(255, 215, 0, 0.4)',
    label: 'Gold',
  },
  platinum: {
    range: [21, 35],
    icon: 'shield-crown-outline',
    gradient: ['#E5E4E2', '#A0B2C6'],
    glowColor: 'rgba(229, 228, 226, 0.5)',
    label: 'Platinum',
  },
  diamond: {
    range: [36, 50],
    icon: 'shield-crown',
    gradient: ['#B9F2FF', '#4FC3F7'],
    glowColor: 'rgba(185, 242, 255, 0.5)',
    label: 'Diamond',
  },
  master: {
    range: [51, Infinity],
    icon: 'shield-star',
    gradient: ['#9C27B0', '#E040FB'],
    glowColor: 'rgba(156, 39, 176, 0.5)',
    label: 'Master',
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

const SIZE_CONFIG = {
  '2xsmall': {
    badge: 24,
    icon: 10,
    fontSize: 10,
    labelSize: 7,
    xpBarWidth: 50,
    glow: 8,
    levelOverlaySize: 14,
  },
  xsmall: {
    badge: 32,
    icon: 12,
    fontSize: 11,
    labelSize: 8,
    xpBarWidth: 60,
    glow: 10,
    levelOverlaySize: 16,
  },
  small: {
    badge: 40,
    icon: 16,
    fontSize: 12,
    labelSize: 9,
    xpBarWidth: 80,
    glow: 12,
    levelOverlaySize: 18,
  },
  medium: {
    badge: 52,
    icon: 20,
    fontSize: 14,
    labelSize: 11,
    xpBarWidth: 100,
    glow: 16,
    levelOverlaySize: 22,
  },
  large: {
    badge: 72,
    icon: 28,
    fontSize: 20,
    labelSize: 13,
    xpBarWidth: 120,
    glow: 20,
    levelOverlaySize: 26,
  },
};

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  xp = 0,
  xpToNextLevel = 100,
  size = 'medium',
  showXp = false,
  showIcon = true,
  showLevelOnly = false,
  variant = 'vertical',
}) => {
  const tier = getTierForLevel(level);
  const sizeConfig = SIZE_CONFIG[size];
  const progress = xpToNextLevel > 0 ? xp / xpToNextLevel : 0;

  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (!showLevelOnly) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1800 }),
          withTiming(1, { duration: 1800 }),
        ),
        -1,
        true,
      );
    }
  }, [showLevelOnly]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const isHorizontal = variant === 'horizontal';
  const isCompact = size === '2xsmall' || size === 'xsmall';

  // Level Only Badge - minimal compact version
  if (showLevelOnly) {
    return (
      <LinearGradient
        colors={tier.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.levelOnlyBadge,
          {
            minWidth: sizeConfig.levelOverlaySize,
            height: sizeConfig.levelOverlaySize,
            borderRadius: sizeConfig.levelOverlaySize / 2,
            paddingHorizontal: isCompact ? 4 : 6,
          },
        ]}
      >
        <Text
          style={[styles.levelOnlyText, { fontSize: sizeConfig.fontSize - 1 }]}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
        >
          Lvl : {level}
        </Text>
      </LinearGradient>
    );
  }
  if (showXp) {
    return (
      <LinearGradient
        colors={tier.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.levelOnlyBadge,
          {
            minWidth: sizeConfig.levelOverlaySize,
            height: sizeConfig.levelOverlaySize,
            borderRadius: sizeConfig.levelOverlaySize / 2,
            paddingHorizontal: isCompact ? 4 : 6,
          },
        ]}
      >
        <Text
          style={[styles.levelOnlyText, { fontSize: sizeConfig.fontSize - 1 }]}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
        >
          {xp} XP
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[styles.container, isHorizontal && styles.containerHorizontal]}
    >
      {/* Badge */}
      <View style={styles.badgeWrapper}>
        {/* Glow */}
        <Animated.View
          style={[
            styles.glow,
            glowStyle,
            {
              width: sizeConfig.badge + sizeConfig.glow,
              height: sizeConfig.badge + sizeConfig.glow,
              backgroundColor: tier.glowColor,
              borderRadius: (sizeConfig.badge + sizeConfig.glow) / 2,
            },
          ]}
        />

        <LinearGradient
          colors={tier.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.badge,
            {
              width: sizeConfig.badge,
              height: sizeConfig.badge,
              borderRadius: sizeConfig.badge / 2,
              borderWidth: isCompact ? 1 : 2,
            },
          ]}
        >
          {/* Inner Circle with Icon */}
          {showIcon && (
            <View style={[styles.innerCircle, { width: '65%', height: '65%' }]}>
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={isCompact ? 4 : 6}
                reducedTransparencyFallbackColor="rgba(255,255,255,0.25)"
              />
              <View style={styles.innerContent}>
                <MaterialCommunityIcons
                  name={tier.icon}
                  size={sizeConfig.icon}
                  color="#FFFFFF"
                />
              </View>
            </View>
          )}

          {/* Level Number - Centered when no icon */}
          {!showIcon && (
            <Text
              style={[
                styles.centeredLevel,
                { fontSize: sizeConfig.fontSize + 2 },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {level}
            </Text>
          )}

          {/* Level Overlay - Only when showing icon */}
          {showIcon && (
            <View
              style={[
                styles.levelOverlay,
                {
                  minWidth: sizeConfig.levelOverlaySize,
                  borderRadius: sizeConfig.levelOverlaySize / 2,
                  paddingHorizontal: isCompact ? 3 : 5,
                  paddingVertical: isCompact ? 0 : 1,
                  bottom: isCompact ? -2 : -3,
                  right: isCompact ? -2 : -3,
                  borderWidth: isCompact ? 1 : 1.5,
                },
              ]}
            >
              <Text
                style={[
                  styles.levelText,
                  { fontSize: sizeConfig.fontSize - 2 },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {level}
              </Text>
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Info Section */}
      {showXp && (
        <View
          style={[styles.infoContainer, isHorizontal && styles.infoHorizontal]}
        >
          <Text
            style={[styles.tierLabel, { fontSize: sizeConfig.labelSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {tier.label}
          </Text>
          <View
            style={[
              styles.xpBar,
              { width: sizeConfig.xpBarWidth, height: isCompact ? 3 : 5 },
            ]}
          >
            <View
              style={[
                styles.xpProgress,
                {
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: tier.gradient[0],
                },
              ]}
            />
          </View>
          <Text
            style={[styles.xpText, { fontSize: sizeConfig.labelSize - 2 }]}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {xp}/{xpToNextLevel} XP
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    opacity: 0.5,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  innerCircle: {
    borderRadius: 100,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  innerContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredLevel: {
    color: '#FFFFFF',
    // fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    // fontWeight: '800',
    fontFamily: 'NunitoSans-ExtraBold',
  },
  levelOverlay: {
    position: 'absolute',
    backgroundColor: '#1857C1',
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontWeight: '800',
  },
  levelOnlyBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  levelOnlyText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontWeight: '800',
  },
  infoContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  infoHorizontal: {
    marginTop: 0,
    marginLeft: 10,
    alignItems: 'flex-start',
  },
  tierLabel: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  xpBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpProgress: {
    height: '100%',
    borderRadius: 3,
  },
  xpText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginTop: 2,
  },
});

export default LevelBadge;
