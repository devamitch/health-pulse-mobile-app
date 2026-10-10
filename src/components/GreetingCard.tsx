import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../hooks/themeHook';
import { haptic } from '../utils';

interface GreetingCardProps {
  userName?: string;
  greeting?: string;
  photoURL?: string;
  onProfilePress: () => void;
  onCheckInPress: () => void;
  style?: ViewStyle;
  hapticLevel?: number;
}

export const GreetingCard: React.FC<GreetingCardProps> = ({
  userName = '',
  greeting = 'How are you today?',
  photoURL,
  onProfilePress,
  onCheckInPress,
  style,
  hapticLevel = 'medium',
}) => {
  const { Colors, DEffect } = useAppTheme();
  const scale = useSharedValue(1);

  const truncateUsername = (name: string): string => {
    return name && name.length > 15 ? name.slice(0, 15) + '...' : name;
  };

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
    haptic(hapticLevel);
    onCheckInPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: Colors.white,
          ...DEffect,
        },
        style,
      ]}
      entering={FadeIn.duration(800).delay(300)}
    >
      <View style={styles.header}>
        <Animated.View
          style={styles.nameContainer}
          entering={SlideInRight.duration(500).delay(500)}
        >
          <Text style={[styles.greeting, { color: Colors.textColor }]}>
            Hi {truncateUsername(userName)}
          </Text>
        </Animated.View>

        <TouchableOpacity
          onPress={() => {
            haptic(hapticLevel);
            onProfilePress();
          }}
          style={styles.profileButton}
        >
          {!photoURL ? (
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={40}
              color={Colors.textColor}
              style={styles.profileIcon}
            />
          ) : (
            <Image source={{ uri: photoURL }} style={styles.profileImage} />
          )}
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.checkInButton, animatedStyle]}>
        <TouchableOpacity
          onPress={handlePress}
          style={[styles.button, { backgroundColor: Colors.primaryColor }]}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>{greeting}</Text>
            <Image
              source={require('../assets/icons/arrow_forward.png')}
              style={styles.arrowIcon}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    borderRadius: 20,
    padding: 20,
    alignSelf: 'center',
    marginTop: -70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  nameContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    letterSpacing: 0.7,
  },
  profileButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileIcon: {
    height: 40,
    width: 40,
  },
  profileImage: {
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  checkInButton: {
    width: '100%',
  },
  button: {
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Nunito-Bold',
    fontSize: 17,
  },
  arrowIcon: {
    height: 25,
    width: 25,
  },
});
