import useNetInfo from '@/hooks/use_net_info';
import { logButtonTap } from '@/services/analyticsService';
import { generateClaudeResponseText } from '@/services/api/claude_client';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { Message, RoutineRecord } from '@/services/mmkv-redux/slices';
import {
  processChatMemory,
  superfoodPrompt,
  updatePrompt,
} from '@/utils/llm_utils';
import { Toast } from '@/utils/toast';
import { useCallback, useEffect, useRef, useState } from 'react';
import Tts from 'react-native-tts';
import { groupRoutineData } from './supplements-utils';
import {
  clearTable,
  fetchDietRecordWithDateRange,
  fetchSuperfoodMessages,
  saveSuperfoodMessage,
} from '@/services/sqlite/message';
import { usePreferenceManager } from '../use-chat-util-function';

type MessageFeedback = {
  liked?: boolean;
  disliked?: boolean;
  feedback?: string;
};

interface StatusSuperfoodChatProps {
  timeframe: 'day' | 'week' | 'month';
  date?: Date | undefined;
}

export const useStatusSuperfoodChat = ({
  timeframe,
  date,
}: StatusSuperfoodChatProps) => {
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [superfoodMessages, setSuperfoodMessages] = useState<Message[]>([]);
  const [superfoodRecord, setSuperfoodRecord] = useState<RoutineRecord[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [animatedText, setAnimatedText] = useState(false);
  const [visible, setVisible] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<
    Record<number, MessageFeedback>
  >({});

  const abortController = useRef<AbortController | null>(null);
  const isConnected = useNetInfo();

  const { prompt, haptic_level, isPrefeencesOn, CategorisedPreferences } =
    useAppSelector(state => state.message);
  const preferences = CategorisedPreferences?.Diet || [];
  const { preferenceManager } = usePreferenceManager();

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleFeedbackSubmit = useCallback(
    (messageIndex: number, type: 'like' | 'dislike', feedback?: string) => {
      setMessageFeedback(
        prev =>
          ({
            ...prev,
            [messageIndex]: {
              liked: type === 'like' ? !prev[messageIndex]?.liked : false,
              disliked:
                type === 'dislike' ? !prev[messageIndex]?.disliked : false,
              feedback: feedback || prev[messageIndex]?.feedback,
            },
          } as Record<number, MessageFeedback>),
      );

      // Save feedback to your backend/analytics service
      logButtonTap(`Superfood Chat ${type}`, {
        messageIndex,
        feedback,
        messageContent: superfoodMessages[messageIndex]?.message,
      });
    },
    [superfoodMessages],
  );

  // const fetchPastRecords = useCallback(async () => {
  //   const start_date = new Date();
  //   start_date.setDate(start_date.getDate() - 8);
  //   start_date.setHours(0, 0, 0, 0);

  //   const end_date = new Date();
  //   start_date.setDate(start_date.getDate() - 1);
  //   end_date.setHours(0, 0, 0, 0);

  //   const records = await fetchDietRecordWithDateRange(
  //     start_date.toISOString(),
  //     end_date.toISOString(),
  //   );
  //   setSuperfoodRecord(groupRoutineData(records));
  // }, []);

  // const loadMessages = useCallback(async () => {
  //   const messages = await fetchSuperfoodMessages(timeframe, date);
  //   setSuperfoodMessages(messages);
  // }, [timeframe, date]);

  // useEffect(() => {
  //   fetchPastRecords();
  //   loadMessages();
  // }, [fetchPastRecords, loadMessages]);

  const handleClearChat = useCallback(async () => {
    await logButtonTap('Superfood Chat Clear');
    closeMenu();
    setSuperfoodMessages([]);
    setMessageFeedback({});
    await clearTable('plan_superfood_messages');
  }, [closeMenu]);

  const generateResponseClaude = useCallback(
    async (userInput: string) => {
      try {
        const chatMemory = processChatMemory(superfoodMessages);
        setLoading(true);
        abortController.current = new AbortController();

        const response = await generateClaudeResponseText(
          userInput,
          updatePrompt(
            superfoodPrompt,
            superfoodRecord,
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
    [superfoodMessages, superfoodRecord, preferences, isPrefeencesOn, prompt],
  );

  const sendMessage = useCallback(async () => {
    await logButtonTap('Superfood Chat Send');
    if (!userInput || isSending) return;

    if (!isConnected) {
      Toast('No internet connection');
      return;
    }

    setIsSending(true);

    try {
      setSuperfoodMessages(prev => [
        ...prev,
        { role: 'user', message: userInput },
      ]);
      await saveSuperfoodMessage('user', userInput);

      if (isPrefeencesOn) await preferenceManager({ userInput });
      setUserInput('');

      const botResponse = await generateResponseClaude(userInput);
      if (botResponse) {
        setAnimatedText(true);
        setSuperfoodMessages(prev => [
          ...prev,
          { role: 'system', message: botResponse },
        ]);
        await saveSuperfoodMessage('system', botResponse);
      }
    } finally {
      setIsSending(false);
    }
  }, [
    userInput,
    isSending,
    isConnected,
    superfoodMessages,
    isPrefeencesOn,
    preferenceManager,
    generateResponseClaude,
  ]);

  const handleStop = useCallback(async () => {
    await logButtonTap('Superfood Chat Stop');
    if (abortController.current) {
      abortController.current.abort();
    }
    Tts.stop();
  }, []);

  return {
    loading,
    userInput,
    setUserInput,
    superfoodMessages,
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
    setLoading,
  };
};
