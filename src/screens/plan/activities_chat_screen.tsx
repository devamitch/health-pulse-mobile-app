import Activity from '@/assets/svg/workout.svg';
import ChatMessageModal from '@/components/modals/chat-message-modal';
import EditPlanModal from '@/components/modals/edit-plan-modal';
import WorkoutRoutineModal from '@/components/modals/workout-routine-modal';
import { StatusList } from '@/components/status/layout-list/animated-list';
import { usePlanActivitiesChat } from '@/hooks/chat/usePlanActivitiesChat';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { Routine } from '@/services/mmkv-redux/slices';
import { addStatusRecord } from '@/services/sqlite/vitals';
import { haptic } from '@/utils';
import { saveActivitiesRoutine } from '@/utils/routinePlanHandler';
import moment from 'moment';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type ActivitiesChatScreenProps = {
  navigation: {
    goBack: () => void;
  };
};

const ActivitiesChatScreen: React.FC<ActivitiesChatScreenProps> = ({
  navigation,
}) => {
  const {
    loading,
    userInput,
    setUserInput,
    activitiesMessages,
    isSending,
    animatedText,
    handleClearChat,
    sendMessage,
    handleStop,
    haptic_level,
    messageFeedback,
    handleFeedbackSubmit,
  } = usePlanActivitiesChat();

  const { weeklyWorkoutPlan } = useAppSelector(state => state.message);

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [selectedList, setSelectedList] = useState<Routine[]>([]);
  const [weeklyWorkoutPlanVisible, setWeeklyWorkoutPlanVisible] =
    useState(false);
  const [weeklyWorkoutPlanDay, setWeeklyWorkoutPlan] =
    useState<{ day: string; routine: string }[]>(weeklyWorkoutPlan);

  const { Colors, DEffect } = useAppTheme();
  const styles = createMainStyles(Colors, DEffect);

  const handleLongPress = (message: string) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };

  const pinToStatus = (message: string) => {
    addStatusRecord(message, 0, 'popup', '');
    setModalVisible(false);
  };

  const savePlan = async (routines: Routine[]) => {
    haptic(haptic_level);
    const date = moment().format('YYYY-MM-DD');
    await saveActivitiesRoutine(routines, date);
    // for (const item of res){
    //   await createWeeklyNotification(item)
    // }
    setEditModalVisible(false);
  };

  const handleEditWeeklyRoutine = (value: string, index: number) => {
    const newList = [...weeklyWorkoutPlanDay];
    if (newList[index])
      newList[index] = { day: newList[index].day, routine: value };
    setWeeklyWorkoutPlan(newList);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusList
        ImageComponent={Activity}
        angle={126.57}
        gradientColors={['#76000B', '#DC0014']} // Red gradient for activities
        title="Today's Activities"
        subtitle="Let's get moving!"
        description="Every step counts - make today your most active day yet."
        loading={loading}
        handleClearChat={handleClearChat}
        input={userInput}
        setInput={setUserInput}
        onSend={sendMessage}
        onStop={handleStop}
        //
        messages={activitiesMessages}
        animatedText={animatedText}
        onLongPress={handleLongPress}
        onAddPlan={savePlan}
        onEditPlan={data => {
          setSelectedList(data);
          setEditModalVisible(true);
        }}
        hapticLevel={haptic_level}
        messageFeedback={messageFeedback}
        onFeedbackSubmit={handleFeedbackSubmit}
        otherMenuItems={[
          {
            title: 'Weekly Workout Plan',
            onPress: () => setWeeklyWorkoutPlanVisible(true),
          },
        ]}
        expandedHeight={200}
        chatVisible
      />

      <ChatMessageModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        message={selectedMessage}
        onPinToStatus={() => pinToStatus(selectedMessage)}
      />

      <EditPlanModal
        isVisible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        selectedList={selectedList || []}
        setSelectedList={setSelectedList}
        savePlan={() => savePlan(selectedList)}
      />

      <WorkoutRoutineModal
        visible={weeklyWorkoutPlanVisible}
        onClose={() => setWeeklyWorkoutPlanVisible(false)}
        weeklyWorkoutPlanDay={weeklyWorkoutPlanDay}
        handleEditWeeklyRoutine={handleEditWeeklyRoutine}
      />
    </GestureHandlerRootView>
  );
};

const createMainStyles = (Colors: any, DEffect: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
  });

export default ActivitiesChatScreen;
