import Superfood from '@/assets/svg/superfood.svg';
import ChatMessageModal from '@/components/modals/chat-message-modal';
import EditPlanModal from '@/components/modals/edit-plan-modal';
import { StatusList } from '@/components/status/layout-list/animated-list';
import { ColorScheme } from '@/constants/theme';
// import { saveSuperfoodRoutine } from '@/hooks/chat/superfoods-utils';
// import { usePlanSuperfoodsChat } from '@/hooks/chat/usePlanSuperfoodsChat';
import { usePlanSuperfoodChat } from '@/hooks/chat/usePlanSuperfoodChat';
import { useAppTheme } from '@/hooks/themeHook';
import { Routine } from '@/services/mmkv-redux/slices';
import { addStatusRecord } from '@/services/sqlite/vitals';
import { haptic } from '@/utils';
import { saveSuperfoodRoutine } from '@/utils/routinePlanHandler';
import moment from 'moment';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type SuperfoodsChatScreenProps = {
  navigation: {
    goBack: () => void;
  };
};

const SuperfoodsChatScreen: React.FC<SuperfoodsChatScreenProps> = ({
  navigation,
}) => {
  const {
    loading,
    userInput,
    setUserInput,
    superfoodMessages,
    isSending,
    animatedText,
    handleClearChat,
    sendMessage,
    handleStop,
    haptic_level,
    messageFeedback,
    handleFeedbackSubmit,
  } = usePlanSuperfoodChat();

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [selectedList, setSelectedList] = useState<Routine[]>([]);

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
    await saveSuperfoodRoutine(routines, date);
    // for (const item of res){
    //   await createWeeklyNotification(item)
    // }
    setEditModalVisible(false);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusList
        ImageComponent={Superfood}
        angle={126.57}
        gradientColors={['#4CAF50', '#8BC34A']} // Green gradient for superfoods
        title="Today's superfoods"
        subtitle="Nourish your body!"
        description="Superfoods are nature's powerhouses packed with nutrients to fuel your day."
        loading={loading}
        handleClearChat={handleClearChat}
        input={userInput}
        setInput={setUserInput}
        onSend={sendMessage}
        onStop={handleStop}
        //
        messages={superfoodMessages}
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
    </GestureHandlerRootView>
  );
};

const createMainStyles = (Colors: ColorScheme, DEffect: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
  });

export default SuperfoodsChatScreen;
