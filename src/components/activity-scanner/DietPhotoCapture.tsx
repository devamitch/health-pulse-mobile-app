'use client';

/**
 * DietPhotoCapture
 *
 * Component for capturing and analyzing food photos
 * Uses takePhoto instead of frame processor (no worklets-core needed)
 */

import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import { Camera } from 'react-native-vision-camera';

interface DietPhotoCaptureProps {
  taskName: string;
  cameraRef: React.RefObject<Camera>;
  onComplete: () => void;
  Colors: ColorScheme;
  DEffect: ElevationScheme;
}

const DietPhotoCapture: React.FC<DietPhotoCaptureProps> = ({
  taskName,
  cameraRef,
  onComplete,
  Colors,
  DEffect,
}) => {
  const styles = useMemo(
    () => createStyles(Colors, DEffect),
    [Colors, DEffect],
  );

  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const capturePhoto = useCallback(async () => {
    if (!cameraRef.current) return;

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'balanced',
        flash: 'off',
        enableShutterSound: true,
      });

      setCapturedPhoto(`file://${photo.path}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [cameraRef]);

  const analyzePhoto = useCallback(async () => {
    if (!capturedPhoto) return;

    try {
      setIsAnalyzing(true);

      // Simulate AI analysis - replace with actual ML model
      await new Promise(resolve => setTimeout(resolve, 2000));

      const analysisResults = {
        foodDetected: true,
        foodType: 'Healthy meal',
        confidence: 0.92,
        portionSize: 'Appropriate',
        matchesTask: true,
      };

      if (analysisResults.foodDetected && analysisResults.matchesTask) {
        Alert.alert(
          'Great Job!',
          `Photo verified! Your ${taskName.toLowerCase()} looks nutritious and well-portioned.`,
          [{ text: 'Complete Task', onPress: onComplete }],
        );
      } else if (analysisResults.foodDetected && !analysisResults.matchesTask) {
        Alert.alert(
          'Hmm...',
          `We detected food, but it doesn't quite match ${taskName}. Would you like to retake the photo?`,
          [
            { text: 'Retake', onPress: () => setCapturedPhoto(null) },
            { text: 'Use Anyway', onPress: onComplete },
          ],
        );
      } else {
        Alert.alert(
          'No Food Detected',
          'Please take a photo of your meal to complete this task.',
          [{ text: 'Retake', onPress: () => setCapturedPhoto(null) }],
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze photo. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [capturedPhoto, taskName, onComplete]);

  const retakePhoto = useCallback(async () => {
    if (capturedPhoto) {
      try {
        const path = capturedPhoto.replace('file://', '');
        const exists = await RNFS.exists(path);
        if (exists) {
          await RNFS.unlink(path);
        }
      } catch {
        // Ignore cleanup errors
      }
    }
    setCapturedPhoto(null);
  }, [capturedPhoto]);

  if (capturedPhoto) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: capturedPhoto }} style={styles.previewImage} />

        {isAnalyzing && (
          <View style={styles.analyzingOverlay}>
            <View style={styles.analyzingCard}>
              <ActivityIndicator size="large" color={Colors.primaryColor} />
              <Text style={styles.analyzingText}>Analyzing your meal...</Text>
              <Text style={styles.analyzingSubtext}>
                Checking nutritional content and portion size
              </Text>
            </View>
          </View>
        )}

        {!isAnalyzing && (
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.retakeButton]}
              onPress={retakePhoto}
            >
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={analyzePhoto}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Photo Tips:</Text>
          <Text style={styles.tipsText}>- Ensure good lighting</Text>
          <Text style={styles.tipsText}>- Show the entire meal</Text>
          <Text style={styles.tipsText}>- Keep the camera steady</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.captureContainer}>
      {/* Guide overlay */}
      <View style={styles.guideOverlay}>
        <View style={styles.guideFrame} />
        <Text style={styles.guideText}>Position your meal in the frame</Text>
        <View style={styles.guideInstructions}>
          <Text style={styles.instructionText}>
            Make sure your entire meal is visible
          </Text>
          <Text style={styles.instructionText}>
            Use good lighting for best results
          </Text>
          <Text style={styles.instructionText}>
            Place the meal on a plain surface
          </Text>
        </View>
      </View>

      {/* Capture button */}
      <View style={styles.captureButtonContainer}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={capturePhoto}
          disabled={isCapturing}
        >
          <View style={styles.captureButtonInner}>
            {isCapturing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.captureButtonCircle} />
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.captureHint}>Tap to capture</Text>
      </View>
    </View>
  );
};

const createStyles = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    captureContainer: {
      flex: 1,
      justifyContent: 'space-between',
    },
    guideOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    guideFrame: {
      width: 280,
      height: 280,
      borderWidth: 3,
      borderColor: Colors.primaryColor,
      borderRadius: 20,
      borderStyle: 'dashed',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    guideText: {
      marginTop: 24,
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
      textAlign: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
    },
    guideInstructions: {
      marginTop: 32,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: 20,
      borderRadius: 16,
      gap: 8,
    },
    instructionText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: '#FFFFFF',
      lineHeight: 22,
    },
    captureButtonContainer: {
      alignItems: 'center',
      paddingBottom: 50,
    },
    captureButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    captureButtonInner: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    captureButtonCircle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: Colors.primaryColor,
    },
    captureHint: {
      marginTop: 12,
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    previewContainer: {
      flex: 1,
      backgroundColor: '#000000',
    },
    previewImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    },
    analyzingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    analyzingCard: {
      backgroundColor: Colors.surface,
      padding: 32,
      borderRadius: 20,
      alignItems: 'center',
      ...DEffect,
    },
    analyzingText: {
      marginTop: 16,
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
    },
    analyzingSubtext: {
      marginTop: 8,
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: Colors.textSecondary,
      textAlign: 'center',
    },
    previewActions: {
      position: 'absolute',
      bottom: 40,
      left: 20,
      right: 20,
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      ...DEffect,
    },
    retakeButton: {
      backgroundColor: Colors.greyColor200,
    },
    retakeButtonText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
    },
    confirmButton: {
      backgroundColor: Colors.primaryColor,
    },
    confirmButtonText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    tipsContainer: {
      position: 'absolute',
      top: 100,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 16,
      borderRadius: 12,
    },
    tipsTitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
      marginBottom: 8,
    },
    tipsText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: 'rgba(255, 255, 255, 0.9)',
      lineHeight: 20,
    },
  });

export default DietPhotoCapture;
