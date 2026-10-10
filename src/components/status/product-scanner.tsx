import { ColorScheme } from "@/constants/theme";
import { useAppTheme } from "@/hooks/themeHook";
import { useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import {
  Camera,
  useCameraPermission,
} from "react-native-vision-camera";
import { Toast } from "@/utils/toast";
import { launchCamera } from "react-native-image-picker";
import ImageResizer, { ResizeFormat } from "react-native-image-resizer";
import RNFS from 'react-native-fs';

type ImageType = 'image/png' | 'image/jpeg' | 'image/webp';

const imageFormat: Record<ImageType, ResizeFormat> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/webp': 'WEBP'
}

interface ProductScannerProps {
  onCapture?: (data: { path: string; base64: string; imageType: ImageType }) => void;
  imageType?: ImageType;
  setLoading?: (val: boolean) => void;
}

const ProductScanner: React.FC<ProductScannerProps> = ({ onCapture, imageType = 'image/jpeg', setLoading }) => {
  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, []);

  const handleCapture = async () => {
    try {
      setLoading?.(true);
      if (!hasPermission) {
        const status = await Camera.requestCameraPermission();
        const granted = status === 'granted';
        if (!granted) return;
      }
    
      launchCamera(
        {
          mediaType: 'photo',
          includeBase64: true,
          maxHeight: 500,
          maxWidth: 500,
          quality: 0.8,
        },
        (response) => {
          const uri = response?.assets?.[0]?.uri;
          if(uri){
            ImageResizer.createResizedImage(uri, 500, 500, imageFormat[imageType], 1)
              .then(async ({path}) => {
                const base64 = await RNFS.readFile(path, 'base64');
                onCapture?.({
                  path: uri,
                  base64,
                  imageType,
                })
              })
          }
        },
      );
    } catch (error) {
      Toast(String(error));
    } finally{
      setLoading?.(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleCapture}
      style={styles.qrButton}
    >
      <AntDesign name="qrcode" size={30} color={Colors.textColor} />
      <Text style={styles.qrTextButton}>Scanner</Text>
    </TouchableOpacity>
  );
};

const createStyle = (Colors: ColorScheme) =>
  StyleSheet.create({
    qrButton: {
      width: "100%",
      flexDirection: "row",
      paddingVertical: 10,
      padding: 20,
      alignItems: "center",
      borderRadius: 24,
    },
    qrTextButton: {
      fontSize: 18,
      fontFamily: "Nunito-SemiBold",
      paddingLeft: 20,
      color: Colors.textColor,
    },
    cameraBox: {
      width: '100%',
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: "#000",
      alignSelf: "center",
      aspectRatio: 1,
    },
    center: {
      justifyContent: "center",
      alignItems: "center",
    },
    closeButton: {
      position: "absolute",
      top: 8,
      left: 8,
      backgroundColor: "#00000088",
      padding: 6,
      borderRadius: 16,
      zIndex: 2,
    },
    buttonText: {
      color: "white",
      fontSize: 18,
    },
    captureButton: {
      position: "absolute",
      bottom: 10,
      alignSelf: "center",
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: "#ffffff88",
      justifyContent: "center",
      alignItems: "center",
    },
    captureInner: {
      width: 30,
      height: 30,
      backgroundColor: "white",
      borderRadius: 15,
    },
  });

export default ProductScanner;
