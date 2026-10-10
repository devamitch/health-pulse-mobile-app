import Workout from '@/assets/svg/workout.svg';
import QuickFeedbackToast from '@/components/gamification/QuickFeedbackToast';
import { StatusList } from '@/components/status/layout-list/animated-list';
import useGameProgression from '@/hooks/useGameProgression';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomCheckbox from '../../components/CustomCheckBox';
import YoutubePlayer from '../../components/YoutubePlayer';
import { ColorScheme, ElevationScheme } from '../../constants/theme';
import { useAppTheme } from '../../hooks/themeHook';

const ActivityTaskScreen = (props: any) => {
  const { haptic_level } = useAppSelector(state => state.message);

  const { Colors, DEffect } = useAppTheme();

  const [qrScanVisiable, setQRScanVisiable] = useState(false);
  const [isConfettiVisible, setIsConfettiVisible] = useState(false);

  const styles = createStyle(Colors, DEffect);

  const taskId = props.route.params?.taskId ?? null;

  const { quickFeedback, dismissQuickFeedback, tasks, handleTaskPress } =
    useGameProgression();

  const activityTasks = tasks.filter(item => item.category === 'activity');

  const currentTask = activityTasks.find(item => item.id === taskId);

  const getCurrentExercise = () => {
    if (activityTasks && activityTasks.length > 0) {
      const currentExercise = activityTasks.find(item => !item.isDone);
      if (currentExercise) {
        return currentExercise.title;
      }
    }
    return 'gym workout';
  };

  const renderFooter = () => (
    <View>
      <View style={[styles.card, styles.videoRecorderWrapper]}>
        {qrScanVisiable ? (
          <View style={styles.videoRecorder}>
            <YoutubePlayer
              exercise={getCurrentExercise()}
              onClose={() => setQRScanVisiable(false)}
            />
          </View>
        ) : (
          <TouchableOpacity onPress={() => setQRScanVisiable(true)}>
            <Image
              source={require('../../assets/images/play.png')}
              style={{ height: 100, width: 100 }}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.card, { padding: 4, marginTop: 20 }]}>
        {/* {activityTasks.map((item, index) => (
          <CustomCheckbox
            key={index}
            label={item.title}
            onChange={() => handleTaskPress(item)}
            checked={item.isDone}
          />
        ))} */}
        {currentTask ? (
          <CustomCheckbox
            label={currentTask.title}
            onChange={() => handleTaskPress(currentTask)}
            checked={currentTask.isDone}
          />
        ) : null}
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusList
        ImageComponent={Workout}
        angle={126.57}
        gradientColors={['#76000B', '#DC0014']} // Red gradient for activities
        title="Today's Activities"
        subtitle="Let's get moving!"
        description="Every step counts - make today your most active day yet."
        loading={false}
        handleClearChat={async () => {}}
        handleNotification={async () => {}}
        input={''}
        setInput={() => {}}
        onSend={async () => {}}
        onStop={async () => {}}
        messages={[]}
        animatedText={false}
        onLongPress={() => {}}
        // onAddPlan={savePlan}
        // onEditPlan={data => {
        //   setSelectedList(data);
        //   setEditModalVisible(true);
        // }}
        hapticLevel={haptic_level}
        messageFeedback={{}}
        onFeedbackSubmit={() => {}}
        ListFooterComponent={renderFooter}
        expandedHeight={200}
      />

      {isConfettiVisible && (
        <ConfettiCannon
          count={200}
          origin={{ x: Dimensions.get('window').width / 2, y: 50 }}
          autoStart={true}
          onAnimationEnd={() => setIsConfettiVisible(false)}
        />
      )}

      {/* Gamification Quick Feedback */}
      {quickFeedback?.visible && quickFeedback.xpEarned !== undefined && (
        <QuickFeedbackToast
          visible={quickFeedback.visible}
          message={quickFeedback.message}
          xpEarned={quickFeedback.xpEarned}
          emoji={quickFeedback.emoji || '💪'}
          onHide={dismissQuickFeedback}
          Colors={Colors}
        />
      )}
    </GestureHandlerRootView>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    headerText: {
      marginLeft: 8,
      fontSize: 18,
      fontFamily: 'Nunito-SemiBold',
      color: Colors.textColor,
    },
    card: {
      width: '100%',
      backgroundColor: Colors.white,
      borderRadius: 24,
      ...DEffect,
    },
    videoRecorderWrapper: {
      marginTop: 12,
      height: 300,
      alignItems: 'center',
      justifyContent: 'center',
    },
    videoRecorder: {
      height: 300,
      width: '100%',
      alignItems: 'center',
      borderRadius: 20,
      overflow: 'hidden',
    },
  });
};

export default ActivityTaskScreen;
