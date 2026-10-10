import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  SlideInLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '../hooks/themeHook';

interface SectionTitleProps {
  title: string;
  style?: ViewStyle;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, style }) => {
  const { Colors } = useAppTheme();
  const width = useSharedValue(0);

  React.useEffect(() => {
    width.value = withTiming(50, { duration: 800 });
  }, []);

  const lineStyle = useAnimatedStyle(() => ({
    width: width.value,
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.Text
        style={[styles.title, { color: Colors.textColor }]}
        entering={SlideInLeft.duration(500)}
      >
        {title}
      </Animated.Text>
      <Animated.View
        style={[
          styles.underline,
          { backgroundColor: Colors.primaryColor },
          lineStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 5,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    letterSpacing: 0.7,
  },
  underline: {
    height: 3,
    borderRadius: 1.5,
    marginTop: 4,
  },
});
