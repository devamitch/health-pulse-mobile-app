import { ComparisonCardProps } from '@/types/home/activityProgress';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import ComparisonIcon from '@/icons/ComparisonIcon';
import ArrowUpIcon from '@/icons/ArrowUpIcon';
import ArrowDownIcon from '@/icons/ArrowDownIcon';
import { FONT_FAMILIES } from '@/constants/typography';

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  yesterdayProgress,
  todayProgress,
  color,
  gradientColors,
  Colors,
  DESIGN,
}) => {
  const change = todayProgress - yesterdayProgress;
  const isPositive = change >= 0;
  const arrowRotation = useSharedValue(0);

  useEffect(() => {
    arrowRotation.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 600 }),
        withTiming(4, { duration: 600 }),
      ),
      -1,
      true,
    );
  }, [arrowRotation]);

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(150).springify()}>
      <View
        style={{
          marginHorizontal: DESIGN.spacing.md,
          marginBottom: DESIGN.spacing.lg,
          paddingVertical: 16,
          paddingHorizontal: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 2, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 4,
          borderRadius: 30,
          backgroundColor: Colors.white,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: DESIGN.spacing.md,
            paddingBottom: DESIGN.spacing.sm,
          }}
        >
          <ComparisonIcon width={24} height={24} color={Colors.textColor} />
          <Text
            style={[
              {
                color: Colors.textColor,
                fontFamily: FONT_FAMILIES.nunitoSemiBold,
                fontSize: 14,
                lineHeight: 20,
              },
            ]}
          >
            Compared to Yesterday
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 16,
            paddingHorizontal: 24,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text
              style={[
                {
                  color: Colors.textColor,
                  fontFamily: FONT_FAMILIES.nunitoBold,
                  fontSize: 20,
                },
              ]}
            >
              {Math.round(yesterdayProgress * 100)}%
            </Text>
            <Text
              style={[
                {
                  color: '#57534E',
                  fontFamily: FONT_FAMILIES.nunitoRegular,
                  fontSize: 14,
                  marginTop: 2,
                },
              ]}
            >
              Yesterday
            </Text>
          </View>

          {isPositive ? (
            <ArrowUpIcon width={67} height={80} />
          ) : (
            <ArrowDownIcon width={67} height={80} />
          )}

          <View style={{ alignItems: 'center' }}>
            <Text
              style={[
                {
                  color: Colors.textColor,
                  fontFamily: FONT_FAMILIES.nunitoBold,
                  fontSize: 20,
                },
              ]}
            >
              {Math.round(todayProgress * 100)}%
            </Text>
            <Text
              style={[
                {
                  color: '#57534E',
                  fontFamily: FONT_FAMILIES.nunitoRegular,
                  fontSize: 14,
                  marginTop: 2,
                },
              ]}
            >
              Today
            </Text>
          </View>
        </View>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: '#4CAF50',
              fontFamily: FONT_FAMILIES.nunitoBold,
              fontSize: 18,
              lineHeight: 16,
              paddingTop: 4,
            }}
          >
            {isPositive ? '+' : ''}
            {(change * 100).toFixed(1)}% Changes
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};