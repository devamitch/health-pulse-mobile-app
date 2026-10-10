import DietActivityHeader from '@/assets/images/diet-activity-header.png';
import BlurView from '@/components/base/BlurView';
import { QuestHeader } from '@/components/home/activity-scanner/QuestHeader';
import BackButton from '@/components/ui/buttons/back-button';
import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import DietQuest from '@/assets/images/diet-quest.png';

import { logButtonTap } from '@/services/analyticsService';
import {
  validateFoodPhoto,
  type FoodValidationResult,
} from '@/services/gemini-api';
import { useAppDispatch } from '@/services/mmkv-redux/hooks';
import { logUserTask } from '@/services/mmkv-redux/slices/game_engine_slice';
import { Toast } from '@/utils/toast';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  type CameraPosition,
} from 'react-native-vision-camera';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ACTIVITY_DURATION = 60; // 30 minutes in seconds

console.log('[ActivityScanner] Module loaded');

// ============================================================================
// ICON COMPONENTS (SVG-like shapes)
// ============================================================================

const ChevronLeftIcon = ({
  size = 24,
  color = '#FFF',
}: {
  size?: number;
  color?: string;
}) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: size * 0.4,
        height: size * 0.4,
        borderLeftWidth: 2.5,
        borderBottomWidth: 2.5,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginLeft: size * 0.15,
      }}
    />
  </View>
);

const CameraIcon = ({
  size = 24,
  color = '#FFF',
}: {
  size?: number;
  color?: string;
}) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <View
      style={{
        width: size * 0.8,
        height: size * 0.6,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: color,
        borderRadius: size * 0.1,
        position: 'relative',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -size * 0.15,
          right: -size * 0.15,
          width: size * 0.4,
          height: size * 0.4,
          backgroundColor: color,
          borderRadius: size * 0.2,
        }}
      />
    </View>
  </View>
);

const CheckCircleIcon = ({
  size = 24,
  checked = false,
}: {
  size?: number;
  checked?: boolean;
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: checked ? '#10B981' : '#E2E8F0',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {checked && (
      <View
        style={{
          width: size * 0.35,
          height: size * 0.2,
          borderLeftWidth: 2,
          borderBottomWidth: 2,
          borderColor: '#FFF',
          transform: [{ rotate: '-45deg' }, { translateY: -1 }],
        }}
      />
    )}
  </View>
);

const CoinIcon = ({ size = 22 }: { size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#F59E0B',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FCD34D',
    }}
  >
    <Text
      style={{
        fontSize: size * 0.5,
        fontFamily: FONT_FAMILIES.nunitoBold,
        color: '#FFF',
      }}
    >
      $
    </Text>
  </View>
);

// ============================================================================
// DUMMY VIDEO URL
// ============================================================================

const DUMMY_VIDEO_URL =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

// ============================================================================
// TYPES
// ============================================================================

interface ActivityScannerScreenProps {
  route: any;
  navigation: any;
}

