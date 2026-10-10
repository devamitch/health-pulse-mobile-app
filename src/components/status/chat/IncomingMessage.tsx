import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LoaderKit from 'react-native-loader-kit';
import { isJsonString } from '@/utils'; // Assuming this utility exists or will be created
import ViewShot from 'react-native-view-shot';
import ShareNative from 'react-native-share';

import ChatFeedbackModal from '@/components/modals/chat-feedback-modal';
import TypingText from '@/components/TypingText';
import { ColorScheme, THEME } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { Message, Routine } from '@/services/mmkv-redux/slices';
import { haptic } from '@/utils';
import { findBulletList, jsonToMessage } from '@/utils/routinePlanHandler';
import { Toast } from '@/utils/toast';
import MessageActions from './MessageActions';
import MiniDisclaimer from './MiniDisclaimer';
import ShareableCard from '@/components/ShareableCard';
import { FONT_FAMILIES } from '@/constants/typography';

// Helper function to check if a message is a routine plan message
const isRoutinePlanMessage = (messageContent: string): boolean => {
  try {
    const parsedMessage = JSON.parse(messageContent);
    return (
      typeof parsedMessage === 'object' &&
      parsedMessage !== null &&
      'type' in parsedMessage &&
      Array.isArray(parsedMessage[parsedMessage.type]) &&
      ['activities', 'diet', 'supplement'].includes(parsedMessage.type) &&
      parsedMessage[parsedMessage.type].every(
        (item: any) =>
          typeof item === 'object' &&
          item !== null &&
          'routine' in item &&
          'routine_items' in item,
      )
    );
  } catch (e) {
    return false;
  }
};

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
      flexDirection: 'column',
      width: '100%',
    },
    rowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    messageContainer: {
      maxWidth: '70%',
      flexShrink: 1,
      marginRight: 8,
    },
    bubble: {
      minHeight: 50,
      borderRadius: 24,
      borderBottomLeftRadius: 4,
      overflow: 'hidden',
      backgroundColor: Colors.primaryColor,
      shadowColor: Colors.primaryColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    bubbleButton: {
      padding: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    chatText: {
      color: 'white',
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
    },
    loader: {
      width: 40,
      height: 40,
    },
    buttonRow: {
      top: 8,
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    buttonWrapper: {
      borderRadius: 12,
      overflow: 'hidden',
      width: 140,
    },
    button: {
      backgroundColor: Colors.primaryColor,
      borderRadius: 24,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      gap: 1,
    },
    buttonText: {
      fontFamily: FONT_FAMILIES.nunitoBold,
      fontSize: 14,
      color: Colors.white,
      letterSpacing: 0.25,
    },
    buttonIcon: {
      marginRight: 4,
    },
    hiddenCard: {
      position: 'absolute',
      left: -9999,
      top: -9999,
    },
  });

// Loading Bubble Component
export const LoadingBubble: React.FC<{ Colors: ColorScheme }> = ({
  Colors,
}) => {
  const styles = createStyles(Colors);

  return (
    <View style={styles.container}>
      <View style={[styles.bubble, styles.messageContainer]}>
        <View style={styles.bubbleButton}>
          <LoaderKit
            style={styles.loader}
            name={'BallPulse'}
            color={Colors.white}
          />
        </View>
      </View>
    </View>
  );
};

type IncomingMessageProps = {
  message: Message;
  isAnimated?: boolean;
  onLongPress?: (message: string) => void;
  isLastMessage: boolean;
  onAddPlan?: (data: Routine[]) => void;
  onEditPlan?: (data: Routine[]) => void;
  hapticLevel: number;
  messageIndex: number;
  messageFeedback?: { liked?: boolean; disliked?: boolean; feedback?: string };
  onFeedbackSubmit: (
    index: number,
    type: 'like' | 'dislike',
    feedback?: string,
  ) => void;
};

const IncomingMessage: React.FC<IncomingMessageProps> = ({
  message,
  isAnimated = false,
  onLongPress,
  isLastMessage,
  onAddPlan,
  onEditPlan,
  hapticLevel,
  messageIndex,
  messageFeedback,
  onFeedbackSubmit,
}) => {
  const { Colors } = useAppTheme();
  const { isPrefeencesOn } = useAppSelector(state => state.message);
  const { userData } = useAppSelector(state => state.user);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'like' | 'dislike'>();
  const [feedbackText, setFeedbackText] = useState('');
  const viewShotRef = useRef<ViewShot>(null);

  const styles = createStyles(Colors);

  const isJsonMessage = useMemo(() => {
    return isJsonString(message.message);
  }, [message.message]);

  const isCurrentMessageRoutinePlan = useMemo(() => {
    return isRoutinePlanMessage(message.message);
  }, [message.message]);

  // isBulletList is no longer directly used for rendering decision,
  // as jsonToMessage handles the formatting internally.
  // Keeping it for potential future use or if other parts of the app rely on it.
  const isBulletList = useMemo(() => {
    return findBulletList(message.message);
  }, [message.message]);

  const handleShare = async () => {
    try {
      haptic(hapticLevel);

      if (!viewShotRef.current) {
        // Fallback to text sharing if view shot fails
        const textToShare = isJsonMessage
          ? (() => {
              const parsed = JSON.parse(message.message);
              if (parsed.type === 'message') {
                return parsed.message;
              }
              return jsonToMessage(message.message);
            })()
          : message.message;
        Share.share({
          message: textToShare,
        });
        return;
      }

      // Capture the view as an image
      const uri = await viewShotRef.current.capture();

      // Share the image
      await ShareNative.open({
        url: `file://${uri}`,
        type: 'image/png',
        title: 'Share Chat Response',
        message: 'Check out this response from HealthPulse HEALTH!',
      });
    } catch (error: any) {
      if (error?.message !== 'User did not share') {
        console.error('Error sharing:', error);
        // Fallback to text sharing
        const textToShare = isJsonMessage
          ? (() => {
              const parsed = JSON.parse(message.message);
              if (parsed.type === 'message') {
                return parsed.message;
              }
              return jsonToMessage(message.message);
            })()
          : message.message;
        Share.share({
          message: textToShare,
        });
      }
    }
  };

  const handleLike = () => {
    haptic(hapticLevel);
    if (messageFeedback?.liked) {
      onFeedbackSubmit(messageIndex, 'like', '');
    } else {
      setFeedbackType('like');
      setFeedbackModalVisible(true);
    }
  };

  const handleDislike = () => {
    haptic(hapticLevel);
    if (messageFeedback?.disliked) {
      onFeedbackSubmit(messageIndex, 'dislike', '');
    } else {
      setFeedbackType('dislike');
      setFeedbackModalVisible(true);
    }
  };

  const handleFeedbackModalSubmit = () => {
    if (feedbackType) {
      onFeedbackSubmit(messageIndex, feedbackType, feedbackText);
    }
    setFeedbackModalVisible(false);
    setFeedbackText('');
  };

  const handleFeedbackModalClose = () => {
    setFeedbackModalVisible(false);
    setFeedbackText('');
  };

  if (message.type === 'loading_system') {
    return <LoadingBubble Colors={Colors} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <View style={styles.messageContainer}>
          <RectButton
            style={styles.bubble}
            onLongPress={() => onLongPress?.(jsonToMessage(message.message))}
          >
            <View style={styles.bubbleButton}>
              {isAnimated ? (
                <TypingText
                  text={
                    isJsonMessage
                      ? (() => {
                          const parsed = JSON.parse(message.message);
                          if (parsed.type === 'message') {
                            return parsed.message;
                          }
                          return jsonToMessage(message.message);
                        })()
                      : message.message
                  }
                  textStyle={styles.chatText}
                />
              ) : (
                <Text style={styles.chatText}>
                  {isJsonMessage
                    ? (() => {
                        const parsed = JSON.parse(message.message);
                        if (parsed.type === 'message') {
                          return parsed.message;
                        }
                        return jsonToMessage(message.message);
                      })()
                    : message.message}
                </Text>
              )}
            </View>
          </RectButton>
        </View>
        <MessageActions
          onShare={handleShare}
          onLike={handleLike}
          onDislike={handleDislike}
          messageFeedback={messageFeedback ?? {}} // Ensure messageFeedback is always an object
        />
      </View>
      {isCurrentMessageRoutinePlan && (onAddPlan || onEditPlan) && (
        <View style={styles.buttonRow}>
          {onAddPlan && (
            <View style={styles.buttonWrapper}>
              <RectButton
                onPress={() => {
                  const parsed = JSON.parse(message.message);
                  onAddPlan(parsed[parsed.type]);
                  Alert.alert(
                    'Success',
                    'The plan has been updated successfully.',
                  );
                }}
                style={styles.button}
              >
                <View style={styles.buttonContent}>
                  <MaterialIcons
                    name="add-circle"
                    size={20}
                    color={Colors.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Add to Plan</Text>
                </View>
              </RectButton>
            </View>
          )}
          {onEditPlan && (
            <View style={styles.buttonWrapper}>
              <RectButton
                onPress={() => {
                  const parsed = JSON.parse(message.message);
                  onEditPlan(parsed[parsed.type]);
                }}
                style={[
                  styles.button,
                  { backgroundColor: Colors.greyColor200 },
                ]}
              >
                <View style={styles.buttonContent}>
                  <MaterialIcons
                    name="edit"
                    size={18}
                    color={Colors.greyColor700}
                    style={styles.buttonIcon}
                  />
                  <Text
                    style={[styles.buttonText, { color: Colors.greyColor700 }]}
                  >
                    Edit Plan
                  </Text>
                </View>
              </RectButton>
            </View>
          )}
        </View>
      )}
      <MiniDisclaimer visible={false} onClose={() => {}} />
      <ChatFeedbackModal
        visible={feedbackModalVisible}
        onClose={handleFeedbackModalClose}
        onSubmit={handleFeedbackModalSubmit}
        type={feedbackType || 'like'} // Provide a default value for type
        initialFeedback={feedbackText}
        // setFeedbackText={setFeedbackText} // This prop is not needed as initialFeedback is used
      />

      {/* Hidden ShareableCard for capturing */}
      <View style={styles.hiddenCard}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
          <ShareableCard
            message={
              isJsonMessage
                ? (() => {
                    const parsed = JSON.parse(message.message);
                    if (parsed.type === 'message') {
                      return parsed.message;
                    }
                    return jsonToMessage(message.message);
                  })()
                : message.message
            }
            userName={userData?.displayName || 'User'}
            timestamp={new Date().toISOString()}
          />
        </ViewShot>
      </View>
    </View>
  );
};

export default IncomingMessage;
