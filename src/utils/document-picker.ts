import DocumentPicker from 'react-native-document-picker';
// import DocumentPicker from '@react-native-documents/picker';
import { Alert, Platform } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { hapticFeedback } from '.';
//  "@react-native-documents/picker": "^10.1.5",
// "@react-native-documents/picker": "^10.1.5"
//     "react-native-document-picker": "^9.3.1"

// Type definitions
export type MediaResult = {
  path: string;
  mime: string;
  filename?: string;
  size?: number;
};

// Open camera function
export const openCamera = async (): Promise<MediaResult | null> => {
  try {
    hapticFeedback('impactMedium');
    const image = await ImagePicker.openCamera({
      width: 1200,
      height: 1200,
      cropping: true,
      mediaType: 'photo',
    });

    return {
      path: image.path,
      mime: image.mime,
      filename:
        Platform.OS === 'ios' ? image.filename : `camera_${Date.now()}.jpg`,
      size: image.size,
    };
  } catch (error) {
    if (error?.code !== 'E_PICKER_CANCELLED') {
      Alert.alert('Camera Error', 'There was an error accessing the camera.');
      console.error('Camera error:', error);
    }
    return null;
  }
};

// Pick file function
export const pickFile = async (): Promise<MediaResult | null> => {
  try {
    hapticFeedback('impactMedium');
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      allowMultiSelection: false,
    });

    const file = result?.[0];
    return {
      path: file?.uri,
      mime: file?.type || 'application/octet-stream',
      filename: file?.name || `file_${Date.now()}`,
      size: file?.size,
    };
  } catch (error) {
    // if (!DocumentPicker.isErrorWithCode(error)) {
    Alert.alert('File Picker Error', 'There was an error picking a file.');
    // console.error('File picker error:', error);
    // }
    return null;
  }
};

// Open scanner function
export const openScanner = (): void => {
  hapticFeedback('impactMedium');
  // Implement your scanner functionality here
  Alert.alert('Scanner', 'Scanner functionality would be implemented here.');
};
