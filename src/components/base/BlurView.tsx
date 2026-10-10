import { BlurView as Blur, BlurViewProps } from '@react-native-community/blur';
import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

type Props = Omit<BlurViewProps, 'style' | 'children' | 'colors'> & {
  style?: ViewStyle | StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const BlurView: React.FC<Props> = ({ style, children, ...props }) => {
  return (
    <Animated.View
      style={[
        style,
        {
          overflow: 'hidden',
          shadowColor: 'black',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 2 },
          elevation: 5,
        },
      ]}
    >
      <Blur
        style={StyleSheet.absoluteFillObject}
        blurAmount={60}
        blurType={'light'}
        {...props}
      />
      {children}
    </Animated.View>
  );
};

export default BlurView;

BlurView.displayName = 'BlurView';
