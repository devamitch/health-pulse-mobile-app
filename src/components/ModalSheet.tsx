import React, { ReactNode } from 'react';
import {
  Dimensions,
  Modal as RNModal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';
import { useAppTheme } from '../hooks/themeHook';

const { height } = Dimensions.get('window');

interface ModalSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  containerStyle?: ViewStyle;
  animationDuration?: number;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({
  visible,
  onClose,
  children,
  containerStyle,
  animationDuration = 300,
}) => {
  const { Colors, DEffect } = useAppTheme();

  if (!visible) return null;

  return (
    <RNModal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="none"
    >
      <Animated.View
        style={styles.overlay}
        entering={FadeIn.duration(animationDuration)}
        exiting={FadeOut.duration(animationDuration)}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.background} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: Colors.backgroundColor,
              ...DEffect,
            },
            containerStyle,
          ]}
          entering={SlideInUp.springify().damping(15)}
          exiting={SlideOutDown.duration(animationDuration)}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '90%',
    maxHeight: height * 0.8,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
});
