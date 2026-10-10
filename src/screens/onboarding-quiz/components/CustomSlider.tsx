// ============================================
// CustomSlider - iOS-style slider component
// ============================================

import { FONT_FAMILIES } from '@/constants/typography';
import { memo, useCallback, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface CustomSliderProps {
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  trackHeight?: number;
  thumbSize?: number;
  showLabels?: boolean;
  Colors: any;
}

const CustomSlider = memo<CustomSliderProps>(
  ({
    value,
    minimumValue,
    maximumValue,
    step,
    onValueChange,
    minimumTrackTintColor = '#1857C1',
    maximumTrackTintColor = '#1857C133',
    thumbTintColor = '#1857C1',
    trackHeight = 6,
    thumbSize = 24,
    showLabels = true,
    Colors,
  }) => {
    const sliderWidth = useRef(0);
    const animatedValue = useRef(new Animated.Value(value)).current;
    const range = maximumValue - minimumValue;

    const getValueFromPosition = useCallback(
      (x: number) => {
        const percentage = Math.max(0, Math.min(1, x / sliderWidth.current));
        const rawValue = minimumValue + percentage * range;
        const steppedValue = Math.round(rawValue / step) * step;
        return Math.max(minimumValue, Math.min(maximumValue, steppedValue));
      },
      [minimumValue, maximumValue, range, step],
    );

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gestureState) => {
          const newValue = getValueFromPosition(gestureState.x0);
          onValueChange(newValue);
          Animated.spring(animatedValue, {
            toValue: newValue,
            useNativeDriver: false,
            speed: 20,
            bounciness: 0,
          }).start();
        },
        onPanResponderMove: (_, gestureState) => {
          const newValue = getValueFromPosition(gestureState.moveX);
          onValueChange(newValue);
          Animated.spring(animatedValue, {
            toValue: newValue,
            useNativeDriver: false,
            speed: 20,
            bounciness: 0,
          }).start();
        },
        onPanResponderRelease: () => {},
      }),
    ).current;

    const handleLayout = (event: any) => {
      sliderWidth.current = event.nativeEvent.layout.width;
    };

    const thumbPosition = ((value - minimumValue) / range) * 100;

    // Generate labels
    const labels = [];
    for (let i = minimumValue; i <= maximumValue; i += step) {
      labels.push(i);
    }

    return (
      <View style={styles.container}>
        <View
          style={[styles.track, { height: trackHeight }]}
          onLayout={handleLayout}
          {...panResponder.panHandlers}
        >
          {/* Maximum track (background) */}
          <View
            style={[
              styles.trackBackground,
              {
                backgroundColor: maximumTrackTintColor,
                borderRadius: trackHeight / 2,
              },
            ]}
          />

          {/* Minimum track (filled) */}
          <View
            style={[
              styles.trackFill,
              {
                width: `${thumbPosition}%`,
                backgroundColor: minimumTrackTintColor,
                borderRadius: trackHeight / 2,
              },
            ]}
          />

          {/* Thumb */}
          <View
            style={[
              styles.thumb,
              {
                left: `${thumbPosition}%`,
                width: thumbSize,
                height: thumbSize,
                borderRadius: thumbSize / 2,
                backgroundColor: thumbTintColor,
                marginLeft: -thumbSize / 2,
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                  },
                  android: {
                    elevation: 4,
                  },
                }),
              },
            ]}
          />
        </View>

        {/* Labels */}
        {showLabels && (
          <View style={styles.labelsContainer}>
            {labels.map(label => (
              <Text
                key={label}
                style={[
                  styles.label,
                  { color: Colors.textTertiary },
                  label === value && [
                    styles.labelActive,
                    { color: Colors.primaryColor },
                  ],
                ]}
              >
                {label}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  },
);

CustomSlider.displayName = 'CustomSlider';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  trackFill: {
    position: 'absolute',
    height: '100%',
  },
  thumb: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 12,
  },
  label: {
    fontSize: 13,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    width: 28,
    textAlign: 'center',
  },
  labelActive: {
    fontFamily: FONT_FAMILIES.nunitoBold,
    fontSize: 14,
  },
});

export default CustomSlider;
