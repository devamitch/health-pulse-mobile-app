import { useAppTheme } from '@/hooks/themeHook';
import { createStyle } from '@/screens/status_chat/wind_screen';
import { logButtonTap } from '@/services/analyticsService';
import { Message } from '@/services/mmkv-redux/slices';
import { useKeyboard } from '@react-native-community/hooks';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  FlatListProps,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IncomingMessage from '../chat/IncomingMessage';
import OutgoingMessage from '../chat/OutgoingMessage';
import { AnimatedStatusHeader } from './animated-status-header';
import StatusMenu from './status-menu';
import { useHeaderAnimation, usePulseAnimation } from './useListAnimation';

interface StatusListProps
  extends Omit<
    FlatListProps<Message>,
    'data' | 'renderItem' | 'ListFooterComponent'
  > {
  title: string;
  subtitle?: string;
  description: string;
  handleNotification?: () => Promise<void>;
  handleClearChat: () => Promise<void>;
  ImageComponent?: React.ComponentType<any>;
  imageWidth?: number;
  imageHeight?: number;
  imageOffsetX?: number;
  imageOffsetY?: number;
  gradientColors?: [string, string];
  messages?: Message[];
  animatedText: boolean;
  onLongPress: (message: string) => void;
  onAddPlan?: (data: any) => void;
  onEditPlan?: (data: any) => void;
  hapticLevel: number;
  messageFeedback?: Record<number, any>;
  onFeedbackSubmit?: (
    messageIndex: number,
    type: 'like' | 'dislike',
    feedback?: string,
  ) => void;
  loading?: boolean;
  input?: string;
  setInput?: React.Dispatch<React.SetStateAction<string>>;
  onSend?: () => Promise<void>;
  onStop?: () => Promise<void>;
  angle?: number;
  scrollThreshold?: number;
  collapsedHeight?: number;
  expandedHeight?: number;
  pulseAnimation?: boolean;
  children?: React.ReactNode | React.ReactNode[];
  otherMenuItems?: {
    title: string;
    onPress: () => void;
    icon?: string;
  }[];
  chatVisible?: boolean;
  ListFooterComponent?:
    | React.ComponentType<any>
    | React.ReactElement
    | null
    | undefined;
}

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList as new (
    props: FlatListProps<
      | {
          type: string;
          message: Message;
          index: number;
          isLastMessage?: boolean;
        }
      | { type: 'footer'; component: any }
    >,
  ) => FlatList<any>,
);

