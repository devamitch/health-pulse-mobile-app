import { useAppTheme } from '@/hooks/themeHook';
import { FONT_FAMILIES } from '@/constants/typography';
import { Message } from '@/services/mmkv-redux/slices';
import { haptic } from '@/utils';
import { Toast } from '@/utils/toast';
import Clipboard from '@react-native-clipboard/clipboard';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AnimatedRectButton = Animated.createAnimatedComponent(RectButton);

type OutgoingMessageProps = {
  message: Message;
  onLongPress?: (message: string) => void;
  hapticLevel: number;
};

const OutgoingMessage = ({
  message,
  onLongPress,
  hapticLevel,
}: OutgoingMessageProps) => {
  const { Colors } = useAppTheme();
  const scale = useSharedValue(1);
  const copyIndicatorOpacity = useSharedValue(0);

  const bubbleAnimation = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const copyAnimation = useAnimatedStyle(() => ({
    opacity: copyIndicatorOpacity.value,
    transform: [{ translateX: copyIndicatorOpacity.value * 8 }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.97, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
  };

  const handleLongPress = () => {
    haptic(hapticLevel);
    Clipboard.setString(message.message);
    Toast('Copied to clipboard');
    onLongPress?.(message.message);

    // Show copy indicator animation
    copyIndicatorOpacity.value = withTiming(1, { duration: 200 }, () => {
      copyIndicatorOpacity.value = withTiming(0, { duration: 300, delay: 800 });
    });
  };

  return (
    <View style={styles(Colors).container}>
      <Animated.View style={[styles(Colors).bubbleContainer, bubbleAnimation]}>
        <AnimatedRectButton
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleLongPress}
          style={styles(Colors).bubble}
          rippleColor={`${Colors.white}20`}
          underlayColor={`${Colors.white}10`}
        >
          <Text style={styles(Colors).text}>{message.message}</Text>
        </AnimatedRectButton>
      </Animated.View>

      <Animated.View style={[styles(Colors).copyIndicator, copyAnimation]}>
        <MaterialIcons name="content-copy" size={16} color={Colors.white} />
      </Animated.View>
    </View>
  );
};

const styles = (Colors: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
      alignSelf: 'flex-end',
      maxWidth: '85%',
      position: 'relative',
    },
    bubbleContainer: {
      borderRadius: 18,
      borderBottomRightRadius: 4,
      backgroundColor: Colors.secondaryColor,
      shadowColor: Colors.isDark ? '#000' : `${Colors.secondaryColor}50`,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
      overflow: 'hidden',
    },
    bubble: {
      paddingVertical: 14,
      paddingHorizontal: 18,
    },
    text: {
      color: 'white',
      fontSize: 15,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      lineHeight: 20,
      letterSpacing: 0.2,
    },
    copyIndicator: {
      position: 'absolute',
      right: -28,
      top: '50%',
      marginTop: -12,
      backgroundColor: Colors.primaryColor,
      borderRadius: 16,
      padding: 6,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default OutgoingMessage;
