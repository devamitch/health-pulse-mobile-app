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
import { groupRoutineData } from './supplements-utils';
import {
  clearTable,
  fetchActivitiesRecordWithDateRange,
  fetchPlanActivitiesChatMessage,
  savePlanActivitiesMessage,
} from '@/services/sqlite/message';
import { usePreferenceManager } from '../use-chat-util-function';

type MessageFeedback = {
  liked?: boolean;
  disliked?: boolean;
  feedback?: string;
};

export const usePlanActivitiesChat = () => {
  const [loading, setLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [activitiesMessages, setActivitiesMessages] = useState<Message[]>([]);
  const [activitiesRecord, setActivitiesRecord] = useState<RoutineRecord[]>([]);
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
      logButtonTap(`Activities Chat ${type}`, {
        messageIndex,
        feedback,
        messageContent: activitiesMessages[messageIndex]?.message,
      });
    },
    [activitiesMessages],
  );

  const fetchPastRecords = useCallback(async () => {
    const start_date = new Date();
    start_date.setDate(start_date.getDate() - 8);
    start_date.setHours(0, 0, 0, 0);

    const end_date = new Date();
    start_date.setDate(start_date.getDate() - 1);
    end_date.setHours(0, 0, 0, 0);

    const records = await fetchActivitiesRecordWithDateRange(
      start_date.toISOString(),
      end_date.toISOString(),
    );
    setActivitiesRecord(groupRoutineData(records));
  }, []);

  const loadMessages = useCallback(async () => {
    const messages = await fetchPlanActivitiesChatMessage();
    setActivitiesMessages(messages);
  }, []);

  useEffect(() => {
    fetchPastRecords();
    loadMessages();
  }, [fetchPastRecords, loadMessages]);

  const handleClearChat = useCallback(async () => {
    await logButtonTap('Activities Chat Clear');
    closeMenu();
    setActivitiesMessages([]);
    setMessageFeedback({});
    await clearTable('plan_activities_messages');
  }, [closeMenu]);
  
  const generateResponse = async (
    userInput: string,
  ) => {
    try {
      setLoading(true);
      abortController.current = new AbortController();
      
      const chatMemory = processChatMemory(activitiesMessages);
  
      const response = await generatePlanResponseClaude({
        plan: 'activity',
        chatMemory,
        userInformation,
        userInput,
        preferences,
        records: activitiesRecord,
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
  //       const chatMemory = processChatMemory(activitiesMessages);
  //       setLoading(true);
  //       abortController.current = new AbortController();

  //       const response = await generateClaudeResponseText(
  //         userInput,
  //         updatePrompt(
  //           activitiesPrompt,
  //           activitiesRecord,
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
  //   [activitiesMessages, activitiesRecord, preferences, isPrefeencesOn, prompt],
  // );

  const sendMessage = useCallback(async () => {
    await logButtonTap('Activities Chat Send');
    if (!userInput || isSending) return;

    if (!isConnected) {
      Toast('No internet connection');
      return;
    }

    setIsSending(true);

    try {
      setActivitiesMessages(prev => [
        ...prev,
        { role: 'user', message: userInput },
      ]);
      await savePlanActivitiesMessage('user', userInput);

      if (isPrefeencesOn) await preferenceManager({ userInput });
      setUserInput('');

      const botResponse = await generateResponse(userInput);
      if (botResponse) {
        setAnimatedText(true);
        setActivitiesMessages(prev => [
          ...prev,
          { role: 'system', message: botResponse },
        ]);
        await savePlanActivitiesMessage('system', botResponse);
      }
    } finally {
      setIsSending(false);
    }
  }, [
    userInput,
    isSending,
    isConnected,
    activitiesMessages,
    isPrefeencesOn,
    preferenceManager,
    generateResponse,
  ]);

  const handleStop = useCallback(async () => {
    await logButtonTap('Activities Chat Stop');
    if (abortController.current) {
      abortController.current.abort();
    }
    Tts.stop();
  }, []);

  return {
    loading,
    userInput,
    setUserInput,
    activitiesMessages,
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