export const StatusList: React.FC<StatusListProps> = ({
  title,
  subtitle,
  description,
  handleNotification,
  handleClearChat,
  ImageComponent,
  imageWidth,
  imageHeight,
  imageOffsetX,
  imageOffsetY,
  gradientColors = ['#3A225D', '#7A47C3'],
  messages = [],
  animatedText,
  onLongPress,
  onAddPlan,
  onEditPlan,
  hapticLevel,
  messageFeedback,
  onFeedbackSubmit,
  loading,
  input,
  setInput,
  onSend,
  onStop,
  angle = 292.08,
  scrollThreshold = 65,
  collapsedHeight = scrollThreshold,
  expandedHeight = 200,
  pulseAnimation = true,
  otherMenuItems = [],
  ListFooterComponent,
  chatVisible,
  ...props
}) => {
  const { Colors, DEffect } = useAppTheme();
  const isKeyboardVisible = useKeyboard().keyboardShown;
  const styles3 = createStyle(Colors, DEffect);
  const styles = { ...styles2, ...styles3 };
  const navigation = useNavigation();
  const scrollY = useSharedValue(0);
  const inset = useSafeAreaInsets();
  const listRef = useRef<FlatList<Message>>(null);
  const [menuVisible, setMenuVisible] = React.useState(false);

  // Animation hooks
  const { pulseStyle } = usePulseAnimation(pulseAnimation);
  const { headerStyle, contentStyle, titleStyle } = useHeaderAnimation(
    scrollY,
    {
      scrollThreshold,
      collapsedHeight,
      expandedHeight,
      insetTop: inset.top,
    },
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Auto-scroll to bottom when messages change or on initial mount
  useEffect(() => {
    if (chatVisible !== false && listRef.current && messages.length > 0) {
      // Use setTimeout to ensure the list has finished rendering
      const timer = setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [messages, chatVisible]);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      if (item.type === 'footer') {
        return (
          <Animated.View style={styles.messageContainer}>
            {typeof item.component === 'function' ? (
              <item.component />
            ) : (
              item.component
            )}
          </Animated.View>
        );
      } else {
        // Regular message rendering
        // Since we reverse the messages array and add footer, adjust indexing for proper animation
        const messageIndex = item.index;
        const isLastMessage = messageIndex === messages.length - 1;

        return (
          <Animated.View style={styles.messageContainer}>
            {item.message.role !== 'user' ? (
              <IncomingMessage
                message={item.message}
                isAnimated={animatedText && isLastMessage}
                // onLongPress={onLongPress}
                isLastMessage={isLastMessage}
                onAddPlan={onAddPlan || (() => {})} // Provide a no-op default
                onEditPlan={onEditPlan || (() => {})} // Provide a no-op default
                hapticLevel={hapticLevel}
                messageIndex={item.index} // Use item.index for messageIndex
                messageFeedback={messageFeedback?.[item.index] ?? {}} // Use item.index for messageFeedback
                onFeedbackSubmit={onFeedbackSubmit || (() => {})} // Provide a no-op default
              />
            ) : (
              <OutgoingMessage
                message={item.message}
                // onLongPress={onLongPress}
                hapticLevel={hapticLevel}
              />
            )}
          </Animated.View>
        );
      }
    },
    [
      animatedText,
      onLongPress,
      onAddPlan,
      onEditPlan,
      hapticLevel,
      messageFeedback,
      onFeedbackSubmit,
      messages.length,
    ],
  );

  const menuItems = [
    {
      title: 'Clear chat',
      onPress: handleClearChat,
      icon: 'trash-outline',
    },
  ];

  if (handleNotification !== undefined)
    menuItems.push({
      title: 'Notifications',
      onPress: handleNotification,
      icon: 'notifications-outline',
    });

  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          keyboardVerticalOffset={
            Platform.OS === 'android' && isKeyboardVisible ? 30 : 0
          }
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
          <AnimatedStatusHeader
            title={title}
            subtitle={subtitle || ''} // Provide an empty string default
            description={description}
            onBackPress={() => {
              logButtonTap('Backbutton'); // Remove await to make it non-blocking
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('NavigationTab');

                // Reset to home screen instead of navigating fresh to avoid performance issues
                // navigation.reset({
                //   index: 0,
                //   routes: [{ name: 'NavigationTab' }],
                // } as any);
              }
            }}
            headerStyle={headerStyle}
            contentStyle={contentStyle}
            titleStyle={titleStyle}
            pulseStyle={pulseStyle}
            gradientColors={gradientColors}
            angle={angle}
            insetTop={inset.top}
            menuItems={[
              {
                title: 'Clear chat',
                onPress: handleClearChat,
                icon: 'trash-outline',
              },
              {
                title: 'Notifications',
                onPress: handleNotification || (() => {}), // Provide a no-op default
                icon: 'notifications-outline',
              },
              ...otherMenuItems,
            ]}
            {...(ImageComponent ? { ImageComponent } : {})}
            {...(imageWidth !== undefined ? { imageWidth } : {})}
            {...(imageHeight !== undefined ? { imageHeight } : {})}
            {...(imageOffsetX !== undefined ? { imageOffsetX } : {})}
            {...(imageOffsetY !== undefined ? { imageOffsetY } : {})}
            menuVisible={menuVisible}
            setMenuVisible={setMenuVisible}
          />

          {chatVisible ? null : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                flexGrow: 1,
                paddingTop: inset.top + 220,
                paddingHorizontal: 20,
                gap: 20,
                paddingBottom: inset.bottom + 30,
              }}
            >
              {typeof ListFooterComponent === 'function' ? (
                <ListFooterComponent />
              ) : (
                ListFooterComponent
              )}
            </ScrollView>
          )}

          {chatVisible ? (
            <AnimatedFlatList
              ref={listRef}
              data={(() => {
                const processedMessages = messages.map((message, index) => ({
                  type: 'message',
                  message,
                  index,
                  isLastMessage: false, // Initialize isLastMessage to false
                }));

                // Determine the actual last message index, excluding the loading message
                const lastActualMessageIndex =
                  messages.length > 0 ? messages.length - 1 : -1;

                // Add isLastMessage prop to the last actual message
                if (lastActualMessageIndex !== -1) {
                  const lastMessage = processedMessages[lastActualMessageIndex];
                  if (lastMessage) {
                    // Ensure lastMessage is defined
                    processedMessages[lastActualMessageIndex] = {
                      type: lastMessage.type,
                      message: lastMessage.message,
                      index: lastMessage.index,
                      isLastMessage: true,
                    };
                  }
                }

                const data = ListFooterComponent
                  ? [
                      { type: 'footer', component: ListFooterComponent },
                      ...processedMessages,
                    ]
                  : processedMessages;

                if (loading) {
                  data.push({
                    type: 'message',
                    message: {
                      role: 'system',
                      message: '',
                      type: 'loading_system',
                    },
                    index: messages.length, // Index for the loading message
                    isLastMessage: false, // Loading message is never the "last" for actions
                  });
                }
                return data;
              })()}
              renderItem={({ item }) => {
                // Pass the isLastMessage prop from the data item to IncomingMessage
                const isLastMessageProp = item.isLastMessage || false;
                if (item.type === 'footer') {
                  return (
                    <Animated.View style={styles.messageContainer}>
                      {typeof item.component === 'function' ? (
                        <item.component />
                      ) : (
                        item.component
                      )}
                    </Animated.View>
                  );
                } else {
                  return (
                    <Animated.View style={styles.messageContainer}>
                      {item.message.role !== 'user' ? (
                        <IncomingMessage
                          message={item.message}
                          isAnimated={animatedText && isLastMessageProp}
                          onLongPress={onLongPress}
                          isLastMessage={isLastMessageProp}
                          onAddPlan={onAddPlan || (() => {})}
                          onEditPlan={onEditPlan || (() => {})}
                          hapticLevel={hapticLevel}
                          messageIndex={item.index}
                          messageFeedback={messageFeedback?.[item.index] ?? {}}
                          onFeedbackSubmit={onFeedbackSubmit || (() => {})}
                        />
                      ) : (
                        <OutgoingMessage
                          message={item.message}
                          onLongPress={onLongPress}
                          hapticLevel={hapticLevel}
                        />
                      )}
                    </Animated.View>
                  );
                }
              }}
              keyExtractor={(item, index) => {
                if (item.type === 'footer') {
                  return 'footer-key';
                } else if (item.message.type === 'loading_system') {
                  return 'loading-system-message';
                } else {
                  return `msg-${item.index}`;
                }
              }}
              contentContainerStyle={[
                styles.listContent,
                {
                  paddingTop: expandedHeight + inset.top + 16,
                  paddingBottom: inset.bottom + 20,
                },
              ]}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={16}
              onScroll={scrollHandler}
              {...props}
            />
          ) : null}

          {/* {setInput && chatVisible && (
            <ChatInput
              value={input ?? ''}
              onChangeText={setInput}
              onSend={onSend || (() => {})} // Provide a no-op default
              onStop={onStop || (() => {})} // Provide a no-op default
            />
          )} */}
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
      {/* <MedicalDisclaimerModal /> */}
      <StatusMenu
        menuItems={[...menuItems, ...otherMenuItems]}
        insetTop={inset.top}
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
      />
    </>
  );
};

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    paddingLeft: 20,
  },
  loader: {
    width: 30,
    height: 30,
  },
  container2: {
    flexGrow: 1,
    paddingHorizontal: 20,
    gap: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
