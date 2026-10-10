import { ColorScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import React, { useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Animated from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TaskCardData } from '../types';

interface TaskCardProps {
  data: TaskCardData;
  onSwipeLeft?: () => void;
  marginHorizontal?: number;
  swipable?: boolean;
}

const TaskCard = React.memo<TaskCardProps>(
  ({ data, onSwipeLeft, marginHorizontal = 0, swipable = false }) => {
    const swipeableRef = useRef<Swipeable>(null);
    const { Colors } = useAppTheme();

    const isCompleted = data.completed || false;

    const styles = createStyles(
      Colors,
      data.accentColor,
      marginHorizontal,
      isCompleted,
    );

    const renderLeftActions = () => {
      if (isCompleted) return null;

      return (
        <View style={styles.swipeActionContainer}>
          <View style={styles.swipeAction}>
            <View style={styles.checkmarkCircle}>
              <MaterialCommunityIcons
                name="check-bold"
                size={24}
                color={Colors.white}
              />
            </View>
          </View>
        </View>
      );
    };

    const handleSwipeableOpen = (direction: 'left' | 'right') => {
      if (direction === 'left' && onSwipeLeft && !isCompleted) {
        setTimeout(() => {
          onSwipeLeft();
          swipeableRef.current?.close();
        }, 200);
      }
    };

    if (!swipable)
      return (
        <Animated.View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.content}>
              <View style={styles.imageContainer}>
                <View style={styles.imageBg} />
                <Image
                  source={data.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.textContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {data.title}
                  </Text>
                </View>

                <Text style={styles.subtitle} numberOfLines={2}>
                  {data.subtitle}
                </Text>

                <View style={styles.durationRow}>
                  <Text style={styles.duration}>{data.duration}</Text>
                </View>

                <View style={styles.ctaButton}>
                  <Text style={styles.ctaText}>{data.buttonText}</Text>
                  <View style={styles.coinContainer}>
                    <Image
                      source={require('@/assets/images/coin-2.png')}
                      style={styles.coinIcon}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Completed Overlay */}
            {/* {isCompleted && <View style={styles.completedOverlay} />} */}
          </View>
        </Animated.View>
      );
    return (
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        onSwipeableOpen={handleSwipeableOpen}
        leftThreshold={80}
        overshootLeft={false}
        enabled={!isCompleted}
        friction={2}
      >
        <Animated.View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.content}>
              <View style={styles.imageContainer}>
                <View style={styles.imageBg} />
                <Image
                  source={data.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.textContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {data.title}
                  </Text>
                </View>

                <Text style={styles.subtitle} numberOfLines={2}>
                  {data.subtitle}
                </Text>

                <View style={styles.durationRow}>
                  <Text style={styles.duration}>{data.duration}</Text>
                </View>

                <View style={styles.ctaButton}>
                  <Text style={styles.ctaText}>{data.buttonText}</Text>
                  <View style={styles.coinContainer}>
                    <Image
                      source={require('@/assets/images/coin-2.png')}
                      style={styles.coinIcon}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Completed Overlay */}
            {isCompleted && <View style={styles.completedOverlay} />}
          </View>
        </Animated.View>
      </Swipeable>
    );
  },
);

TaskCard.displayName = 'TaskCard';

const createStyles = (
  Colors: ColorScheme,
  accentColor: string,
  marginHorizontal: number,
  isCompleted: boolean,
) =>
  StyleSheet.create({
    cardContainer: {
      flex: 1,
      marginHorizontal: marginHorizontal,
    },
    card: {
      width: '100%',
      backgroundColor: Colors.white,
      borderRadius: 28,
      padding: 16,
      elevation: 8,
      shadowColor: Colors.isDark ? '#000' : Colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: Colors.isDark ? 0.2 : 0.08,
      shadowRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      borderWidth: marginHorizontal === 0 ? 1 : 0,
      borderColor: Colors.isDark ? Colors.borderDark : Colors.borderLight,
    },
    accentBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: `${accentColor}${Colors.isDark ? '40' : '20'}`,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    imageContainer: {
      width: 120,
      height: 120,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      borderRadius: 20,
      overflow: 'hidden',
    },
    imageBg: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    image: {
      width: '100%',
      height: '100%',
      zIndex: 1,
    },
    textContent: {
      flex: 1,
      gap: 4,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 4,
    },
    title: {
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoBold,
      flex: 1,
      color: accentColor,
    },
    completedBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${accentColor}${Colors.isDark ? '30' : '15'}`,
    },
    subtitle: {
      fontSize: 10,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: '#808080',
      lineHeight: 14,
    },
    durationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 2,
    },
    duration: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
    },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
      paddingVertical: 4,
      borderRadius: 20,
      gap: 4,
      alignSelf: 'flex-start',
      elevation: 3,
      marginTop: 4,
      shadowColor: Colors.isDark ? '#000' : accentColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: Colors.isDark ? 0.3 : 0.15,
      shadowRadius: 4,
      backgroundColor: accentColor,
    },
    ctaText: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: 'rgba(255, 255, 255, 1)',
      lineHeight: 16,
    },
    coinContainer: {
      width: 22,
      height: 22,
      backgroundColor: Colors.isDark
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(255, 255, 255, 0.25)',
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    coinIcon: {
      width: 20,
      height: 20,
      resizeMode: 'contain',
    },
    swipeActionContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      marginRight: 12,
    },
    swipeAction: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      borderRadius: 28,
      backgroundColor:
        marginHorizontal !== 0
          ? `${accentColor}${Colors.isDark ? '30' : '15'}`
          : Colors.white,
      borderWidth: marginHorizontal === 0 ? 1 : 0,
      borderColor: Colors.isDark ? Colors.borderDark : Colors.border,
    },
    checkmarkCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: Colors.isDark ? '#000' : accentColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: Colors.isDark ? 0.3 : 0.2,
      shadowRadius: 8,
      backgroundColor: accentColor,
    },
    completedOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: Colors.isDark
        ? 'rgba(0, 0, 0, 0.4)'
        : 'rgba(255, 255, 255, 0.4)',
      borderRadius: 28,
    },
  });

export default TaskCard;
