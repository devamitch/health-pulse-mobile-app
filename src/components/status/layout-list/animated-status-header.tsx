import LinearGradient from '@/components/base/LinearGradient';
import BackButton from '@/components/ui/buttons/back-button';
import { IconButton } from '@/components/ui/buttons/button';
import React from 'react';
import { Platform, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import Entypo from 'react-native-vector-icons/Entypo';

interface AnimatedHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  onBackPress: () => void;
  headerStyle: Animated.AnimateStyle<any>;
  contentStyle: Animated.AnimateStyle<any>;
  titleStyle: Animated.AnimateStyle<any>;
  pulseStyle: Animated.AnimateStyle<any>;
  gradientColors: [string, string];
  angle?: number;
  insetTop: number;
  menuItems?: {
    title: string;
    onPress: () => void;
    icon?: string;
  }[];
  ImageComponent?: React.ComponentType<any>; // Made optional
  imageWidth?: number;
  imageHeight?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  menuVisible: boolean;
  setMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AnimatedStatusHeader: React.FC<AnimatedHeaderProps> = ({
  title,
  subtitle,
  description,
  onBackPress,
  headerStyle,
  contentStyle,
  titleStyle,
  pulseStyle,
  gradientColors,
  angle = 292.08,
  insetTop,
  menuItems = [],
  ImageComponent,
  imageWidth,
  imageHeight,
  imageOffsetX,
  imageOffsetY,
  menuVisible,
  setMenuVisible,
}) => {
  return (
    <Animated.View style={[styles.headerContainer, headerStyle]}>
      <StatusBar
        backgroundColor={'transparent'}
        barStyle={'light-content'}
        translucent
      />

      <Animated.View style={[StyleSheet.absoluteFillObject, pulseStyle]}>
        <LinearGradient
          useAngle={true}
          angle={angle}
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <View style={[styles.contentWrapper, { paddingTop: insetTop }]}>
        <View style={styles.headerContent}>
          <BackButton onPress={onBackPress} iconColor="white" />

          <View style={styles.titleContainer}>
            <Animated.Text
              style={[styles.titleText, titleStyle]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Animated.Text>
          </View>

          <View style={styles.menuWrapper}>
             {/* <IconButton
                        onPress={() => setMenuVisible?.(true)}
                        variant="white"
                        size={36}
                        icon={<Entypo name="dots-three-vertical" size={18} color="#FFFFFF" />}
                      /> */}
          </View>
        </View>

        <Animated.View
          style={[styles.contentContainer, contentStyle]}
          pointerEvents="none"
        >
          {subtitle && (
            <Text style={styles.subtitleText} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
          {(description || ImageComponent) && (
            <View style={styles.descriptionContainer}>
              {description && (
                <Text style={styles.descriptionText} numberOfLines={3}>
                  {description}
                </Text>
              )}
              {ImageComponent && (
                <View style={styles.imageContainer}>
                  <View style={styles.circleContainer}>
                    <View style={styles.circle1} />
                    <View style={styles.circle2} />
                  </View>

                  <ImageComponent
                    height={imageHeight || 150}
                    width={imageWidth || 150}
                    style={[
                      styles.image,
                      {
                        transform: [
                          { translateX: imageOffsetX || 0 },
                          { translateY: imageOffsetY || 0 },
                        ],
                      },
                    ]}
                  />
                </View>
              )}
            </View>
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  contentWrapper: {
    flex: 1,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    zIndex: 100,
  },
  backButton: {
    padding: 5,
    borderRadius: 30,
  },
  titleContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Nunito-SemiBold',
  },
  menuWrapper: {
    zIndex: 1001,
    width: 36,
    height: 36,
    alignItems: 'center',
  },
  menuButton: {
    borderRadius: 30,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
  },
  menuPositioningContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
  },
  menuContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.99)',
    borderRadius: 12,
    minWidth: 180,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
  },
  menuIcon: {
    marginRight: 12,
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  subtitleText: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'Nunito-SemiBold',
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  descriptionText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
    lineHeight: 20,
    fontFamily: 'Nunito-Regular',
  },
  imageContainer: {
    position: 'relative',
    height: 150,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    top: 120,
    right: -70,
    position: 'relative',
    height: 200,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  circle1: {
    position: 'absolute',
    height: 297,
    width: 297,
    borderRadius: 297 / 2,
    borderWidth: 30,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  circle2: {
    position: 'absolute',
    height: 173,
    width: 173,
    borderRadius: 173 / 2,
    borderWidth: 30,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  image: {
    zIndex: 1,
    top: -150,
  },
});
