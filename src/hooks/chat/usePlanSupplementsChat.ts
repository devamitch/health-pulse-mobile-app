import useNetInfo from '@/hooks/use_net_info';
import { logButtonTap } from '@/services/analyticsService';
import { generatePlanResponseClaude } from '@/services/api/claude_client';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { Message, RoutineRecord } from '@/services/mmkv-redux/slices';
import {
  processChatMemory,
} from '@/utils/llm_utils';
import { Toast } from '@/utils/toast';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Tts from 'react-native-tts';
import {
  clearTable,
  fetchSupplementRecordWithDateRange,
  savePlanSupplementMessage,
} from './supplements-db';
import { groupRoutineData } from './supplements-utils';
import { usePreferenceManager } from '../use-chat-util-function';
import { fetchPlanSupplementChatMessage } from '@/services/sqlite/message';

export type MessageFeedback = {
  liked?: boolean;
  disliked?: boolean;
  feedback?: string;
};

export const usePlanSupplementsChat = () => {
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [supplementsMessages, setSupplementsMessages] = useState<Message[]>([]);
  const [supplementRecord, setSupplementRecord] = useState<RoutineRecord[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [animatedText, setAnimatedText] = useState(false);
  const [visible, setVisible] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<
    Record<number, MessageFeedback>
  >({});

  const abortController = useRef<AbortController | null>(null);
  const isConnected = useNetInfo();


  const {
    haptic_level,
    isPrefeencesOn,
    CategorisedPreferences,
    quiz,
  } = useAppSelector(state => state.message);

  const { preferenceManager } = usePreferenceManager();
  const preferences = CategorisedPreferences?.Activities ?? [];
  
  const userInformation = useMemo(() => (
    quiz.reduce<Record<string, string | number | boolean>>((acc, item) => {
      acc[item.questionTag] = item.answer;
      return acc;
    }, {})
  ), [quiz]);

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
      logButtonTap(`Supplements Chat ${type}`, {
        messageIndex,
        feedback,
        messageContent: supplementsMessages[messageIndex]?.message,
      });
    },
    [supplementsMessages],
  );

  const fetchPastRecords = useCallback(async () => {
    const start_date = new Date();
    start_date.setDate(start_date.getDate() - 8);
    start_date.setHours(0, 0, 0, 0);

    const end_date = new Date();
    start_date.setDate(start_date.getDate() - 1);
    end_date.setHours(0, 0, 0, 0);

    const records = await fetchSupplementRecordWithDateRange(
      start_date.toISOString(),
      end_date.toISOString(),
    );
    setSupplementRecord(groupRoutineData(records));
  }, []);

  const loadMessages = useCallback(async () => {
    const messages = await fetchPlanSupplementChatMessage();
    setSupplementsMessages(messages);
  }, []);

  useEffect(() => {
    fetchPastRecords();
    loadMessages();
  }, [fetchPastRecords, loadMessages]);

  const handleClearChat = useCallback(async () => {
    await logButtonTap('Supplements Chat Clear');
    closeMenu();
    setSupplementsMessages([]);
    setMessageFeedback({});
    await clearTable('plan_supplement_messages');
  }, [closeMenu]);

  const generateResponse = async (
    userInput: string,
  ) => {
    try {
      setLoading(true);
      abortController.current = new AbortController();
      
      const chatMemory = processChatMemory(supplementsMessages);
  
      const response = await generatePlanResponseClaude({
        plan: 'supplement',
        chatMemory,
        userInformation,
        userInput,
        preferences,
        records: supplementRecord,
        isChat: true,
      });
  
      return (response?.content[0] as any).text as string;
    } catch (error) {
      if (abortController.current?.signal.aborted) {
        console.log('Request was aborted');
      } else {
        console.error('Error:', error);
      }
      return 'Something went wrong. Please try again.';
    } finally {
      setLoading(false);
      abortController.current = null;
    }
  }

  // const generateResponseClaude = useCallback(
  //   async (userInput: string) => {
  //     try {
  //       const chatMemory = processChatMemory(supplementsMessages);
  //       setLoading(true);
  //       abortController.current = new AbortController();

  //       const response = await generateClaudeResponseText(
  //         userInput,
  //         updatePrompt(
  //           supplementPrompt,
  //           supplementRecord,
  //           isPrefeencesOn ? preferences : [],
  //           [],
  //           prompt || '',
  //         ),
  //         chatMemory as any,
  //         // abortController.current.signal as any,
  //       );
  //       // const response2 = await generateClaudeResponseText(
  //       //   `Existing preferences: ${JSON.stringify(
  //       //     preferences,
  //       //   )}, Message: ${userInput}`,
  //       //   preferencePrompt,
  //       //   [],
  //       //   'claude-3-5-haiku-20241022',
  //       // );

  //       return (response?.content?.[0] as any).text;
  //     } catch (error) {
  //       if (abortController.current?.signal.aborted) {
  //         console.log('Request was aborted');
  //       } else {
  //         console.error('Error:', error);
  //       }
  //       if (!prompt) {
  //         Toast('Please complete the quiz section to access this feature');
  //         return '';
  //       }
  //       return 'Something went wrong. Please try again.';
  //     } finally {
  //       setLoading(false);
  //       abortController.current = null;
  //     }
  //   },
  //   [
  //     supplementsMessages,
  //     supplementRecord,
  //     preferences,
  //     isPrefeencesOn,
  //     prompt,
  //   ],
  // );

  const sendMessage = useCallback(async () => {
    await logButtonTap('Supplements Chat Send');
    if (!userInput || isSending) return;

    if (!isConnected) {
      Toast('No internet connection');
      return;
    }

    setIsSending(true);

    try {
      setSupplementsMessages(prev => [
        ...prev,
        { role: 'user', message: userInput },
      ]);
      await savePlanSupplementMessage('user', userInput);

      if (isPrefeencesOn) await preferenceManager({ userInput });
      setUserInput('');

      const botResponse = await generateResponse(userInput);
      if (botResponse) {
        setAnimatedText(true);
        setSupplementsMessages(prev => [
          ...prev,
          { role: 'system', message: botResponse },
        ]);
        await savePlanSupplementMessage('system', botResponse);
      }
    } finally {
      setIsSending(false);
    }
  }, [
    userInput,
    isSending,
    isConnected,
    supplementsMessages,
    isPrefeencesOn,
    preferenceManager,
    generateResponse,
  ]);

  const handleStop = useCallback(async () => {
    await logButtonTap('Supplements Chat Stop');
    if (abortController.current) {
      abortController.current.abort();
    }
    Tts.stop();
  }, []);

  return {
    loading,
    userInput,
    setUserInput,
    supplementsMessages,
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
