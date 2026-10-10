import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { useGetPlaylistDataQuery } from '@/services/mmkv-redux/apis';
import Slider from '@react-native-community/slider';
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
  Animated,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video, { VideoRef } from 'react-native-video';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface WatchVideoActionProps {
  videoUrl?: string;
  accentColor?: string;
  onEnd?: () => void;
}

type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

// ============================================================================
// COMPONENT
// ============================================================================

const WatchVideoAction: React.FC<WatchVideoActionProps> = ({
  videoUrl: directVideoUrl,
  accentColor = '#7C60C8',
  onEnd,
}) => {
  const { Colors, DEffect } = useAppTheme();
  const styles = useMemo(
    () => createStyles(Colors, DEffect),
    [Colors, DEffect],
  );

  const videoRef = useRef<VideoRef>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Playback state
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // Advanced controls state
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // Fetch from playlist API only if no direct URL provided
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

  // Resolve final video URL
  const resolvedVideoUrl = useMemo(() => {
    if (directVideoUrl) return directVideoUrl;
    if (playlistData && playlistData.length > 0)
      return playlistData[0].playbackUrl;
    return undefined;
  }, [directVideoUrl, playlistData]);

  // Sync loading with fetch
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

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls && !isPaused && !showSpeedMenu) {
      controlsTimeoutRef.current = setTimeout(() => {
        hideControls();
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPaused, showSpeedMenu]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isFullscreen && Platform.OS === 'android') {
        StatusBar.setHidden(false);
      }
    };
  }, [isFullscreen]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const hideControls = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowControls(false));
  }, [fadeAnim]);

  const displayControls = useCallback(() => {
    setShowControls(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const togglePlayPause = useCallback(() => {
    setIsPaused(prev => !prev);
    displayControls();
  }, [displayControls]);

  const handleLoad = useCallback((data: any) => {
    setDuration(data.duration);
    setIsLoading(false);
    console.log('[Video] Loaded:', data);
  }, []);

  const handleProgress = useCallback(
    (data: any) => {
      if (!isSeeking) {
        setCurrentTime(data.currentTime);
      }
    },
    [isSeeking],
  );

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
    if (!isLooping) {
      setIsPaused(true);
      setCurrentTime(duration);
    }
    displayControls();
    onEnd?.();
  }, [isLooping, duration, displayControls, onEnd]);

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
    displayControls();
  }, [displayControls]);

  const handleSeek = useCallback((value: number) => {
    setCurrentTime(value);
  }, []);

  const handleSeekComplete = useCallback((value: number) => {
    setIsSeeking(false);
    videoRef.current?.seek(value);
  }, []);

  const skipForward = useCallback(() => {
    const newTime = Math.min(currentTime + 10, duration);
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
    displayControls();
  }, [currentTime, duration, displayControls]);

  const skipBackward = useCallback(() => {
    const newTime = Math.max(currentTime - 10, 0);
    videoRef.current?.seek(newTime);
    setCurrentTime(newTime);
    displayControls();
  }, [currentTime, displayControls]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    displayControls();
  }, [displayControls]);

  const changePlaybackSpeed = useCallback(
    (speed: PlaybackSpeed) => {
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
      displayControls();
    },
    [displayControls],
  );

  const toggleSpeedMenu = useCallback(() => {
    setShowSpeedMenu(prev => !prev);
    displayControls();
  }, [displayControls]);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => !prev);
    displayControls();
  }, [displayControls]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      const newFullscreen = !prev;

      if (Platform.OS === 'android') {
        StatusBar.setHidden(newFullscreen, 'fade');
      }

      return newFullscreen;
    });
    displayControls();
  }, [displayControls]);

  const restartVideo = useCallback(() => {
    videoRef.current?.seek(0);
    setCurrentTime(0);
    setIsPaused(false);
    displayControls();
  }, [displayControls]);

  const handleVideoPress = useCallback(() => {
    if (showControls) {
      if (!isPaused && !showSpeedMenu) {
        hideControls();
      }
    } else {
      displayControls();
    }
  }, [showControls, isPaused, showSpeedMenu, hideControls, displayControls]);

  const insests = useSafeAreaInsets();
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Loading state
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

  // Error state
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

  return (
    <View
      style={[styles.container, isFullscreen && styles.fullscreenContainer]}
    >
      {/* Video Player */}
      {isFullscreen ? (
        <View />
      ) : (
        <View style={[styles.videoWrapper]}>
          <Video
            ref={videoRef}
            source={{ uri: resolvedVideoUrl }}
            style={styles.video}
            resizeMode={isFullscreen ? 'contain' : 'cover'}
            controls={false}
            paused={isPaused}
            repeat={isLooping}
            volume={isMuted ? 0 : volume}
            rate={playbackSpeed}
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

          {/* Buffering overlay */}
          {isBuffering && (
            <View style={styles.bufferingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}

          {/* Tap to show/hide controls */}
          <TouchableOpacity
            style={styles.videoTouchArea}
            onPress={handleVideoPress}
            activeOpacity={1}
          />

          {/* Controls overlay */}
          {showControls && (
            <Animated.View
              style={[styles.controlsOverlay, { opacity: fadeAnim }]}
            >
              {/* Top bar - compact */}
              <View style={styles.topBar}>
                <TouchableOpacity
                  style={styles.topButton}
                  onPress={toggleLoop}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={isLooping ? 'repeat' : 'repeat-off'}
                    size={20}
                    color={isLooping ? accentColor : '#FFFFFF'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.topButton}
                  onPress={toggleFullscreen}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {/* Center play/pause */}
              <TouchableOpacity
                style={styles.centerPlayButton}
                onPress={togglePlayPause}
                activeOpacity={0.9}
              >
                <View style={styles.playPauseCircle}>
                  <MaterialCommunityIcons
                    name={isPaused ? 'play' : 'pause'}
                    size={32}
                    color="#FFFFFF"
                  />
                </View>
              </TouchableOpacity>

              {/* Bottom controls - compact */}
              <View style={styles.bottomBar}>
                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={currentTime}
                    onValueChange={handleSeek}
                    onSlidingStart={handleSeekStart}
                    onSlidingComplete={handleSeekComplete}
                    minimumTrackTintColor={accentColor}
                    maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    thumbTintColor={accentColor}
                  />
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>

                {/* Control buttons - single row */}
                <View style={styles.controlsRow}>
                  <View style={styles.controlsLeft}>
                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={restartVideo}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="restart"
                        size={20}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={skipBackward}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="rewind-10"
                        size={22}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={togglePlayPause}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={isPaused ? 'play' : 'pause'}
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={skipForward}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="fast-forward-10"
                        size={22}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.controlsRight}>
                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={toggleMute}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={
                          isMuted
                            ? 'volume-off'
                            : volume > 0.5
                            ? 'volume-high'
                            : 'volume-medium'
                        }
                        size={20}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.speedButton}
                      onPress={toggleSpeedMenu}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.speedText}>{playbackSpeed}x</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Speed menu popup */}
                {showSpeedMenu && (
                  <View style={styles.speedMenu}>
                    <Text style={styles.speedMenuTitle}>Speed</Text>
                    <View style={styles.speedGrid}>
                      {(
                        [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as PlaybackSpeed[]
                      ).map(speed => (
                        <TouchableOpacity
                          key={speed}
                          style={[
                            styles.speedItem,
                            playbackSpeed === speed && styles.speedItemActive,
                          ]}
                          onPress={() => changePlaybackSpeed(speed)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.speedItemText,
                              playbackSpeed === speed &&
                                styles.speedItemTextActive,
                            ]}
                          >
                            {speed}x
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>
          )}
        </View>
      )}
      <Modal visible={isFullscreen} style={styles.fullscreenVideo}>
        <View
          style={[styles.videoWrapper, isFullscreen && styles.fullscreenVideo]}
        >
          <Video
            ref={videoRef}
            source={{ uri: resolvedVideoUrl }}
            style={styles.video}
            resizeMode={isFullscreen ? 'contain' : 'cover'}
            controls={false}
            paused={isPaused}
            repeat={isLooping}
            volume={isMuted ? 0 : volume}
            rate={playbackSpeed}
            onLoad={handleLoad}
            onProgress={handleProgress}
            onError={handleError}
            onBuffer={handleBuffer}
            onEnd={handleEnd}
            ignoreSilentSwitch="ignore"
            playInBackground={false}
            playWhenInactive={false}
            fullscreen={isFullscreen}
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 50000,
              bufferForPlaybackMs: 2500,
              bufferForPlaybackAfterRebufferMs: 5000,
            }}
          />

          {/* Buffering overlay */}
          {isBuffering && (
            <View style={styles.bufferingOverlay}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}

          {/* Tap to show/hide controls */}
          <TouchableOpacity
            style={styles.videoTouchArea}
            onPress={handleVideoPress}
            activeOpacity={1}
          />

          {/* Controls overlay */}
          {showControls && (
            <Animated.View
              style={[styles.controlsOverlay, { opacity: fadeAnim }]}
            >
              {/* Top bar - compact */}
              <View style={[styles.topBar, { top: insests.top }]}>
                <TouchableOpacity
                  style={styles.topButton}
                  onPress={toggleLoop}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={isLooping ? 'repeat' : 'repeat-off'}
                    size={20}
                    color={isLooping ? accentColor : '#FFFFFF'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.topButton}
                  onPress={toggleFullscreen}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {/* Center play/pause */}
              <TouchableOpacity
                style={styles.centerPlayButton}
                onPress={togglePlayPause}
                activeOpacity={0.9}
              >
                <View style={styles.playPauseCircle}>
                  <MaterialCommunityIcons
                    name={isPaused ? 'play' : 'pause'}
                    size={32}
                    color="#FFFFFF"
                  />
                </View>
              </TouchableOpacity>

              {/* Bottom controls - compact */}
              <View style={[styles.bottomBar, { bottom: insests.bottom }]}>
                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={currentTime}
                    onValueChange={handleSeek}
                    onSlidingStart={handleSeekStart}
                    onSlidingComplete={handleSeekComplete}
                    minimumTrackTintColor={accentColor}
                    maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                    thumbTintColor={accentColor}
                  />
                  <Text style={styles.timeText}>{formatTime(duration)}</Text>
                </View>

                {/* Control buttons - single row */}
                <View style={styles.controlsRow}>
                  <View style={styles.controlsLeft}>
                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={restartVideo}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="restart"
                        size={20}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={skipBackward}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="rewind-10"
                        size={22}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={togglePlayPause}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={isPaused ? 'play' : 'pause'}
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={skipForward}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="fast-forward-10"
                        size={22}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.controlsRight}>
                    <TouchableOpacity
                      style={styles.smallButton}
                      onPress={toggleMute}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={
                          isMuted
                            ? 'volume-off'
                            : volume > 0.5
                            ? 'volume-high'
                            : 'volume-medium'
                        }
                        size={20}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.speedButton}
                      onPress={toggleSpeedMenu}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.speedText}>{playbackSpeed}x</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Speed menu popup */}
                {showSpeedMenu && (
                  <View style={styles.speedMenu}>
                    <Text style={styles.speedMenuTitle}>Speed</Text>
                    <View style={styles.speedGrid}>
                      {(
                        [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as PlaybackSpeed[]
                      ).map(speed => (
                        <TouchableOpacity
                          key={speed}
                          style={[
                            styles.speedItem,
                            playbackSpeed === speed && styles.speedItemActive,
                          ]}
                          onPress={() => changePlaybackSpeed(speed)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.speedItemText,
                              playbackSpeed === speed &&
                                styles.speedItemTextActive,
                            ]}
                          >
                            {speed}x
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>

      {/* Info section - only when not fullscreen */}
      {!isFullscreen && (
        <View style={styles.infoSection}>
          <MaterialCommunityIcons
            name="meditation"
            size={20}
            color={accentColor}
          />
          <Text style={styles.infoText}>
            Watch the video to complete this quest
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const createStyles = (Colors: ColorScheme, _DEffect: ElevationScheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginTop: 8,
    },
    fullscreenContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      backgroundColor: '#000',
      zIndex: 9999,
      marginTop: 0,
    },

    // Video wrapper
    videoWrapper: {
      width: '100%',
      aspectRatio: 16 / 9,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#000',
    },
    fullscreenVideo: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      borderRadius: 0,
      aspectRatio: undefined,
    },
    video: {
      width: '100%',
      height: '100%',
    },

    // Touch area
    videoTouchArea: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
    },

    // Buffering
    bufferingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },

    // Controls overlay
    controlsOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 3,
    },

    // Top bar
    topBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 12,
    },
    topButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Center play button
    centerPlayButton: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -30 }, { translateY: -30 }],
    },
    playPauseCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    // Bottom bar
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 12,
      paddingBottom: 16,
    },

    // Progress
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    slider: {
      flex: 1,
      height: 40,
      marginHorizontal: 8,
    },
    timeText: {
      fontSize: 11,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: '#FFFFFF',
      minWidth: 40,
      textAlign: 'center',
    },

    // Controls row
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    controlsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    controlsRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    smallButton: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButton: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    speedButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 40,
      height: 28,
      justifyContent: 'center',
      alignItems: 'center',
    },
    speedText: {
      fontSize: 11,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },

    // Speed menu
    speedMenu: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderRadius: 12,
      padding: 12,
      marginTop: 8,
    },
    speedMenuTitle: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
      marginBottom: 8,
      textAlign: 'center',
    },
    speedGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      justifyContent: 'center',
    },
    speedItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      minWidth: 50,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    speedItemActive: {
      backgroundColor: 'rgba(124, 96, 200, 0.3)',
      borderColor: '#7C60C8',
    },
    speedItemText: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    speedItemTextActive: {
      color: '#7C60C8',
    },

    // Loading
    loadingContainer: {
      width: '100%',
      aspectRatio: 16 / 9,
      borderRadius: 16,
      backgroundColor: Colors.surface,
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
      aspectRatio: 16 / 9,
      borderRadius: 16,
      backgroundColor: Colors.surface,
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
      gap: 8,
      marginTop: 12,
      paddingHorizontal: 4,
    },
    infoText: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      flex: 1,
    },
  });

export { WatchVideoAction };
export default memo(WatchVideoAction);
