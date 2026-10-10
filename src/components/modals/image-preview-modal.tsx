import React from 'react';
import {
  Image,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import Modal from 'react-native-modal';
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface ImagePreviewModalProps {
  isVisible: boolean;
  imageUri: string;
  onClose?: () => void;
  primaryColor: string;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isVisible,
  imageUri,
  onClose,
  primaryColor,
}) => {
  const styles = createImageModalStyle();

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.8}
      useNativeDriver
      animationIn="zoomIn"
      animationOut="zoomOut"
      style={styles.modal}
    >
      <GestureHandlerRootView style={styles.modalContent}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="large"
          color={primaryColor}
          style={styles.loader}
        />
      </GestureHandlerRootView>
    </Modal>
  );
};

const createImageModalStyle = () =>
  StyleSheet.create({
    modal: {
      margin: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      height: 350,
      width: 350,
      borderRadius: 15,
    },
    loader: {
      position: 'absolute',
      height: 70,
      width: 70,
      borderRadius: 35,
      backgroundColor: '#fff',
      transform: [{ scale: 0.6 }],
      justifyContent: 'center',
      alignItems: 'center',
    },
});

export default ImagePreviewModal;