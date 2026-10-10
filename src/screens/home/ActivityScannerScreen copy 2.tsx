// previous activity screen
import ActivityQuest from '@/assets/images/activity-quest.png';
import CalmQuest from '@/assets/images/calm-quest.png';
import DietQuest from '@/assets/images/diet-quest.png';
import ActionButton from '@/components/home/activity-scanner/ActionButton';
import { CameraAction } from '@/components/home/activity-scanner/camera_action';
import { LogJournal } from '@/components/home/activity-scanner/log_journal';
import { QuestHeader } from '@/components/home/activity-scanner/QuestHeader';
import { TimerAction } from '@/components/home/activity-scanner/timer_action';
import { QuestCompletedModal } from '@/components/modals/quest_completed_modal';
import { ColorScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
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
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  type CameraPosition,
} from 'react-native-vision-camera';

const ACTIVITY_DURATION = 60; // 30 minutes in seconds

console.log('[ActivityScanner] Module loaded');

// ============================================================================
// ICON COMPONENTS (SVG-like shapes)
// ============================================================================

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
  const { taskId, taskType, taskName, task } = route.params;
  const taskPoints = task?.points || 20;

  const { Colors } = useAppTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
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

  // Camera & validation states
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] =
    useState<FoodValidationResult | null>(null);

  // Modal state
  const [showCompletedModal, setShowCompletedModal] = useState(false);

  const [waterCount, setWaterCount] = useState(0); // For diet quest (0-3)
  const [repCount, setRepCount] = useState(0); // For activity quest (0-5)
  const [journalText, setJournalText] = useState(''); // For activity quest journal
  const TOTAL_WATER = 3;
  const TOTAL_REPS = 5;

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

  const progressPercent =
    ((ACTIVITY_DURATION - timeRemaining) / ACTIVITY_DURATION) * 100;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleComplete = useCallback(() => {
    console.log('[ActivityScanner] Task completed!');
    // Update visual state for quest completion
    if (taskType === 'diet') {
      setWaterCount(TOTAL_WATER);
    } else if (taskType === 'activity') {
      setRepCount(TOTAL_REPS);
    }
    setTimerState('completed');

    dispatch(
      logUserTask({
        id: taskId,
        type: taskName,
        category: taskType,
        points: taskPoints,
      }),
    );

    // Show modal instead of immediate navigation
    setShowCompletedModal(true);
  }, [
    dispatch,
    taskId,
    taskName,
    taskType,
    taskPoints,
    TOTAL_WATER,
    TOTAL_REPS,
  ]);

  const handleModalClose = useCallback(() => {
    setShowCompletedModal(false);
    // Navigate back after modal closes
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  }, [navigation]);

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
        enableAutoRedEyeReduction: true,
      });

      console.log('[ActivityScanner] Photo captured:', photo.path);

      // For diet tasks, validate with AI
      if (taskType === 'diet') {
        console.log('[ActivityScanner] Validating diet photo with AI...');
        const result = await validateFoodPhoto(photo.path, taskName);
        setValidationResult(result);

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
  const ActivityConfig = {
    diet: {
      title: 'Diet Quest',
      description:
        'The first step is always the hardest, but today marks the start of something great. The first step is always the hardest, but today marks the start of something great always the hardest great.',
      gradientColors: ['rgba(39, 168, 100, 1)', 'rgba(132, 208, 169, 1)'] as [
        string,
        string,
      ],
      imageSource: DietQuest,
      angle: 135,
    },
    activity: {
      title: 'Activity Quest',
      description:
        'The first step is always the hardest, but today marks the start of something great. The first step is always the hardest, but today marks the start of something great always the hardest great.',
      gradientColors: ['rgba(198, 63, 44, 1)', 'rgba(224, 154, 145, 1)'] as [
        string,
        string,
      ],
      imageSource: ActivityQuest,
      angle: 135,
    },
    stress: {
      title: 'Calm Quest',
      description:
        'The first step is always the hardest, but today marks the start of something great. The first step is always the hardest, but today marks the start of something great always the hardest great.',
      gradientColors: ['rgba(124, 96, 200, 1)', 'rgba(182, 166, 227, 1)'] as [
        string,
        string,
      ],
      imageSource: CalmQuest,
      angle: 135,
    },
  };

  const currentActivity =
    ActivityConfig[taskType as keyof typeof ActivityConfig] ||
    ActivityConfig.diet;

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

      {/* Quest Header */}
      <QuestHeader
        title={currentActivity.title}
        description={currentActivity.description}
        gradientColors={currentActivity.gradientColors}
        imageSource={currentActivity.imageSource}
        angle={currentActivity.angle}
        onBackPress={handleBack}
        insetTop={insets.top}
      />

      <ScrollView
        contentContainerStyle={[
          styles.cameraSection,
          { paddingTop: insets.top + 270 },
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
            <Image
              source={require('@/assets/images/coin-2.png')}
              style={styles.coinIcon}
            />
          </View>

          {taskType === 'diet' ? (
            <CameraAction
              device={device}
              cameraRef={cameraRef}
              timerState={timerState}
              isCameraReady={isCameraReady}
              setIsCameraReady={setIsCameraReady}
              onBack={handleBack}
            />
          ) : taskType === 'activity' ? (
            // <LogRecord
            //   timerText={`${repCount} / ${TOTAL_REPS}`}
            //   motivationText={`You've completed ${repCount} of ${TOTAL_REPS} push-ups`}
            //   subText={'Keep going your healthy streak \nis growing 💪'}
            // />
            <LogJournal
              value={journalText}
              onChangeText={setJournalText}
              placeholder="How did your workout feel? Log your experience here..."
              maxWords={300}
            />
          ) : (
            <TimerAction
              timeRemaining={timeRemaining}
              progressPercent={progressPercent}
            />
          )}

          {/* BUTTON SECTION - Below Camera Container */}
          <ActionButton
            componentType={
              taskType === 'diet'
                ? 'camera_action'
                : taskType === 'activity'
                ? 'log_journal'
                : 'timer_action'
            }
            handleComplete={handleComplete}
            timerState={timerState}
            handleStart={handleStart}
            handlePause={handlePause}
            handleContinue={handleContinue}
            isValidating={isValidating}
          />
          {renderValidationResult()}
        </View>
      </ScrollView>

      {/* Quest Completed Modal */}
      <QuestCompletedModal
        visible={showCompletedModal}
        onClose={handleModalClose}
        questName={taskName}
        questType={taskType as 'diet' | 'activity' | 'stress'}
        xpGained={taskPoints}
      />
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const createStyles = (Colors: ColorScheme) =>
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

    coinIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
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
    startButton: {
      backgroundColor: '#1857C1',
      paddingVertical: 12,
      paddingHorizontal: 48,
      borderRadius: 30,
      width: '100%',
      alignSelf: 'center',
    },
    startButtonText: {
      fontSize: 18,
      textAlign: 'center',
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#FFFFFF',
    },
  });

export default ActivityScannerScreen;
