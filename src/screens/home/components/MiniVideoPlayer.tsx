'use client';

/**
 * MiniVideoPlayer
 *
 * Mini video player for form correction feedback
 * Shows exercise demo when user makes form errors
 */

import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import React, { useMemo, useRef } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MiniVideoPlayerProps {
  videoUrl: string;
  currentError: string;
  onUnderstood: () => void;
  Colors: ColorScheme;
  DEffect: ElevationScheme;
}

const MiniVideoPlayer: React.FC<MiniVideoPlayerProps> = ({
  videoUrl,
  currentError,
  onUnderstood,
  Colors,
  DEffect,
}) => {
  const styles = useMemo(
    () => createStyles(Colors, DEffect),
    [Colors, DEffect],
  );

  const videoRef = useRef<Video>(null);

  return (
    <View style={styles.container}>
      {/* Semi-transparent backdrop */}
      <View style={styles.backdrop} />

      {/* Player card */}
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.warningIcon}>
            <Text style={styles.warningIconText}>!</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Form Correction</Text>
            <Text style={styles.headerSubtitle}>Watch the correct form</Text>
          </View>
        </View>

        {/* Error message */}
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{currentError}</Text>
        </View>

        {/* Video */}
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode="cover"
            repeat={true}
            paused={false}
            muted={true}
          />

          {/* Close button on video */}
          <TouchableOpacity style={styles.closeVideoButton} onPress={onUnderstood}>
            <Text style={styles.closeVideoIcon}>X</Text>
          </TouchableOpacity>
        </View>

        {/* Action button */}
        <TouchableOpacity style={styles.understoodButton} onPress={onUnderstood}>
          <Text style={styles.understoodButtonText}>Got It, Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    card: {
      width: SCREEN_WIDTH - 48,
      backgroundColor: Colors.surface,
      borderRadius: 24,
      overflow: 'hidden',
      ...DEffect,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors.greyColor200,
    },
    warningIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: Colors.warningBg || 'rgba(251, 191, 36, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    warningIconText: {
      fontSize: 24,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.warning,
    },
    headerText: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textColor,
    },
    headerSubtitle: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: Colors.textSecondary,
      marginTop: 2,
    },
    errorBox: {
      marginHorizontal: 20,
      marginTop: 16,
      padding: 16,
      backgroundColor: Colors.errorBg || 'rgba(239, 68, 68, 0.1)',
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: Colors.error,
    },
    errorText: {
      fontSize: 15,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: Colors.error,
      lineHeight: 22,
    },
    videoContainer: {
      marginHorizontal: 20,
      marginTop: 16,
      height: 200,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#000000',
    },
    video: {
      width: '100%',
      height: '100%',
    },
    closeVideoButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeVideoIcon: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    understoodButton: {
      margin: 20,
      paddingVertical: 16,
      backgroundColor: Colors.primaryColor,
      borderRadius: 12,
      alignItems: 'center',
    },
    understoodButtonText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
  });

export default MiniVideoPlayer;
