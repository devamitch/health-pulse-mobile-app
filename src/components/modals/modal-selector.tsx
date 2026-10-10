import React from 'react';
import {
  Platform,
  Modal as RNModalNative,
  useWindowDimensions,
} from 'react-native';
import RNModal from 'react-native-modal';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';

interface ModalSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
  avoidKeyboard?: boolean;
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
  onSwipeComplete?: () => void;
  backdropOpacity?: number;
}

const ModalSelector: React.FC<ModalSelectorProps> = ({
  isVisible,
  onClose,
  children,
  animationType = 'fade',
  avoidKeyboard = true,
  swipeDirection,
  onSwipeComplete,
  backdropOpacity = 0.5,
}) => {
  const { height, width } = useWindowDimensions();
  // Use native modal for iOS for better performance
  if (Platform.OS === 'ios') {
    return (
      <RNModalNative
        visible={isVisible}
        transparent={true}
        animationType={animationType}
        onRequestClose={onClose}
        supportedOrientations={['portrait', 'landscape']}
        collapsable
      >
        {children}
      </RNModalNative>
    );
  }

  return (
    <RNModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      onSwipeComplete={onSwipeComplete || onClose}
      {...(swipeDirection ? { swipeDirection } : {})}
      avoidKeyboard={avoidKeyboard}
      backdropOpacity={0}
      backdropTransitionInTiming={400}
      backdropTransitionOutTiming={600}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={400}
      animationOutTiming={600}
      hideModalContentWhileAnimating={false}
      propagateSwipe
      style={{ margin: 0, height, width, flex: 1 }}
      useNativeDriverForBackdrop
      useNativeDriver
      coverScreen={false}
      statusBarTranslucent
    >
      {isVisible ? (
        <Animated.View
          style={[{ flex: 1 }]}
          entering={FadeIn.easing(Easing.inOut(Easing.ease)).duration(400)}
          exiting={FadeOut.easing(Easing.inOut(Easing.ease)).duration(600)}
        >
          {children}
        </Animated.View>
      ) : null}
      {/* {children} */}
    </RNModal>
  );
};

export default React.memo(ModalSelector);
