import { BlurView } from '@react-native-community/blur';
import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  Easing,
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONT_FAMILIES } from '@/constants/typography';
import SparkIcon from '@/icons/SparkIcon';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { RectButton } from 'react-native-gesture-handler';
import { useAppTheme } from '../hooks/themeHook';
import {
  AnimatedHistoryIcon,
  AnimatedHomeIcon,
  AnimatedPlanIcon,
} from './AniamtedIcons';
import MainActionButton from './main-action-button';

type TabName = 'Home' | 'History' | 'Plan';

interface TabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: TabName }>;
  };
  descriptors: {
    [key: string]: {
      options: {
        tabBarAccessibilityLabel?: string;
        tabBarTestID?: string;
      };
    };
  };
  navigation: {
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault: boolean;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
  onCameraPress?: () => void;
  onGalleryPress?: () => void;
  onCustomMetricPress?: () => void;
  onChatPress?: () => void;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Sliding bubble - simplified
const Bubble: React.FC<{
  activeIndex: number;
  totalTabs: number;
  tabBarWidth: number;
}> = ({ activeIndex, totalTabs, tabBarWidth }) => {
  const translateX = useSharedValue(40);
  const opacity = useSharedValue(0);
  const { dark } = useAppTheme();

  useEffect(() => {
    if (tabBarWidth > 20) {
      const singleTabWidth = (tabBarWidth - 40) / totalTabs;
      const centerOffset = singleTabWidth / 2;
      const bubbleHalfWidth =
        activeIndex === 0 ? 40 : activeIndex === 1 ? 30 : 20;
      const targetX =
        activeIndex * singleTabWidth + centerOffset - bubbleHalfWidth;

      translateX.value = targetX;

      opacity.value = 1;
    }
  }, [activeIndex, tabBarWidth, totalTabs]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const gradientColors = dark
    ? ['#f73575e3', '#fe568e']
    : [
        'rgba(254, 86, 141, 0.15)',
        'rgba(254, 86, 141, 0.15)',
        'rgba(254, 86, 141, 0.15)',
      ];

  return (
    <Animated.View style={[styles.bubbleContainer, bubbleStyle]}>
      <AnimatedLinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bubble}
      />
    </Animated.View>
  );
};

const PremiumTabBar = ({
  state,
  descriptors,
  navigation,
  onCameraPress = () => {},
  onGalleryPress = () => {},
  onCustomMetricPress = () => {},
  onChatPress = () => {},
}: TabBarProps) => {
  const insets = useSafeAreaInsets();
  const { Colors, dark } = useAppTheme();
  const isDark = useAppSelector(state => state.theme.colorScheme === 'dark');
  const [isExpanded, setIsExpanded] = useState(false);
  const [tabBarWidth, setTabBarWidth] = useState(0);

  // Simplified shared values - removed all jiggle animations
  const labelOpacities = useRef(
    state.routes.map(() => useSharedValue(0)),
  ).current;
  const colorProgress = useRef(
    state.routes.map(() => useSharedValue(0)),
  ).current;

  const expandAnimation = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    state.routes.forEach((_, index) => {
      const isFocused = state.index === index;

      // Simple color transition
      colorProgress[index].value = withTiming(isFocused ? 1 : 0, {
        duration: 280,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });

      // Simple label fade
      if (isFocused) {
        labelOpacities[index].value = withTiming(1, { duration: 230 });
      } else {
        labelOpacities[index].value = withTiming(0, { duration: 150 });
      }
    });
  }, [state.index]);

  const backgroundColor = isDark
    ? 'rgba(31, 41, 55, 0.96)'
    : 'rgba(255, 255, 255, 0.97)';

  const shadowColor = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.15)';

  const toggleExpanded = () => {
    const newValue = isExpanded ? 0 : 1;

    overlayOpacity.value = withTiming(newValue, { duration: 200 });
    expandAnimation.value = withTiming(newValue, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });

    runOnJS(setIsExpanded)(!isExpanded);
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value * 0.75,
  }));

  return (
    <>
      {/* Overlay */}
      {isExpanded && (
        <Animated.View
          style={[styles.overlay, overlayStyle]}
          pointerEvents="auto"
        >
          <RectButton
            style={StyleSheet.absoluteFillObject}
            onPress={toggleExpanded}
          >
            <AnimatedBlurView
              style={StyleSheet.absoluteFillObject}
              blurType={isDark ? 'dark' : 'light'}
              blurAmount={85}
            />
          </RectButton>
        </Animated.View>
      )}

      {/* Floating Action Buttons */}
      <View
        style={[
          styles.floatingButtonsContainer,
          { bottom: insets.bottom + 55 },
        ]}
        pointerEvents="box-none"
      >
        <MainActionButton
          onCameraPress={() => {
            toggleExpanded();
            setTimeout(onCameraPress, 300);
          }}
          onGalleryPress={() => {
            toggleExpanded();
            setTimeout(onGalleryPress, 300);
          }}
          onCustomMetricPress={() => {
            toggleExpanded();
            setTimeout(onCustomMetricPress, 300);
          }}
          onChatPress={() => {
            toggleExpanded();
            setTimeout(onChatPress, 300);
          }}
          isExpanded={isExpanded}
          expandAnimation={expandAnimation}
        />
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBarWrapper, { bottom: insets.bottom + 10 }]}>
        <Animated.View
          style={[styles.tabBarContainer, { backgroundColor, shadowColor }]}
          onLayout={e => setTabBarWidth(e.nativeEvent.layout.width)}
        >
          {/* Sliding Bubble */}
          {tabBarWidth > 0 && (
            <Bubble
              activeIndex={state.index}
              totalTabs={state.routes.length}
              tabBarWidth={tabBarWidth}
            />
          )}

          {/* Tabs */}
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const labelStyle = useAnimatedStyle(() => ({
              opacity: labelOpacities[index].value,
            }));

            // Animated icon color
            const animatedIconColor = useDerivedValue(() => {
              return interpolateColor(
                colorProgress[index].value,
                [0, 1],
                [Colors.greyColor600, !isDark ? '#FE568D' : '#FFFFFF'],
              );
            });

            // Animated text color
            const animatedTextStyle = useAnimatedStyle(() => {
              return {
                color: interpolateColor(
                  colorProgress[index].value,
                  [0, 1],
                  [Colors.greyColor600, !isDark ? '#FE568D' : '#FFFFFF'],
                ),
              };
            });

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <View key={index} style={styles.tabContainer}>
                <RectButton
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  style={styles.tabButton}
                  underlayColor={`${Colors.secondaryColor}15`}
                  rippleColor={`${Colors.secondaryColor}12`}
                >
                  <View
                    style={
                      isFocused ? styles.tabContentActive : styles.tabContent
                    }
                  >
                    <View>
                      {route.name === 'Home' && (
                        <AnimatedHomeIcon
                          size={22}
                          animatedColor={animatedIconColor}
                        />
                      )}
                      {route.name === 'History' && (
                        <AnimatedHistoryIcon
                          size={22}
                          animatedColor={animatedIconColor}
                        />
                      )}
                      {route.name === 'Plan' && (
                        <AnimatedPlanIcon
                          size={24}
                          animatedColor={animatedIconColor}
                        />
                      )}
                    </View>
                    {isFocused && (
                      <Animated.Text
                        style={[styles.tabLabel, animatedTextStyle, labelStyle]}
                      >
                        {route.name}
                      </Animated.Text>
                    )}
                  </View>
                </RectButton>
              </View>
            );
          })}
        </Animated.View>

        {/* Main Button */}
        <Animated.View
          style={[
            styles.mainButtonContainer,
            { shadowColor, backgroundColor: Colors.white },
          ]}
        >
          <RectButton
            onPress={toggleExpanded}
            style={styles.mainButton}
            underlayColor={`${Colors.secondaryColor}15`}
            rippleColor={`${Colors.secondaryColor}12`}
          >
            <SparkIcon
              color={ '#FE568D' }
              width={24}
              height={24}
            />
          </RectButton>
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  floatingButtonsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999,
    pointerEvents: 'box-none',
    paddingHorizontal: 20,
    alignItems: 'flex-end',
    paddingBottom: 100,
  },
  tabBarWrapper: {
    position: 'absolute',
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: 58,
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 31.5,
    shadowOffset: {
      width: 0,
      height: Platform.select({ default: 8, android: -10 }),
    },
    shadowOpacity: Platform.select({ default: 0.15, android: 0.2 }),
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  tabBarBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 31.5,
  },
  bubbleContainer: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -22,
    zIndex: 0,
  },
  bubble: {
    width: 100,
    height: 44,
    borderRadius: 22,
    shadowColor: '#FE568D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  tabContainer: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative',
    borderRadius: 31.5,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContentActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabLabel: {
    fontSize: 15,
    fontFamily: FONT_FAMILIES.nunitoBold,
    marginLeft: 6,
    letterSpacing: 0.2,
  },
  mainButtonContainer: {
    width: 58,
    height: 58,
    borderRadius: 29.5,
    shadowOffset: { width: 0, height: 4 },
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowOpacity: Platform.select({ default: 0.15, android: 0.2 }),
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  mainButtonGradient: {
    borderRadius: 31.5,
  },
  mainButtonBlur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 31.5,
  },
  mainButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 5,
    paddingLeft: 5,
  },
});

export default PremiumTabBar;
