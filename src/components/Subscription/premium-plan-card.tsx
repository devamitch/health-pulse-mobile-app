'use client';

import LinearGradient from '@/components/base/LinearGradient';
import type React from 'react';
import { useEffect } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface PremiumPlanCardProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  gradientColors?: string[];
  accentColor?: string;
}

const PremiumPlanCard: React.FC<PremiumPlanCardProps> = ({
  title,
  price,
  period,
  features,
  isPopular = false,
  isSelected,
  onSelect,
  gradientColors = ['#6366F1', '#8B5CF6'],
  accentColor = '#6366F1',
}) => {
  const scaleAnim = new Animated.Value(1);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (isSelected) {
      Animated.spring(scaleAnim, {
        toValue: 1.03,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Start pulse animation for popular card
      if (isPopular) {
        startPulseAnimation();
      }
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [isSelected]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        {
          transform: [{ scale: scaleAnim }],
          borderColor: isSelected ? accentColor : '#E2E8F0',
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onSelect}
        style={styles.touchable}
      >
        {isPopular && (
          <Animated.View
            style={[
              styles.popularBadge,
              {
                backgroundColor: accentColor,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </Animated.View>
        )}

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{price}</Text>
            <Text style={styles.period}>/{period}</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={accentColor}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <LinearGradient
          colors={isSelected ? gradientColors : ['#F9FAFB', '#F9FAFB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.selectButton,
            { borderColor: isSelected ? 'transparent' : accentColor },
          ]}
        >
          <Text
            style={[
              styles.selectButtonText,
              { color: isSelected ? '#FFFFFF' : accentColor },
            ]}
          >
            {isSelected ? 'Selected' : 'Select Plan'}
          </Text>
          {isSelected && (
            <MaterialCommunityIcons
              name="check"
              size={20}
              color="#FFFFFF"
              style={{ marginLeft: 8 }}
            />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  selectedContainer: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  touchable: {
    padding: 20,
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: -30,
    backgroundColor: '#6366F1',
    paddingHorizontal: 30,
    paddingVertical: 5,
    transform: [{ rotate: '45deg' }],
    width: 140,
    alignItems: 'center',
    zIndex: 10,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#6366F1',
  },
  period: {
    fontSize: 16,
    color: '#718096',
    marginLeft: 2,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 10,
  },
  featureText: {
    fontSize: 15,
    color: '#4A5568',
    flex: 1,
  },
  selectButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PremiumPlanCard;
