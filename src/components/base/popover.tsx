import { BlurView } from '@react-native-community/blur';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type MenuItem = {
  title: string;
  onPress: () => void;
  icon?: string;
  divider?: boolean;
  disabled?: boolean;
  destructive?: boolean;
};

export type PopoverPosition = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  centerHorizontal?: boolean;
  centerVertical?: boolean;
};
export type PopoverAnimationConfig = {
  type: 'fade' | 'scale' | 'slide';
  duration?: number;
  easing?: any;
  spring?: {
    damping: number;
    mass: number;
    stiffness: number;
  };
};

export type PopoverRef = {
  show: () => void;
  hide: () => void;
  isVisible: () => boolean;
};

type PopoverProps = {
  children?: React.ReactNode;
  menuItems: MenuItem[];
  position?: PopoverPosition;
  anchor?: React.RefObject<View>;
  animationConfig?: PopoverAnimationConfig;
  blurAmount?: number;
  overlayColor?: string;
  borderRadius?: number;
  backgroundColor?: string;
  textColor?: string;
  destructiveColor?: string;
  dividerColor?: string;
  disabledColor?: string;
  insetTop?: number;
  onShow?: () => void;
  onHide?: () => void;
  visible?: boolean;
  onRequestClose?: () => void;
};

const defaultAnimationConfig: PopoverAnimationConfig = {
  type: 'scale',
  duration: 200,
  easing: Easing.out(Easing.cubic),
  spring: {
    damping: 15,
    mass: 1,
    stiffness: 200,
  },
};

