import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
} from 'react-native';
import useNetInfo from '../../hooks/use_net_info';
import { logButtonTap } from '../../services/analyticsService';
import { generateClaudeResponseText } from '../../services/api/claude_client';
import { useAppDispatch, useAppSelector } from '../../services/mmkv-redux/hooks';
import {
  Message,
  updateMessageCount,
} from '../../services/mmkv-redux/slices';
import {
  clearTable,
  fetchGeneralChatMessage,
  saveGeneralMessage,
} from '../../services/sqlite/message';
import { addStatusRecord } from '../../services/sqlite/vitals';
import {
  classifierPrompt,
  generalPrompt,
  processChatMemory,
  referDocumentPrompt,
  updatePrompt,
} from '../../utils/llm_utils';
import { Toast } from '../../utils/toast';
import { usePreferenceManager } from '../use-chat-util-function';
import { AppDocument } from '@/constants/app_documentation';

type MessageFeedback = {
  liked?: boolean;
  disliked?: boolean;
  feedback?: string;
};

const useGeneralChat = () => {
  const dispatch = useAppDispatch();
  const { preferenceManager } = usePreferenceManager();

  // Selectors
  const { userData, paymentStatus } = useAppSelector(state => state.user);
  const { messageCount, preferences, isPrefeencesOn, prompt } = useAppSelector(
    state => state.message,
  );

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [visible, setVisible] = useState(false);
  const [animatedText, setAnimatedText] = useState(false);
  const [isUnlockModalVisible, setUnlockModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState('');
    const [messageFeedback, setMessageFeedback] = useState<
      Record<number, MessageFeedback>
    >({});

  // Refs
  const abortController = useRef<AbortController | null>(null);
  
  // Network status
  const isConnected = useNetInfo();

  // Memoized chat memory
  const chatMemory = useMemo(() => 
    processChatMemory(messages), 
    [messages]
  );

  // Memoized current prompt
  const currentPrompt = useMemo(() => 
    updatePrompt(
      generalPrompt,
      [],
      isPrefeencesOn ? preferences : [],
      [],
      prompt,
    ),
    [isPrefeencesOn, preferences, prompt]
  );

  // Menu handlers
  const openMenu = useCallback(() => setVisible(true), []);
  const closeMenu = useCallback(() => setVisible(false), []);

  // Clear chat handler
  const handleClearChat = useCallback(async () => {
    try {
      await logButtonTap('Chatscreen Clear chat');
      closeMenu();
      await clearTable('general_messages');
      setMessages([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
      Toast('Failed to clear chat');
    }
  }, [closeMenu]);
  
    const handleFeedbackSubmit = useCallback(
      (messageIndex: number, type: 'like' | 'dislike', feedback?: string) => {
        setMessageFeedback(prev => ({
          ...prev,
          [messageIndex]: {
            liked: type === 'like' ? !prev[messageIndex]?.liked : false,
            disliked: type === 'dislike' ? !prev[messageIndex]?.disliked : false,
            feedback: feedback || prev[messageIndex]?.feedback,
          },
        }) as Record<number, MessageFeedback>);
  
        // Save feedback to your backend/analytics service
        logButtonTap(`General Chat ${type}`, {
          messageIndex,
          feedback,
          messageContent: messages[messageIndex]?.message,
        });
      },
      [messages],
    );

  // Generate Claude response
  const generateResponseClaude = useCallback(
    async (message: string): Promise<string> => {
      try {
        setLoading(true);
        abortController.current = new AbortController();

        const type = JSON.parse(((await generateClaudeResponseText(
          message,
          classifierPrompt,
          [],
          'claude-3-5-haiku-latest'
        )).content[0] as any).text)?.type as 'application' | 'general';

        console.log({type});

        const systemPrompt = type === 'general' 
          ? currentPrompt
          : `${referDocumentPrompt}\nDocument: \n${AppDocument}`;

        const response = await generateClaudeResponseText(
          message,
          systemPrompt,
          chatMemory,
        );

        return (response.content[0] as any).text;
      } catch (error) {
        if (abortController.current?.signal.aborted) {
          console.log('Request was aborted');
          return '';
        } else {
          console.error('Error generating Claude response:', error);
          return 'Something went wrong. Please try again.';
        }
      } finally {
        setLoading(false);
        abortController.current = null;
      }
    },
    [currentPrompt, chatMemory],
  );

  // Check message limits
  const checkMessageLimit = useCallback((): boolean => {
    if (paymentStatus) return true;
    
    dispatch(updateMessageCount('main_chat'));
    
    const currentCount = messageCount['main_chat']?.count || 0;
    if (currentCount >= 1000) {
      setUnlockModalVisible(true);
      return false;
    }
    
    return true;
  }, [paymentStatus, messageCount, dispatch]);

  // Send message handler
  const sendMessage = useCallback(async () => {
    try {
      await logButtonTap('Chatscreen Sendchat');
      
      // Validation
      if (!userInput.trim()) return;

      Keyboard.dismiss();

      if (!isConnected) {
        Toast('No internet connection');
        return;
      }

      if (!checkMessageLimit()) return;

      // Add user message
      const userMessage: Message = { role: 'user', message: userInput };
      setMessages(prevState => [userMessage, ...prevState]);
      
      // Save user message and clear input
      await saveGeneralMessage('user', userInput);
      const currentInput = userInput;
      setUserInput('');

      // Process preferences in background
      preferenceManager({userInput: currentInput});

      // Generate bot response
      const botResponse = await generateResponseClaude(currentInput);
      
      if (botResponse) {
        setAnimatedText(true);
        const botMessage: Message = { role: 'system', message: botResponse };
        setMessages(prevState => [botMessage, ...prevState]);
        await saveGeneralMessage('system', botResponse);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Toast('Failed to send message');
    }
  }, [
    userInput,
    isConnected,
    checkMessageLimit,
    preferenceManager,
    generateResponseClaude,
  ]);

  // Stop generation handler
  const handleStop = useCallback(async () => {
    try {
      await logButtonTap('Chatscreen Stopchat');
      if (abortController.current) {
        abortController.current.abort();
      }
    } catch (error) {
      console.error('Error stopping chat:', error);
    }
  }, []);

  // Long press handler
  const handleLongPress = useCallback((message: string) => {
    setSelectedMessage(message);
    setModalVisible(true);
  }, []);

  // Pin to status handler
  const pinToStatus = useCallback(async (message: string) => {
    try {
      await addStatusRecord(message, 0, 'popup', '');
      setModalVisible(false);
    } catch (error) {
      console.error('Error pinning to status:', error);
      Toast('Failed to pin message');
    }
  }, []);

  // Initialize chat and check greeting
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Fetch existing messages
        const fetchedMessages = await fetchGeneralChatMessage();
        setMessages(fetchedMessages);

        // Check and update greeting message date
        const storedDate = messageCount['main_chat']?.date;
        const currentDate = new Date().toDateString();
        
        if (storedDate !== currentDate) {
          dispatch(updateMessageCount('main_chat'));
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    // Add a small delay to ensure proper initialization
    const initTimeout = setTimeout(initializeChat, 1000);

    return () => clearTimeout(initTimeout);
  }, [dispatch, messageCount, userData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
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
    setVisible,
    setAnimatedText,
    setUnlockModalVisible,
    setModalVisible,
    setLoading,
    setSelectedMessage,
    
    // Methods
    openMenu,
    closeMenu,
    handleClearChat,
    sendMessage,
    handleStop,
    handleLongPress,
    pinToStatus,
    handleFeedbackSubmit,
  };
};

export default useGeneralChat;