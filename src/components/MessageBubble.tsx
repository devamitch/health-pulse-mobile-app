import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Share,
} from 'react-native';
import TypingText from './TypingText';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface MessageBubbleProps {
  message: string;
  role: string;
  searchTerm?: string;
  index: number;
  reversedIndex: number;
  animatedText: boolean;
  onLongPress: (message: string) => void;
  colors: any;
}

const MessageBubble = ({
  message,
  onLongPress,
  role,
  index,
  animatedText,
  colors,
}: MessageBubbleProps) => {
  const messageText =
    typeof message === 'object' && 'message' in message
      ? (message as { message: string }).message
      : message;

  const shouldAnimate = animatedText && role === 'system' && index === 0;

  const handleShare = () => {
    Share.share({message: messageText})
  }

  const styles = createStyles(colors);

  return (
    <View style={role !== 'user' && {flexDirection: 'row'}}>
      <TouchableOpacity
        onLongPress={() => onLongPress(messageText)}
        style={[
          styles.container,
          role === 'user' ? styles.sentContainer : styles.receivedContainer,
        ]}
        activeOpacity={0.8}
      >
        <View style={[styles.chatBubble, role === 'user' && styles.sentBubble]}>
          {shouldAnimate ? (
            <TypingText text={messageText} />
          ) : (
            <Text style={[styles.chatText, role === 'user' && styles.sentText]}>
              {messageText}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      {role !== 'user' && (
        <TouchableOpacity onPress={handleShare} style={styles.share}>
          <MaterialIcons
            name="ios-share"
            size={18}
            color={colors.textColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 5,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    chatBubble: {
      maxWidth: '85%',
      backgroundColor: '#2E70B3',
      borderRadius: 30,
      padding: 15,
      marginTop: 10,
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 0,
    },
    sentBubble: {
      backgroundColor: '#FE568D',
      alignSelf: 'flex-end',
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: 30,
    },
    chatText: {
      color: 'white',
      fontSize: 16,
      fontFamily: 'Nunito-SemiBold',
    },
    sentText: {
      color: 'white',
    },
    highlightedText: {
      backgroundColor: 'yellow',
      fontWeight: 'bold',
      color: '#000',
    },
    share: {
      backgroundColor: colors.greyColor400,
      borderRadius: 50,
      alignSelf: 'flex-end',
      padding: 8,
      marginLeft: 8,
    },
    sentContainer: {
      alignSelf: 'flex-end',
      justifyContent: 'flex-end',
    },
    receivedContainer: {
      alignSelf: 'flex-start',
      justifyContent: 'flex-start',
    },
  });

export default MessageBubble;
