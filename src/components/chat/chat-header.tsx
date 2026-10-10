import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '@/hooks/themeHook';
import { FONT_FAMILIES } from '@/constants/typography';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Entypo from 'react-native-vector-icons/Entypo';
import BackButton from '../ui/buttons/back-button';
import { IconButton } from '../ui/buttons/button';

interface ChatHeaderProps {
  scrollY: Animated.SharedValue<number>;
  userData: any;
  onBackPress: () => void;
  onMenuPress: () => void;
}

// FIXED CONSTANTS - Based on home-header pattern
const HEADER_BASE_HEIGHT = 200; // Content area padding
const HEADER_MIN_HEIGHT = 60; // When fully collapsed
const SCROLL_DISTANCE = 120; // How far to scroll for full collapse

const ChatHeader: React.FC<ChatHeaderProps> = ({
  scrollY,
  userData,
  onBackPress,
  onMenuPress,
}) => {
  const insets = useSafeAreaInsets();
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);

  const truncateUsername = (name: string): string => {
    return name && name.length > 15 ? name.slice(0, 15) + '...' : name;
  };

  // Header background animation
  const headerBackgroundStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [HEADER_BASE_HEIGHT, HEADER_MIN_HEIGHT + insets.top],
      Extrapolation.CLAMP,
    );

    const borderRadius = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE * 0.5],
      [20, 0],
      Extrapolation.CLAMP,
    );

    return {
      height: withSpring(height, { damping: 20, stiffness: 100 }),
      borderBottomLeftRadius: withSpring(borderRadius, {
        damping: 20,
        stiffness: 100,
      }),
      borderBottomRightRadius: withSpring(borderRadius, {
        damping: 20,
        stiffness: 100,
      }),
    };
  });

  // Main content fade out smoothly
  const mainContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE * 0.5, SCROLL_DISTANCE * 0.7],
      [1, 0.4, 0],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE * 0.7],
      [0, -20],
      Extrapolation.CLAMP,
    );

    return {
      opacity: withTiming(opacity, { duration: 150 }),
      transform: [{ translateY: withSpring(translateY, { damping: 20 }) }],
      pointerEvents: scrollY.value > SCROLL_DISTANCE * 0.75 ? 'none' : 'auto',
    } as any;
  });

  // Compact header fade in after main content fades
  const compactHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_DISTANCE * 0.7, SCROLL_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      scrollY.value,
      [SCROLL_DISTANCE * 0.7, SCROLL_DISTANCE],
      [-15, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity: withTiming(opacity, { duration: 150 }),
      transform: [{ translateY: withSpring(translateY, { damping: 20 }) }],
      pointerEvents: scrollY.value > SCROLL_DISTANCE * 0.75 ? 'auto' : 'none',
    } as any;
  });

  return (
    <>
      {/* Animated Background */}
      <Animated.View
        style={[
          styles.headerBackground,
          headerBackgroundStyle,
          { backgroundColor: '#1857C1' },
        ]}
      />

      <Animated.View
        style={[
          styles.mainContent,
          mainContentStyle,
          { paddingTop: insets.top + 16, paddingHorizontal: 24 },
        ]}
      >
        {/* Top Row - Back Button, Title, Menu */}
        <View style={styles.topRow}>
          <BackButton onPress={onBackPress} iconColor={'white'} />
          <Text style={styles.titleText}>SKYLA</Text>
          <IconButton
            onPress={onMenuPress}
            variant="light"
            size={42}
            icon={<Entypo name="dots-three-vertical" size={18} color="#FFFFFF" />}
          />
        </View>

        {/* Greeting Card */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingContent}>
             <Text style={styles.greetingText} numberOfLines={1}>
                      Hey {truncateUsername(userData?.displayName || '')} 👋
                    </Text>
            <View style={{ height: 16 }} />
            <Text style={styles.testlistStyle}>
              A personalized plan designed specially for you based on your
              reports ans data, backed by science.
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Compact Header (Scroll State) */}
      <Animated.View
        style={[
          styles.compactHeader,
          compactHeaderStyle,
          { top: insets.top, backgroundColor: '#1857C1' },
        ]}
      >
        <BackButton onPress={onBackPress} iconColor={'white'} />
        <Text style={styles.compactTitle} numberOfLines={1}>
          SKYLA
        </Text>
        <IconButton
          onPress={onMenuPress}
          variant="white"
          size={34}
          icon={<Entypo name="dots-three-vertical" size={16} color="#FFFFFF" />}
        />
      </Animated.View>
    </>
  );
};

const createStyles = (Colors: any) => StyleSheet.create({
  headerBackground: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  mainContent: {
    position: 'absolute',
    width: '100%',
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleText: {
    color:'white',
    fontFamily: FONT_FAMILIES.nunitoRegular,
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  greetingCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 120,
  },
  greetingContent: {
    flex: 1,
  },
  greetingText: {
    color: Colors.textPrimaryColor,
    fontSize: 20,
    fontFamily: FONT_FAMILIES.nunitoBold,
    flex: 1,
  },
      testlistStyle: {
      color: Colors.textSecondary,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      fontSize: 16,
      textAlign: 'left',
    },
  compactHeader: {
    position: 'absolute',
    width: '100%',
    zIndex: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    flex: 1,
    textAlign: 'center',
  },
});

export default ChatHeader;
