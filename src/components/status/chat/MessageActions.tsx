import { ColorScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { haptic } from '@/utils';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Feather from 'react-native-vector-icons/Feather';

const AnimatedRectButton = Animated.createAnimatedComponent(RectButton);

type MessageActionsProps = {
  onShare: () => void;
  onLike: () => void;
  onDislike: () => void;
  messageFeedback?: { liked?: boolean; disliked?: boolean; feedback?: string };
};

const MessageActions = ({
  onShare,
  onLike,
  onDislike,
  messageFeedback,
}: MessageActionsProps) => {
  const { Colors } = useAppTheme();
  const styles = useMemo(() => createMessageActionStyles(Colors), [Colors]);

  const likeScale = useSharedValue(1);
  const dislikeScale = useSharedValue(1);
  const addPlanScale = useSharedValue(1);
  const editPlanScale = useSharedValue(1);

  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeScale.value }],
  }));

  const dislikeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dislikeScale.value }],
  }));

  const addPlanAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addPlanScale.value }],
    shadowColor: Colors.primaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  }));

  const editPlanAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: editPlanScale.value }],
    shadowColor: Colors.greyColor700,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
    borderColor: Colors.greyColor200,
    borderWidth: 1,
    borderRadius: 24,
  }));

  const handlePress = (
    scale: Animated.SharedValue<number>,
    callback: () => void,
  ) => {
    scale.value = withSpring(0.96, { duration: 100 }, () => {
      scale.value = withSpring(1, { duration: 100 });
    });
    callback();
  };

  return (
    <View style={styles.actionsContainer}>
      <View style={styles.row}>
        <RectButton
          onPress={() => handlePress(likeScale, onLike)}
          style={styles.iconButton}
        >
          <Animated.View style={likeAnimatedStyle}>
            <Feather
              name="thumbs-up"
              size={20}
              color={
                messageFeedback?.liked
                  ? Colors.primaryColor
                  : Colors.greyColor700
              }
            />
          </Animated.View>
        </RectButton>
        <RectButton
          onPress={() => handlePress(dislikeScale, onDislike)}
          style={styles.iconButton}
        >
          <Animated.View style={dislikeAnimatedStyle}>
            <Feather
              name="thumbs-down"
              size={20}
              color={
                messageFeedback?.disliked
                  ? Colors.primaryColor
                  : Colors.greyColor700
              }
            />
          </Animated.View>
        </RectButton>
        <RectButton onPress={onShare} style={styles.iconButton}>
          <Feather name="share-2" size={20} color={Colors.greyColor700} />
        </RectButton>
      </View>
    </View>
  );
};

const createMessageActionStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    actionsContainer: {
      flexDirection: 'column',
      gap: 4,
      paddingHorizontal: 4,
      width: 'auto',
      flexShrink: 0,
    },
    row: {
      flexDirection: 'column',
      gap: 4,
      alignItems: 'center',
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(24,87,193,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonWrapper: {
      borderRadius: 12,
      overflow: 'hidden',
      width: 140,
    },
    button: {
      backgroundColor: Colors.primaryColor,
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      gap: 1,
    },
    buttonText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 14,
      color: Colors.white,
      letterSpacing: 0.25,
      fontWeight: '700',
    },
    buttonIcon: {
      marginRight: 4,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default MessageActions;
