import ActivityQuest from '@/assets/images/activity-quest.png';
import CalmQuest from '@/assets/images/calm-quest.png';
import DietQuest from '@/assets/images/diet-quest.png';
import ActionButton from '@/components/home/activity-scanner/ActionButton';
import { CameraAction } from '@/components/home/activity-scanner/camera_action';
import { LogJournal } from '@/components/home/activity-scanner/log_journal';
import { LogRecord } from '@/components/home/activity-scanner/log_record';
import { QuestHeader } from '@/components/home/activity-scanner/QuestHeader';
import { TimerAction } from '@/components/home/activity-scanner/timer_action';
import { WatchVideoAction } from '@/components/home/activity-scanner/watch_video_action';
import { QuestCompletedModal } from '@/components/modals/quest_completed_modal';

import { ColorScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import type {
  AIValidationResult,
  TimerState as ReduxTimerState,
  TaskAction,
  TaskCategory,
  TaskProof,
} from '@/lib/types/game-progression.types';
import AIValidationService from '@/services/AIValidationService';
import { logButtonTap } from '@/services/analyticsService';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import {
  clearTaskTimer,
  completeTask,
  gameSelectors,
  pauseTaskTimer,
  recordTokenUsage,
  resumeTaskTimer,
  startTaskTimer,
} from '@/services/mmkv-redux/slices/gameProgressionSlice';
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
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  type CameraPosition,
} from 'react-native-vision-camera';

// ============================================================================
// TYPES
// ============================================================================

type LocalTimerState = 'idle' | 'active' | 'paused' | 'completed';

