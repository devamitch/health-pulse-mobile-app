import { ColorScheme } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolate,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';

interface Feature {
  id: string;
  name: string;
  description: string;
}

interface Plan {
  id: string;
  title: string;
  color?: string;
  features: string[];
}

interface FeatureComparisonTableProps {
  plans: Plan[];
  features: Feature[];
  theme: ColorScheme;
  scrollY?: SharedValue<number>;
}

const FeatureComparisonTable: React.FC<FeatureComparisonTableProps> = ({
  plans,
  features,
  theme,
  scrollY = useSharedValue(0),
}) => {
  // Animation values for each feature row
  const rowAnimations = features.map(() => useSharedValue(0));

  // Start staggered animations
  React.useEffect(() => {
    features.forEach((_, index) => {
      rowAnimations[index].value = withDelay(
        index * 100,
        withTiming(1, { duration: 500 }),
      );
    });
  }, []);

  // Header parallax effect
  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, 200],
      [0, 20],
      Extrapolate.CLAMP,
    );

    return {
      transform: [{ translateY }],
      opacity: interpolate(
        scrollY.value,
        [0, 100],
        [1, 0.9],
        Extrapolate.CLAMP,
      ),
    };
  });

  // Generate feature row styles with staggered animations
  const getRowStyle = (index: number) => {
    return useAnimatedStyle(() => {
      return {
        opacity: rowAnimations[index].value,
        transform: [
          {
            translateY: interpolate(
              rowAnimations[index].value,
              [0, 1],
              [20, 0],
              Extrapolate.CLAMP,
            ),
          },
        ],
      };
    });
  };

  // Function to check if a plan includes a feature
  const planHasFeature = (plan: Plan, featureId: string) => {
    const featureName = features.find(f => f.id === featureId)?.name;
    return plan.features.some(
      f =>
        f.toLowerCase().includes(featureId.toLowerCase()) ||
        f.toLowerCase().includes(featureName?.toLowerCase() || ''),
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.tableTitle, { color: theme.textColor }]}>
        Feature Comparison
      </Text>

      {/* Table Header */}
      <Animated.View style={[styles.tableHeader, headerStyle]}>
        <View style={styles.featureHeaderCell}>
          <Text style={[styles.featureHeaderText, { color: theme.textColor }]}>
            Feature
          </Text>
        </View>

        {plans.map(plan => (
          <View key={plan.id} style={styles.planHeaderCell}>
            <Text
              style={[
                styles.planHeaderText,
                { color: plan.color || theme.primaryColor },
              ]}
            >
              {plan.title}
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* Table Rows */}
      {features.map((feature, index) => (
        <Animated.View
          key={feature.id}
          style={[
            styles.tableRow,
            {
              backgroundColor:
                index % 2 === 0 ? theme.greyColor100 : 'transparent',
            },
            getRowStyle(index),
          ]}
        >
          <View style={styles.featureCell}>
            <Text style={[styles.featureName, { color: theme.textColor }]}>
              {feature.name}
            </Text>
            <Text
              style={[styles.featureDescription, { color: theme.greyColor700 }]}
            >
              {feature.description}
            </Text>
          </View>

          {plans.map(plan => {
            const hasFeature = planHasFeature(plan, feature.id);

            // Create a pulse animation for the check mark
            const pulseValue = useSharedValue(1);

            React.useEffect(() => {
              if (hasFeature) {
                pulseValue.value = withSequence(
                  withDelay(
                    index * 100 + 500,
                    withTiming(1.3, { duration: 200 }),
                  ),
                  withTiming(1, { duration: 200 }),
                );
              }
            }, []);

            const pulseStyle = useAnimatedStyle(() => {
              return {
                transform: [{ scale: pulseValue.value }],
              };
            });

            return (
              <View key={plan.id} style={styles.planFeatureCell}>
                {hasFeature ? (
                  <Animated.View style={pulseStyle}>
                    <Icon
                      name="check-circle"
                      size={20}
                      color={plan.color || theme.greenColor}
                    />
                  </Animated.View>
                ) : (
                  <Icon name="minus" size={20} color={theme.greyColor400} />
                )}
              </View>
            );
          })}
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  featureHeaderCell: {
    flex: 2,
    paddingHorizontal: 8,
  },
  featureHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  planHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  planHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  featureCell: {
    flex: 2,
    paddingHorizontal: 8,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
  },
  planFeatureCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FeatureComparisonTable;
