import { Toast } from '@/utils/toast';
import { BlurView } from '@react-native-community/blur';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ImageBackground,
  KeyboardAvoidingView,
  ListRenderItem,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  RectButton,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Video, { VideoRef } from 'react-native-video';
// import RNFS from 'react-native-fs';
import { useGetPlaylistDataQuery, VideoItem } from '@/services/mmkv-redux/apis';
// import videoCache from '@/services/videoCache';

const { height } = Dimensions.get('screen');
const VIDEO_HEIGHT = height / 2;

import { AppStackParamList } from '@/navigation/main_route';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';

interface VideoPlayerProps {
  screen: 'evening_winddown' | 'mindful_morning';
  style?: ViewStyle;
  insetTop: number;
  onBackPress: () => void;
  navigation: NavigationProp<AppStackParamList>;
}

// Performance tracking utility
const PerformanceTracker = {
  start: (label: string) => {
    if (__DEV__) {
      console.time(`[VideoPlayer] ${label}`);
    }
  },
  end: (label: string) => {
    if (__DEV__) {
      console.timeEnd(`[VideoPlayer] ${label}`);
    }
  },
};

// Skeleton loader component for progressive loading
const VideoSkeleton = memo(() => (
  <View style={[styles.centerContainer, styles.roundedContainer]}>
    <View style={styles.skeletonBox} />
    <ActivityIndicator
      size="large"
      color="#007AFF"
      style={styles.skeletonLoader}
    />
  </View>
));

VideoSkeleton.displayName = 'VideoSkeleton';

