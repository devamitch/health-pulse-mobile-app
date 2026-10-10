import { Colors } from '@/constants';
import React, { useEffect, useRef } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Share from 'react-native-share';
import ViewShot from 'react-native-view-shot';

const { width, height } = Dimensions.get('window');

interface TaskCompletedModalProps {
  visible: boolean;
  onClose: () => void;
  celebration?: any;
}

export const TaskCompletedModal: React.FC<TaskCompletedModalProps> = ({
  visible,
  onClose,
  celebration,
}) => {
  const insets = useSafeAreaInsets();
  const confettiRef = useRef<any>(null);
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    // Trigger confetti when modal becomes visible
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

        const taskName =
          celebration?.taskName || celebration?.title || '5 Mins Breathing';
        const points = celebration?.points || celebration?.xpEarned || 30;

        // Share the screenshot
        const shareOptions = {
          title: `${getQuestType()} Completed!`,
          message: `I just completed ${taskName} and earned ${points}xp! 🎉`,
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

  const getQuestType = (): string => {
    if (!celebration?.category) return 'Quest';
    const category = celebration.category.toLowerCase();
    if (category.includes('mind') || category.includes('calm')) {
      return 'Mind Quest';
    } else if (category.includes('activity') || category.includes('exercise')) {
      return 'Active Quest';
    } else if (category.includes('diet') || category.includes('food')) {
      return 'Diet Quest';
    }
    return 'Quest';
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <ViewShot
        ref={viewShotRef}
        options={{
          format: 'png',
          quality: 1.0,
        }}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={['#2563BF', '#0E327E']}
          style={styles.container}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
            <ConfettiCannon
              ref={confettiRef}
              count={200}
              origin={{ x: width / 2, y: height / 4 }}
              autoStart={false}
              fadeOut={true}
              fallSpeed={2500}
            />
            <View style={styles.badgeContainer}>
              <Image
                source={require('./../../assets/images/broch.png')}
                style={styles.badgeImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.taskName}>
              {celebration?.taskName ||
                celebration?.title ||
                '5 Mins Breathing'}
            </Text>

            <Text style={styles.completedText}>
              {getQuestType()} Completed!
            </Text>

            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>
                +{celebration?.points || celebration?.xpEarned || 30}xp
              </Text>
              <Image
                source={require('./../../assets/images/coin-2.png')}
                style={styles.coinIcon}
                resizeMode="contain"
              />
              <Text style={styles.pointsLabel}>Points</Text>
            </View>
          </View>

          <View
            style={[
              styles.buttonsContainer,
              { paddingBottom: insets.bottom + 20 },
            ]}
          >
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ViewShot>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    gap: 24,
  },
  badgeContainer: {
    marginBottom: 40,
  },
  badgeImage: {
    width: 266,
    height: 266,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Nunito-SemiBold',
    color: Colors.white,
    textAlign: 'center',
  },
  completedText: {
    fontSize: 28,
    fontFamily: 'Nunito-Bold',
    color: Colors.white,
    textAlign: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsText: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: Colors.white,
  },
  coinIcon: {
    width: 28,
    height: 28,
  },
  pointsLabel: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: Colors.white,
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  shareButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: Colors.white,
  },
  continueButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: '#1857C1',
  },
});
