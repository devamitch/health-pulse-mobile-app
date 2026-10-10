import BlurView from '@/components/base/BlurView';
import React, { ReactNode } from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReusableModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  showCloseButton?: boolean;
  containerStyle?: any;
  contentHeight?: number;
}

const ReusableModal: React.FC<ReusableModalProps> = ({
  visible,
  title,
  onClose,
  children,
  showCloseButton = true,
  containerStyle,
  contentHeight = SCREEN_HEIGHT * 0.7,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <BlurView style={styles.modalOverlay} blurAmount={10}>
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.modalContainer, containerStyle]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            {showCloseButton && (
              <TouchableOpacity
                onPress={onClose}
                style={styles.modalCloseButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.modalContent, { maxHeight: contentHeight }]}>
            {children}
          </View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: '#0F172A',
    flex: 1,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

export default React.memo(ReusableModal);
