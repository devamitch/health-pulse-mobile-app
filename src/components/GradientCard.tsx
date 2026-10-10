import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import Stars from '@/icons/stars';
import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from './base/LinearGradient';

interface GradientCardProps {
  colors: (string | number)[];
  text: string;
  angle?: number;
  textColor?: string;
  style?: ViewStyle;
  textComponent?: string;
  title?: string;
  imageComponent?: React.ReactNode;
  isCircleVisible?: boolean;
  onOpenPress?: () => void;
  onInfoPress?: () => void;
  isOpenButtonVisible?: boolean;
  isCompleted?: boolean;
  /** XP amount to display in the badge (e.g., 50 shows "+50 XP") */
  xpAmount?: number;
  /** Custom XP badge colors for the gradient background */
  xpBadgeColors?: string[];
}

const GradientCard: React.FC<GradientCardProps> = ({
  colors,
  text,
  angle = 0,
  textColor = 'white',
  style,
  onOpenPress,
  imageComponent,
  textComponent,
  onInfoPress,
  isOpenButtonVisible,
  title = `Let's Get Started!`,
  isCircleVisible = true,
  isCompleted,
  xpAmount,
  xpBadgeColors = ['#FFD700', '#FFA500'],
}) => {
  const { DEffect } = useAppTheme();

  const showXpBadge = typeof xpAmount === 'number' && xpAmount > 0;

  return (
    <LinearGradient
      useAngle={true}
      angle={angle}
      colors={colors}
      style={[styles.container, style, DEffect]}
    >
      {/* XP Badge - Positioned at top right */}

      <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
        {isCompleted ? (
          <View style={[styles.buttons, { backgroundColor: 'transparent' }]}>
            <Ionicons name="checkmark-circle" size={24} color="white" />
          </View>
        ) : isOpenButtonVisible ? (
          <View style={[styles.buttons, { backgroundColor: 'transparent' }]} />
        ) : null}
        <View style={styles.titleContainer}>
          <Text style={[styles.titleText, { color: textColor }]}>{text}</Text>
        </View>
        {isOpenButtonVisible ? (
          <RectButton onPress={() => onOpenPress?.()} style={styles.buttons}>
            <Stars height={20} width={20} />
          </RectButton>
        ) : isCompleted ? (
          <View style={[styles.buttons, { backgroundColor: 'transparent' }]} />
        ) : null}
      </View>
      <View
        style={{ flexDirection: 'row', paddingLeft: 30, position: 'relative' }}
      >
        <View style={{ minHeight: 150, width: '60%', paddingBottom: 20 }}>
          <Text style={[styles.secondaryText, { color: textColor }]}>
            {title}
          </Text>
          <Text style={[styles.descriptionText, { color: textColor }]}>
            {textComponent}
          </Text>
          {showXpBadge && (
            <View style={styles.xpBadgeContainer}>
              <LinearGradient
                colors={xpBadgeColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.xpBadge}
              >
                <View style={styles.xpBadgeInner}>
                  <Text style={styles.xpBadgeText}> Earn {xpAmount}</Text>
                  <Text style={styles.xpLabel}>XP</Text>
                  <Image
                    source={require('@/assets/images/coin-2.png')}
                    style={styles.coinIcon}
                  />
                </View>
              </LinearGradient>
              {/* Glow effect */}
            </View>
          )}
        </View>
        <View
          style={{
            bottom: 0,
            flexDirection: 'row',
            position: 'absolute',
            right: -125,
          }}
        >
          {isCircleVisible && (
            <View
              style={[
                styles.circle,
                { height: 125, width: 125, borderTopLeftRadius: 125, right: 0 },
              ]}
            >
              <View
                style={[
                  styles.circle,
                  { height: 75, width: 75, borderTopLeftRadius: 75 },
                ]}
              />
            </View>
          )}
          <View style={styles.component}>{imageComponent}</View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 34,
    paddingTop: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  buttons: {
    height: 40,
    width: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    textAlign: 'center',
    alignSelf: 'center',
  },
  subtitleText: {
    paddingLeft: 30,
    fontFamily: FONT_FAMILIES.nunitoBold,
    fontSize: 16,
    paddingBottom: 10,
  },
  secondaryText: {
    fontFamily: FONT_FAMILIES.nunitoBold,
    fontSize: 14,
    paddingVertical: 5,
  },
  descriptionText: {
    fontFamily: FONT_FAMILIES.nunitoMedium,
    fontSize: 14,
    paddingVertical: 5,
  },
  circle: {
    borderColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 30,
    borderLeftWidth: 30,
    marginLeft: 'auto',
    marginTop: 'auto',
  },
  component: {
    height: 125,
    width: 125,
    right: 120,
  },
  titleContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginRight: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
    minWidth: '50%',
    marginLeft: 'auto',
    fontFamily: FONT_FAMILIES.nunitoBold,
  },
  star: {
    height: 20,
    width: 20,
    marginHorizontal: 10,
  },
  coinIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  // XP Badge Styles
  xpBadgeContainer: {
    // position: 'absolute',
    // top: 12,
    // right: 16,
    // zIndex: 10,
    width: 120,
    marginTop: 5,
  },
  xpBadge: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
    shadowColor: '#f1f1f1',
    borderColor: '#f1f1f1',
    // borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  xpBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpBadgeText: {
    fontSize: 12,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    fontWeight: '800',
    color: '#ddd',
    letterSpacing: 0.5,
  },
  xpLabel: {
    fontSize: 11,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    fontWeight: '700',
    color: '#f1f1f1',
    marginTop: 1,
  },
  xpGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    zIndex: -1,
  },
});

export default GradientCard;
