import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { useGetPlaylistDataQuery } from '@/services/mmkv-redux/apis';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Share from 'react-native-share';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video, { VideoRef } from 'react-native-video';
import ViewShot from 'react-native-view-shot';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface WatchVideoActionProps {
  videoUrl?: string;
  accentColor?: string;
  onEnd?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const WatchVideoAction: React.FC<WatchVideoActionProps> = ({
  videoUrl: directVideoUrl,
  accentColor = '#7C60C8',
  onEnd,
}) => {
  const { Colors, DEffect } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(Colors, DEffect, insets),
    [Colors, DEffect, insets],
  );

  const videoRef = useRef<VideoRef>(null);
  const viewShotRef = useRef<ViewShot>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);

  // Playback state
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Animated values
  const controlsOpacity = useSharedValue(1);
  const playPauseScale = useSharedValue(1);
  const fullscreenScale = useSharedValue(1);

  // Fetch from playlist API
  const {
    data: playlistData,
    isFetching,
    error: fetchError,
  } = useGetPlaylistDataQuery(
    { title: 'morning-mindful' },
    {
      skip: !!directVideoUrl,
      refetchOnMountOrArgChange: true,
    },
  );

  // Resolve video URL
  const resolvedVideoUrl = useMemo(() => {
    if (directVideoUrl) return directVideoUrl;
    if (playlistData && playlistData.length > 0)
      return playlistData[0].playbackUrl;
    return undefined;
  }, [directVideoUrl, playlistData]);

  // Sync loading
  useEffect(() => {
    if (directVideoUrl) {
      setIsLoading(false);
    } else {
      setIsLoading(isFetching);
    }
  }, [isFetching, directVideoUrl]);

  useEffect(() => {
    if (fetchError) {
      setHasError(true);
      setIsLoading(false);
    }
  }, [fetchError]);

  // Android back button handler
  useEffect(() => {
    if (!isFullscreen) return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        exitFullscreen();
        return true;
      },
    );

    return () => backHandler.remove();
  }, [isFullscreen]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && !isPaused) {
      controlsTimeoutRef.current = setTimeout(() => {
        hideControls();
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPaused]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const hideControls = useCallback(() => {
    controlsOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => setShowControls(false), 300);
  }, []);

  const revealControls = useCallback(() => {
    setShowControls(true);
    controlsOpacity.value = withTiming(1, { duration: 300 });
  }, []);

  const toggleControls = useCallback(() => {
    if (showControls) {
      hideControls();
    } else {
      revealControls();
    }
  }, [showControls, hideControls, revealControls]);

  const handleDoubleTap = useCallback(
    (x: number) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        // Double tap detected
        const screenCenter = SCREEN_WIDTH / 2;
        if (x < screenCenter) {
          skipBackward();
        } else {
          skipForward();
        }
      } else {
        // Single tap
        toggleControls();
      }

      lastTapRef.current = now;
    },
    [toggleControls],
  );

  const togglePlayPause = useCallback(() => {
    playPauseScale.value = withSpring(1.2, { damping: 10 }, () => {
      playPauseScale.value = withSpring(1);
    });
    setIsPaused(prev => !prev);
    revealControls();
  }, [revealControls]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    revealControls();
  }, [revealControls]);

  const cyclePlaybackRate = useCallback(() => {
    const rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    revealControls();
  }, [playbackRate, revealControls]);

  const skipBackward = useCallback(() => {
    if (videoRef.current) {
      const newTime = Math.max(0, currentTime - 10);
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
      revealControls();
    }
  }, [currentTime, revealControls]);

  const skipForward = useCallback(() => {
    if (videoRef.current) {
      const newTime = Math.min(duration, currentTime + 10);
      videoRef.current.seek(newTime);
      setCurrentTime(newTime);
      revealControls();
    }
  }, [currentTime, duration, revealControls]);

  const enterFullscreen = useCallback(() => {
    fullscreenScale.value = withSpring(1.1, { damping: 15 }, () => {
      fullscreenScale.value = withSpring(1);
    });
    setIsFullscreen(true);
    StatusBar.setHidden(true, 'fade');
  }, []);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    StatusBar.setHidden(false, 'fade');
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  const handleShare = useCallback(async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();

        const shareOptions = {
          title: 'Check out this video!',
          message: "I'm watching this amazing mindfulness video 🧘‍♂️",
          url: `file://${uri}`,
          type: 'image/png',
        };

        await Share.open(shareOptions);
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  }, []);

  const handleLoad = useCallback((data: any) => {
    setDuration(data.duration);
    setIsLoading(false);
  }, []);

  const handleProgress = useCallback((data: any) => {
    setCurrentTime(data.currentTime);
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('[WatchVideoAction] Video error:', error);
    setHasError(true);
  }, []);

  const handleBuffer = useCallback(
    ({ isBuffering: buffering }: { isBuffering: boolean }) => {
      setIsBuffering(buffering);
    },
    [],
  );

  const handleEnd = useCallback(() => {
    setIsPaused(true);
    revealControls();
    onEnd?.();
  }, [onEnd, revealControls]);

  const handleSeek = useCallback(
    (percent: number) => {
      if (videoRef.current && duration > 0) {
        const seekTime = (percent / 100) * duration;
        videoRef.current.seek(seekTime);
        setCurrentTime(seekTime);
        revealControls();
      }
    },
    [duration, revealControls],
  );

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Animated styles
  const controlsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  const playPauseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playPauseScale.value }],
  }));

  const fullscreenAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fullscreenScale.value }],
  }));

  // Progress bar gesture
  const progressGesture = Gesture.Pan()
    .onUpdate(e => {
      const percent = Math.max(0, Math.min(100, (e.x / e.absoluteX) * 100));
      handleSeek(percent);
    })
    .onEnd(() => {
      revealControls();
    });

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      </View>
    );
  }

  if (hasError || !resolvedVideoUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="video-off-outline"
            size={48}
            color={Colors.textTertiary}
          />
          <Text style={styles.errorText}>Unable to load video</Text>
          <Text style={styles.errorSubText}>
            Please check your connection and try again
          </Text>
        </View>
      </View>
    );
  }

  const VideoPlayerContent = () => (
    <ViewShot
      ref={viewShotRef}
      options={{ format: 'png', quality: 1.0 }}
      style={isFullscreen ? styles.fullscreenVideoWrapper : styles.videoWrapper}
    >
      <View
        style={
          isFullscreen ? styles.fullscreenVideoWrapper : styles.videoWrapper
        }
      >
        {/* Video Player */}
        <Video
          ref={videoRef}
          source={{ uri: resolvedVideoUrl }}
          style={styles.video}
          resizeMode={isFullscreen ? 'contain' : 'cover'}
          paused={isPaused}
          repeat={false}
          muted={isMuted}
          rate={playbackRate}
          onLoad={handleLoad}
          onProgress={handleProgress}
          onError={handleError}
          onBuffer={handleBuffer}
          onEnd={handleEnd}
          ignoreSilentSwitch="ignore"
          playInBackground={false}
          playWhenInactive={false}
          bufferConfig={{
            minBufferMs: 15000,
            maxBufferMs: 50000,
            bufferForPlaybackMs: 2500,
            bufferForPlaybackAfterRebufferMs: 5000,
          }}
        />

        {/* Tap area for controls */}
        <TouchableOpacity
          style={styles.tapArea}
          activeOpacity={1}
          onPress={e => handleDoubleTap(e.nativeEvent.locationX)}
        />

        {/* Buffering overlay */}
        {isBuffering && (
          <View style={styles.bufferingOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <Animated.View
            style={[styles.controlsOverlay, controlsAnimatedStyle]}
          >
            {/* Top Bar */}
            <View
              style={[styles.topBar, isFullscreen && styles.topBarFullscreen]}
            >
              {isFullscreen && (
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={exitFullscreen}
                >
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              )}
              <View style={styles.topBarSpacer} />
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleShare}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={skipBackward}
              >
                <MaterialCommunityIcons
                  name="rewind-10"
                  size={36}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <Animated.View style={playPauseAnimatedStyle}>
                <TouchableOpacity
                  style={styles.playPauseButton}
                  onPress={togglePlayPause}
                >
                  <MaterialCommunityIcons
                    name={isPaused ? 'play' : 'pause'}
                    size={40}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </Animated.View>

              <TouchableOpacity style={styles.skipButton} onPress={skipForward}>
                <MaterialCommunityIcons
                  name="fast-forward-10"
                  size={36}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {/* Bottom Bar */}
            <View
              style={[
                styles.bottomBar,
                isFullscreen && styles.bottomBarFullscreen,
              ]}
            >
              {/* Progress Bar */}
              <View style={styles.progressSection}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${progressPercent}%`,
                          backgroundColor: accentColor,
                        },
                      ]}
                    />
                    <TouchableOpacity
                      style={[
                        styles.progressThumb,
                        {
                          left: `${progressPercent}%`,
                          backgroundColor: accentColor,
                        },
                      ]}
                      activeOpacity={0.8}
                    />
                  </View>
                </View>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>

              {/* Control Buttons Row */}
              <View style={styles.controlsRow}>
                <TouchableOpacity
                  style={styles.smallControlButton}
                  onPress={toggleMute}
                >
                  <MaterialCommunityIcons
                    name={isMuted ? 'volume-off' : 'volume-high'}
                    size={22}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.speedButton}
                  onPress={cyclePlaybackRate}
                >
                  <Text style={styles.speedText}>{playbackRate}x</Text>
                </TouchableOpacity>

                <View style={styles.controlsSpacer} />

                <Animated.View style={fullscreenAnimatedStyle}>
                  <TouchableOpacity
                    style={styles.smallControlButton}
                    onPress={toggleFullscreen}
                  >
                    <MaterialCommunityIcons
                      name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
                      size={22}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
    </ViewShot>
  );

  // Fullscreen Modal
  if (isFullscreen) {
    return (
      <Modal
        visible={isFullscreen}
        animationType="fade"
        transparent={false}
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={exitFullscreen}
      >
        <View style={styles.fullscreenContainer}>
          <VideoPlayerContent />
        </View>
      </Modal>
    );
  }

  // Normal View
  return (
    <View style={styles.container}>
      <VideoPlayerContent />

      {/* Info below video */}
      <View style={styles.infoSection}>
        <MaterialCommunityIcons
          name="meditation"
          size={22}
          color={accentColor}
        />
        <Text style={styles.infoText}>
          Watch the video to complete this quest
        </Text>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const createStyles = (
  Colors: ColorScheme,
  _DEffect: ElevationScheme,
  insets: any,
) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginTop: 8,
    },

    // Video wrapper
    videoWrapper: {
      width: '100%',
      height: SCREEN_WIDTH * 0.56,
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: '#000000',
    },
    fullscreenContainer: {
      flex: 1,
      backgroundColor: '#000000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullscreenVideoWrapper: {
      width: SCREEN_HEIGHT,
      height: SCREEN_WIDTH,
      backgroundColor: '#000000',
    },
    video: {
      width: '100%',
      height: '100%',
    },

    // Tap area
    tapArea: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1,
    },

    // Overlays
    bufferingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },
    controlsOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      zIndex: 3,
    },

    // Top Bar
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    topBarFullscreen: {
      paddingTop: Platform.OS === 'ios' ? Math.max(insets.top, 16) : 16,
    },
    topBarSpacer: {
      flex: 1,
    },

    // Center Controls
    centerControls: {
      flex: 1,
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
    playPauseButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Bottom Bar
    bottomBar: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 12,
    },
    bottomBarFullscreen: {
      paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16,
    },

    // Progress Section
    progressSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    progressBarContainer: {
      flex: 1,
    },
    progressBarTrack: {
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 2,
      overflow: 'visible',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 2,
    },
    progressThumb: {
      position: 'absolute',
      width: 14,
      height: 14,
      borderRadius: 7,
      top: -5,
      marginLeft: -7,
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    timeText: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: '#FFFFFF',
      minWidth: 45,
      textAlign: 'center',
    },

    // Controls Row
    controlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    controlButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    smallControlButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    speedButton: {
      paddingHorizontal: 12,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    speedText: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    controlsSpacer: {
      flex: 1,
    },

    // Loading
    loadingContainer: {
      width: '100%',
      height: SCREEN_WIDTH * 0.56,
      borderRadius: 20,
      backgroundColor: 'rgba(244, 244, 244, 1)',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textTertiary,
    },

    // Error
    errorContainer: {
      width: '100%',
      height: SCREEN_WIDTH * 0.56,
      borderRadius: 20,
      backgroundColor: 'rgba(244, 244, 244, 1)',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 24,
    },
    errorText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textPrimaryColor,
      textAlign: 'center',
      marginTop: 4,
    },
    errorSubText: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textTertiary,
      textAlign: 'center',
    },

    // Info section
    infoSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 14,
      paddingHorizontal: 4,
    },
    infoText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
    },
  });

export { WatchVideoAction };
export default memo(WatchVideoAction);
