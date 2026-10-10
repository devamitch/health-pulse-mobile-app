import { Message } from '@/services/mmkv-redux/slices';
import { useCallback, useRef } from 'react';
import { FlatList, View } from 'react-native';
import IncomingMessage from './IncomingMessage';
import OutgoingMessage from './OutgoingMessage';

type ChatMessagesListProps = {
  messages: Message[];
  animatedText: boolean;
  onLongPress: (message: string) => void;
  onAddPlan: (data: any) => void;
  onEditPlan: (data: any) => void;
  hapticLevel: number;
  messageFeedback: Record<number, any>;
  onFeedbackSubmit: (
    messageIndex: number,
    type: 'like' | 'dislike',
    feedback?: string,
  ) => void;
};

const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
  messages,
  animatedText,
  onLongPress,
  onAddPlan,
  onEditPlan,
  hapticLevel,
  messageFeedback,
  onFeedbackSubmit,
}) => {
  const listRef = useRef<FlatList<Message>>(null);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      // With inverted FlatList, the first item in the data array is at the bottom
      const isLastMessage = index === 0; // First item in data is last visually

      return (
        <View style={{ flex: 1, width: '100%' }}>
          {item.role === 'system' ? (
            <IncomingMessage
              message={item}
              isAnimated={animatedText && isLastMessage}
              onLongPress={onLongPress}
              isLastMessage={isLastMessage}
              onAddPlan={onAddPlan}
              onEditPlan={onEditPlan}
              hapticLevel={hapticLevel}
              messageIndex={messages.length - 1 - index} // Original index
              messageFeedback={
                messageFeedback[messages.length - 1 - index] ?? {}
              }
              onFeedbackSubmit={onFeedbackSubmit}
            />
          ) : (
            <OutgoingMessage
              message={item}
              onLongPress={onLongPress}
              hapticLevel={hapticLevel}
            />
          )}
        </View>
      );
    },
    [
      messages.length,
      animatedText,
      onLongPress,
      onAddPlan,
      onEditPlan,
      hapticLevel,
      messageFeedback,
      onFeedbackSubmit,
    ],
  );

  return (
    <FlatList
      ref={listRef}
      data={messages}
      inverted
      renderItem={renderMessage}
      keyExtractor={(item, index) => `msg-${item.id || index}`} // Better to use item.id if available
      contentContainerStyle={{ paddingVertical: 16 }}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
    />
  );
};

export default ChatMessagesList;
