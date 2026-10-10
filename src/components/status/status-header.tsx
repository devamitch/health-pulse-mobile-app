import LinearGradient from '@/components/base/LinearGradient';
import React, { useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StatusMenu from './layout-list/status-menu';

type CircleStyle = {
  size?: number;
  color?: string;
  blur?: number;
};

type HeaderStyles = {
  container?: ViewStyle;
  headerContainer?: ViewStyle;
  titleText?: TextStyle;
  subtitleText?: TextStyle;
  descriptionText?: TextStyle;
  circle1?: CircleStyle;
  circle2?: CircleStyle;
  svgImage?: ViewStyle;
  circleContainer?: ViewStyle;
  menuButton?: ViewStyle;
};

type MenuItem = {
  title: string;
  onPress: () => void;
  titleStyle?: TextStyle;
  icon?: string;
};

type StausHeaderProps<T extends React.ComponentType<any> | React.FC<any>> = {
  title?: string;
  subtitle?: string;
  description?: string;
  onBackPress?: () => void;
  scrollY?: Animated.SharedValue<number>;
  scrollThreshold?: number;
  collapsedHeight?: number;
  expandedHeight?: number;
  styles?: HeaderStyles;
  menuItems?: MenuItem[];
  animateOnKeyboard?: boolean;
  pulseAnimation?: boolean;
  floatingCircles?: boolean;
  backIcon?: string;
  backIconSize?: number;
  backIconColor?: string;
  menuIcon?: string;
  menuIconColor?: string;
  gradientColors?: [string, string];
  statusBarColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  IconComponent?: React.ComponentType<any>;
  RightComponent?: React.ComponentType<any>;
  LeftComponent?: React.ComponentType<any>;
  ImageComponent?: T;
  imageProps?: Omit<React.ComponentProps<T>, 'height' | 'width'>;
  imageSize?: number;
  angle?: number;
};

const defaultStyles: HeaderStyles = {
  container: {
    borderBottomRightRadius: 45,
    borderBottomLeftRadius: 45,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
    fontFamily: 'Nunito-SemiBold',
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginHorizontal: 16,
    fontFamily: 'Nunito-SemiBold',
    paddingLeft: 20,
    top: 10,
    paddingBottom: 10,
  },
  descriptionText: {
    paddingLeft: 20,
    fontSize: 12,
    width: '55%',
    fontFamily: 'Nunito-SemiBold',
  },
  circle1: {
    size: 100,
    color: 'rgba(255, 255, 255, 0.1)',
    blur: 60,
  },
  circle2: {
    size: 150,
    color: 'rgba(255, 255, 255, 0.05)',
    blur: 80,
  },
  circleContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  svgImage: {
    zIndex: 1,
  },
  menuButton: {
    borderRadius: 30,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

const StatusHeader = <T extends React.ComponentType<any>>({
  title = 'Evening Wind Down',
  subtitle = "Let's get started!",
  description = 'A personalized mindfulness exercise designed specially to help you to sleep better.',
  onBackPress,
  styles: customStyles = {},
  menuItems = [],
  animateOnKeyboard = true,
  pulseAnimation = true,
  floatingCircles = true,
  backIcon = 'chevron-back',
  backIconSize = 24,
  backIconColor = 'white',
  menuIcon = 'dots-vertical',
  menuIconColor = 'white',
  gradientColors = ['#3A225D', '#7A47C3'],
  statusBarColor = 'white',
  statusBarStyle = 'light-content',
  IconComponent = Ionicons,
  RightComponent,
  LeftComponent,
  ImageComponent,
  imageProps,
  imageSize = 100,
  scrollY,
  scrollThreshold = 65,
  collapsedHeight = scrollThreshold,
  expandedHeight = 200,
  angle,
}: StausHeaderProps<T>) => {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = React.useState(false);
  const progress = useSharedValue(0);
  const pulse = useSharedValue(0);

  const styles: HeaderStyles = {
    ...defaultStyles,
    ...customStyles,
    circle1: { ...defaultStyles.circle1, ...customStyles.circle1 },
    circle2: { ...defaultStyles.circle2, ...customStyles.circle2 },
  };

  useEffect(() => {
    if (animateOnKeyboard) {
      progress.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
    }
  }, [animateOnKeyboard]);

  useEffect(() => {
    if (pulseAnimation) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 2000 }),
          withTiming(1, { duration: 2000 }),
        ),
        -1,
        true,
      );
    }
  }, [pulseAnimation]);

  const headerStyle = useAnimatedStyle(() => {
    if (scrollY) {
      const height = interpolate(
        scrollY.value,
        [0, scrollThreshold],
        [expandedHeight + insets.top, collapsedHeight + insets.top],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      );

      const borderRadius = interpolate(
        scrollY.value,
        [0, scrollThreshold],
        [45, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      );

      return {
        height,
        borderBottomRightRadius: borderRadius,
        borderBottomLeftRadius: borderRadius,
      };
    }

    return {
      height: withTiming(expandedHeight + insets.top, { duration: 300 }),
      borderBottomRightRadius: withTiming(45, { duration: 300 }),
      borderBottomLeftRadius: withTiming(45, { duration: 300 }),
    };
  });

  const contentOpacity = useAnimatedStyle(() => {
    if (scrollY) {
      const opacity = interpolate(
        scrollY.value,
        [0, scrollThreshold * 0.8],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      );
      return { opacity };
    }

    return { opacity: 1 };
  });

  const titleStyle = useAnimatedStyle(() => {
    if (scrollY) {
      const fontSize = interpolate(
        scrollY.value,
        [0, scrollThreshold],
        [20, 19],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
      );
      return { fontSize };
    }
    return {};
  });

  const gradientStyle = useAnimatedStyle(() => {
    const opacity = pulseAnimation
      ? interpolate(pulse.value, [0, 1], [0.95, 1])
      : 1;
    return {
      opacity,
    };
  });

  const openMenu = () => {
    setVisible(true);
  };

  const closeMenu = () => setVisible(false);

  return (
    <Animated.View
      style={[
        styles.container,
        headerStyle,
        {
          shadowColor: 'black',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          backgroundColor: 'transparent',
        },
      ]}
    >
      <StatusBar backgroundColor={statusBarColor} barStyle={statusBarStyle} />
      <Animated.View style={[StyleSheet.absoluteFillObject, gradientStyle]}>
        <LinearGradient
          useAngle={true}
          angle={angle || 292.08}
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <View
        style={[
          StyleSheet.absoluteFillObject,
          { paddingTop: insets.top, flex: 1 },
        ]}
      >
        <View style={[styles.headerContainer, { zIndex: 100 }]}>
          {LeftComponent ? (
            <LeftComponent />
          ) : onBackPress ? (
            <RectButton
              onPress={onBackPress}
              style={{
                padding: 5,
                borderRadius: 30,
              }}
            >
              <IconComponent
                name={backIcon}
                size={backIconSize}
                color={backIconColor}
              />
            </RectButton>
          ) : (
            <View style={{ width: backIconSize + 10 }} />
          )}

          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.2)',
              paddingHorizontal: 10,
              paddingVertical: 10,
              borderRadius: 20,
              minWidth: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 45,
            }}
          >
            <Animated.Text
              style={[styles.titleText, titleStyle, { color: 'white' }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Animated.Text>
          </View>

          <RectButton onPress={openMenu} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </RectButton>
          <StatusMenu
            menuItems={menuItems}
            insetTop={insets.top}
            menuVisible={visible}
            setMenuVisible={setVisible}
          />
        </View>

        <Animated.View style={[contentOpacity, { paddingLeft: 5 }]}>
          {subtitle && (
            <Text
              style={[styles.subtitleText, { color: 'white' }]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          )}
          {(description || ImageComponent) && (
            <View style={{ flexDirection: 'row' }}>
              {description && (
                <Text
                  style={[
                    styles.descriptionText,
                    { color: 'white', fontSize: 13 },
                  ]}
                  numberOfLines={3}
                >
                  {description}
                </Text>
              )}
              {ImageComponent && (
                <View style={circleStyles.circleContainer}>
                  {floatingCircles && (
                    <>
                      <Animated.View
                        style={[circleStyles.circle1]}
                        pointerEvents={'none'}
                      />
                      <Animated.View
                        style={[circleStyles.circle2]}
                        pointerEvents={'none'}
                      />
                    </>
                  )}
                  <ImageComponent
                    height={imageSize}
                    width={imageSize}
                    {...imageProps}
                    style={[styles.svgImage, imageProps?.style]}
                  />
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const circleStyles = StyleSheet.create({
  circle1: {
    position: 'absolute',
    height: 297,
    width: 297,
    borderRadius: 297 / 2,
    borderWidth: 30,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  circle2: {
    position: 'absolute',
    height: 173,
    width: 173,
    borderRadius: 173 / 2,
    borderWidth: 30,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  circleContainer: {
    bottom: 50,
    right: -50,
    position: 'relative',
    height: 200,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});

export default StatusHeader;
