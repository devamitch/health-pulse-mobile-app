import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import ChatHeader from '@/components/chat/chat-header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONT_FAMILIES } from '@/constants/typography';
import SubscriptionModal from '../../components/SubscriptionModal';
import { ColorScheme, ElevationScheme } from '../../constants/theme';
import { useAppTheme } from '../../hooks/themeHook';
import { useAppSelector } from '../../services/mmkv-redux/hooks';
import useGeneralChat from '@/hooks/chat/useGeneralChat';
import { Message } from '@/services/mmkv-redux/slices';
import IncomingMessage from '@/components/status/chat/IncomingMessage';
import OutgoingMessage from '@/components/status/chat/OutgoingMessage';
import ChatMessageModal from '@/components/modals/chat-message-modal';
import ChatInput from '@/components/status/ChatInput';
import StatusMenu from '@/components/status/layout-list/status-menu';
import { useSharedValue } from 'react-native-reanimated';

const ChatScreen = (props: any) => {
  const insets = useSafeAreaInsets();

  const {
    // State
    loading,
    userInput,
    messages,
    visible,
    animatedText,
    isUnlockModalVisible,
    modalVisible,
    selectedMessage,
    messageFeedback,

    // Setters
    setUserInput,
    setUnlockModalVisible,
    setModalVisible,
    setVisible,

    // Methods
    openMenu,
    handleClearChat,
    sendMessage,
    handleStop,
    handleLongPress,
    pinToStatus,
    handleFeedbackSubmit,
  } = useGeneralChat();

  const { userData } = useAppSelector(state => state.user);
  const { haptic_level } = useAppSelector(state => state.message);
  const { Colors, DEffect } = useAppTheme();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);
  const scrollY = useSharedValue(0);

  const styles = useMemo(() => createStyle(Colors, DEffect), [Colors, DEffect]);

  const handleKeyboardShow = useCallback(() => {
    setIsKeyboardVisible(true);
  }, []);

  const handleKeyboardHide = useCallback(() => {
    setIsKeyboardVisible(false);
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      'keyboardDidShow',
      handleKeyboardShow,
    );
    const hideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      handleKeyboardHide,
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [handleKeyboardShow, handleKeyboardHide]);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isLastMessage = index === 0;

      return (
        <View style={styles.messageContainer}>
          {item.role !== 'user' ? (
            <IncomingMessage
              message={item}
              isAnimated={animatedText && isLastMessage}
              onLongPress={handleLongPress}
              isLastMessage={isLastMessage}
              hapticLevel={haptic_level}
              messageIndex={messages.length - 1 - index}
              messageFeedback={
                messageFeedback?.[messages.length - 1 - index] ?? {}
              }
              onFeedbackSubmit={handleFeedbackSubmit}
            />
          ) : (
            <OutgoingMessage
              message={item}
              onLongPress={handleLongPress}
              hapticLevel={haptic_level}
            />
          )}
        </View>
      );
    },
    [
      animatedText,
      handleLongPress,
      haptic_level,
      messageFeedback,
      handleFeedbackSubmit,
      messages.length,
    ],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={
        Platform.OS === 'android' && isKeyboardVisible ? 30 : 0
      }
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
    >
      <StatusBar backgroundColor={Colors.primaryColor} barStyle="light-content" />

      <ChatHeader
        scrollY={scrollY}
        userData={userData}
        onBackPress={() => props.navigation.goBack()}
        onMenuPress={openMenu}
      />

      <FlatList
        ref={listRef}
        data={messages}
        inverted
        renderItem={renderMessage}
        keyExtractor={(item, index) => `msg-${index}-${item}`}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: 10, paddingBottom: 100 + insets.bottom },
        ]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      />

      <ChatInput
        value={userInput}
        onChangeText={setUserInput}
        loading={loading}
        onSend={sendMessage}
        onStop={handleStop}
      />

      <ChatMessageModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        message={selectedMessage}
        onPinToStatus={() => pinToStatus(selectedMessage)}
      />

      <StatusMenu
        insetTop={insets.top + 10}
        menuVisible={visible}
        setMenuVisible={setVisible}
        menuItems={[
          {
            title: 'Clear Chat',
            onPress: handleClearChat,
          },
        ]}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isUnlockModalVisible}
        onRequestClose={() => {
          setUnlockModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <SubscriptionModal
            onClose={() => {
              setUnlockModalVisible(false);
              props.navigation.goBack();
            }}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.backgroundColor,
    },
    messageContainer: {
      flex: 1,
      width: '100%',
    },
    listContent: {
      paddingHorizontal: 20,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      ...DEffect,
    },
    modalTextContainer: {
      width: '100%',
      backgroundColor: Colors.greyColor,
      padding: 12,
      marginBottom: 16,
      borderRadius: 12,
    },
    modalText: {
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoMedium,
      color: Colors.textColor,
    },
  });
};

export default ChatScreen;
