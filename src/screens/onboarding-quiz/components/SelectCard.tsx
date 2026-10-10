// ============================================
// SelectCard - Theme-aware Selectable Card with Image/Icon
// ============================================

import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ColorScheme } from '../../../constants/theme';
import { FONT_FAMILIES } from '../../../constants/typography';
import { useAppTheme } from '../../../hooks/themeHook';

interface SelectCardProps {
  label: string;
  image?: ImageSourcePropType;
  icon?: string;
  iconColor?: string;
  isSelected: boolean;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'cuisine' | 'gender' | 'diet';
  delay?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const SelectCard: React.FC<SelectCardProps> = ({
  label,
  image,
  icon,
  iconColor,
  isSelected,
  onPress,
  size = 'medium',
  variant = 'default',
  delay = 0,
}) => {
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.cardSmall;
      case 'large':
        return styles.cardLarge;
      default:
        return styles.cardMedium;
    }
  };

  const getImageSize = () => {
    switch (size) {
      case 'small':
        return { width: 50, height: 50 };
      case 'large':
        return { width: 100, height: 100 };
      default:
        return { width: 70, height: 70 };
    }
  };

  // Gender variant
  if (variant === 'gender') {
    return (
      <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
        <AnimatedTouchable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={[
            styles.genderCard,
            isSelected && styles.genderCardSelected,
            animatedStyle,
          ]}
        >
          {image && (
            <Image
              source={image}
              style={styles.genderImage}
              resizeMode="contain"
            />
          )}
        </AnimatedTouchable>
      </Animated.View>
    );
  }

  // Diet variant
  if (variant === 'diet') {
    return (
      <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
        <AnimatedTouchable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={[
            styles.dietCard,
            isSelected && styles.dietCardSelected,
            animatedStyle,
          ]}
        >
          {image && (
            <Image
              source={image}
              style={[styles.dietImage, isSelected && styles.dietImageSelected]}
              resizeMode="contain"
            />
          )}
          <Text
            style={[styles.dietLabel, isSelected && styles.dietLabelSelected]}
          >
            {label}
          </Text>
        </AnimatedTouchable>
      </Animated.View>
    );
  }

  // Cuisine variant
  if (variant === 'cuisine') {
    return (
      <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
        <AnimatedTouchable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          style={[
            styles.cuisineCard,
            isSelected && styles.cuisineCardSelected,
            animatedStyle,
          ]}
        >
          {image && (
            <Image
              source={image}
              style={[
                styles.cuisineImage,
                isSelected && styles.cuisineImageSelected,
              ]}
              resizeMode="cover"
            />
          )}
          <View
            style={[
              styles.cuisineLabelContainer,
              isSelected && styles.cuisineLabelContainerSelected,
            ]}
          >
            <Text
              style={[
                styles.cuisineLabel,
                isSelected && styles.cuisineLabelSelected,
              ]}
            >
              {label}
            </Text>
          </View>
        </AnimatedTouchable>
      </Animated.View>
    );
  }

  // Default variant
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[
          styles.card,
          getSizeStyles(),
          isSelected && styles.cardSelected,
          animatedStyle,
        ]}
      >
        {image && (
          <Image
            source={image}
            style={[styles.cardImage, getImageSize()]}
            resizeMode="contain"
          />
        )}
        {icon && !image && (
          <Ionicons
            name={icon}
            size={getImageSize().width * 0.6}
            color={isSelected ? Colors.white : iconColor || Colors.primaryColor}
          />
        )}
        <Text
          style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}
        >
          {label}
        </Text>
      </AnimatedTouchable>
    </Animated.View>
  );
};

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    // Default card styles
    card: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surface,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: Colors.borderLight,
      padding: 12,
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cardSmall: {
      width: 90,
      height: 90,
    },
    cardMedium: {
      width: 110,
      height: 110,
    },
    cardLarge: {
      width: 140,
      height: 140,
    },
    cardSelected: {
      backgroundColor: '#1857C1',
    },
    cardImage: {
      marginBottom: 8,
    },
    cardLabel: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
      textAlign: 'center',
    },
    cardLabelSelected: {
      color: 'white',
    },

    // Gender card styles
    genderCard: {
      width: 160,
      height: 160,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      overflow: 'hidden',
      backgroundColor: Colors.surface,
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
      position: 'relative',
    },
    genderCardSelected: {
      backgroundColor: '#1857C1',
    },
    genderImage: {
      width: '100%',
      height: 180,
    },

    // Diet card styles
    dietCard: {
      width: 80,
      height: 130,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.surface,
      borderRadius: 16,
      borderWidth: 3,
      borderColor: 'transparent',
      padding: 4,
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    dietCardSelected: {
      backgroundColor: '#1857C1',
    },
    dietImage: {
      width: 65,
      height: 90,
      borderRadius: 10,
      marginBottom: 8,
      backgroundColor: Colors.primaryBg,
    },
    dietImageSelected: {
      backgroundColor: Colors.white,
    },
    dietLabel: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
      textAlign: 'center',
    },
    dietLabelSelected: {
      color: 'white',
    },

    // Cuisine card styles
    cuisineCard: {
      width: 110,
      height: 135,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: Colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    cuisineCardSelected: {
      backgroundColor: '#1857C1',
    },
    cuisineImage: {
      width: 90,
      borderRadius: 12,
      marginBottom: 4,
      backgroundColor: Colors.primaryBg,
      height: 90,
    },
    cuisineImageSelected: {
      backgroundColor: Colors.white,
    },
    cuisineLabelContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      backgroundColor: 'transparent',
    },
    cuisineLabelContainerSelected: {
      backgroundColor: 'transparent',
    },
    cuisineLabel: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
      textAlign: 'center',
    },
    cuisineLabelSelected: {
      color: 'white',
    },
  });

export default SelectCard;
