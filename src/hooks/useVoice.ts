import {
  checkVoiceRecognitionAvailable,
  initVoiceRecognition,
  requestMicrophonePermission,
  startVoiceRecognition,
  stopVoiceRecognition,
} from '@/services/voice';
import type { VoiceState } from '@/types/voice';
import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook for voice recognition
 */
export const useVoice = (
  options: { onTranscript?: (text: string) => void } = {},
) => {
  const [state, setState] = useState<VoiceState>({
    status: 'idle',
    transcript: '',
    error: undefined,
    isAvailable: false,
    hasPermission: false,
  });

  // Check availability and permissions on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [isAvailable, hasPermission] = await Promise.all([
          checkVoiceRecognitionAvailable(),
          requestMicrophonePermission(),
        ]);

        setState(prev => ({
          ...prev,
          isAvailable,
          hasPermission,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Initialization failed',
        }));
      }
    };

    init();
  }, []);

  // Handle voice events
  useEffect(() => {
    const { destroy } = initVoiceRecognition({
      onEvent: event => {
        switch (event.type) {
          case 'start':
            setState(prev => ({ ...prev, status: 'recording' }));
            break;

          case 'end':
            setState(prev => ({ ...prev, status: 'idle' }));
            break;

          case 'error':
            setState(prev => ({
              ...prev,
              status: 'error',
              error: event.error.message,
            }));
            break;

          case 'results':
            setState(prev => ({
              ...prev,
              transcript: event.value[0] || '',
            }));
            options.onTranscript?.(event.value[0] || '');
            break;
        }
      },
    });

    return destroy;
  }, [options.onTranscript]);

  const start = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: 'starting', error: undefined }));
      await startVoiceRecognition();
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to start',
      }));
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: 'stopping' }));
      await stopVoiceRecognition();
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to stop',
      }));
    }
  }, []);

  const toggle = useCallback(async () => {
    if (state.status === 'recording') {
      await stop();
    } else {
      await start();
    }
  }, [state.status, start, stop]);

  const clearTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }));
  }, []);

  return {
    ...state,
    start,
    stop,
    toggle,
    clearTranscript,
  };
};