const Popover = forwardRef<PopoverRef, PopoverProps>(
  (
    {
      children,
      menuItems,
      position = { top: 0, right: 0 },
      anchor,
      animationConfig = defaultAnimationConfig,
      blurAmount = 5,
      overlayColor = 'rgba(0, 0, 0, 0.2)',
      borderRadius = 12,
      backgroundColor = 'rgba(255, 255, 255, 0.99)',
      textColor = '#333',
      destructiveColor = '#ff3b30',
      dividerColor = 'rgba(0, 0, 0, 0.1)',
      disabledColor = 'rgba(0, 0, 0, 0.3)',
      insetTop = 0,
      onShow,
      onHide,
      visible = false,
      onRequestClose,
    },
    ref,
  ) => {
    const isVisible = useSharedValue(false);
    const animationProgress = useSharedValue(0);
    const [calculatedPosition, setCalculatedPosition] = React.useState({
      top: 0,
      left: 0,
    });
    const menuRef = useRef<View>(null);
    const containerRef = useRef<View>(null);

    // Sync with external visible prop if provided
    useEffect(() => {
      if (visible !== isVisible.value) {
        if (visible) {
          show();
        } else {
          hide();
        }
      }
    }, [visible]);

    useImperativeHandle(ref, () => ({
      show: () => show(),
      hide: () => hide(),
      isVisible: () => isVisible.value,
    }));

    const show = () => {
      calculatePosition();
      isVisible.value = true;
      animationProgress.value = withSpring(
        1,
        animationConfig.spring || defaultAnimationConfig.spring,
        () => {
          if (onShow) runOnJS(onShow)();
        },
      );
    };

    const hide = () => {
      animationProgress.value = withTiming(
        0,
        {
          duration: animationConfig.duration || 200,
          easing: animationConfig.easing,
        },
        () => {
          isVisible.value = false;
          if (onHide) runOnJS(onHide)();
        },
      );
    };

    const handleRequestClose = () => {
      if (onRequestClose) {
        onRequestClose();
      } else {
        hide();
      }
    };

    const calculatePosition = () => {
      if (anchor && anchor.current) {
        anchor.current.measureInWindow((x, y, width, height) => {
          let top = y + height;
          let left = x;

          // Adjust position based on screen boundaries
          const windowWidth = Dimensions.get('window').width;
          const windowHeight = Dimensions.get('window').height;

          if (menuRef.current) {
            // We need to estimate the menu size for positioning
            const estimatedMenuWidth = 180;
            const estimatedMenuHeight = menuItems.length * 50;

            if (left + estimatedMenuWidth > windowWidth) {
              left = windowWidth - estimatedMenuWidth - 10;
            }

            if (top + estimatedMenuHeight > windowHeight) {
              top = y - estimatedMenuHeight;
            }

            setCalculatedPosition({ top, left });
          }
        });
      } else {
        // Use manual positioning if no anchor is provided
        let top = position.top || 0;
        let left = position.left || 0;

        setCalculatedPosition({ top, left });
      }
    };

    const overlayAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: interpolate(
          animationProgress.value,
          [0, 1],
          [0, 1],
          Extrapolate.CLAMP,
        ),
      };
    });

    const menuAnimatedStyle = useAnimatedStyle(() => {
      switch (animationConfig.type) {
        case 'scale':
          return {
            opacity: interpolate(
              animationProgress.value,
              [0, 1],
              [0, 1],
              Extrapolate.CLAMP,
            ),
            transform: [
              {
                scale: interpolate(
                  animationProgress.value,
                  [0, 1],
                  [0.8, 1],
                  Extrapolate.CLAMP,
                ),
              },
            ],
          };
        case 'fade':
          return {
            opacity: interpolate(
              animationProgress.value,
              [0, 1],
              [0, 1],
              Extrapolate.CLAMP,
            ),
          };
        case 'slide':
          return {
            opacity: interpolate(
              animationProgress.value,
              [0, 1],
              [0, 1],
              Extrapolate.CLAMP,
            ),
            transform: [
              {
                translateY: interpolate(
                  animationProgress.value,
                  [0, 1],
                  [-20, 0],
                  Extrapolate.CLAMP,
                ),
              },
            ],
          };
        default:
          return {};
      }
    });

    if (!isVisible.value) {
      return children ? <View ref={containerRef}>{children}</View> : null;
    }

    return (
      <View ref={containerRef} style={styles.container}>
        {children}

        <TouchableWithoutFeedback onPress={handleRequestClose}>
          <Animated.View
            style={[
              styles.modalOverlay,
              overlayAnimatedStyle,
              {
                backgroundColor: overlayColor,
                paddingTop: insetTop,
              },
            ]}
          >
            <BlurView
              style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
              blurAmount={blurAmount}
              blurType="light"
              reducedTransparencyFallbackColor="white"
            />

            <View
              ref={menuRef}
              style={[
                styles.menuPositioningContainer,
                anchor ? calculatedPosition : position,
                { zIndex: 999 },
              ]}
            >
              <Animated.View
                style={[
                  styles.menuContainer,
                  {
                    backgroundColor,
                    borderRadius,
                  },
                  menuAnimatedStyle,
                ]}
              >
                {menuItems.map((item, index) => (
                  <React.Fragment key={index}>
                    {item.divider ? (
                      <View
                        style={[
                          styles.divider,
                          { backgroundColor: dividerColor },
                        ]}
                      />
                    ) : (
                      <RectButton
                        style={[
                          styles.menuItem,
                          index === menuItems.length - 1 && styles.lastMenuItem,
                          item.disabled && styles.disabledMenuItem,
                        ]}
                        onPress={() => {
                          if (!item.disabled) {
                            handleRequestClose();
                            item.onPress();
                          }
                        }}
                        enabled={!item.disabled}
                      >
                        {item.icon && (
                          <Ionicons
                            name={item.icon}
                            size={20}
                            color={
                              item.disabled
                                ? disabledColor
                                : item.destructive
                                ? destructiveColor
                                : textColor
                            }
                            style={styles.menuIcon}
                          />
                        )}
                        <Text
                          style={[
                            styles.menuItemText,
                            {
                              color: item.disabled
                                ? disabledColor
                                : item.destructive
                                ? destructiveColor
                                : textColor,
                            },
                          ]}
                        >
                          {item.title}
                        </Text>
                      </RectButton>
                    )}
                  </React.Fragment>
                ))}
              </Animated.View>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    );
  },
);

export { Popover };

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuPositioningContainer: {
    position: 'absolute',
  },
  menuContainer: {
    minWidth: 180,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    fontWeight: '400',
  },
  menuIcon: {
    marginRight: 12,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
});
