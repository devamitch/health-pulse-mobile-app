
import { FONT_FAMILIES } from '@/constants/typography';
import React, { useState }  from 'react';
import {

  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CameraModal } from './camera-modal';
import { BoostChallengeCardProps, ProgressType } from '@/types/home/activityProgress';


export const BoostChallengeCard: React.FC<BoostChallengeCardProps> = ({
  color,
  gradientColors,
  type,
  Colors,
  DESIGN,
}) => {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const boostTasks: Record<
    ProgressType,
    { title: string; description: string; xp: number; icon: string }
  > = {
    diet: {
      title: 'Perfect Meal Photo',
      description: 'Capture your balanced meal with proper portions.',
      xp: 500,
      icon: 'camera',
    },
    activity: {
      title: 'Workout Proof',
      description: 'Record your complete workout session.',
      xp: 500,
      icon: 'camera-burst',
    },
    stress: {
      title: 'Meditation Sanctuary',
      description: 'Share your peaceful meditation space.',
      xp: 500,
      icon: 'camera',
    },
  };

  const task = boostTasks[type];

  return (
    <>
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <View
          style={{
            marginHorizontal: DESIGN.spacing.md,
            marginBottom: DESIGN.spacing.lg,
            borderRadius: DESIGN.radius.xl,
            overflow: 'hidden',
            ...DESIGN.shadow.medium,
            backgroundColor: DESIGN.colors.gaming.cardBg,

            borderColor: color + '30',
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
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: DESIGN.radius.md,
                backgroundColor: color + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: DESIGN.spacing.md,
              }}
            >
              <Icon name="rocket-launch" size={24} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  DESIGN.typography.subtitle,
                  { color: Colors.textColor },
                ]}
              >
                Boost Challenge
              </Text>
              <Text
                style={[
                  DESIGN.typography.caption,
                  { color: Colors.textSecondary },
                ]}
              >
                Camera verification • 10x XP
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#FFD700' + '20',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: DESIGN.radius.full,

                borderColor: '#FFD700' + '40',
              }}
            >
              <Text style={[DESIGN.typography.micro, { color: '#FFD700' }]}>
                ELITE
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={{ padding: DESIGN.spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: DESIGN.radius.sm,
                  backgroundColor: color + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: DESIGN.spacing.md,
                }}
              >
                <Icon name={task.icon} size={20} color={color} />
              </View>
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
                  {task.title}
                </Text>
                <Text
                  style={[
                    DESIGN.typography.caption,
                    { color: Colors.textSecondary },
                  ]}
                >
                  {task.description}
                </Text>
              </View>
            </View>

            {/* Coming Soon Button */}
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
              <TouchableOpacity
                onPress={() => setShowComingSoon(true)}
                activeOpacity={0.8}
                style={{ flex: 1, marginRight: DESIGN.spacing.sm }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                    borderRadius: DESIGN.radius.md,
                    backgroundColor: color + '15',

                    borderColor: color + '30',
                  }}
                >
                  <Icon
                    name="camera-outline"
                    size={18}
                    color={color}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[DESIGN.typography.body, { color: color }]}>
                    Open Camera
                  </Text>
                  <View
                    style={{
                      marginLeft: 6,
                      backgroundColor: Colors.warning + '20',
                      paddingHorizontal: 4,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        fontFamily: FONT_FAMILIES.nunitoBold,
                        color: Colors.warning,
                      }}
                    >
                      SOON
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <View
                style={{
                  backgroundColor: '#FFD700' + '20',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: DESIGN.radius.full,
                  flexDirection: 'row',
                  alignItems: 'center',

                  borderColor: '#FFD700' + '30',
                }}
              >
                <Icon name="lightning-bolt" size={16} color="#FFD700" />
                <Text
                  style={[
                    DESIGN.typography.body,
                    {
                      color: '#FFD700',
                      fontFamily: FONT_FAMILIES.nunitoBold,
                      marginLeft: 4,
                      fontSize: 14,
                    },
                  ]}
                >
                  +{task.xp}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Coming Soon Modal */}
      <CameraModal
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        theme={{ Colors }}
        categoryColor={color}
      />
    </>
  );
};