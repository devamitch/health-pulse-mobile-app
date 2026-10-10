import { CameraModal } from '@/components/home/activityProgress/camera-modal';
import { FONT_FAMILIES } from '@/constants/typography';
import { SpecialQuestCardProps } from '@/types/home/activityProgress';

import React, {  useState } from 'react';
import {
Text,
TouchableOpacity,
View,
} from 'react-native';
import Animated, {
FadeInDown,
useAnimatedStyle,
useSharedValue,
withRepeat,
withSequence,
withTiming,
} from 'react-native-reanimated';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


export const SpecialQuestCard: React.FC<SpecialQuestCardProps> = ({
  Colors,
  DESIGN,
}) => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const currentMonth = new Date().getMonth();
  let season = 'Spring';

  // Determine season based on month
  if (currentMonth >= 2 && currentMonth <= 4) season = 'Spring';
  else if (currentMonth >= 5 && currentMonth <= 7) season = 'Summer';
  else if (currentMonth >= 8 && currentMonth <= 10) season = 'Autumn';
  else season = 'Winter';

  const seasonColors: Record<
    string,
    { gradient: string[]; icon: string; emoji: string }
  > = {
    Spring: {
      gradient: ['#FFB6C1', '#FFD700', '#98FB98'],
      icon: 'flower',
      emoji: '🌸',
    },
    Summer: {
      gradient: ['#19789d', '#FFD700', '#FF8C00'],
      icon: 'white-balance-sunny',
      emoji: '☀️',
    },
    Autumn: {
      gradient: ['#D2691E', '#FF8C00', '#FFD700'],
      icon: 'leaf',
      emoji: '🍂',
    },
    Winter: {
      gradient: ['#3f90b0', '#4ea2bd', '#b2d2ee'],
      icon: 'snowflake',
      emoji: '❄️',
    },
  };

  const seasonConfig = seasonColors[season];

  const pulseAnimation = useSharedValue(1);

  React.useEffect(() => {
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 }),
      ),
      -1,
      true,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  return (
    <>
      <Animated.View entering={FadeInDown.delay(300).springify()}>
        <View
          style={{
            marginHorizontal: DESIGN.spacing.md,
            marginBottom: DESIGN.spacing.lg,
            borderRadius: DESIGN.radius.xl,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: DESIGN.spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <Animated.View style={pulseStyle}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: DESIGN.radius.md,
                  backgroundColor: seasonConfig.gradient[1] + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: DESIGN.spacing.md,
                }}
              >
                <Text style={{ fontSize: 28 }}>{seasonConfig.emoji}</Text>
              </View>
            </Animated.View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  DESIGN.typography.subtitle,
                  { color: Colors.textColor },
                ]}
              >
                {season} Quest
              </Text>
              <Text
                style={[
                  DESIGN.typography.caption,
                  { color: Colors.textSecondary },
                ]}
              >
                30-day special challenge
              </Text>
            </View>
            <View
              style={{
                backgroundColor: Colors.warning + '20',
                paddingHorizontal: DESIGN.spacing.sm,
                paddingVertical: 4,
                borderRadius: DESIGN.radius.full,
              }}
            >
              <Text
                style={[DESIGN.typography.micro, { color: Colors.warning }]}
              >
                NEW
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={{ padding: DESIGN.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Icon
                name="calendar-star"
                size={22}
                color={seasonConfig.gradient[1]}
                style={{ marginRight: DESIGN.spacing.sm, marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    DESIGN.typography.body,
                    {
                      color: Colors.textColor,
                      fontFamily: FONT_FAMILIES.nunitoSemiBold,
                      marginBottom: 4,
                    },
                  ]}
                >
                  30-Day {season} Transformation
                </Text>
                <Text
                  style={[
                    DESIGN.typography.caption,
                    { color: Colors.textSecondary },
                  ]}
                >
                  Complete daily challenges with photo verification to earn
                  exclusive seasonal rewards and badges.
                </Text>
              </View>
            </View>

            {/* Rewards */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: DESIGN.spacing.md,
                paddingTop: DESIGN.spacing.md,
                borderTopWidth: 1,
                borderTopColor: Colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text
                  style={[
                    DESIGN.typography.caption,
                    {
                      color: Colors.textSecondary,
                      marginLeft: 4,
                    },
                  ]}
                >
                  Exclusive Rewards
                </Text>
              </View>
              <View
                style={{
                  marginLeft: DESIGN.spacing.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Icon name="trophy" size={16} color="#FFD700" />
                <Text
                  style={[
                    DESIGN.typography.caption,
                    {
                      color: Colors.textSecondary,
                      marginLeft: 4,
                    },
                  ]}
                >
                  Seasonal Badges
                </Text>
              </View>
            </View>

            {/* Coming Soon Button */}
            <TouchableOpacity
              onPress={() => setShowComingSoon(true)}
              activeOpacity={0.8}
              style={{
                marginTop: DESIGN.spacing.md,
                backgroundColor: seasonConfig.gradient[1] + '15',
                paddingVertical: 12,
                borderRadius: DESIGN.radius.md,

                borderColor: seasonConfig.gradient[1] + '30',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon
                name="camera-outline"
                size={20}
                color={seasonConfig.gradient[1]}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  DESIGN.typography.body,
                  { color: seasonConfig.gradient[1] },
                ]}
              >
                Camera Challenge
              </Text>
              <View
                style={{
                  marginLeft: 8,
                  backgroundColor: Colors.warning + '20',
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: FONT_FAMILIES.nunitoBold,
                    color: Colors.warning,
                  }}
                >
                  SOON
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Coming Soon Modal */}
      <CameraModal
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        theme={{ Colors }}
        categoryColor={seasonConfig.gradient[1]}
      />
    </>
  );
};
