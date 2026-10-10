'use client';

/**
 * FullScreenVideoPlayer
 *
 * Full-screen video player component with custom controls
 * Uses standard Animated API (no worklets-core needed)
 */

import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FullScreenVideoPlayerProps {
  videoUrl: string;
  currentTime: number;
  duration: number;
  isPaused: boolean;
  onClose: () => void;
  onProgress: (data: { currentTime: number }) => void;
  onEnd: () => void;
  onPause: () => void;
  Colors: ColorScheme;
  DEffect: ElevationScheme;
}

const FullScreenVideoPlayer: React.FC<FullScreenVideoPlayerProps> = ({
  videoUrl,
  currentTime,
  duration,
  isPaused,
  onClose,
  onProgress,
  onEnd,
  onPause,
  Colors,
  DEffect,
}) => {
  const styles = useMemo(
    () => createStyles(Colors, DEffect),
    [Colors, DEffect],
  );

  const videoRef = useRef<Video>(null);
  const [showControls, setShowControls] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = useCallback((value: number) => {
    if (videoRef.current) {
      videoRef.current.seek(value);
    }
  }, []);

  const handleSlidingStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSlidingComplete = useCallback((value: number) => {
    setIsSeeking(false);
    handleSeek(value);
  }, [handleSeek]);

  const toggleControls = useCallback(() => {
    setShowControls(prev => !prev);

    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }

    if (!showControls) {
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [showControls]);

  const skipForward = useCallback(() => {
    if (videoRef.current) {
      const newTime = Math.min(currentTime + 10, duration);
      videoRef.current.seek(newTime);
    }
  }, [currentTime, duration]);

  const skipBackward = useCallback(() => {
    if (videoRef.current) {
      const newTime = Math.max(currentTime - 10, 0);
      videoRef.current.seek(newTime);
    }
  }, [currentTime]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <TouchableWithoutFeedback onPress={toggleControls}>
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode="contain"
            paused={isPaused || isSeeking}
            onProgress={onProgress}
            onEnd={onEnd}
            repeat={false}
          />

          {/* Controls overlay */}
          {showControls && (
            <View style={styles.controlsOverlay}>
              {/* Top bar with close button */}
              <View style={styles.topBar}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeIcon}>X</Text>
                </TouchableOpacity>
              </View>

              {/* Center controls */}
              <View style={styles.centerControls}>
                {/* Skip backward */}
                <TouchableOpacity style={styles.skipButton} onPress={skipBackward}>
                  <Text style={styles.skipText}>-10</Text>
                </TouchableOpacity>

                {/* Play/Pause */}
                <TouchableOpacity style={styles.playPauseButton} onPress={onPause}>
                  {isPaused ? (
                    <View style={styles.playIcon} />
                  ) : (
                    <View style={styles.pauseIcon}>
                      <View style={styles.pauseBar} />
                      <View style={styles.pauseBar} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Skip forward */}
                <TouchableOpacity style={styles.skipButton} onPress={skipForward}>
                  <Text style={styles.skipText}>+10</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom bar with progress */}
              <View style={styles.bottomBar}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration || 1}
                  value={currentTime}
                  onSlidingStart={handleSlidingStart}
                  onSlidingComplete={handleSlidingComplete}
                  minimumTrackTintColor={Colors.primaryColor}
                  maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                  thumbTintColor={Colors.primaryColor}
                />

                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const createStyles = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },
    videoContainer: {
      flex: 1,
    },
    video: {
      flex: 1,
    },
    controlsOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'space-between',
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      padding: 20,
      paddingTop: 50,
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeIcon: {
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    centerControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 40,
    },
    skipButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    skipText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    playPauseButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playIcon: {
      width: 0,
      height: 0,
      marginLeft: 6,
      borderLeftWidth: 24,
      borderTopWidth: 16,
      borderBottomWidth: 16,
      borderLeftColor: Colors.primaryColor,
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
    },
    pauseIcon: {
      flexDirection: 'row',
      gap: 8,
    },
    pauseBar: {
      width: 8,
      height: 28,
      backgroundColor: Colors.primaryColor,
      borderRadius: 2,
    },
    bottomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 12,
    },
    timeText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: '#FFFFFF',
      width: 50,
    },
    slider: {
      flex: 1,
      height: 40,
    },
  });

export default FullScreenVideoPlayer;
