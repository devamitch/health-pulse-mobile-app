import BlurView from '@/components/base/BlurView';
import React, { memo, ReactNode, useCallback } from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ColorScheme } from '../../../constants/theme';
import { FONT_FAMILIES } from '../../../constants/typography';
import { useAppTheme } from '../../../hooks/themeHook';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PickerBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxHeight?: number;
  showBlur?: boolean;
  blurAmount?: number;
  swipeThreshold?: number; // How far to swipe down to close (0-1)
  springConfig?: {
    damping?: number;
    stiffness?: number;
    mass?: number;
  };
}

const PickerBottomSheet: React.FC<PickerBottomSheetProps> = memo(
  ({
    visible,
    onClose,
    title,
    children,
    maxHeight = SCREEN_HEIGHT * 0.7,
    showBlur = true,
    blurAmount = 10,
    swipeThreshold = 0.3, // 30% of maxHeight
    springConfig = { damping: 20, stiffness: 90, mass: 1 },
  }) => {
    const { Colors } = useAppTheme();
    const styles = createStyles(Colors);

    // Animation values
    const translateY = useSharedValue(maxHeight);
    const overlayOpacity = useSharedValue(0);

    const OverlayComponent = showBlur ? BlurView : View;
    const overlayProps = showBlur ? { blurAmount } : {};

    // Animated styles
    const animatedSheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const animatedOverlayStyle = useAnimatedStyle(() => ({
      opacity: overlayOpacity.value,
    }));

    // Gesture handlers
    const panGesture = Gesture.Pan()
      .onUpdate(event => {
        // Only allow downward swipes (positive translationY)
        if (event.translationY > 0) {
          translateY.value = event.translationY;
        }
      })
      .onEnd(event => {
        const threshold = maxHeight * swipeThreshold;

        // If swiped down beyond threshold or velocity is high enough
        if (event.translationY > threshold || event.velocityY > 500) {
          translateY.value = withTiming(maxHeight, { duration: 200 });
          overlayOpacity.value = withTiming(0, { duration: 200 });
          runOnJS(onClose)();
        } else {
          // Return to original position
          translateY.value = withSpring(0, springConfig);
        }
      });

    // Handle modal show/hide with animations
    const handleModalShow = useCallback(() => {
      if (visible) {
        translateY.value = withSpring(0, springConfig);
        overlayOpacity.value = withTiming(1, { duration: 300 });
      }
    }, [visible, springConfig]);

    const handleModalHide = useCallback(() => {
      translateY.value = withTiming(maxHeight, { duration: 200 });
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }, [maxHeight]);

    // Close function with animation
    const handleClose = useCallback(() => {
      translateY.value = withTiming(maxHeight, { duration: 200 });
      overlayOpacity.value = withTiming(0, { duration: 200 });
      setTimeout(() => {
        onClose();
      }, 200);
    }, [maxHeight, onClose]);

    // Reset animation when modal becomes visible
    React.useEffect(() => {
      if (visible) {
        handleModalShow();
      } else {
        handleModalHide();
      }
    }, [visible, handleModalShow, handleModalHide]);

    // Prevent content clicks from closing the modal
    const handleContentPress = (e: any) => {
      e.stopPropagation();
    };

    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        animationType="none" // We handle our own animations
        transparent={true}
        onRequestClose={handleClose}
        statusBarTranslucent={true}
      >
        <OverlayComponent
          style={[styles.modalOverlay, animatedOverlayStyle]}
          {...overlayProps}
        >
          {/* Touchable overlay that closes on click outside */}
          <TouchableWithoutFeedback onPress={handleClose}>
            <Animated.View
              style={[styles.touchableOverlay, animatedOverlayStyle]}
            />
          </TouchableWithoutFeedback>

          {/* Gesture-detected bottom sheet */}
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                styles.modalContainer,
                { maxHeight, height: maxHeight, flex: 1 },
                animatedSheetStyle,
              ]}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={styles.modalCloseButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* Content - TouchableWithoutFeedback prevents closing when clicking inside */}
              <TouchableWithoutFeedback onPress={handleContentPress}>
                <View style={styles.modalContent}>{children}</View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </GestureDetector>
        </OverlayComponent>
      </Modal>
    );
  },
);

PickerBottomSheet.displayName = 'PickerBottomSheet';

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
      justifyContent: 'flex-end',
    },
    touchableOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'transparent',
    },
    modalContainer: {
      backgroundColor: Colors.surface,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10,
      maxHeight: SCREEN_HEIGHT * 0.7,
    },
    swipeIndicatorContainer: {
      width: '100%',
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 8,
    },
    swipeIndicator: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: Colors.border,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 28,
      paddingVertical: 28,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
      flex: 1,
      marginRight: 16,
    },
    modalCloseButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: Colors.surfaceHover,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalContent: {
      flex: 1,
    },
  });

export default PickerBottomSheet;