type TimerState = 'idle' | 'active' | 'paused' | 'completed';
type CaptureMode = 'auto' | 'manual';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ActivityScannerScreen: React.FC<ActivityScannerScreenProps> = ({
  route,
  navigation,
}) => {
  console.log('[ActivityScanner] Component render');
  const { taskId, taskType, taskName, task, videoUrl, gradientColors } =
    route.params;
  const taskPoints = task?.points || 20;
  const questGradient = gradientColors || ['#3A225D', '#7A47C3'];

  const { Colors, DEffect } = useAppTheme();
  const styles = useMemo(
    () => createStyles(Colors, DEffect),
    [Colors, DEffect],
  );
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  // ============================================================================
  // STATE
  // ============================================================================

  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();

  // Determine initial camera position based on task type
  const initialCameraPosition: CameraPosition =
    taskType === 'diet' ? 'back' : 'front';

  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(
    initialCameraPosition,
  );

  const device = useCameraDevice(cameraPosition);

  // Timer state management
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(ACTIVITY_DURATION);
  const [captureMode, setCaptureMode] = useState<CaptureMode>('auto');
  const videoRef = useRef(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(30);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);

  // Camera & validation states
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] =
    useState<FoodValidationResult | null>(null);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);
  const [captureHistory, setCaptureHistory] = useState<
    Array<{
      timestamp: number;
      uri: string;
      validation?: FoodValidationResult;
    }>
  >([]);

  // Refs
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCaptureTimeRef = useRef<number>(0);
  const MIN_CAPTURE_INTERVAL = 10000; // 10 seconds between captures

  console.log(
    '[ActivityScanner] Task type:',
    taskType,
    'Camera:',
    cameraPosition,
  );

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Request camera permission on mount
  useEffect(() => {
    if (!hasPermission) {
      console.log('[ActivityScanner] Requesting camera permission');
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Handle task type changes
  useEffect(() => {
    if (taskType === 'diet') {
      setCameraPosition('back');
    } else {
      setCameraPosition('front');
    }
  }, [taskType]);

  // Timer logic
  useEffect(() => {
    console.log('[ActivityScanner] Timer effect - state:', timerState);

    if (timerState === 'active') {
      console.log('[ActivityScanner] Starting timer interval');

      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          console.log('[ActivityScanner] Timer tick:', newTime);

          // Auto-capture logic based on time intervals
          if (captureMode === 'auto' && newTime > 0) {
            const captureIntervals = [1500, 1200, 900, 600, 300, 60]; // 25m, 20m, 15m, 10m, 5m, 1m
            const now = Date.now();

            if (
              captureIntervals.includes(newTime) &&
              !isValidating &&
              now - lastCaptureTimeRef.current > MIN_CAPTURE_INTERVAL
            ) {
              console.log(`[ActivityScanner] Auto-capture at ${newTime}s`);
              lastCaptureTimeRef.current = now;
              capturePhoto();
            }

            // Final capture at 0 seconds
            if (newTime === 1 && !isValidating) {
              setTimeout(() => {
                capturePhoto();
              }, 1000);
            }
          }

          if (newTime <= 0) {
            console.log('[ActivityScanner] Timer completed!');
            clearTimer();
            handleComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => {
      clearTimer();
    };
  }, [timerState, captureMode, isValidating]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const clearTimer = () => {
    if (timerIntervalRef.current) {
      console.log('[ActivityScanner] Clearing timer interval');
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const formatVideoTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `00:${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent =
    ((ACTIVITY_DURATION - timeRemaining) / ACTIVITY_DURATION) * 100;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleComplete = useCallback(() => {
    console.log('[ActivityScanner] Task completed!');
    setTimerState('completed');

    dispatch(
      logUserTask({
        id: taskId,
        type: taskName,
        category: taskType,
        points: taskPoints,
      }),
    );

    Toast(`Task completed! You earned ${taskPoints} XP`);

    // Show confetti after 1 second
    setTimeout(() => {
      Toast.confetti(`${taskName} Task marked as complete!`);
    }, 1000);

    // Navigate back after 4 seconds
    setTimeout(() => {
      navigation.goBack();
    }, 4000);
  }, [dispatch, taskId, taskName, taskType, taskPoints, navigation]);

  const handleBack = useCallback(async () => {
    console.log('[ActivityScanner] Back button pressed');
    await logButtonTap('Back');
    clearTimer();
    navigation.goBack();
  }, [navigation]);

  const handleStart = useCallback(() => {
    console.log('[ActivityScanner] Start button pressed');
    setTimerState('active');
    setCaptureMode(taskType === 'diet' ? 'manual' : 'auto');
  }, [taskType]);

  const handlePause = useCallback(() => {
    console.log('[ActivityScanner] Pause button pressed');
    setTimerState('paused');
  }, []);

  const handleContinue = useCallback(() => {
    console.log('[ActivityScanner] Continue button pressed');
    setTimerState('active');
  }, []);

  const toggleCameraPosition = useCallback(() => {
    try {
    } catch {}
    if (taskType === 'diet') {
      Alert.alert('Error', 'Back camera is required for food photos');
      return;
    }
    setCameraPosition(current => (current === 'back' ? 'front' : 'back'));
  }, [taskType]);

  const toggleVideoPlayPause = useCallback(() => {
    setIsVideoPaused(prev => !prev);
  }, []);

  // ============================================================================
  // PHOTO CAPTURE & VALIDATION
  // ============================================================================

  const capturePhoto = useCallback(async () => {
    if (!cameraRef.current || !isCameraReady) {
      Toast('Camera not ready yet');
      return;
    }

    console.log('[ActivityScanner] Capturing photo...');

    try {
      setIsValidating(true);

      // Take photo
      const photo = await cameraRef.current.takePhoto({
        flash: 'auto',
        qualityPrioritization: 'quality',
        skipMetadata: false,
        enableAutoRedEyeReduction: true,
      });

      console.log('[ActivityScanner] Photo captured:', photo.path);
      setCapturedPhotoUri(photo.path);

      // Add to capture history
      const captureRecord = {
        timestamp: Date.now(),
        uri: photo.path,
      };
      setCaptureHistory(prev => [...prev, captureRecord]);

      // For diet tasks, validate with AI
      if (taskType === 'diet') {
        console.log('[ActivityScanner] Validating diet photo with AI...');
        const result = await validateFoodPhoto(photo.path, taskName);
        setValidationResult(result);

        // Update capture record with validation
        setCaptureHistory(prev =>
          prev.map(record =>
            record.timestamp === captureRecord.timestamp
              ? { ...record, validation: result }
              : record,
          ),
        );

        if (result.isValid) {
          Alert.alert(
            'Success',
            `Validated: ${result.foodType} (${result.confidence}% confidence)`,
          );

          // If confidence is high enough, mark as complete
          if (result.confidence >= 70) {
            setTimeout(() => {
              handleComplete();
            }, 2000);
          } else {
            Toast('Please ensure your photo clearly shows the activity');
          }
        } else {
          Alert.alert(
            'Error',
            'Could not validate activity. Please try again.',
          );
        }
      } else {
        // For non-diet tasks, just show success
        Alert.alert('Success', 'Photo captured successfully!');
      }
    } catch (error) {
      console.error('[ActivityScanner] Photo capture error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    } finally {
      setIsValidating(false);
    }
  }, [cameraRef, isCameraReady, taskType, taskName, handleComplete]);

  const toggleCaptureMode = useCallback(() => {
    setCaptureMode(prev => (prev === 'auto' ? 'manual' : 'auto'));
    Toast(`Capture mode: ${captureMode === 'auto' ? 'Manual' : 'Auto'}`);
  }, [captureMode]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderCameraOverlay = () => {
    if (taskType === 'diet') {
      return (
        <View style={styles.foodOverlay}>
          <Text style={styles.foodOverlayText}>Food Camera</Text>
          <Text style={styles.foodOverlaySubtext}>
            Position food in the frame
          </Text>
          <View style={styles.foodFrame}>
            <View style={styles.foodFrameBorder} />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.activityOverlay}>
        <Text style={styles.activityOverlayText}>Activity Camera</Text>
        <Text style={styles.activityOverlaySubtext}>
          Face the camera for activity tracking
        </Text>
      </View>
    );
  };

  const renderValidationResult = () => {
    if (!validationResult) return null;

    return (
      <View style={styles.validationContainer}>
        <View
          style={[
            styles.validationBadge,
            validationResult.isValid
              ? styles.validationSuccess
              : styles.validationError,
          ]}
        >
          <Text style={styles.validationBadgeText}>
            {validationResult.isValid ? 'Valid' : 'Invalid'}
          </Text>
          <Text style={styles.validationConfidence}>
            {validationResult.confidence}% confidence
          </Text>
        </View>
        <Text style={styles.validationMessage}>{validationResult.message}</Text>
        {validationResult.suggestions &&
          validationResult.suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {validationResult.suggestions.map((suggestion, index) => (
                <View
                  key={index}
                  style={{ flexDirection: 'row', marginTop: 4 }}
                >
                  <Text style={styles.suggestionBullet}>•</Text>
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </View>
              ))}
            </View>
          )}
      </View>
    );
  };

  // ============================================================================
  // PERMISSION & DEVICE CHECKS
  // ============================================================================

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000"
          translucent
        />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Camera permission required</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={requestPermission}
          >
            <Text style={styles.startButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // if (!device) {
  //   return (
  //     <View style={styles.container}>
  //       <StatusBar
  //         barStyle="light-content"
  //         backgroundColor="#000"
  //         translucent
  //       />
  //       <View style={styles.permissionContainer}>
  //         <Text style={styles.permissionText}>No camera device found</Text>
  //         <TouchableOpacity style={styles.startButton} onPress={handleBack}>
  //           <Text style={styles.startButtonText}>Go Back</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   );
  // }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

      {/* Show video player only for activity and calm quests */}
      {taskType !== 'diet' && (
        <View style={styles.videoSection}>
          <Video
            ref={videoRef}
            source={{ uri: videoUrl || task?.videoUrl || DUMMY_VIDEO_URL }}
            style={styles.video}
            resizeMode="cover"
            paused={isVideoPaused || timerState === 'paused'}
            repeat={false}
            onProgress={data => {
              setVideoCurrentTime(data.currentTime);
            }}
            onLoad={data => {
              setVideoDuration(data.duration);
              setIsVideoLoaded(true);
            }}
            onError={error => {
              console.error('[ActivityScanner] Video error:', error);
            }}
          />

          {/* Play/Pause Button Overlay */}
          <TouchableOpacity
            style={styles.videoPlayPauseButton}
            onPress={toggleVideoPlayPause}
            activeOpacity={0.8}
          >
            <View style={styles.playPauseIconContainer}>
              <MaterialCommunityIcons
                name={isVideoPaused ? 'play' : 'pause'}
                size={28}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>

          {/* Video Progress Bar */}
          <View style={styles.videoProgressContainer}>
            <View style={styles.videoProgressBar}>
              <View
                style={[
                  styles.videoProgressFill,
                  {
                    width: `${
                      (videoCurrentTime / (videoDuration || 1)) * 100
                    }%`,
                  },
                ]}
              />
              <View
                style={[
                  styles.videoProgressThumb,
                  {
                    left: `${(videoCurrentTime / (videoDuration || 1)) * 100}%`,
                  },
                ]}
              />
            </View>
            <View style={styles.videoTimeRow}>
              <Text style={styles.videoTimeText}>
                {formatVideoTime(videoCurrentTime)}
              </Text>
              <Text style={styles.videoTimeText}>
                {formatVideoTime(videoDuration)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Diet Quest Header */}
      {taskType === 'diet' && (
        <QuestHeader
          title="Diet Quest"
          description="The first step is always the hardest, but today marks the start of something great. The first step is always the hardest, but today marks the start of something great always the hardest great."
          gradientColors={['rgba(39, 168, 100, 1)', 'rgba(132, 208, 169, 1)']}
          imageSource={DietQuest}
          angle={90.08}
          onBackPress={handleBack}
          insetTop={insets.top}
        />
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 12 }]}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <ChevronLeftIcon size={24} color="#FFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.flipButton, { top: insets.top + 12 }]}
        onPress={toggleCameraPosition}
        activeOpacity={0.7}
      >
        <Text style={styles.flipButtonText}>↻</Text>
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={[
          styles.cameraSection,
          taskType === 'diet' && { paddingTop: insets.top + 220 },
        ]}
      >
        {/* TASK HEADER */}
        <View style={styles.containerSection}>
          <View style={[styles.taskHeader, { marginTop: 12 }]}>
            <CheckCircleIcon size={24} checked={timerState === 'completed'} />
            <Text style={styles.taskTitle} numberOfLines={1}>
              {taskName}
            </Text>
            <Text style={styles.taskXp}>{taskPoints}XP</Text>
            <CoinIcon size={22} />
          </View>
          {taskType === 'diet' && captureHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>Capture History</Text>
              <View style={styles.historyList}>
                {captureHistory.slice(-3).map((record, index) => (
                  <View key={index} style={styles.historyItem}>
                    <Text style={styles.historyTime}>
                      {new Date(record.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {record.validation && (
                      <Text
                        style={[
                          styles.historyStatus,
                          record.validation.isValid
                            ? styles.historyValid
                            : styles.historyInvalid,
                        ]}
                      >
                        {record.validation.isValid ? '✓' : '✗'}
                        {record.validation.confidence}%
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Camera Container - Only for activity and diet quests */}
          {taskType !== 'stress' && (
            <View style={styles.cameraContainer}>
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 24,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {!device ? (
                  <View style={styles.container}>
                    <StatusBar
                      barStyle="light-content"
                      backgroundColor="#000"
                      translucent
                    />
                    <View style={styles.permissionContainer}>
                      <Text style={styles.permissionText}>
                        No camera device found
                      </Text>
                      <TouchableOpacity
                        style={styles.startButton}
                        onPress={handleBack}
                      >
                        <Text style={styles.startButtonText}>Go Back</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Camera
                    ref={cameraRef}
                    // style={styles.camera}
                    device={device}
                    isActive={timerState !== 'completed'}
                    photo={true}
                    video={false}
                    audio={false}
                    onInitialized={() => {
                      console.log('[ActivityScanner] Camera initialized');
                      setIsCameraReady(true);
                    }}
                    onError={error => {
                      console.error('[ActivityScanner] Camera error:', error);
                      Alert.alert('Error', 'Camera error: ' + error.message);
                    }}
                    style={{ width: '100%', height: '100%', borderRadius: 30 }}
                  />
                )}

                <LinearGradient
                  colors={['#00000035', '#00000089']}
                  style={StyleSheet.absoluteFillObject}
                />
              </View>
              {/* <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>No camera device found</Text>/{' '}
              </View> */}
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    position: 'absolute',
                    top: '15%',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1,
                  },
                ]}
              >
                {/* TIMER DISPLAY (only for calm quest when active) */}
              </View>

              <View style={styles.poseContainer}>
                <Animated.View style={[styles.poseFrame]}>
                  {/* Glow effect */}
                  <Animated.View style={[styles.poseGlow]} />

                  {/* Corners */}
                  <View
                    style={[
                      styles.poseCorner,
                      styles.poseTL,
                      {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.poseCorner,
                      styles.poseTR,
                      {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.poseCorner,
                      styles.poseBL,
                      {
                        borderColor: 'rgba(255,255,255,0.4)',
                      },
                    ]}
                  />
                  <View style={[styles.poseCorner, styles.poseBR]} />
                </Animated.View>
              </View>
              {/* Camera overlay based on task type */}
            </View>
          )}

          {taskType === 'stress' && (
            <View style={styles.timerContainer}>
              <Text style={[styles.timerText]}>
                {formatTime(timeRemaining)}
              </Text>
              <Text style={styles.motivationText}>
                {progressPercent < 25 && 'Getting started! Keep it up!'}
                {progressPercent >= 25 &&
                  progressPercent < 50 &&
                  'Great progress! You can do this!'}
                {progressPercent >= 50 &&
                  progressPercent < 75 &&
                  'Halfway there! Stay strong!'}
                {progressPercent >= 75 &&
                  progressPercent < 100 &&
                  'Almost done! Final push!'}
                {progressPercent >= 100 && 'Activity complete! Great job!'}
              </Text>

              <Text style={styles.motivationSubText}>
                {'Keep going your healthy streak \nis growing 💪'}
              </Text>

              {/* Capture Stats */}
              {captureHistory.length > 0 && (
                <View style={styles.captureStats}>
                  <Text style={styles.captureStatsText}>
                    {captureHistory.length} photo
                    {captureHistory.length !== 1 ? 's' : ''} captured
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* BUTTON SECTION - Below Camera Container */}
          <View style={styles.bottomButtonSection}>
            {taskType === 'diet' ? (
              // Diet Quest: Only show Complete Quest button
              <TouchableOpacity
                style={styles.dietCompleteButton}
                onPress={handleComplete}
                activeOpacity={0.8}
              >
                <Text style={styles.completeButtonText}>Complete Quest</Text>
              </TouchableOpacity>
            ) : // Activity & Calm Quest: Show Start Quest button, then Pause/Complete
            timerState === 'idle' ? (
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Start Quest</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonRow}>
                {timerState === 'active' ? (
                  <TouchableOpacity
                    style={styles.pauseButton}
                    onPress={handlePause}
                    activeOpacity={0.7}
                    disabled={timerState === 'completed'}
                  >
                    <Text style={styles.pauseButtonText}>Pause</Text>
                  </TouchableOpacity>
                ) : timerState === 'paused' ? (
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                    disabled={timerState === 'completed'}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[
                    styles.completeButton,
                    (timerState === 'completed' || isValidating) &&
                      styles.completeButtonDisabled,
                  ]}
                  onPress={handleComplete}
                  activeOpacity={0.8}
                  disabled={timerState === 'completed' || isValidating}
                >
                  {isValidating ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.completeButtonText}>
                      {timerState === 'completed' ? 'Completed' : 'End Quest'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
          {/* VALIDATION RESULT */}
          {renderValidationResult()}
        </View>
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const createStyles = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    containerSection: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
      borderRadius: 24,
      margin: 16,
      padding: 16,
    },
    poseContainer: {
      position: 'absolute',
      top: '7%',
      left: '7%',
      right: '7%',
      bottom: '7%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    poseFrame: {
      width: '100%',
      height: '100%',
      borderWidth: 0,
      // borderStyle: 'dashed',
      borderRadius: 36,
    },
    poseGlow: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 34,
      borderWidth: 0,
      borderColor: '#eeeef47b',
    },
    poseCorner: {
      position: 'absolute',
      width: 44,
      height: 44,
      borderColor: '#eeeef47b',
    },
    poseTL: {
      top: -2,
      left: -2,
      borderTopWidth: 5,
      borderLeftWidth: 5,
      borderTopLeftRadius: 36,
      borderColor: '#eeeef47b',
    },
    poseTR: {
      top: -2,
      right: -2,
      borderTopWidth: 5,
      borderRightWidth: 5,
      borderTopRightRadius: 36,
      borderColor: '#eeeef47b',
    },
    poseBL: {
      bottom: -2,
      left: -2,
      borderBottomWidth: 5,
      borderLeftWidth: 5,
      borderBottomLeftRadius: 36,
      borderColor: '#eeeef47b',
    },
    poseBR: {
      bottom: -2,
      right: -2,
      borderBottomWidth: 5,
      borderRightWidth: 5,
      borderBottomRightRadius: 36,
      borderColor: '#eeeef47b',
    },
    container: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },

    // CAMERA SECTION
    cameraSection: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
      paddingTop: 16,
    },
    camera: {
      width: '100%',
      height: '100%',
      borderRadius: 24,
    },
    cameraContainer: {
      width: SCREEN_WIDTH - 56,
      height: SCREEN_WIDTH * 0.8,
      borderRadius: 24,
      overflow: 'hidden',
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.black,
      marginTop: 16,
    },

    // FOOD & ACTIVITY OVERLAYS
    foodOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 24,
    },
    foodOverlayText: {
      fontSize: 20,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.white,
      marginBottom: 8,
    },
    foodOverlaySubtext: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 24,
    },
    foodFrame: {
      width: '70%',
      height: '50%',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      borderRadius: 16,
      position: 'relative',
    },
    foodFrameBorder: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '80%',
      height: '60%',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 12,
      transform: [{ translateX: -80 }, { translateY: -60 }],
    },
    activityOverlay: {
      position: 'absolute',
      top: 16,
      left: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    activityOverlayText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.white,
    },
    activityOverlaySubtext: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.8)',
    },

    // CAMERA BUTTONS
    backButton: {
      position: 'absolute',
      left: 32,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    flipButton: {
      position: 'absolute',
      right: 32,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    flipButtonText: {
      fontSize: 24,
      color: Colors.white,
      fontFamily: FONT_FAMILIES.nunitoBold,
    },
    captureButton: {
      position: 'absolute',
      bottom: 100,
      alignSelf: 'center',
      zIndex: 10,
    },
    captureButtonOuter: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    captureButtonInner: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#3B82F6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    captureModeButton: {
      position: 'absolute',
      bottom: 180,
      alignSelf: 'center',
      zIndex: 10,
    },
    captureModeBadge: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    captureModeText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.white,
    },

    // TASK HEADER
    taskHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      marginBottom: 24,
    },
    taskTitle: {
      flex: 1,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textPrimaryColor,
      marginLeft: 12,
    },
    taskXp: {
      fontSize: 15,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textSecondary,
      marginRight: 8,
    },

    // VALIDATION CONTAINER
    validationContainer: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12,
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    validationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    validationSuccess: {
      backgroundColor: '#D1FAE5',
    },
    validationError: {
      backgroundColor: '#FEE2E2',
    },
    validationBadgeText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: '#065F46',
      marginRight: 8,
    },
    validationConfidence: {
      fontSize: 12,
      color: '#6B7280',
    },
    validationMessage: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    suggestionsContainer: {
      backgroundColor: Colors.surfaceHover,
      borderRadius: 8,
      padding: 12,
    },
    suggestionBullet: {
      fontSize: 14,
      color: '#6B7280',
      marginRight: 8,
    },
    suggestionText: {
      flex: 1,
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      lineHeight: 18,
    },

    // HISTORY CONTAINER
    historyContainer: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12,
      shadowColor: Colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    historyTitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textPrimaryColor,
      marginBottom: 12,
    },
    historyList: {
      gap: 8,
    },
    historyItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    historyTime: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
    },
    historyStatus: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
    },
    historyValid: {
      color: '#10B981',
    },
    historyInvalid: {
      color: '#EF4444',
    },

    // DIET HEADER SECTION
    dietHeader: {
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH * 0.7,
      backgroundColor: Colors.primaryColor,
      overflow: 'hidden',
      alignSelf: 'center',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dietHeaderContent: {
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    dietHeaderTitle: {
      fontSize: 28,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
      textAlign: 'center',
      marginBottom: 16,
    },
    dietHeaderSubtitle: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#FFFFFF',
      textAlign: 'center',
      lineHeight: 24,
      opacity: 0.9,
    },

    // VIDEO SECTION
    videoSection: {
      // width: SCREEN_WIDTH - 32,
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH * 0.7,
      backgroundColor: Colors.black,
      borderRadius: 16,
      overflow: 'hidden',
      alignSelf: 'center',
      // marginVertical: 12,
    },
    video: {
      width: '100%',
      height: '100%',
    },
    videoPlayPauseButton: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: [{ translateX: -30 }, { translateY: -30 }],
      zIndex: 10,
    },
    playPauseIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoProgressContainer: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      right: 12,
    },
    videoProgressBar: {
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    videoProgressFill: {
      height: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: 2,
    },
    videoProgressThumb: {
      position: 'absolute',
      top: -4,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#FFFFFF',
      marginLeft: -6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    videoTimeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    videoTimeText: {
      fontSize: 12,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.white,
    },

    // TIMER OVERLAY
    timerOverlay: {
      alignItems: 'center',
      marginTop: 45,
      paddingHorizontal: 16,
    },

    // BOTTOM BUTTON SECTION
    bottomButtonSection: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },

    // START SCREEN
    startContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    startTitle: {
      fontSize: 28,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.textPrimaryColor,
      marginBottom: 12,
      textAlign: 'center',
    },
    startDescription: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 24,
    },
    startHint: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textTertiary,
      textAlign: 'center',
      marginBottom: 32,
      fontStyle: 'italic',
    },
    startButton: {
      backgroundColor: Colors.primaryColor,
      paddingVertical: 16,
      paddingHorizontal: 48,
      borderRadius: 30,
      shadowColor: Colors.primaryColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
      width: 200,
      alignSelf: 'center',
    },
    startButtonText: {
      fontSize: 17,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.white,
    },

    // TIMER DISPLAY
    timerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: 254,
      borderRadius: 18,
      backgroundColor: 'rgba(244, 244, 244, 1)',
    },
    timerBox: {
      borderRadius: 20,
      padding: 16,
      gap: 12,
    },
    timerText: {
      fontSize: 60,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: 'rgba(128, 128, 128, 1)',
      letterSpacing: 2,
      textAlign: 'center',
    },
    timerStatus: {
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.primaryColor,
      marginBottom: 20,
    },
    motivationText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
      textAlign: 'center',
    },
    motivationSubText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: Colors.textColor,
      textAlign: 'center',
    },
    progressBarContainer: {
      width: '100%',
      alignItems: 'center',
      marginBottom: 16,
    },
    progressBar: {
      width: '100%',
      height: 8,
      backgroundColor: Colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#10B981',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textSecondary,
    },
    captureStats: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      width: '100%',
      alignItems: 'center',
    },
    captureStatsText: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textSecondary,
    },

    // BUTTONS
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    pauseButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 30,
      borderWidth: 1.5,
      borderColor: Colors.border,
      backgroundColor: Colors.surface,
      alignItems: 'center',
    },
    pauseButtonText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textSecondary,
    },
    continueButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 30,
      backgroundColor: '#10B981',
      alignItems: 'center',
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    continueButtonText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.white,
    },
    completedBadge: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 30,
      backgroundColor: '#10B981',
      alignItems: 'center',
    },
    completedText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: Colors.white,
    },
    completeButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 30,
      backgroundColor: Colors.primaryColor,
      alignItems: 'center',
      shadowColor: Colors.primaryColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    completeButtonDisabled: {
      backgroundColor: Colors.textTertiary,
      shadowColor: Colors.textTertiary,
    },
    completeButtonText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
    dietCompleteButton: {
      width: '100%',
      paddingVertical: 16,
      borderRadius: 30,
      backgroundColor: Colors.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: Colors.primaryColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },

    // PERMISSION CONTAINER
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: Colors.black,
    },
    permissionText: {
      fontSize: 18,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.white,
      textAlign: 'center',
      marginBottom: 24,
    },
  });

export default ActivityScannerScreen;
