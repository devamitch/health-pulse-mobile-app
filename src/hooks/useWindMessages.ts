import { generateClaudeResponseText } from '@/services/api/claude_client';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import {
  updateMessageCount,
} from '@/services/mmkv-redux/slices';
import { fetchWindMessages, saveWindMessage } from '@/services/sqlite/message';
import { clearTable } from '@/services/sqlite/vitals';
import { WindMessage } from '@/types/windTypes';
import {
  generalPrompt,
  updatePrompt,
} from '@/utils/llm_utils';
import { processWindChatMemory } from '@/utils/status/wind/windUtils';
import { Toast } from '@/utils/toast';
import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';
import { usePreferenceManager } from './use-chat-util-function';

export const useWindMessages = (date: Date) => {
  const [messages, setMessages] = useState<WindMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const abortController = useRef<AbortController | null>(null);
  const dispatch = useAppDispatch();
  const isConnected = useNetInfo();
  const { paymentStatus } = useAppSelector(state => state.user);
  const { preferenceManager } = usePreferenceManager();
  const { preferences, prompt, isPrefeencesOn, messageCount } = useAppSelector(
    state => state.message,
  );

  useEffect(() => {
    const loadMessages = async () => {
      const fetchedMessages = await fetchWindMessages(date);
      setMessages(fetchedMessages);
    };
    loadMessages();
  }, [date]);

  const generateResponse = async (message: string) => {
    try {
      setLoading(true);
      abortController.current = new AbortController();
      const response = await generateClaudeResponseText(
        message,
        updatePrompt(
          generalPrompt,
          [],
          isPrefeencesOn ? preferences : [],
          [],
          prompt,
        ),
        processWindChatMemory(messages),
      );
      return (response.content[0] as any).text;
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
  };

  const sendMessage = async (userInput: string) => {
    if (!userInput) return;

    if (!isConnected) {
      Toast('No internet connection');
      return;
    }

    if (!paymentStatus) {
      dispatch(updateMessageCount('windscreen_messages'));
      if (messageCount['windscreen_messages'] && messageCount['windscreen_messages'].count >= 6) {
        return true; // Indicates unlock modal should be shown
      }
    }

    const newUserMessage: WindMessage = { role: 'user', message: userInput };
    setMessages(prev => [newUserMessage, ...prev]);
    await saveWindMessage('user', userInput);

    const botResponse = await generateResponse(userInput);
    if (isPrefeencesOn) await preferenceManager({userInput});

    if (botResponse) {
      const newSystemMessage: WindMessage = {
        role: 'system',
        message: botResponse,
      };
      setMessages(prev => [newSystemMessage, ...prev]);
      await saveWindMessage('system', botResponse);
    }

    return false;
  };

  const stopGeneration = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
  };

  const clearChat = async () => {
    await clearTable('wind_messages');
    setMessages([]);
  };

  return {
    messages,
    loading,
    sendMessage,
    stopGeneration,
    clearChat,
  };
};
