import GalleryIcon from '@/icons/GalleryIcon';
import React from 'react';
import {
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { CameraDevice } from 'react-native-vision-camera';
import { Camera } from 'react-native-vision-camera';

interface CameraActionProps {
  device: CameraDevice | undefined;
  cameraRef: React.RefObject<Camera>;
  timerState: 'idle' | 'active' | 'paused' | 'completed';
  isCameraReady: boolean;
  setIsCameraReady: (ready: boolean) => void;
  onBack: () => void;
  result: () => React.ReactNode;
  capturedPhotoUri: string | null;
  onCapture: () => void;
  onGalleryPress: () => void;
  onRetake: () => void;
  onCameraFlip?: () => void;
}

export const CameraAction: React.FC<CameraActionProps> = ({
  device,
  cameraRef,
  timerState,
  isCameraReady,
  setIsCameraReady,
  onBack,
  result,
  capturedPhotoUri,
  onCapture,
  onGalleryPress,
  onRetake,
  onCameraFlip,
}) => {
  // If photo is captured, show preview with close button
  if (capturedPhotoUri) {
    return (
      <View style={styles.cameraContainer}>
        <View style={styles.previewWrapper}>
          <Image
            source={{ uri: capturedPhotoUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          {/* Close button to retake */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onRetake}
            activeOpacity={0.8}
          >
            <View style={styles.closeIcon}>
              <View style={styles.closeLine1} />
              <View style={styles.closeLine2} />
            </View>
          </TouchableOpacity>
        </View>
        {result()}
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <View style={styles.previewWrapper}>
        {!device ? (
          <View style={styles.container}>
            <StatusBar
              barStyle="light-content"
              backgroundColor="#000"
              translucent
            />
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>No camera device found</Text>
              <TouchableOpacity style={styles.startButton} onPress={onBack}>
                <Text style={styles.startButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Camera
            ref={cameraRef}
            device={device}
            isActive={timerState !== 'completed'}
            photo={true}
            video={false}
            audio={false}
            onInitialized={() => {
              console.log('[CameraAction] Camera initialized');
              setIsCameraReady(true);
            }}
            onError={error => {
              console.error('[CameraAction] Camera error:', error);
              Alert.alert('Error', 'Camera error: ' + error.message);
            }}
            style={{ width: '100%', height: '100%', borderRadius: 30 }}
          />
        )}

        <LinearGradient
          colors={['#00000035', '#00000089']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Camera Controls */}
        <View style={styles.cameraControls}>
          {/* Gallery Button */}
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={onGalleryPress}
            activeOpacity={0.8}
          >
            <GalleryIcon width={20} height={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Shutter Button */}
          <TouchableOpacity
            style={styles.shutterButton}
            onPress={onCapture}
            activeOpacity={0.8}
            disabled={!isCameraReady}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          {/* Camera Flip Button */}
          {onCameraFlip && (
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={onCameraFlip}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-reverse" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.poseContainer}>
        <Animated.View style={[styles.poseFrame]}>
          <Animated.View style={[styles.poseGlow]} />
          <View
            style={[
              styles.poseCorner,
              styles.poseTL,
              { borderColor: 'rgba(255,255,255,0.4)' },
            ]}
          />
          <View
            style={[
              styles.poseCorner,
              styles.poseTR,
              { borderColor: 'rgba(255,255,255,0.4)' },
            ]}
          />
          <View
            style={[
              styles.poseCorner,
              styles.poseBL,
              { borderColor: 'rgba(255,255,255,0.4)' },
            ]}
          />
          <View style={[styles.poseCorner, styles.poseBR]} />
        </Animated.View>
      </View>
      {result()}
    </View>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    width: '100%',
    height: 330,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  previewWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 18,
    fontFamily: 'Nunito-SemiBold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: '#FFF',
    textAlign: 'center',
  },
  poseContainer: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  poseFrame: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  poseGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  poseCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  poseTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  poseTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  poseBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  poseBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 10,
  },
  galleryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  shutterButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  shutterInner: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  closeLine1: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    top: 9,
  },
  closeLine2: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }],
    top: 9,
  },
});
