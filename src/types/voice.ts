export type VoiceError = {
  code: string;
  message: string;
};

export type FrequencyBands = {
  bass: number;
  mid: number;
  high: number;
};

export interface VoiceState {
  isRecording: boolean;
  transcript: string;
  permissionGranted: boolean;
  frequencyBands: FrequencyBands;
  error?: string;
}

export type MicrophoneButtonProps = {
  size?: number;
  onPress?: () => void;
  isActive?: boolean;
};

/**
 * Voice recognition event types
 */
export type SpeechStartEvent = {
  type: 'start';
};

export type SpeechRecognizedEvent = {
  type: 'recognized';
  isFinal: boolean;
};

export type SpeechEndEvent = {
  type: 'end';
};

export type SpeechErrorEvent = {
  type: 'error';
  error: {
    message: string;
    code?: string;
  };
};

export type SpeechResultsEvent = {
  type: 'results' | 'partialResults';
  value: string[];
};

export type SpeechVolumeChangeEvent = {
  type: 'volumeChange';
  value: number;
};

export type VoiceEvent =
  | SpeechStartEvent
  | SpeechRecognizedEvent
  | SpeechEndEvent
  | SpeechErrorEvent
  | SpeechResultsEvent
  | SpeechVolumeChangeEvent;

/**
 * Voice recognition state
 */
export interface VoiceState {
  status: 'idle' | 'starting' | 'recording' | 'stopping' | 'error';
  transcript: string;
  isAvailable: boolean;
  hasPermission: boolean;
}

/**
 * Voice recognition options
 */
export type VoiceOptions = {
  locale?: string;
  onEvent?: (event: VoiceEvent) => void;
  android?: {
    extraLanguageModel?: string;
    extraMaxResults?: number;
    requestPermissionsAuto?: boolean;
  };
};
