import { useAppTheme } from '@/hooks/themeHook';
import { FONT_FAMILIES } from '@/constants/typography';
import ChatSparkIcon from '@/icons/ChatSparkIcon';
import JournalEntryIcon from '@/icons/JournalEntryIcon';
import GalleryIcon from '@/icons/GalleryIcon';
import CameraUploadIcon from '@/icons/CameraUploadIcon';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface ActionItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  isPremium?: boolean;
}

interface MainActionButtonProps {
  onCameraPress: () => void;
  onGalleryPress: () => void;
  onCustomMetricPress: () => void;
  onChatPress: () => void;
  isExpanded: boolean;
  expandAnimation: Animated.SharedValue<number>;
}

const MainActionButton: React.FC<MainActionButtonProps> = ({
  onCameraPress,
  onGalleryPress,
  onCustomMetricPress,
  onChatPress,
  isExpanded,
  expandAnimation,
}) => {
  const { Colors } = useAppTheme();

  const actionItems: ActionItem[] = [
    {
      id: 'chat',
      label: 'Skyla',
      icon: ChatSparkIcon
    },
    {
      id: 'custom',
      label: 'Journal Entry',
      icon: JournalEntryIcon,
    },
    {
      id: 'gallery',
      label: 'From Gallery',
      icon: GalleryIcon,
    },
    {
      id: 'camera',
      label: 'Take Photo',
      icon: CameraUploadIcon,
    },
  ];

  const handleActionPress = (actionId: string) => {
    console.log('Action pressed:', actionId);
    switch (actionId) {
      case 'chat':
        onChatPress();
        break;
      case 'camera':
        onCameraPress();
        break;
      case 'gallery':
        onGalleryPress();
        break;
      case 'custom':
        onCustomMetricPress();
        break;
    }
  };

  if (!isExpanded) return null;

  return (
    <>
      {actionItems.map((item, index) => (
        <ActionButton
          key={item.id}
          item={item}
          index={index}
          expandAnimation={expandAnimation}
          onPress={() => handleActionPress(item.id)}
          Colors={Colors}
        />
      ))}
    </>
  );
};

interface ActionButtonProps {
  item: ActionItem;
  index: number;
  expandAnimation: Animated.SharedValue<number>;
  onPress: () => void;
  Colors: any;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  item,
  index,
  expandAnimation,
  onPress,
  Colors,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      expandAnimation.value,
      [0, 1],
      [80, -(index + 1) * 64 + 80], // Reduced from 68 to 64
      Extrapolate.CLAMP,
    );

    const scale = interpolate(
      expandAnimation.value,
      [0, 0.5, 1],
      [0, 0.7, 1], // Improved from 0.6 to 0.7
      Extrapolate.CLAMP,
    );

    const opacity = interpolate(
      expandAnimation.value,
      [0, 0.3, 1], // Faster fade in from 0.4 to 0.3
      [0, 0, 1],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          expandAnimation.value,
          [0, 0.5, 1],
          [0.8, 0.9, 1],
          Extrapolate.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Animated.View
      style={[styles.actionButton, animatedStyle]}
      pointerEvents="box-none"
    >
        <View style={styles.actionButtonContent}>
          <RectButton
          onPress={onPress}
           rippleColor="rgba(0,0,0,0.1)"
          >
            <Text
            style={[
              styles.actionLabel,
               Colors.isDark && styles.actionButtonTouchableDark,
            ]}
          >
            {item.label}
          </Text>
          </RectButton>
          <RectButton
           onPress={onPress}
           rippleColor="rgba(0,0,0,0.1)"
            style={{ borderRadius: 20 }}
           >
            <Animated.View
            style={[
              styles.actionIconContainer,
              iconStyle,
               Colors.isDark && styles.actionButtonTouchableDark,
            ]}
          >
            { item.icon ? (
              <item.icon width={24} height={24} color={Colors.isDark ? '#FFFFFF' : 'black'} />
            ) : null}
          </Animated.View>
          </RectButton>
          
        </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    position: 'absolute',
    right: 20,
    width: 180,
    zIndex: 1000, 
  },

  actionButtonTouchableDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.98)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    color: '#FFFFFF',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding:4,
    gap: 10,
  },
  actionLabel: {
    fontSize: 14, 
    fontFamily: FONT_FAMILIES.nunitoBold,
    textAlign:'center',
    flex: 1,
    marginVertical: 2,
    paddingVertical:6,
    paddingHorizontal:12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Reduced from 3
    shadowOpacity: 0.12, // Softer from 0.15
    shadowRadius: 6, // Reduced from 8
    elevation: 5, // Reduced from 6
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)', 
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
   backgroundColor: 'rgba(255, 255, 255, 0.98)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Reduced from 3
    shadowOpacity: 0.12, // Softer from 0.15
    shadowRadius: 6, // Reduced from 8
    elevation: 5, // Reduced from 6
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)'
  },
});

export default MainActionButton;
