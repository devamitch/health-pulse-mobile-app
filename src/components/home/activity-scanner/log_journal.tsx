import { FONT_FAMILIES } from '@/constants/typography';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface LogJournalProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxWords?: number;
}

export const LogJournal: React.FC<LogJournalProps> = ({
  value,
  onChangeText,
  placeholder = 'Write your thoughts here...',
  maxWords = 300,
}) => {
  const [wordCount, setWordCount] = useState(0);

  const handleTextChange = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const count = words.length;

    if (count <= maxWords) {
      setWordCount(count);
      onChangeText(text);
    }
  };

  React.useEffect(() => {
    const words = value.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, [value]);

  return (
    <View style={styles.timerContainer}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={6}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={handleTextChange}
          textAlignVertical="top"
        />

        <View style={styles.counterContainer}>
          <Text
            style={[
              styles.counterText,
              wordCount > maxWords * 0.9 && { color: '#FF4444' },
            ]}
          >
            {wordCount}/{maxWords} words
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: 254,
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'rgba(244, 244, 244, 1)',
  },
  inputContainer: {
    width: '100%',
    flex: 1,
  },
  textInput: {
    flex: 1,
    minHeight: 180,
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    lineHeight: 24,
    color: '#1A1A1A',
  },
  counterContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  counterText: {
    fontSize: 13,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    color: '#666',
  },
});
