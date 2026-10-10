import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Gradient, { LinearGradientProps } from 'react-native-linear-gradient';

type Props = Omit<LinearGradientProps, 'style' | 'children' | 'colors'> & {
  style?: ViewStyle | StyleProp<ViewStyle>;
  children?: React.ReactNode;
  colors?: (string | number)[];
};

const LinearGradient: React.FC<Props> = ({
  style,
  children,
  colors = ['#3A225D', '#7A47C3'],
  ...props
}) => {
  return (
    <View
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
      <Gradient
        {...props}
        style={StyleSheet.absoluteFillObject}
        colors={colors}
      />
      {children}
    </View>
  );
};

export default LinearGradient;

LinearGradient.displayName = 'LinearGradient';
LinearGradient.defaultProps = {
  colors: ['#3A225D', '#7A47C3'],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
  locations: [0, 1],
  useAngle: false,
  angleCenter: { x: 0.5, y: 0.5 },
  angle: 0,
};