const VideoPlayerComponent = memo<{
  videoUrl: string | undefined;
  posterUrl: string | undefined;
  isLoading: boolean;
  hasError: boolean;
  onError: (error: any) => void;
  onLoad: () => void;
  onBuffer: (isBuffering: boolean) => void;
  onEnd: () => void;
  videoRef: React.RefObject<VideoRef | null>;
  isLooping: boolean;
  isPaused: boolean;
  onSettingsPress: () => void;
}>(
  ({
    videoUrl,
    posterUrl,
    isLoading,
    hasError,
    onError,
    onLoad,
    onBuffer,
    onEnd,
    videoRef,
    isLooping,
    isPaused,
    onSettingsPress,
  }) => {
    const [isBuffering, setIsBuffering] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    // Progressive loading: show video after a short delay
    useEffect(() => {
      if (videoUrl && !isLoading) {
        const timer = setTimeout(() => setShowVideo(true), 100);
        return () => clearTimeout(timer);
      }
      return undefined;
    }, [videoUrl, isLoading]);

    const handleBuffer = useCallback(
      ({ isBuffering }: { isBuffering: boolean }) => {
        setIsBuffering(isBuffering);
        onBuffer(isBuffering);
      },
      [onBuffer],
    );

    if (isLoading || !showVideo) {
      return <VideoSkeleton />;
    }

    if (hasError || !videoUrl) {
      return (
        <View style={[styles.video, styles.roundedContainer]}>
          <Text style={styles.errorText}>Unable to load video</Text>
        </View>
      );
    }

    // Conditionally build video props to avoid passing undefined
    const videoProps = {
      source: { uri: videoUrl },
      style: styles.video,
      controls: true,
      resizeMode: 'cover' as const,
      onError,
      onLoad,
      onBuffer: handleBuffer,
      onEnd,
      repeat: isLooping,
      posterResizeMode: 'cover' as const,
      ignoreSilentSwitch: 'ignore' as const,
      paused: isPaused,
      playInBackground: false,
      playWhenInactive: false,
      bufferConfig: {
        minBufferMs: 15000,
        maxBufferMs: 50000,
        bufferForPlaybackMs: 2500,
        bufferForPlaybackAfterRebufferMs: 5000,
      },
      progressUpdateInterval: 1000,
      ...(posterUrl && { poster: posterUrl }),
    };

    return (
      <View style={styles.roundedContainer}>
        <Video ref={videoRef} {...videoProps} />
        {isBuffering && (
          <View style={styles.bufferingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onSettingsPress}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  },
);

VideoPlayerComponent.displayName = 'VideoPlayerComponent';

const VideoListItem = memo<{
  item: VideoItem;
  onPress: (url: string) => void;
  screen?: string;
  imageLink?: string | undefined;
}>(
  ({ item, onPress }) => {
    const handlePress = useCallback(
      () => onPress(item.playbackUrl),
      [onPress, item.playbackUrl],
    );

    return (
      <RectButton onPress={handlePress} style={styles.listComponentContainer}>
        <ImageBackground
          source={{ uri: item.thumbnailUrl }}
          resizeMode="cover"
          style={styles.listComponent}
          imageStyle={styles.listComponentImage}
        >
          <View style={styles.playButtonContainer}>
            <Ionicons
              name="play-circle"
              size={48}
              color="rgba(255, 255, 255, 0.9)"
            />
          </View>
          <BlurView
            style={styles.blurContainer}
            blurType="light"
            blurAmount={1}
            reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.6)"
          />
          <View style={styles.textContainer}>
            <Text style={styles.componentTitle}>{item.title}</Text>
            {/* {showDescription && (
              <Text style={styles.componentDescription}>
                {item.description}
              </Text>
            )} */}
          </View>
        </ImageBackground>
      </RectButton>
    );
  },
  (prevProps, nextProps) =>
    prevProps.item.playbackUrl === nextProps.item.playbackUrl &&
    prevProps.imageLink === nextProps.imageLink,
);

VideoListItem.displayName = 'VideoListItem';

const TimerDisplay = memo(
  ({
    isTimerActive,
    duration,
    formatTime,
    onTimerEnd,
    onSetTimer,
    onCancelTimer,
    onCustomTimer,
  }: {
    isTimerActive: boolean;
    duration: number | null;
    formatTime: (seconds: number) => string;
    onTimerEnd: () => void;
    onSetTimer: (minutes: number) => void;
    onCancelTimer: () => void;
    onCustomTimer: () => void;
  }) => {
    const [remaining, setRemaining] = useState<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (isTimerActive && duration) {
        setRemaining(duration * 60);
        intervalRef.current = setInterval(() => {
          setRemaining(prev => {
            if (prev === null || prev <= 1) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
              onTimerEnd();
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setRemaining(null);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [isTimerActive, duration, onTimerEnd]);

    if (isTimerActive && remaining !== null) {
      return (
        <View style={styles.activeTimerContainer}>
          <View style={styles.timerDisplayContainer}>
            <Ionicons name="timer-outline" size={24} color="#FFFFFF" />
            <Text style={styles.timerDisplay}>{formatTime(remaining)}</Text>
          </View>
          <TouchableOpacity
            style={styles.cancelTimerButton}
            onPress={onCancelTimer}
          >
            <Ionicons name="close-circle" size={20} color="#FF3B30" />
            <Text style={styles.cancelTimerText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View>
        <View style={styles.timerButtonsContainer}>
          <TouchableOpacity
            style={styles.timerButton}
            onPress={() => onSetTimer(15)}
          >
            <Text style={styles.timerButtonText}>15 min</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timerButton}
            onPress={() => onSetTimer(30)}
          >
            <Text style={styles.timerButtonText}>30 min</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timerButton}
            onPress={() => onSetTimer(45)}
          >
            <Text style={styles.timerButtonText}>45 min</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timerButton}
            onPress={() => onSetTimer(60)}
          >
            <Text style={styles.timerButtonText}>60 min</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.customTimerButton}
          onPress={onCustomTimer}
        >
          <Ionicons name="time-outline" size={20} color="#007AFF" />
          <Text style={styles.customTimerButtonText}>Custom Timer</Text>
        </TouchableOpacity>
        <View style={{ height: 20 }} />
      </View>
    );
  },
);
TimerDisplay.displayName = 'TimerDisplay';

// Settings Modal Component with swipe-to-dismiss
const SettingsModal = memo<{
  visible: boolean;
  onClose: () => void;
  isLooping: boolean;
  isRepeatAll: boolean;
  toggleLoop: () => void;
  toggleRepeatAll: () => void;
  isTimerActive: boolean;
  sleepTimerDuration: number | null;
  formatTime: (seconds: number) => string;
  handleTimerEnd: () => void;
  setSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  handleCustomTimerPress: () => void;
}>(
  ({
    visible,
    onClose,
    isLooping,
    isRepeatAll,
    toggleLoop,
    toggleRepeatAll,
    isTimerActive,
    sleepTimerDuration,
    formatTime,
    handleTimerEnd,
    setSleepTimer,
    cancelSleepTimer,
    handleCustomTimerPress,
  }) => {
    const translateY = useSharedValue(0);
    const { height: screenHeight } = Dimensions.get('window');

    useEffect(() => {
      if (visible) {
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 90,
        });
      }
    }, [visible, translateY]);

    const gestureHandler = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      { startY: number }
    >({
      onStart: (_, context) => {
        context.startY = translateY.value;
      },
      onActive: (event, context) => {
        // Only allow dragging down
        if (event.translationY > 0) {
          translateY.value = context.startY + event.translationY;
        }
      },
      onEnd: event => {
        // If dragged down more than 150 pixels or velocity is high, close modal
        if (event.translationY > 150 || event.velocityY > 500) {
          translateY.value = withSpring(screenHeight, {
            damping: 20,
            stiffness: 90,
          });
          runOnJS(onClose)();
        } else {
          // Otherwise, snap back
          translateY.value = withSpring(0, {
            damping: 20,
            stiffness: 90,
          });
        }
      },
    });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    if (!visible) return null;

    return (
      <Modal visible={visible} transparent animationType="fade">
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={2}
          reducedTransparencyFallbackColor="black"
        />
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View
              style={[styles.settingsModalContainer, animatedStyle]}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={e => e.stopPropagation()}
              >
                <View style={styles.settingsModalContent}>
                  {/* Drag Handle */}
                  <View style={styles.dragHandleContainer}>
                    <View style={styles.dragHandle} />
                  </View>

                  <View style={styles.settingsSection}>
                    <Text style={styles.settingsSectionTitle}>
                      Playback Options
                    </Text>
                    <View style={styles.controlsContainer}>
                      <TouchableOpacity
                        onPress={toggleLoop}
                        style={[
                          styles.controlButton,
                          isLooping && styles.controlButtonActive,
                        ]}
                      >
                        <Ionicons
                          name="repeat-outline"
                          size={22}
                          color={isLooping ? '#FFFFFF' : '#3C3C43'}
                        />
                        <Text
                          style={[
                            styles.controlButtonText,
                            isLooping && styles.controlButtonTextActive,
                          ]}
                        >
                          Loop
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={toggleRepeatAll}
                        style={[
                          styles.controlButton,
                          isRepeatAll && styles.controlButtonActive,
                        ]}
                      >
                        <Ionicons
                          name="repeat"
                          size={22}
                          color={isRepeatAll ? '#FFFFFF' : '#3C3C43'}
                        />
                        <Text
                          style={[
                            styles.controlButtonText,
                            isRepeatAll && styles.controlButtonTextActive,
                          ]}
                        >
                          Repeat All
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.settingsSection}>
                    <Text style={styles.settingsSectionTitle}>Sleep Timer</Text>
                    <TimerDisplay
                      isTimerActive={isTimerActive}
                      duration={sleepTimerDuration}
                      formatTime={formatTime}
                      onTimerEnd={handleTimerEnd}
                      onSetTimer={setSleepTimer}
                      onCancelTimer={cancelSleepTimer}
                      onCustomTimer={handleCustomTimerPress}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </PanGestureHandler>
        </TouchableOpacity>
      </Modal>
    );
  },
);

SettingsModal.displayName = 'SettingsModal';

const VideoScreen: React.FC<VideoPlayerProps> = ({
  screen,
  insetTop,
  onBackPress,
  navigation,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>();
  const [posterUrl, setPosterUrl] = useState<string>();
  const [isLooping, setIsLooping] = useState(false);
  const [isRepeatAll, setIsRepeatAll] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [sleepTimerDuration, setSleepTimerDuration] = useState<number | null>(
    null,
  ); // in minutes - stored for tracking
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showCustomTimerModal, setShowCustomTimerModal] = useState(false);
  const [customTimerInput, setCustomTimerInput] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const videoRef = useRef<VideoRef>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use sleepTimerDuration for logging when needed
  if (__DEV__ && sleepTimerDuration) {
    // Timer duration is tracked for debugging
  }
  const mountedRef = useRef(true);
  const processedRef = useRef(false);
  const loadStartTimeRef = useRef<number>(0);

  // const [fileResponse, setFileResponse] = useState<VideoItem[]>();

  // const { data: playlistInfo, isSuccess: isPlaylistFetched, isFetching, error } = useGetPlaylistsQuery(undefined, {
  //   refetchOnMountOrArgChange: true,
  // });

  const {
    data: videoData,
    isFetching,
    error,
  } = useGetPlaylistDataQuery(
    {
      title:
        screen === 'evening_winddown' ? 'evening-winddown' : 'morning-mindful',
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (!isFetching && !error && !!videoData)
      setVideoUrl(videoData[0]?.playbackUrl);
  }, [videoData, isFetching, error]);

  // useEffect(() => {
  //   const getData = async () => {
  //     if(playlistInfo && isPlaylistFetched){
  //       const data = (await Promise.all(playlistInfo.map(async (pl) => await getVideoData(pl._id).unwrap() ?? []))).flat();
  //       // setFileResponse(data);
  //     }
  //   }

  //   getData();
  // }, [playlistInfo, isPlaylistFetched])

  useFocusEffect(
    useCallback(() => {
      setIsPaused(false);
      return () => {
        setIsPaused(true);
      };
    }, []),
  );

  // Component mount tracking
  useEffect(() => {
    PerformanceTracker.start('Component Mount');
    loadStartTimeRef.current = Date.now();

    return () => {
      PerformanceTracker.end('Component Mount');
    };
  }, []);

  // Prefetch video URLs
  const prefetchVideos = useCallback((videos: VideoItem[]) => {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      PerformanceTracker.start('Prefetch Videos');

      // Prefetch first 3 videos for faster switching
      videos.slice(0, 3).forEach(video => {
        if (video.playbackUrl) {
          // Note: react-native-video doesn't have built-in prefetch,
          // but we can preload by creating hidden video components
          // or use react-native-fast-image for thumbnails
          if (__DEV__) {
            console.log(`[VideoPlayer] Queued for prefetch: ${video.title}`);
          }
        }
      });

      PerformanceTracker.end('Prefetch Videos');
    }
  }, []);

  // Process data immediately and only once
  useEffect(() => {
    if (!videoData || processedRef.current) return;

    PerformanceTracker.start('Data Processing');
    processedRef.current = true;
    setHasError(false);

    try {
      const videoResult: Record<string, VideoItem[]> = {};

      // Preserve current video if timer is active
      if (!isTimerActive) {
        const screenVideos = videoResult[screen] || [];
        const firstVideo = screenVideos[0];

        if (firstVideo) {
          // Set remote playback URL (cache resolution handled elsewhere)
          setVideoUrl(firstVideo.playbackUrl);

          // Use Gumlet thumbnail
          if (firstVideo.thumbnailUrl) {
            setPosterUrl(firstVideo.thumbnailUrl);
          }

          // Prefetch videos for this screen/tag
          prefetchVideos(screenVideos);
        }
      }

      PerformanceTracker.end('Data Processing');
    } catch (error) {
      console.error('[VideoPlayer] Processing error:', error);
      if (mountedRef.current) {
        setHasError(true);
        Toast('Something went wrong. Please check your network connection.');
      }
    }
  }, [videoData, screen, prefetchVideos, isTimerActive]);

  // Separate effect to check for cached video after video URL is set
  useEffect(() => {
    const checkForCachedVideo = async () => {
      if (!videoUrl || !videoData) return;

      const firstVideo = videoData[0];
      if (!firstVideo || firstVideo.playbackUrl !== videoUrl) return;

      setVideoUrl(firstVideo.playbackUrl);

      // try {
      //   // Check if video is cached locally for immediate playback
      //   const cachedVideo = videoCache.getCachedVideo(firstVideo.playbackUrl);
      //   if (cachedVideo) {
      //     // Verify file exists before using cached path
      //     const fileExists = await RNFS.exists(cachedVideo.localPath);
      //     if (fileExists) {
      //       console.log(
      //         `[VideoPlayer] Switching to cached video: ${cachedVideo.localPath}`,
      //       );
      //       setVideoUrl(`file://${cachedVideo.localPath}`);
      //     } else {
      //       console.warn(
      //         `[VideoPlayer] Cached file not found, keeping remote URL: ${cachedVideo.localPath}`,
      //       );
      //     }
      //   } else {
      //     console.log(
      //       `[VideoPlayer] Video not cached, keeping remote URL: ${videoUrl}`,
      //     );
      //   }
      // } catch (error) {
      //   console.error('[VideoPlayer] Error checking cached video:', error);
      // }
    };

    checkForCachedVideo();
  }, [videoUrl, videoData, screen]);

  // Sync loading state with RTK Query
  useEffect(() => {
    if (mountedRef.current) {
      setIsLoading(isFetching);

      // Track loading completion
      if (!isFetching && loadStartTimeRef.current > 0) {
        const loadTime = Date.now() - loadStartTimeRef.current;
        if (__DEV__) {
          console.log(`[VideoPlayer] Total load time: ${loadTime}ms`);
        }
        loadStartTimeRef.current = 0;
      }
    }
  }, [isFetching]);

  // Handle RTK Query error
  useEffect(() => {
    if (error && mountedRef.current) {
      setHasError(true);
      setIsLoading(false);
      Toast('Unable to load videos. Please check your network connection.');
    }
  }, [error]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleVideoError = useCallback((error: any) => {
    console.error('[VideoPlayer] Video error:', error);
    if (mountedRef.current) {
      Toast('Unable to load video. Please try again.');
    }
  }, []);

  const handleVideoLoad = useCallback(() => {
    PerformanceTracker.end('Video Load');
    if (__DEV__) {
      console.log('[VideoPlayer] Video loaded successfully');
    }
  }, []);

  const handleVideoBuffer = useCallback((isBuffering: boolean) => {
    if (__DEV__) {
      console.log(`[VideoPlayer] Buffering: ${isBuffering}`);
    }
  }, []);

  const handleVideoPress = useCallback(
    async (url: string) => {
      // Prevent video switch if sleep timer is active
      if (isTimerActive) {
        Toast('Video cannot be changed while sleep timer is running');
        return;
      }

      PerformanceTracker.start('Video Load');
      const selectedVideo = videoData?.find(v => v.playbackUrl === url);
      const videoIndex = videoData?.findIndex(v => v.playbackUrl === url);
      if (videoIndex && videoIndex !== -1) {
        setCurrentVideoIndex(videoIndex);
      }

      try {
        console.log(
          `[VideoPlayer] Handling video press: ${url} (Platform: ${Platform.OS})`,
        );

        if (!selectedVideo) return;

        setVideoUrl(selectedVideo.playbackUrl);
        setPosterUrl(selectedVideo.thumbnailUrl);

        // Check if video is cached locally
        // const cachedVideo = videoCache.getCachedVideo(selectedVideo.playbackUrl);
        // let videoToPlay = url; // Default to remote URL

        // if (cachedVideo) {
        //   console.log(
        //     `[VideoPlayer] Cached video found: ${cachedVideo.localPath}`,
        //   );

        //   // Verify file exists before using cached path
        //   const fileExists = await RNFS.exists(cachedVideo.localPath);
        //   console.log(`[VideoPlayer] Cached file exists: ${fileExists}`);

        //   if (fileExists) {
        //     videoToPlay = `file://${cachedVideo.localPath}`;
        //     console.log(`[VideoPlayer] Using cached video: ${videoToPlay}`);

        //     // iOS-specific: Check if file is readable
        //     if (Platform.OS === 'ios') {
        //       try {
        //         const fileStats = await RNFS.stat(cachedVideo.localPath);
        //         console.log(`[VideoPlayer] iOS file stats:`, {
        //           size: fileStats.size,
        //           path: fileStats.path,
        //           isFile: fileStats.isFile,
        //         });
        //       } catch (iosError) {
        //         console.error(`[VideoPlayer] iOS file stat error:`, iosError);
        //         console.warn(
        //           `[VideoPlayer] iOS: Falling back to remote despite file existence`,
        //         );
        //         videoToPlay = url;
        //       }
        //     }
        //   } else {
        //     console.warn(
        //       `[VideoPlayer] Cached file not found${
        //         Platform.OS === 'ios' ? ' (iOS: common issue)' : ''
        //       }: ${cachedVideo.localPath}`,
        //     );
        //     if (Platform.OS === 'ios') {
        //       console.error(
        //         `[VideoPlayer] iOS: Cached file not found, keeping remote URL`,
        //       );
        //     }
        //     // Note: Invalid cache entry will be cleaned up automatically on next cleanup cycle
        //   }
        // } else {
        //   console.log(`[VideoPlayer] Video not cached, using remote: ${url}`);
        // }

        // console.log(`[VideoPlayer] Final video URL: ${videoToPlay}`);
        // setVideoUrl(videoToPlay);

        // // Update poster for the selected video
        // if (selectedVideo) {
        //   const poster = selectedVideo.thumbnailUrl;
        //   if (poster) {
        //     setPosterUrl(poster);
        //   }
        // }
      } catch (error) {
        console.error('[VideoPlayer] Error in handleVideoPress:', error);
        if (Platform.OS === 'ios') {
          console.error(
            `[VideoPlayer] iOS: handleVideoPress error: ${
              (error as Error)?.message || error
            }`,
          );
        }
        // Fallback to remote URL if anything goes wrong
        setVideoUrl(url);

        // Update poster
        if (selectedVideo) {
          const poster = selectedVideo.thumbnailUrl;
          if (poster) {
            setPosterUrl(poster);
          }
        }
      }
    },
    [videoData, screen],
  );

  const handleVideoEnd = useCallback(() => {
    if (__DEV__) {
      console.log('[VideoPlayer] Video ended');
    }

    // If looping is enabled, the video will automatically repeat
    // If repeat all is enabled and looping is disabled, play next video
    if (isRepeatAll && !isLooping && videoData) {
      const nextIndex = (currentVideoIndex + 1) % videoData.length;
      setCurrentVideoIndex(nextIndex);
      const nextVideo = videoData[nextIndex];
      if (nextVideo) {
        handleVideoPress(nextVideo.playbackUrl);
      }
    }
  }, [isRepeatAll, isLooping, currentVideoIndex, videoData, handleVideoPress]);

  const toggleLoop = useCallback(() => {
    setIsLooping(prev => {
      const newValue = !prev;
      if (newValue && isRepeatAll) {
        setIsRepeatAll(false);
      }
      return newValue;
    });
  }, [isRepeatAll]);

  const toggleRepeatAll = useCallback(() => {
    setIsRepeatAll(prev => {
      const newValue = !prev;
      if (newValue && isLooping) {
        setIsLooping(false);
      }
      return newValue;
    });
  }, [isLooping]);

  const setSleepTimer = useCallback((minutes: number) => {
    setSleepTimerDuration(minutes);
    setIsTimerActive(true);
    Toast(`Sleep timer set for ${minutes} minutes`);
  }, []);

  const cancelSleepTimer = useCallback(() => {
    setSleepTimerDuration(null);
    setIsTimerActive(false);
    Toast('Sleep timer cancelled');
  }, []);

  const handleTimerEnd = useCallback(() => {
    setIsTimerActive(false);
    setSleepTimerDuration(null);
    if (videoRef.current) {
      videoRef.current.pause();
    }
    Toast('Sleep timer ended');
    // Navigate to home screen via NavigationTab (Home is the default first tab)
    navigation.navigate('NavigationTab');
  }, [navigation]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleCustomTimer = useCallback(() => {
    const minutes = parseInt(customTimerInput, 10);
    if (isNaN(minutes) || minutes <= 0) {
      Toast('Please enter a valid number of minutes');
      return;
    }
    if (minutes > 180) {
      Toast('Maximum timer duration is 180 minutes (3 hours)');
      return;
    }
    setSleepTimer(minutes);
    setShowCustomTimerModal(false);
    setCustomTimerInput('');
  }, [customTimerInput, setSleepTimer]);

  const handleSettingsPress = useCallback(() => {
    setShowSettingsModal(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettingsModal(false);
  }, []);

  const renderItem: ListRenderItem<VideoItem> = useCallback(
    ({ item }) => <VideoListItem item={item} onPress={handleVideoPress} />,
    [screen, handleVideoPress],
  );

  // Memoize video player separately to prevent re-renders
  const videoPlayerMemo = useMemo(
    () => (
      <VideoPlayerComponent
        videoUrl={videoUrl}
        posterUrl={posterUrl}
        isLoading={isLoading}
        hasError={hasError}
        onError={handleVideoError}
        onLoad={handleVideoLoad}
        onBuffer={handleVideoBuffer}
        onEnd={handleVideoEnd}
        videoRef={videoRef}
        isLooping={isLooping}
        isPaused={isPaused}
        onSettingsPress={handleSettingsPress}
      />
    ),
    [
      videoUrl,
      posterUrl,
      isLoading,
      hasError,
      handleVideoError,
      handleVideoLoad,
      handleVideoBuffer,
      handleVideoEnd,
      isLooping,
      isPaused,
      handleSettingsPress,
    ],
  );

  const handleCustomTimerPress = useCallback(
    () => setShowCustomTimerModal(true),
    [],
  );

  const renderHeader = useCallback(
    () => (
      <View>
        <StatusBar translucent backgroundColor="transparent" />
        {videoPlayerMemo}
      </View>
    ),
    [videoPlayerMemo],
  );

  const keyExtractor = useCallback((item: VideoItem) => item.playbackUrl, []);

  const backButtonStyle = useMemo(
    () => [styles.backButton, { top: insetTop + 10 }],
    [insetTop],
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 120, // 100 height + 20 marginTop
      offset: 120 * index,
      index,
    }),
    [],
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* {isFetching && <Loader loading={true} />} */}
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent
      />
      <FlatList
        data={videoData}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        keyExtractor={keyExtractor}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={3}
        initialNumToRender={2}
        getItemLayout={getItemLayout}
        updateCellsBatchingPeriod={50}
      />
      <RectButton onPress={onBackPress} style={backButtonStyle}>
        <Ionicons name="chevron-back" size={25} color="black" />
      </RectButton>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          visible={showSettingsModal}
          onClose={handleCloseSettings}
          isLooping={isLooping}
          isRepeatAll={isRepeatAll}
          toggleLoop={toggleLoop}
          toggleRepeatAll={toggleRepeatAll}
          isTimerActive={isTimerActive}
          sleepTimerDuration={sleepTimerDuration}
          formatTime={formatTime}
          handleTimerEnd={handleTimerEnd}
          setSleepTimer={setSleepTimer}
          cancelSleepTimer={cancelSleepTimer}
          handleCustomTimerPress={handleCustomTimerPress}
        />
      )}

      {/* Custom Timer Modal */}
      <Modal
        visible={showCustomTimerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomTimerModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCustomTimerModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={e => e.stopPropagation()}
              style={styles.modalContent}
            >
              <Text style={styles.modalTitle}>Custom Sleep Timer</Text>
              <Text style={styles.modalSubtitle}>
                Enter duration in minutes (1-180)
              </Text>
              <TextInput
                style={styles.modalInput}
                value={customTimerInput}
                onChangeText={setCustomTimerInput}
                placeholder="e.g., 90"
                keyboardType="number-pad"
                maxLength={3}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowCustomTimerModal(false);
                    setCustomTimerInput('');
                  }}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={handleCustomTimer}
                >
                  <Text style={styles.modalButtonConfirmText}>Set Timer</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </GestureHandlerRootView>
  );
};

