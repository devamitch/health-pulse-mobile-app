// components/subscription/SwipeablePlanCard.tsx
import LinearGradient from '@/components/base/LinearGradient';
import { useGradientAnimation, usePulseAnimation } from '@/hooks/useAnimations';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AnimatedCard from './AnimatedCard';
import { COLORS } from './colors';

const { width } = Dimensions.get('window');

interface SwipeablePlanCardProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  isSelected: boolean;
  isActive?: boolean;
  onSelect: () => void;
  onShowDetails?: () => void;
  gradientColors?: string[];
  accentColor?: string;
  index?: number;
}

const SwipeablePlanCard: React.FC<SwipeablePlanCardProps> = ({
  title,
  price,
  period,
  features,
  isPopular = false,
  isSelected,
  isActive = false,
  onSelect,
  onShowDetails,
  gradientColors = ['#6366F1', '#8B5CF6'],
  accentColor = '#6366F1',
  index = 0,
}) => {
  // Use our custom animation hooks
  const { style: gradientStyle } = useGradientAnimation(2000);
  const { style: popularBadgeStyle } = usePulseAnimation(1, 1.05, 1000);

  // Handle swipe
  const handleSwipe = (direction: 'left' | 'right') => {
    if (onShowDetails) {
      onShowDetails();
    }
  };

  return (
    <AnimatedCard
      onPress={onSelect}
      onSwipe={handleSwipe}
      isActive={isSelected}
      index={index}
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        {
          borderColor: isSelected ? accentColor : '#E2E8F0',
          width: width - 32, // Account for container padding
        },
      ]}
      swipeThreshold={80}
      entranceDelay={150}
    >
      <View style={styles.touchable}>
        {isPopular && (
          <Animated.View
            style={[
              styles.popularBadge,
              { backgroundColor: accentColor },
              popularBadgeStyle,
            ]}
          >
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </Animated.View>
        )}

        {isActive && (
          <View style={styles.activeLabel}>
            <MaterialCommunityIcons
              name="check-circle"
              size={14}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.activeLabelText}>CURRENT PLAN</Text>
          </View>
        )}

        <Animated.View style={isSelected ? gradientStyle : undefined}>
          <LinearGradient
            colors={isSelected ? gradientColors : ['#FFFFFF', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.cardHeader, !isSelected && styles.nonSelectedHeader]}
          >
            <Text style={[styles.title, isSelected && styles.selectedText]}>
              {title}
            </Text>
            <View style={styles.priceContainer}>
              <Text
                style={[
                  styles.price,
                  { color: isSelected ? '#FFFFFF' : accentColor },
                ]}
              >
                {price}
              </Text>
              <Text style={[styles.period, isSelected && styles.selectedText]}>
                {period ? `/${period}` : ''}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.featuresContainer}>
          {features.map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
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

        <View
          style={[
            styles.selectButton,
            {
              backgroundColor: isSelected ? accentColor : 'transparent',
              borderColor: accentColor,
            },
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
        </View>

        <View style={styles.swipeHint}>
          <MaterialCommunityIcons
            name="gesture-swipe-horizontal"
            size={16}
            color="#94A3B8"
          />
          <Text style={styles.swipeHintText}>Swipe for details</Text>
        </View>
      </View>
    </AnimatedCard>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginHorizontal: 16,
    marginVertical: 10,
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
    padding: 0,
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: -30,
    backgroundColor: '#6366F1',
    paddingHorizontal: 30,
    paddingVertical: 5,
    width: 140,
    alignItems: 'center',
    zIndex: 10,
    transform: [{ rotate: '45deg' }],
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  activeLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  activeLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardHeader: {
    padding: 24,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: 120,
  },
  nonSelectedHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 12,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: '#6366F1',
  },
  period: {
    fontSize: 18,
    color: '#718096',
    marginLeft: 2,
  },
  featuresContainer: {
    padding: 24,
    flex: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#4A5568',
    flex: 1,
    lineHeight: 22,
  },
  selectButton: {
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexDirection: 'row',
  },
  selectButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  swipeHintText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 4,
  },
});

export default SwipeablePlanCard;
