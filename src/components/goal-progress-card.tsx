'use client';

// Enhanced Goal Progress Card - Gaming Elixir Theme
// ✅ Elixir/potion drop effect on progress increase
// ✅ Optional glow effects
// ✅ Working touch interactions
// ✅ Proper theme color integration
// ✅ Breathing and floating animations

import { ColorScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ============================================
// ELIXIR DROP EFFECT (Like potion drops)
// ============================================

interface ElixirDropProps {
  color: string;
  delay: number;
  startX: number;
}

const ElixirDrop: React.FC<ElixirDropProps> = ({ color, delay, startX }) => {
  const translateY = useSharedValue(-180);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    // Drop falls with bounce
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(40, {
          duration: 700,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        withSpring(50, { damping: 6, stiffness: 150 }),
      ),
    );

    // Fade in and splash out
    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0.8, { duration: 400 }),
        withTiming(0, { duration: 200 }),
      ),
    );

    // Scale grows then disappears
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1, { damping: 8 }),
        withTiming(1.3, { duration: 200 }),
        withTiming(0, { duration: 150 }),
      ),
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 16,
          height: 20,
          borderRadius: 12,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.7,
          shadowRadius: 10,
          zIndex: 5,
        },
        animatedStyle,
      ]}
    >
      {/* Inner shine */}
      <View
        style={{
          position: 'absolute',
          top: 3,
          left: 4,
          width: 6,
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.4)',
        }}
      />
    </Animated.View>
  );
};

// ============================================
// SPLASH EFFECT (When elixir hits liquid)
// ============================================

interface SplashEffectProps {
  color: string;
  size: number;
}

const SplashEffect: React.FC<SplashEffectProps> = ({ color, size }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(0.3, { duration: 0 }),
      withSpring(1.2, { damping: 8 }),
      withTiming(1.5, { duration: 300 }),
    );

    opacity.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(0, { duration: 500 }),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: (size * 0.3) / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

// ============================================
// AMBIENT PARTICLES (Subtle magic particles)
// ============================================

interface AmbientParticleProps {
  color: string;
  index: number;
  size: number;
}

const AmbientParticle: React.FC<AmbientParticleProps> = ({
  color,
  index,
  size,
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 200;

    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-12, {
            duration: 2500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );

    translateX.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1500 }),
          withTiming(0.1, { duration: 1500 }),
        ),
        -1,
        true,
      ),
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
    opacity: opacity.value,
  }));

  // Position around circle
  const angle = (index / 4) * 2 * Math.PI;
  const radius = size * 0.52;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 3,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: color,
          left: size / 2 + x,
          top: size / 2 + y,
        },
        animatedStyle,
      ]}
    />
  );
};

// ============================================
// TYPES
// ============================================
export interface GoalProgressItem {
  label: string;
  progress: number;
  color: string;
  background: string;
  gradientColors: string[];
  glowColor?: string;
  colorKey: 'diet' | 'activity' | 'stress';
  onPress?: () => void;
}

export interface GoalProgressCardProps {
  progressData: GoalProgressItem[];
  Colors: ColorScheme;
  enableGlow?: boolean; // Optional glow
}

// ============================================
// ENHANCED LIQUID CIRCLE
// ============================================
interface LiquidCircleProps {
  label: string;
  percentage: number;
  size?: number;
  gradientColors: string[];
  backgroundColor: string;
  Colors: ColorScheme;
  index?: number;
  onPress?: () => void;
  enableGlow?: boolean;
}

