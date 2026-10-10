import Supplement from '@/assets/svg/supplement.svg';
import ChatMessageModal from '@/components/modals/chat-message-modal';
import EditPlanModal from '@/components/modals/edit-plan-modal';
import { StatusList } from '@/components/status/layout-list/animated-list';
import { saveSupplementRoutine2 } from '@/hooks/chat/supplements-utils';
import { usePlanSupplementsChat } from '@/hooks/chat/usePlanSupplementsChat';
import { useAppTheme } from '@/hooks/themeHook';
import { Routine } from '@/services/mmkv-redux/slices';
import { addStatusRecord } from '@/services/sqlite/vitals';
import { haptic } from '@/utils';
import moment from 'moment';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type SupplementsChatScreenProps = {
  navigation: {
    goBack: () => void;
  };
};

const SupplementsChatScreen: React.FC<SupplementsChatScreenProps> = ({
  navigation,
}) => {
  const {
    loading,
    userInput,
    setUserInput,
    supplementsMessages,
    isSending,
    animatedText,
    handleClearChat,
    sendMessage,
    handleStop,
    haptic_level,
    messageFeedback,
    handleFeedbackSubmit,
  } = usePlanSupplementsChat();

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
    await saveSupplementRoutine2(routines, date);
    // for (const item of res){
    //   await createWeeklyNotification(item)
    // }
    setEditModalVisible(false);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusList
        ImageComponent={Supplement}
        angle={126.57}
        gradientColors={['#AC5B00', '#FEDD00']}
        title="Today's supplement"
        subtitle="Let's get started!"
        description="The first step is always the hardest, but today marks the start of something great."
        loading={loading}
        handleClearChat={handleClearChat}
        input={userInput}
        setInput={setUserInput}
        onSend={sendMessage}
        onStop={handleStop}
        //
        messages={supplementsMessages}
        animatedText={animatedText}
        onLongPress={handleLongPress}
        // onAddPlan={savePlan}
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

const createMainStyles = (Colors: any, DEffect: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
  });

export default SupplementsChatScreen;
