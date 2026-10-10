import TypingText from '@/components/TypingText';
import { WindMessage } from '@/types/windTypes';
import { Text } from 'react-native-gesture-handler';

export const processWindChatMemory = (messages: WindMessage[]) => {
  return messages
    .slice()
    .reverse()
    .map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.message,
    }));
};

export const renderHighlightedMessage = (
  message: string,
  searchTerm: string,
  role: 'user' | 'system',
  isAnimated: boolean,
  styles: any,
) => {
  if (!searchTerm) {
    return isAnimated && role === 'system' ? (
      <TypingText text={message} />
    ) : (
      <Text style={[styles.chatText, role === 'user' && styles.sentText]}>
        {message}
      </Text>
    );
  }

  const parts = message.split(new RegExp(`(${searchTerm})`, 'i'));

  return (
    <Text>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <Text key={index} style={styles.highlightedText}>
            {part}
          </Text>
        ) : isAnimated && role === 'system' ? (
          <TypingText text={part} />
        ) : (
          <Text
            key={index}
            style={[styles.chatText, role === 'user' && styles.sentText]}
          >
            {part}
          </Text>
        ),
      )}
    </Text>
  );
};
