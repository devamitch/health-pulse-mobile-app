import useNetInfo from '@/hooks/use_net_info';
import { logButtonTap } from '@/services/analyticsService';
import { generateClaudeResponseText } from '@/services/api/claude_client';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import {
  Message,
} from '@/services/mmkv-redux/slices';
import {
  processChatMemory,
  generalPrompt,
  updatePrompt,
} from '@/utils/llm_utils';
import { Toast } from '@/utils/toast';
import { useCallback, useEffect, useRef, useState } from 'react';
import Tts from 'react-native-tts';
import { clearTable, fetchFeminineMessages, saveFeminineMessage } from '@/services/sqlite/message';
import { usePreferenceManager } from '../use-chat-util-function';

type MessageFeedback = {
  liked?: boolean;
  disliked?: boolean;
  feedback?: string;
};

interface FeminineChatProps{
  timeframe: "day" | "week" | "month", 
  date?: Date | undefined,
}

export const useFeminineChat = ({timeframe, date}: FeminineChatProps) => {
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [feminineMessages, setFeminineMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [animatedText, setAnimatedText] = useState(false);
  const [visible, setVisible] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<
    Record<number, MessageFeedback>
  >({});

  const abortController = useRef<AbortController | null>(null);
  const isConnected = useNetInfo();

  const { preferences, prompt, haptic_level, isPrefeencesOn } = useAppSelector(
    state => state.message,
  );
  const { preferenceManager } = usePreferenceManager();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

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
      logButtonTap(`Feminine Chat ${type}`, {
        messageIndex,
        feedback,
        messageContent: feminineMessages[messageIndex]?.message,
      });
    },
    [feminineMessages],
  );

  const loadMessages = useCallback(async () => {
    const messages = await fetchFeminineMessages(timeframe, date);
    setFeminineMessages(messages);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleClearChat = useCallback(async () => {
    await logButtonTap('Feminine Chat Clear');
    closeMenu();
    setFeminineMessages([]);
    setMessageFeedback({});
    await clearTable('feminine_messages');
  }, [closeMenu]);

  const generateResponseClaude = useCallback(
    async (userInput: string) => {
      try {
        const chatMemory = processChatMemory(feminineMessages);
        setLoading(true);
        abortController.current = new AbortController();

        const response = await generateClaudeResponseText(
          userInput,
          updatePrompt(
            generalPrompt,
            [],
            isPrefeencesOn ? preferences : [],
            [],
            prompt || '',
          ),
          chatMemory as any,
          // abortController.current.signal as any,
        );
        // const response2 = await generateClaudeResponseText(
        //   `Existing preferences: ${JSON.stringify(
        //     preferences,
        //   )}, Message: ${userInput}`,
        //   preferencePrompt,
        //   [],
        //   'claude-3-5-haiku-20241022',
        // );

        return (response?.content?.[0] as any).text;
      } catch (error) {
        if (abortController.current?.signal.aborted) {
          console.log('Request was aborted');
        } else {
          console.error('Error:', error);
        }
        if (!prompt) {
          Toast('Please complete the quiz section to access this feature');
          return '';
        }
        return 'Something went wrong. Please try again.';
      } finally {
        setLoading(false);
        abortController.current = null;
      }
    },
    [
      feminineMessages,
      preferences,
      isPrefeencesOn,
      prompt,
    ],
  );

  const sendMessage = useCallback(async () => {
    await logButtonTap('Feminine Chat Send');
    if (!userInput || isSending) return;

    if (!isConnected) {
      Toast('No internet connection');
      return;
    }

    setIsSending(true);

    try {
      setFeminineMessages(prev => [
        {role: 'user', message: userInput},
        ...prev,
      ]);
      await saveFeminineMessage('user', userInput);

      if (isPrefeencesOn) await preferenceManager({userInput});
      setUserInput('');

      const botResponse = await generateResponseClaude(userInput);
      if (botResponse) {
        setAnimatedText(true);
        setFeminineMessages(prev => [
          {role: 'system', message: botResponse},
          ...prev,
        ]);
        await saveFeminineMessage('system', botResponse);
      }
    } finally {
      setIsSending(false);
    }
  }, [
    userInput,
    isSending,
    isConnected,
    feminineMessages,
    isPrefeencesOn,
    preferenceManager,
    generateResponseClaude,
  ]);

  const handleStop = useCallback(async () => {
    await logButtonTap('Feminine Chat Stop');
    if (abortController.current) {
      abortController.current.abort();
    }
    Tts.stop();
  }, []);

  return {
    loading,
    userInput,
    setUserInput,
    feminineMessages,
    isSending,
    animatedText,
    handleClearChat,
    sendMessage,
    handleStop,
    haptic_level,
    visible,
    setVisible,
    openMenu,
    closeMenu,
    messageFeedback,
    handleFeedbackSubmit,
  };
};
