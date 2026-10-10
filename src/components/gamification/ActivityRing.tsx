import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ActivityRingProps {
  progress: number; // 0-2 (supports overflow)
  size?: number;
  strokeWidth?: number;
  color: string;
  overflowColor: string;
  glowColor: string;
  delay?: number;
  animated?: boolean;
}

export const ActivityRing: React.FC<ActivityRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 12,
  color,
  overflowColor,
  glowColor,
  delay = 0,
  animated = true,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Animate progress fill
      Animated.spring(animatedProgress, {
        toValue: Math.min(progress, 2),
        friction: 8,
        tension: 10,
        delay,
        useNativeDriver: true,
      }).start();

      // Pulse animation when complete
      if (progress >= 1) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start();

        // Glow animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }
    } else {
      animatedProgress.setValue(Math.min(progress, 2));
    }
  }, [progress, animated]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Calculate base progress (0-1)
  const baseProgress = Math.min(progress, 1);
  const baseStrokeDashoffset = circumference - baseProgress * circumference;

  // Calculate overflow progress (1-2)
  const hasOverflow = progress > 1;
  const overflowProgress = hasOverflow ? progress - 1 : 0;

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        transform: [{ scale: pulseAnim }],
      }}
    >
      <Svg width={size} height={size}>
        <Defs>
          {/* Gradient for base ring */}
          <LinearGradient
            id={`baseGradient-${color}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </LinearGradient>

          {/* Gradient for overflow ring */}
          <LinearGradient
            id={`overflowGradient-${color}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={overflowColor} stopOpacity="1" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={glowColor} stopOpacity="1" />
          </LinearGradient>

          {/* Glow effect */}
          <LinearGradient
            id={`glowGradient-${color}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={glowColor} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={glowColor} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>

        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
            fill="transparent"
            opacity={0.3}
          />

          {/* Glow layer (when complete) */}
          {progress >= 1 && (
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius + 4}
              stroke={`url(#glowGradient-${color})`}
              strokeWidth={strokeWidth + 8}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={baseStrokeDashoffset}
              strokeLinecap="round"
              opacity={glowAnim}
            />
          )}

          {/* Base progress ring (0-100%) */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#baseGradient-${color})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={animatedProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [
                circumference,
                circumference - baseProgress * circumference,
              ],
            })}
            strokeLinecap="round"
          />

          {/* Overflow ring (100-200%) */}
          {hasOverflow && (
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={`url(#overflowGradient-${color})`}
              strokeWidth={strokeWidth + 2}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={animatedProgress.interpolate({
                inputRange: [1, 2],
                outputRange: [
                  circumference,
                  circumference - overflowProgress * circumference,
                ],
              })}
              strokeLinecap="round"
              opacity={0.9}
            />
          )}

          {/* Completion sparkle */}
          {progress >= 1 && (
            <Circle
              cx={size / 2}
              cy={strokeWidth / 2}
              r={strokeWidth / 2}
              fill={overflowColor}
              opacity={glowAnim as any}
            />
          )}
        </G>
      </Svg>
    </Animated.View>
  );
};

interface MultiRingProgressProps {
  rings: Array<{
    progress: number;
    color: string;
    overflowColor: string;
    glowColor: string;
  }>;
  size?: number;
  strokeWidth?: number;
  gap?: number;
}

export const MultiRingProgress: React.FC<MultiRingProgressProps> = ({
  rings,
  size = 200,
  strokeWidth = 10,
  gap = 8,
}) => {
  return (
    <View style={styles.multiRingContainer}>
      {rings.map((ring, index) => {
        const ringSize = size - index * (strokeWidth + gap) * 2;
        return (
          <View
            key={index}
            style={[
              StyleSheet.absoluteFill,
              {
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <ActivityRing
              progress={ring.progress}
              size={ringSize}
              strokeWidth={strokeWidth}
              color={ring.color}
              overflowColor={ring.overflowColor}
              glowColor={ring.glowColor}
              delay={index * 200}
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  multiRingContainer: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ActivityRing;
