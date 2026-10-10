
import { FONT_FAMILIES } from '@/constants/typography';
import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';
import BaseModal from './base-modal';
import { useAppTheme } from '@/hooks/themeHook';

const { width, height } = Dimensions.get('window');

interface QuestCompletedModalProps {
  visible: boolean;
  onClose: () => void;
  questName: string;
  questType: 'diet' | 'activity' | 'stress';
  xpGained: number;
}

export const QuestCompletedModal: React.FC<QuestCompletedModalProps> = ({
  visible,
  onClose,
  questName,
  questType,
  xpGained,
}) => {
  const confettiRef = useRef<any>(null);
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    if (visible && confettiRef.current) {
      confettiRef.current.start();
    }
  }, [visible]);

  const handleContinue = () => {
    console.log('Continue button pressed, closing modal');
    onClose();
  };

  const handleShare = async () => {
    console.log('Share button pressed');
    try {
      if (viewShotRef.current) {
        // Capture the screenshot
        const uri = await viewShotRef.current.capture();
        console.log('Screenshot captured:', uri);

        // Share the screenshot
        const shareOptions = {
          title: 'Quest Completed!',
          message: `I just completed ${questName} and earned ${xpGained}xp! 🎉`,
          url: `file://${uri}`,
          type: 'image/png',
        };

        await Share.open(shareOptions);
        console.log('Share successful');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const getQuestTypeName = (): string => {
    switch (questType) {
      case 'diet':
        return 'Diet Quest';
      case 'activity':
        return 'Activity Quest';
      case 'stress':
        return 'Calm Quest';
      default:
        return 'Quest';
    }
  };
 const { Colors } = useAppTheme();
  return (
    <BaseModal
      isVisible={visible}
      onClose={onClose}
      showHeader={false}
      backdropOpacity={0.3}
    >
      <ViewShot
        ref={viewShotRef}
        options={{
          format: 'png',
          quality: 1.0,
        }}
      >
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: width / 2, y: height / 2 - 100 }}
          autoStart={false}
          fadeOut={true}
          fallSpeed={2500}
        />
        <View style={styles.content}>
          <View style={styles.badgeContainer}>
            <Image
              source={require('./../../assets/images/broch.png')}
              style={styles.badgeImage}
              resizeMode="contain"
            />
          </View>

          <Text style={[styles.taskName, { color: Colors.textColor }]}>
            {questName}
          </Text>

          <Text style={[styles.completedText, { color: Colors.textColor }]}>
            {getQuestTypeName()} Completed
          </Text>

          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>+{xpGained}xp</Text>
            <Image
              source={require('./../../assets/images/coin-2.png')}
              style={styles.coinIcon}
              resizeMode="contain"
            />
            <Text style={styles.pointsLabel}>Points Collected</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.shareButton } onPress={handleShare}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ViewShot>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  badgeContainer: {
    marginBottom: 16,
  },
  badgeImage: {
    width: 140,
    height: 140,
  },
  taskName: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: FONT_FAMILIES.nunitoMedium,
    textAlign: 'center',
    marginBottom: 8,
  },
  completedText: {
    fontSize: 24,
    fontFamily: FONT_FAMILIES.nunitoBold,
    textAlign: 'center',
    marginBottom: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  pointsText: {
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoMedium,
    color: '#1857C1',
  },
  coinIcon: {
    width: 20,
    height: 20,
  },
  pointsLabel: {
    fontSize: 14,
    fontFamily: FONT_FAMILIES.nunitoMedium,
    color: '#1857C1',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#1A1A1A',
  },
  continueButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1857C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoBold,
    color: '#FFFFFF',
  },
});
