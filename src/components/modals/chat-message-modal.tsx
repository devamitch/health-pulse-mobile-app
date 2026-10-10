import { ColorScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { hapticFeedback } from '@/utils';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import BaseModal from './base-modal';
import ModalBtttons from './modal-buttons';
import { useRef, useState } from 'react';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import ShareableCard from '../ShareableCard';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { Toast } from '@/utils/toast';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface ChatMessageModalProps {
  isVisible: boolean;
  onClose: () => void;
  message: string;
  onPinToStatus: () => void;
}

const ChatMessageModal: React.FC<ChatMessageModalProps> = ({
  isVisible,
  onClose,
  message,
  onPinToStatus,
}) => {
  const { Colors } = useAppTheme();
  const { userData } = useAppSelector(state => state.user);
  const styles = createStyles(Colors);
  const viewShotRef = useRef<ViewShot>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handlePin = () => {
    hapticFeedback('impactMedium');
    onPinToStatus();
  };

  const handleShareAsImage = async () => {
    try {
      setIsSharing(true);
      hapticFeedback('impactMedium');

      if (!viewShotRef.current) {
        Toast('Unable to create share card');
        return;
      }

      // Capture the view as an image
      const uri = await viewShotRef.current.capture();

      // Share the image
      await Share.open({
        url: `file://${uri}`,
        type: 'image/png',
        title: 'Share Chat Response',
        message: 'Check out this response from HealthPulse HEALTH!',
      });

      onClose();
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Error sharing image:', error);
        Toast('Failed to share image');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <BaseModal
      isVisible={isVisible}
      onClose={onClose}
      title="Message Options"
      buttons={
        <ModalBtttons
          onClose={onClose}
          handleSave={handlePin}
          buttonText="Pin to Status"
        />
      }
    >
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{message}</Text>
      </View>

      {/* Share as Image Button */}
      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleShareAsImage}
        disabled={isSharing}
      >
        {isSharing ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <>
            <MaterialIcons
              name="share"
              size={20}
              color={Colors.white}
              style={styles.shareIcon}
            />
            <Text style={styles.shareButtonText}>Share as Image</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Hidden ShareableCard for capturing */}
      <View style={styles.hiddenCard}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
          <ShareableCard
            message={message}
            userName={userData?.displayName || 'User'}
            timestamp={new Date().toISOString()}
          />
        </ViewShot>
      </View>
    </BaseModal>
  );
};

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    messageContainer: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: Colors.greyColor100,
      borderWidth: 1,
      borderColor: Colors.greyColor400,
      marginBottom: 8,
    },
    messageText: {
      fontSize: 16,
      fontFamily: 'Nunito-Medium',
      color: Colors.textColor,
      lineHeight: 24,
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2c3bbb',
      borderRadius: 12,
      padding: 14,
      marginTop: 12,
      marginBottom: 8,
    },
    shareIcon: {
      marginRight: 8,
    },
    shareButtonText: {
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      color: Colors.white,
    },
    hiddenCard: {
      position: 'absolute',
      left: -9999,
      top: -9999,
    },
  });

export default ChatMessageModal;
