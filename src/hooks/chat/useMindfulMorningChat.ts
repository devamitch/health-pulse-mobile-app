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
import { clearTable, fetchMindfulMessages, saveMindfulMessage } from '@/services/sqlite/message';
import { usePreferenceManager } from '../use-chat-util-function';

type MessageFeedback = {
  liked?: boolean;
  disliked?: boolean;
  feedback?: string;
};

interface MindfulMorningChatProps{
  timeframe: "day" | "week" | "month", 
  date?: Date | undefined,
}

export const useMindfulMorningChat = ({timeframe, date}: MindfulMorningChatProps) => {
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [mindfulMessages, setMindfulMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [animatedText, setAnimatedText] = useState(false);
  const [visible, setVisible] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<
    Record<number, MessageFeedback>
  >({});

  const abortController = useRef<AbortController | null>(null);
  const isConnected = useNetInfo();

  const { 
    prompt, 
    haptic_level, 
    isPrefeencesOn, 
    CategorisedPreferences: {
      Meditation: preferences
    } } = useAppSelector(
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
      logButtonTap(`Mindful Message Chat ${type}`, {
        messageIndex,
        feedback,
        messageContent: mindfulMessages[messageIndex]?.message,
      });
    },
    [mindfulMessages],
  );

  const loadMessages = useCallback(async () => {
    const messages = await fetchMindfulMessages(timeframe, date);
    setMindfulMessages(messages);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleClearChat = useCallback(async () => {
    await logButtonTap('Mindful Chat Clear');
    closeMenu();
    setMindfulMessages([]);
    setMessageFeedback({});
    await clearTable('mindful_messages');
  }, [closeMenu]);

  const generateResponseClaude = useCallback(
    async (userInput: string) => {
      try {
        const chatMemory = processChatMemory(mindfulMessages);
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
      mindfulMessages,
      preferences,
      isPrefeencesOn,
      prompt,
    ],
  );

  const sendMessage = useCallback(async () => {
    await logButtonTap('Mindful Message Chat Send');
    if (!userInput || isSending) return;

    if (!isConnected) {
      Toast('No internet connection');
      return;
    }

    setIsSending(true);

    try {
      setMindfulMessages(prev => [
        { role: 'user', message: userInput},
        ...prev,
      ]);
      await saveMindfulMessage('user', userInput);

      if (isPrefeencesOn) await preferenceManager(userInput);
      setUserInput('');

      const botResponse = await generateResponseClaude(userInput);
      if (botResponse) {
        setAnimatedText(true);
        setMindfulMessages(prev => [
          { role: 'system', message: botResponse },
          ...prev,
        ]);
        await saveMindfulMessage('system', botResponse);
      }
    } finally {
      setIsSending(false);
    }
  }, [
    userInput,
    isSending,
    isConnected,
    mindfulMessages,
    isPrefeencesOn,
    preferenceManager,
    generateResponseClaude,
  ]);

  const handleStop = useCallback(async () => {
    await logButtonTap('Mindful Message Chat Stop');
    if (abortController.current) {
      abortController.current.abort();
    }
    Tts.stop();
  }, []);

  return {
    loading,
    userInput,
    setUserInput,
    mindfulMessages,
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
