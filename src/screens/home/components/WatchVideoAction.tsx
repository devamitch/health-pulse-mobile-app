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
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video, { VideoRef } from 'react-native-video';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

interface WatchVideoActionProps {
  /** Direct video URL from task.videoUrl — if provided, skips playlist fetch */
  videoUrl?: string;
  /** Gradient accent color for the progress fill */
  accentColor?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const WatchVideoAction: React.FC<WatchVideoActionProps> = ({
  videoUrl: directVideoUrl,
  accentColor = '#7C60C8',
}) => {
  const { Colors, DEffect } = useAppTheme();
  const styles = useMemo(
    () => createStyles(Colors, DEffect),
    [Colors, DEffect],
  );

  const videoRef = useRef<VideoRef>(null);

  // Playback state
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  // Fetch from playlist API only if no direct URL provided
  const {
    data: playlistData,
    isFetching,
    error: fetchError,
  } = useGetPlaylistDataQuery(
    { title: 'morning-mindful' },
    {
      skip: !!directVideoUrl, // skip fetch if we already have a URL
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

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const togglePlayPause = useCallback(() => {
    setIsPaused(prev => !prev);
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
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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
    <View style={styles.container}>
      {/* Video Player */}
      <View style={styles.videoWrapper}>
        <Video
          ref={videoRef}
          source={{ uri: resolvedVideoUrl }}
          style={styles.video}
          resizeMode="cover"
          paused={isPaused}
          repeat={false}
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

        {/* Play / Pause overlay button */}
        <TouchableOpacity
          style={styles.playPauseOverlay}
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

        {/* Progress bar & time */}
        <View style={styles.progressContainer}>
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
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>

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

const createStyles = (Colors: ColorScheme, _DEffect: ElevationScheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      marginTop: 8,
    },

    // Video wrapper
    videoWrapper: {
      width: '100%',
      height: SCREEN_WIDTH * 0.56, // ~16:9
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: '#1C1C1E',
    },
    video: {
      width: '100%',
      height: '100%',
    },

    // Overlays
    bufferingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playPauseOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playPauseCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Progress
    progressContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 12,
      paddingBottom: 10,
    },
    progressBarTrack: {
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 2,
    },
    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    timeText: {
      fontSize: 11,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: '#FFFFFF',
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
