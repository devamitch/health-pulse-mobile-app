import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { useCardSwipeAnimation } from '@/hooks/useAnimations';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

interface SubscriptionPlan {
  id: string;
  title: string;
  price: string;
  period: string;
  features: string[];
  isFree: boolean;
  popular?: boolean;
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  index: number;
  isSelected: boolean;
  isActive: boolean;
  onSelect: () => void;
  theme: ColorScheme;
  elevation: ElevationScheme;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  plan,
  index,
  isSelected,
  isActive,
  onSelect,
  theme,
  elevation,
}) => {
  const { style, handleSwipeGesture } = useCardSwipeAnimation(index);

  return (
    <PanGestureHandler
      onGestureEvent={event =>
        handleSwipeGesture(event.nativeEvent.translationX)
      }
    >
      <Animated.View
        style={[
          styles.planCard,
          {
            backgroundColor: isSelected ? theme.primaryColor : theme.white,
            borderColor: isSelected ? theme.primaryColor : theme.greyColor400,
            ...elevation,
          },
          style,
        ]}
      >
        <TouchableOpacity
          style={styles.planCardContent}
          onPress={onSelect}
          activeOpacity={0.9}
          disabled={isActive}
        >
          <View style={styles.planHeader}>
            <Text
              style={[
                styles.planName,
                { color: isSelected ? theme.white : theme.textColor },
              ]}
            >
              {plan.title}
            </Text>

            {plan.popular && (
              <View
                style={[
                  styles.popularBadge,
                  { backgroundColor: theme.secondaryColor },
                ]}
              >
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
            )}

            {isActive && (
              <View
                style={[
                  styles.activeBadge,
                  { backgroundColor: theme.greenColor },
                ]}
              >
                <Text style={styles.activeText}>ACTIVE</Text>
              </View>
            )}
          </View>

          <View style={styles.priceContainer}>
            <Text
              style={[
                styles.price,
                { color: isSelected ? theme.white : theme.textColor },
              ]}
            >
              {plan.price}
            </Text>
            {!plan.isFree && (
              <Text
                style={[
                  styles.period,
                  { color: isSelected ? theme.white : theme.greyColor700 },
                ]}
              >
                /{plan.period}
              </Text>
            )}
          </View>

          <View style={styles.featuresContainer}>
            {plan.features.map((feature, idx) => (
              <View key={idx} style={styles.featureItem}>
                <MaterialIcon
                  name="check-circle"
                  size={16}
                  color={isSelected ? theme.white : theme.greenColor}
                  style={styles.featureIcon}
                />
                <Text
                  style={[
                    styles.featureText,
                    { color: isSelected ? theme.white : theme.textColor },
                  ]}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {isSelected && !isActive && (
            <View
              style={[
                styles.selectedIndicator,
                { backgroundColor: theme.white },
              ]}
            >
              <Text
                style={[styles.selectedText, { color: theme.primaryColor }]}
              >
                SELECTED
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  planCard: {
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  planCardContent: {
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  popularBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  popularText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 2,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
  },
  selectedIndicator: {
    marginTop: 16,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  selectedText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default SubscriptionCard;
