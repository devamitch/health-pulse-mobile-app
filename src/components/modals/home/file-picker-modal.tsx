import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Modal from 'react-native-modal';
import { ColorScheme, darkTheme, ElevationScheme } from "@/constants/theme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

interface FilePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  openCamera: () => void;
  pickFile: () => void;
  isDarkMode?: boolean;
  Colors: ColorScheme;
  DEffect: ElevationScheme;
  onOpenCustomMetricsModal: () => void;
}

const FilePickerModal: React.FC<FilePickerModalProps> = ({
  isVisible,
  onClose,
  openCamera,
  pickFile,
  isDarkMode = false,
  Colors,
  DEffect,
  onOpenCustomMetricsModal,
}) => {
  const styles = createFilePickerStyle(Colors, DEffect);
  const backgroundColor = (Colors.backgroundColor === darkTheme.backgroundColor)
    ? 'rgba(31, 41, 55, 0.85)'
    : 'rgba(255, 255, 255, 0.9)';

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0}
      style={{ margin: 0 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackButtonPress={onClose}
      useNativeDriver
    >
      <BlurView
        style={StyleSheet.absoluteFillObject}
        blurType={isDarkMode ? 'dark' : 'light'}
        blurAmount={20}
        reducedTransparencyFallbackColor={backgroundColor}
      />
      <TouchableWithoutFeedback onPress={onClose}>
        <GestureHandlerRootView style={styles.modalContainer}>
          <View style={styles.container}>
            <TouchableOpacity
              onPress={() => {
                onClose();
                setTimeout(openCamera, 500);
              }}
              style={styles.modalItem}
            >
              <FontAwesome5
                color={Colors.textColor}
                style={styles.modalItemIcon}
                name='camera'
                size={25}
              />
              <Text style={styles.modeltextStyle}>Open Camera</Text>
            </TouchableOpacity>

            <View style={styles.dividerStyle} />

            <TouchableOpacity
              onPress={() => {
                onClose();
                setTimeout(pickFile, 500);
              }}
              style={styles.modalItem}
            >
              <FontAwesome5
                color={Colors.textColor}
                style={styles.modalItemIcon}
                name='file-upload'
                size={25}
              />
              <Text style={styles.modeltextStyle}>Upload File</Text>
            </TouchableOpacity>

            <View style={styles.dividerStyle} />

            <TouchableOpacity onPress={() => {
              onClose();
              setTimeout(onOpenCustomMetricsModal, 500);
            }} style={styles.modalItem}>
              <FontAwesome5
                color={Colors.textColor}
                style={styles.modalItemIcon}
                name='list'
                size={25}
              />
              <Text style={styles.modeltextStyle}>Custom Metrics</Text>
            </TouchableOpacity>
          </View>
        </GestureHandlerRootView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const createFilePickerStyle = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    container: {
      width: '90%',
      borderRadius: 20,
      backgroundColor: Colors.white,
      margin: 20,
      flexDirection: 'column',
      padding: 20,
      ...DEffect,
    },
    modalItem: {
      flexDirection: 'row',
      paddingLeft: 10,
      alignItems: 'center',
    },
    modalItemIcon: {
      height: 25,
      width: 25,
      resizeMode: 'contain',
      tintColor: Colors.textColor,
      marginRight: 5,
      alignSelf: 'center'
    },
    modeltextStyle: {
      flex: 1,
      color: Colors.textColor,
      fontSize: 17,
      fontFamily: 'Nunito-Medium',
      marginLeft: 10,
      letterSpacing: 0.7,
    },
    dividerStyle: {
      height: 1,
      backgroundColor: Colors.greyColor,
      marginVertical: 10,
      alignSelf: 'center',
      width: '90%',
    },
});

export default FilePickerModal;