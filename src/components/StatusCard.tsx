import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme } from '../hooks/themeHook';
import { haptic } from '../utils';

interface StatusCardProps {
  icon: any;
  description: string;
  onPress: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
  hapticLevel?: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  icon,
  description,
  onPress,
  onDelete,
  style,
  hapticLevel = 'medium',
}) => {
  const { Colors, DEffect } = useAppTheme();
  const swipeProgress = useSharedValue(0);
  const isDeleting = useSharedValue(false);

  const handleDelete = () => {
    isDeleting.value = true;
    swipeProgress.value = withTiming(1, { duration: 300 }, () => {
      onDelete && onDelete();
    });
    haptic(hapticLevel);
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeProgress.value * -100 }],
    opacity: 1 - swipeProgress.value,
  }));

  return (
    <Animated.View
      style={[styles.container, cardStyle]}
      entering={SlideInRight.springify().damping(15)}
      exiting={
        isDeleting.value ? SlideOutLeft.duration(300) : FadeOut.duration(300)
      }
    >
      <RectButton
        onPress={() => {
          haptic(hapticLevel);
          onPress();
        }}
      >
        <View
          style={[
            styles.cardContent,
            {
              backgroundColor: Colors.white,
              borderWidth: Colors?.isDark ? 1 : 0,
              borderColor: Colors?.isDark ? Colors.greyColor : 'transparent',
              ...DEffect,
            },
            style,
          ]}
        >
          {typeof icon === 'object' ? (
            icon
          ) : (
            <Image source={icon} style={styles.icon} />
          )}
          <Text style={[styles.description, { color: Colors.textColor }]}>
            {description}
          </Text>

          {onDelete && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Image
                source={require('@/assets/icons/close.png')}
                style={styles.deleteIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </RectButton>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 20,
    flex: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  description: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Medium',
    letterSpacing: 0.5,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    width: 18,
    height: 18,
    tintColor: '#FF6B6B',
  },
});
