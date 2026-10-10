import LinearGradient from '@/components/base/LinearGradient';
import BackButton from '@/components/ui/buttons/back-button';
import { IconButton } from '@/components/ui/buttons/button';
import { FONT_FAMILIES } from '@/constants/typography';
import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

interface QuestHeaderProps {
  title: string;
  description: string;
  gradientColors: [string, string];
  imageSource: ImageSourcePropType;
  angle?: number;
  onBackPress: () => void;
  insetTop: number;
}

export const QuestHeader: React.FC<QuestHeaderProps> = ({
  title,
  description,
  gradientColors,
  imageSource,
  angle = 135,
  onBackPress,
  insetTop,
}) => {
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        useAngle={true}
        angle={angle}
        colors={gradientColors}
        style={[styles.contentWrapper, { paddingTop: insetTop }]}
      >
        <View style={styles.headerContent}>
          <BackButton onPress={onBackPress} iconColor="white" />
          <View style={styles.titleContainer}>
            <Text
              style={styles.titleText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </View>
          <View style={{ width: 18 }} />
        </View>

        <View style={styles.contentContainer} pointerEvents="none">
          <View style={styles.imageWithTextContainer}>
            <View style={styles.leftTextContent}>
              <Text
                style={styles.descriptionTextWithImage}
                numberOfLines={8}
                adjustsFontSizeToFit
              >
                {description}
              </Text>
            </View>

            <View style={styles.imageContainer}>
              <Image
                source={imageSource}
                style={[styles.image, { width: 150, height: 150 }]}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  contentWrapper: {
    flex: 1,
    paddingBottom: 24,
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
  titleContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 6,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
  },
  contentContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  imageWithTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  leftTextContent: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'center',
  },
  descriptionTextWithImage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 1)',
    letterSpacing: -0.11,
    fontWeight: '400',
    fontFamily: FONT_FAMILIES.nunitoRegular,
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
  },
});