interface ActivityScannerScreenProps {
  route: any;
  navigation: any;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ACTIVITY_DURATION = 60;

const THEME_CONFIG: Record<
  TaskCategory,
  {
    title: string;
    description: string;
    gradientColors: [string, string];
    imageSource: any;
    angle: number;
  }
> = {
  diet: {
    title: 'Diet Quest',
    description:
      'The first step is always the hardest, but today marks the start of something great. The first step is always the hardest, but today marks the start of something great always the hardest great.',
    gradientColors: ['rgba(39, 168, 100, 1)', 'rgba(132, 208, 169, 1)'],
    imageSource: DietQuest,
    angle: 135,
  },
  activity: {
    title: 'Activity Quest',
    description:
      'The first step is always the hardest, but today marks the start of something great. The first step is always the hardest, but today marks the start of something great always the hardest great.',
    gradientColors: ['rgba(198, 63, 44, 1)', 'rgba(224, 154, 145, 1)'],
    imageSource: ActivityQuest,
    angle: 135,
  },
  stress: {
    title: 'Calm Quest',
    description:
      'The first step is always the hardest, but today marks the start of something great. The first step is always the hardest, but today marks the start of something great always the hardest great.',
    gradientColors: ['rgba(124, 96, 200, 1)', 'rgba(182, 166, 227, 1)'],
    imageSource: CalmQuest,
    angle: 135,
  },
};

// ============================================================================
// ICON COMPONENT
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
// HELPER
// ============================================================================

function getDefaultAction(taskType: string): TaskAction {
  switch (taskType) {
    case 'diet':
      return 'capture_photo';
    case 'activity':
      return 'timer';
    case 'stress':
      return 'timer';
    default:
      return 'timer';
  }
}

/** Map Redux timer status → local UI timer state */
function mapReduxTimerToLocal(
  reduxTimer: ReduxTimerState | undefined,
  taskId: string,
): LocalTimerState {
  if (!reduxTimer || reduxTimer.taskId !== taskId) return 'idle';
  switch (reduxTimer.status) {
    case 'active':
      return 'active';
    case 'paused':
      return 'paused';
    case 'completed':
      return 'completed';
    default:
      return 'idle';
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ActivityScannerScreen: React.FC<ActivityScannerScreenProps> = ({
  route,
  navigation,
}) => {
  // ---------------------------------------------------------------------------
  // STORE TASK LOOKUP
  // ---------------------------------------------------------------------------
  const { taskId, taskType: routeTaskType } = route.params;
  const dispatch = useAppDispatch();

  // Pull tasks from Redux store
  const storeTasks = useAppSelector(gameSelectors.selectTodaysTasks);
  const task = useMemo(
    () => storeTasks.find(t => t.id === taskId),
    [storeTasks, taskId],
  );

  // Derive from store task — route params are only fallbacks
  const taskType: TaskCategory =
    (task?.category as TaskCategory) ?? routeTaskType ?? 'diet';
  const taskName: string = task?.title ?? 'Quest';
  const taskPoints: number = task?.points ?? task?.coins ?? 20;
  const taskAction: TaskAction = task?.action ?? getDefaultAction(taskType);
  const taskDuration: number = task?.seconds ?? ACTIVITY_DURATION;

  // ---------------------------------------------------------------------------
  // SELECTORS — centralized timer from Redux
  // ---------------------------------------------------------------------------
  const reduxActiveTimer = useAppSelector(gameSelectors.selectActiveTimer);
  const reduxTimerRemaining = useAppSelector(
    gameSelectors.selectTimerRemaining,
  );
  const reduxTimerElapsed = useAppSelector(gameSelectors.selectTimerElapsed);
  const remainingTokenBudget = useAppSelector(
    gameSelectors.selectRemainingTokenBudget,
  );

  // Map Redux timer → local UI state
  const timerState: LocalTimerState = useMemo(
    () =>
      mapReduxTimerToLocal(
        reduxActiveTimer as ReduxTimerState | undefined,
        taskId,
      ),
    [reduxActiveTimer, taskId],
  );

  // Use Redux timer for remaining time, fallback to duration if no timer started
  const timeRemaining = useMemo(() => {
    if (timerState === 'idle') return taskDuration;
    return Math.max(0, reduxTimerRemaining);
  }, [timerState, taskDuration, reduxTimerRemaining]);

  const progressPercent = useMemo(
    () => ((taskDuration - timeRemaining) / taskDuration) * 100,
    [taskDuration, timeRemaining],
  );

  // ---------------------------------------------------------------------------
  // THEMING
  // ---------------------------------------------------------------------------
  const { Colors } = useAppTheme();
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const insets = useSafeAreaInsets();
  const theme = THEME_CONFIG[taskType] || THEME_CONFIG.diet;

  // ---------------------------------------------------------------------------
  // CAMERA STATE
  // ---------------------------------------------------------------------------
  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const initialCameraPosition: CameraPosition =
    taskAction === 'capture_photo' ? 'back' : 'front';
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(
    initialCameraPosition,
  );
  const device = useCameraDevice(cameraPosition);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // ---------------------------------------------------------------------------
  // VALIDATION STATE
  // ---------------------------------------------------------------------------
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] =
    useState<AIValidationResult | null>(null);
  const [capturedPhotoUri, setCapturedPhotoUri] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // MODAL & ACTION-SPECIFIC STATE
  // ---------------------------------------------------------------------------
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [repCount, setRepCount] = useState(0);
  const TOTAL_REPS = 5;

  // ---------------------------------------------------------------------------
  // LOCAL TIMER TICK (reads Redux state, auto-completes when 0)
  // ---------------------------------------------------------------------------
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (taskAction !== 'timer' && taskAction !== 'log_record') return;

    if (timerState === 'active') {
      // Tick every second to update the foreground state and check completion
      tickRef.current = setInterval(() => {
        dispatch({ type: 'game/updateTimerOnForeground' });
      }, 1000);
    } else {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    }

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [taskAction, timerState, dispatch]);

  // Auto-complete when Redux timer reaches completed
  useEffect(() => {
    if (timerState === 'completed' && !showCompletedModal) {
      handleComplete();
    }
  }, [timerState]);

  // ---------------------------------------------------------------------------
  // CAMERA PERMISSION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (taskAction === 'capture_photo' && !hasPermission) {
      requestPermission();
    }
  }, [taskAction, hasPermission, requestPermission]);

  useEffect(() => {
    setCameraPosition(taskAction === 'capture_photo' ? 'back' : 'front');
  }, [taskAction]);

  // ---------------------------------------------------------------------------
  // CLEANUP on unmount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      // Don't clear timer on unmount — user might come back
      // Timer persists in Redux
    };
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /** Central completion handler — dispatches to Redux with full proof */
  const handleComplete = useCallback(() => {
    // Build proof based on action type
    let proof: TaskProof | undefined;

    switch (taskAction) {
      case 'capture_photo':
        proof = {
          type: 'photo',
          uri: capturedPhotoUri ?? undefined,
          aiAnalysis: validationResult ?? undefined,
          submittedAt: Date.now(),
        };
        break;

      case 'timer':
        proof = {
          type: 'timer',
          playDuration: reduxTimerElapsed,
          completionPercentage: progressPercent >= 100 ? 100 : progressPercent,
          submittedAt: Date.now(),
        };
        break;

      case 'watch_video':
        proof = {
          type: 'video',
          playDuration: taskDuration,
          completionPercentage: 100,
          submittedAt: Date.now(),
        };
        break;

      case 'log_journal':
        proof = {
          type: 'journal',
          journalText,
          submittedAt: Date.now(),
        };
        break;

      case 'log_record':
        proof = {
          type: 'manual',
          completionPercentage: (repCount / TOTAL_REPS) * 100,
          submittedAt: Date.now(),
        };
        break;
    }

    // Dispatch completeTask — this handles XP, scores, logs, photoProofs, level-up
    dispatch(
      completeTask({
        taskId,
        proof,
      }),
    );

    // Clear Redux timer if active for this task
    if (
      reduxActiveTimer &&
      (reduxActiveTimer as ReduxTimerState).taskId === taskId
    ) {
      dispatch(clearTaskTimer());
    }

    setShowCompletedModal(true);
  }, [
    dispatch,
    taskId,
    taskAction,
    capturedPhotoUri,
    validationResult,
    reduxTimerElapsed,
    progressPercent,
    taskDuration,
    journalText,
    repCount,
    TOTAL_REPS,
    reduxActiveTimer,
  ]);

  const handleModalClose = useCallback(() => {
    setShowCompletedModal(false);
    setTimeout(() => navigation.goBack(), 300);
  }, [navigation]);

  const handleBack = useCallback(async () => {
    await logButtonTap('Back');
    // Pause timer if active (don't clear — user can resume)
    if (timerState === 'active') {
      dispatch(pauseTaskTimer());
    }
    navigation.goBack();
  }, [navigation, timerState, dispatch]);

  /** Start timer — dispatches to Redux centralized timer */
  const handleStart = useCallback(() => {
    dispatch(
      startTaskTimer({
        taskId,
        targetSeconds: taskDuration,
      }),
    );
  }, [dispatch, taskId, taskDuration]);

  const handlePause = useCallback(() => {
    dispatch(pauseTaskTimer());
  }, [dispatch]);

  const handleContinue = useCallback(() => {
    dispatch(resumeTaskTimer());
  }, [dispatch]);

  // ============================================================================
  // LOG RECORD HANDLER
  // ============================================================================

  const handleLogRecordComplete = useCallback(() => {
    setRepCount(prev => {
      const next = prev + 1;
      if (next >= TOTAL_REPS) {
        handleComplete();
      }
      return next;
    });
  }, [handleComplete, TOTAL_REPS]);

  // ============================================================================
  // PHOTO CAPTURE & AI VALIDATION
  // ============================================================================

  const capturePhoto = useCallback(async () => {
    if (!cameraRef.current || !isCameraReady) {
      Toast.error('Camera not ready yet');
      return;
    }
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'auto',
        enableAutoRedEyeReduction: true,
      });
      setCapturedPhotoUri(`file://${photo.path}`);
    } catch (error) {
      console.error('[ActivityScanner] Photo capture error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  }, [isCameraReady]);

  const handleGalleryPick = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage || 'Failed to pick image');
        return;
      }
      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert('Error', 'No image selected');
        return;
      }
      setCapturedPhotoUri(asset.uri);
    } catch (error) {
      console.error('[ActivityScanner] Gallery pick error:', error);
      Alert.alert('Error', 'Failed to process image from gallery');
    }
  }, []);

  /**
   * Validate photo using AIValidationService (replaces gemini-api).
   * Tracks token usage, stores proof with macros.
   */
  const validateAndComplete = useCallback(async () => {
    if (!capturedPhotoUri) {
      Toast.error('No photo to validate');
      return;
    }

    try {
      setIsValidating(true);

      // Check if we have token budget for AI validation
      const canUseAI = AIValidationService.canValidate(remainingTokenBudget);

      let result: AIValidationResult;

      if (canUseAI) {
        // Use AI validation
        const output = await AIValidationService.validatePhotoWithTokens({
          uri: capturedPhotoUri,
          expectedCategory: taskType,
          taskDescription: task?.description ?? taskName,
          taskName,
        });

        result = output.result;

        // Track token usage in Redux
        dispatch(
          recordTokenUsage({
            tokens: output.tokensUsed,
            type: 'photoValidation',
          }),
        );
      } else {
        // Fallback — no budget for AI
        result = AIValidationService.getFallbackResult(taskName, taskType);
      }

      setValidationResult(result);

      if (result.isValid) {
        Toast.success(
          result.message || 'Photo matches the quest requirements!',
        );
        // Short delay so user sees toast, then complete
        setTimeout(() => handleComplete(), 1200);
      } else {
        Toast.error(
          result.message ||
            "This photo doesn't match the quest. Please try again.",
        );
      }
    } catch (error) {
      console.error('[ActivityScanner] Photo validation error:', error);
      // On error, use fallback and auto-accept
      const fallback = AIValidationService.getFallbackResult(
        taskName,
        taskType,
      );
      setValidationResult(fallback);
      Toast.success(fallback.message || 'Photo accepted!');
      setTimeout(() => handleComplete(), 1200);
    } finally {
      setIsValidating(false);
    }
  }, [
    capturedPhotoUri,
    taskType,
    taskName,
    task?.description,
    remainingTokenBudget,
    dispatch,
    handleComplete,
  ]);

  const handleRetake = useCallback(() => {
    setCapturedPhotoUri(null);
    setValidationResult(null);
  }, []);

  const handleCameraFlip = useCallback(() => {
    setCameraPosition(prev => (prev === 'back' ? 'front' : 'back'));
  }, []);

  // ============================================================================
  // VALIDATION RESULT UI
  // ============================================================================

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
            {validationResult.confidence ?? 0}% confidence
          </Text>
        </View>

        <Text style={styles.validationMessage}>
          {validationResult.message ?? validationResult.feedback ?? ''}
        </Text>

        {/* Show detected items */}
        {validationResult.detectedItems &&
          validationResult.detectedItems.length > 0 && (
            <Text style={styles.detectedItemsText}>
              Detected: {validationResult.detectedItems.join(', ')}
            </Text>
          )}

        {/* Show macros for diet tasks */}
        {taskType === 'diet' && validationResult.macros && (
          <View style={styles.macroRow}>
            <View style={styles.macroChip}>
              <Text style={styles.macroLabel}>Cal</Text>
              <Text style={styles.macroValue}>
                {validationResult.macros.calories ?? 0}
              </Text>
            </View>
            <View style={styles.macroChip}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>
                {validationResult.macros.protein ?? 0}g
              </Text>
            </View>
            <View style={styles.macroChip}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>
                {validationResult.macros.carbs ?? 0}g
              </Text>
            </View>
            <View style={styles.macroChip}>
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroValue}>
                {validationResult.macros.fats ?? 0}g
              </Text>
            </View>
          </View>
        )}

        {/* Suggestions */}
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
  // ACTION → COMPONENT RENDERER
  // ============================================================================

  const renderActionComponent = () => {
    switch (taskAction) {
      case 'capture_photo':
        return (
          <CameraAction
            device={device}
            cameraRef={cameraRef}
            timerState={timerState}
            isCameraReady={isCameraReady}
            setIsCameraReady={setIsCameraReady}
            onBack={handleBack}
            result={renderValidationResult}
            capturedPhotoUri={capturedPhotoUri}
            onCapture={capturePhoto}
            onGalleryPress={handleGalleryPick}
            onRetake={handleRetake}
            onCameraFlip={handleCameraFlip}
          />
        );

      case 'timer':
        return (
          <TimerAction
            timeRemaining={timeRemaining}
            progressPercent={progressPercent}
          />
        );

      case 'log_journal':
        return (
          <LogJournal
            value={journalText}
            onChangeText={setJournalText}
            placeholder="Write your thoughts here..."
            maxWords={300}
          />
        );

      case 'log_record':
        return (
          <LogRecord
            timerText={`${repCount} / ${TOTAL_REPS}`}
            motivationText={`You've completed ${repCount} of ${TOTAL_REPS} tasks`}
            subText={'Keep going your healthy streak \nis growing 💪'}
          />
        );

      case 'watch_video':
        return (
          <WatchVideoAction
            videoUrl={task?.videoUrl}
            accentColor={theme.gradientColors[0]}
            onEnd={handleComplete}
          />
        );

      default:
        return (
          <TimerAction
            timeRemaining={timeRemaining}
            progressPercent={progressPercent}
          />
        );
    }
  };

  // ============================================================================
  // PERMISSION CHECK
  // ============================================================================

  if (taskAction === 'capture_photo' && !hasPermission) {
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

  // ============================================================================
  // RENDER
  // ============================================================================

  const isTaskCompleted =
    timerState === 'completed' || task?.isDone || task?.status === 'completed';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

      <QuestHeader
        title={theme.title}
        description={theme.description}
        gradientColors={theme.gradientColors}
        imageSource={theme.imageSource}
        angle={theme.angle}
        onBackPress={handleBack}
        insetTop={insets.top}
      />

      <ScrollView
        contentContainerStyle={[
          styles.cameraSection,
          { paddingTop: insets.top + 270 },
        ]}
      >
        <View style={styles.containerSection}>
          {/* TASK HEADER */}
          <View style={[styles.taskHeader, { marginTop: 12 }]}>
            <CheckCircleIcon size={24} checked={isTaskCompleted} />
            <Text style={styles.taskTitle} numberOfLines={1}>
              {taskName}
            </Text>
            <Text style={styles.taskXp}>{taskPoints}XP</Text>
            <Image
              source={require('@/assets/images/coin-2.png')}
              style={styles.coinIcon}
            />
          </View>

          {/* ACTION COMPONENT */}
          {renderActionComponent()}

          {/* ACTION BUTTON — hidden for capture_photo until photo captured */}
          {(taskAction !== 'capture_photo' || capturedPhotoUri) && (
            <ActionButton
              componentType={taskAction}
              handleComplete={
                taskAction === 'capture_photo'
                  ? validateAndComplete
                  : taskAction === 'log_record'
                  ? handleLogRecordComplete
                  : handleComplete
              }
              timerState={timerState}
              handleStart={handleStart}
              handlePause={handlePause}
              handleContinue={handleContinue}
              isValidating={isValidating}
            />
          )}
        </View>
      </ScrollView>

      <QuestCompletedModal
        visible={showCompletedModal}
        onClose={handleModalClose}
        questName={taskName}
        questType={taskType}
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
    cameraSection: {
      flexGrow: 1,
      backgroundColor: Colors.backgroundColor,
      paddingTop: 16,
    },
    taskHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      marginBottom: 12,
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

    // Validation
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
    validationSuccess: { backgroundColor: '#D1FAE5' },
    validationError: { backgroundColor: '#FEE2E2' },
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
    detectedItemsText: {
      fontSize: 13,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#6B7280',
      marginBottom: 8,
    },
    macroRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    macroChip: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: '#F0F9FF',
      borderRadius: 8,
      paddingVertical: 6,
      marginHorizontal: 2,
    },
    macroLabel: {
      fontSize: 10,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      color: '#6B7280',
    },
    macroValue: {
      fontSize: 14,
      fontFamily: FONT_FAMILIES.nunitoBold,
      color: '#1857C1',
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

    // Permission
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