export default memo(VideoScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 8,
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  settingsButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  video: {
    width: '100%',
    height: VIDEO_HEIGHT,
  },
  centerContainer: {
    width: '100%',
    height: VIDEO_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  roundedContainer: {
    width: '100%',
    height: VIDEO_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
  },
  listComponentContainer: {
    width: '92%',
    height: 110,
    marginTop: 16,
    alignSelf: 'center',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#2C2C2E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  listComponent: {
    flex: 1,
    flexDirection: 'row-reverse',
  },
  listComponentImage: {
    borderRadius: 24,
  },
  playButtonContainer: {
    position: 'absolute',
    left: '20%',
    top: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    zIndex: 2,
    opacity: 0.9,
  },
  blurContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '65%',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  textContainer: {
    width: '75%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: 24,
    zIndex: 1,
    right: 0,
    height: '100%',
  },
  componentTitle: {
    fontFamily: 'Nunito-Sans',
    fontWeight: '700',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'right',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  componentDescription: {
    fontFamily: 'Nunito-Sans',
    fontSize: 13,
    textAlign: 'right',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  skeletonBox: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#2C2C2E',
  },
  skeletonLoader: {
    position: 'absolute',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalKeyboardView: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    width: '85%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'Nunito-Sans',
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    fontFamily: 'Nunito-Sans',
    color: '#8E8E93',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalInput: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 20,
    fontFamily: 'Nunito-Sans',
    fontWeight: '600',
    color: '#1C1C1E',
    backgroundColor: '#F2F2F7',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F2F2F7',
  },
  modalButtonCancelText: {
    fontSize: 17,
    fontFamily: 'Nunito-Sans',
    fontWeight: '600',
    color: '#8E8E93',
  },
  modalButtonConfirm: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonConfirmText: {
    fontSize: 17,
    fontFamily: 'Nunito-Sans',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingsModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  settingsModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 16,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#E5E5EA',
    borderRadius: 100,
  },
  settingsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  settingsModalTitle: {
    fontSize: 28,
    fontFamily: 'Nunito-Sans',
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  settingsSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 8,
  },
  settingsSectionTitle: {
    fontSize: 13,
    fontFamily: 'Nunito-Sans',
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    gap: 10,
  },
  controlButtonActive: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  controlButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Sans',
    fontWeight: '600',
    color: '#3C3C43',
  },
  controlButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  timerTitle: {
    fontSize: 17,
    fontFamily: 'Nunito-Sans',
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  timerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  timerButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerButtonText: {
    fontSize: 15,
    fontFamily: 'Nunito-Sans',
    fontWeight: '600',
    color: '#1C1C1E',
  },
  activeTimerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 24,
  },
  timerDisplayContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  timerDisplay: {
    fontSize: 24,
    fontFamily: 'Nunito-Sans',
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  cancelTimerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelTimerText: {
    fontSize: 16,
    fontFamily: 'Nunito-Sans',
    fontWeight: '700',
    color: '#FF3B30',
  },
  customTimerButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  customTimerButtonText: {
    fontSize: 16,
    fontFamily: 'Nunito-Sans',
    fontWeight: '700',
    color: '#007AFF',
  },
});
