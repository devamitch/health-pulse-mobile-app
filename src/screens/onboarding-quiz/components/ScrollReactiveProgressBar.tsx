import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScrollReactiveProgressBarProps {
  scrollX: Animated.SharedValue<number>;
  totalScreens: number;
}

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const ScrollReactiveProgressBar: React.FC<ScrollReactiveProgressBarProps> = ({
  scrollX,
  totalScreens,
}) => {
  useEffect(() => {
    console.log('📊 [PROGRESS BAR] Component mounted');
    console.log(`📊 [PROGRESS BAR] Total screens: ${totalScreens}`);
    console.log(`📊 [PROGRESS BAR] Screen width: ${SCREEN_WIDTH}px`);

    return () => {
      console.log('📊 [PROGRESS BAR] Component unmounted');
    };
  }, [totalScreens]);

  // Calculate progress width based on scroll position
  const progressStyle = useAnimatedStyle(() => {
    // Convert scroll position to screen index (0 to totalScreens-1)
    const currentPosition = scrollX.value / SCREEN_WIDTH;

    // Calculate percentage (0 to 100)
    const progressPercentage = interpolate(
      currentPosition,
      [0, totalScreens - 1],
      [0, 100],
      Extrapolate.CLAMP,
    );

    // Log progress updates (runs on UI thread)
    console.log(
      `📊 [PROGRESS] ScrollX: ${scrollX.value.toFixed(
        0,
      )}px → Progress: ${progressPercentage.toFixed(1)}%`,
    );

    return {
      width: `${progressPercentage}%`,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <AnimatedGradient
          colors={['#4A90E2', '#5C6BC0', '#7E57C2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.bar, progressStyle]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  track: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
});

console.log('✅ [PROGRESS BAR] Component loaded');

export default ScrollReactiveProgressBar;