export const LiquidCircle: React.FC<LiquidCircleProps> = ({
  label,
  percentage,
  size = 130,
  gradientColors,
  backgroundColor,
  Colors,
  index = 0,
  onPress,
  enableGlow = false,
}) => {
  const wavePhase = useSharedValue(0);
  const fillLevel = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);
  const breathe = useSharedValue(1);
  const glow = useSharedValue(0.2);

  const previousPercentage = useRef(0);
  const [showElixirDrops, setShowElixirDrops] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(false);

  const center = size / 2;
  const radius = size / 2 - 4;

  const safeGradientColors = useMemo(() => {
    if (gradientColors.length < 2) {
      return [gradientColors[0] || Colors.primaryColor, Colors.primaryDark];
    }
    return gradientColors;
  }, [gradientColors, Colors]);

  useEffect(() => {
    const delay = index * 120;

    // Entrance
    opacity.value = withTiming(1, { duration: 400 + delay });
    scale.value = withSpring(1, { damping: 14, stiffness: 90 });

    // Check progress increase for elixir effect
    if (percentage > previousPercentage.current && percentage > 0) {
      setShowElixirDrops(true);
      setShowSplash(true);
      setTimeout(() => setShowElixirDrops(false), 1200);
      setTimeout(() => setShowSplash(false), 700);
    }
    previousPercentage.current = percentage;

    // Fill animation
    fillLevel.value = withTiming(percentage, {
      duration: 1500 + delay,
      easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    });

    // Continuous wave
    wavePhase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 2500, easing: Easing.linear }),
      -1,
      false,
    );

    // Breathing
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.015, {
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    // Glow (only if enabled)
    if (enableGlow) {
      glow.value = withRepeat(
        withSequence(
          withTiming(0.35, { duration: 1800 }),
          withTiming(0.2, { duration: 1800 }),
        ),
        -1,
        true,
      );
    }
  }, [percentage, index, enableGlow]);

  const currentFill = useDerivedValue(() => fillLevel.value / 100);

  const waveAnimatedProps = useAnimatedProps(() => {
    'worklet';
    const fill = currentFill.value;
    const phase = wavePhase.value;
    const waveHeight = 5 + (1 - fill) * 4;
    const liquidY = size - fill * size;

    let path = `M 0 ${liquidY}`;
    for (let x = 0; x <= size; x += 2) {
      const y =
        liquidY + Math.sin((x / size) * 4 * Math.PI + phase) * waveHeight;
      path += ` L ${x} ${y}`;
    }
    path += ` L ${size} ${size} L 0 ${size} Z`;
    return { d: path };
  });

  const wave2AnimatedProps = useAnimatedProps(() => {
    'worklet';
    const fill = currentFill.value;
    const phase = wavePhase.value + Math.PI * 0.7;
    const waveHeight = 3.5 + (1 - fill) * 3;
    const liquidY = size - fill * size;

    let path = `M 0 ${liquidY}`;
    for (let x = 0; x <= size; x += 2) {
      const y =
        liquidY + Math.sin((x / size) * 3.5 * Math.PI + phase) * waveHeight;
      path += ` L ${x} ${y}`;
    }
    path += ` L ${size} ${size} L 0 ${size} Z`;
    return { d: path };
  });

  const animatedBorderProps = useAnimatedProps(() => {
    'worklet';
    const strokeColor = interpolateColor(
      fillLevel.value,
      [0, 50, 100],
      [
        safeGradientColors[0] + '50',
        safeGradientColors[Math.floor(safeGradientColors.length / 2)] + '80',
        safeGradientColors[safeGradientColors.length - 1],
      ],
    );
    return { stroke: strokeColor, opacity: 0.5 };
  });

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * breathe.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: enableGlow ? glow.value : 0,
  }));

  const textStyle = useAnimatedStyle(() => {
    'worklet';
    const textColor = interpolateColor(
      fillLevel.value,
      [0, 45, 100],
      [
        Colors.isDark ? Colors.textColor : safeGradientColors[0],
        Colors.isDark ? Colors.textColor : safeGradientColors[0],
        '#FFFFFF',
      ],
    );
    return { color: textColor };
  });

  const uniqueId = `liquid-${label}-${index}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
      style={{ padding: 10 }}
    >
      <Animated.View
        style={[
          liquidStyles.container,
          { width: size, height: size },
          containerStyle,
        ]}
      >
        {/* Splash effect */}
        {showSplash && (
          <SplashEffect color={safeGradientColors[0]} size={size} />
        )}

        {/* Elixir drops */}
        {showElixirDrops &&
          Array.from({ length: 3 }, (_, i) => (
            <ElixirDrop
              key={i}
              color={safeGradientColors[0]}
              delay={i * 120}
              startX={(Math.random() - 0.5) * 30}
            />
          ))}

        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient
              id={`${uniqueId}-gradient`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              {safeGradientColors.map((color, idx) => (
                <Stop
                  key={idx}
                  offset={`${(idx / (safeGradientColors.length - 1)) * 100}%`}
                  stopColor={color}
                  stopOpacity={0.92 - idx * 0.06}
                />
              ))}
            </LinearGradient>

            <LinearGradient
              id={`${uniqueId}-gradient-light`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <Stop
                offset="0%"
                stopColor={safeGradientColors[0]}
                stopOpacity="0.5"
              />
              <Stop
                offset="100%"
                stopColor={
                  safeGradientColors[Math.floor(safeGradientColors.length / 2)]
                }
                stopOpacity="0.3"
              />
            </LinearGradient>

            <ClipPath id={`${uniqueId}-clip`}>
              <Circle cx={center} cy={center} r={radius} />
            </ClipPath>
          </Defs>

          <Circle cx={center} cy={center} r={radius} fill={Colors.white} />

          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={2.5}
            animatedProps={animatedBorderProps}
          />

          <G clipPath={`url(#${uniqueId}-clip)`}>
            <AnimatedPath
              animatedProps={wave2AnimatedProps}
              fill={`url(#${uniqueId}-gradient-light)`}
            />
            <AnimatedPath
              animatedProps={waveAnimatedProps}
              fill={`url(#${uniqueId}-gradient)`}
            />
          </G>

          <Circle
            cx={center}
            cy={center}
            r={radius - 1.5}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
          />
        </Svg>

        <View style={liquidStyles.textOverlay}>
          <Animated.Text
            style={[
              liquidStyles.label,
              {
                fontSize: size * 0.105,
                fontFamily: FONT_FAMILIES.nunitoBold,
              },
              textStyle,
            ]}
          >
            {label.toUpperCase()}
          </Animated.Text>
          <View style={liquidStyles.percentRow}>
            <Animated.Text
              style={[
                liquidStyles.percentage,
                {
                  fontSize: size * 0.24,
                  fontFamily: FONT_FAMILIES.nunitoBlack,
                },
                textStyle,
              ]}
            >
              {Math.round(percentage)}
            </Animated.Text>
            <Animated.Text
              style={[
                liquidStyles.percentSymbol,
                {
                  fontSize: size * 0.12,
                  fontFamily: FONT_FAMILIES.nunitoBold,
                },
                textStyle,
              ]}
            >
              %
            </Animated.Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const liquidStyles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  label: {
    letterSpacing: 0.8,
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  percentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  percentage: {
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  percentSymbol: {
    marginLeft: 1,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

// ============================================
// MAIN CARD COMPONENT
// ============================================
const GoalProgressCard: React.FC<GoalProgressCardProps> = React.memo(
  ({ progressData, enableGlow = false }) => {
    const { Colors } = useAppTheme();
    const styles = useMemo(() => createStyles(Colors), [Colors]);

    const screenWidth = useWindowDimensions().width;
    const circleSize = useMemo(() => {
      const horizontalPadding = 16; // paddingHorizontal on container
      const gaps = 8 * (progressData.length - 1); // gap between items
      const itemPadding = 8 * 2 * progressData.length; // padding in TouchableOpacity
      const availableWidth =
        screenWidth - horizontalPadding - gaps - itemPadding;
      const itemWidth = availableWidth / progressData.length;

      // Return a size that fits well, with min/max constraints
      return Math.max(100, Math.min(170, itemWidth));
    }, [screenWidth, progressData.length]);

    if (!progressData || progressData.length === 0) {
      return null;
    }

    return (
      <View style={styles.container}>
        <View style={styles.progressGrid}>
          {progressData.map((item, index) => (
            <View key={`${item.label}-${index}`} style={styles.progressItem}>
              <LiquidCircle
                label={item.label}
                percentage={Math.round(
                  Math.max(0, Math.min(1, item.progress)) * 100,
                )}
                size={circleSize}
                gradientColors={item.gradientColors}
                backgroundColor={item.background}
                Colors={Colors}
                index={index}
                onPress={item.onPress}
                enableGlow={enableGlow}
              />
            </View>
          ))}
        </View>
      </View>
    );
  },
);

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    progressGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default GoalProgressCard;
