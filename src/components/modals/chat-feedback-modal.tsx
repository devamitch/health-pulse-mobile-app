import { useAppTheme } from '@/hooks/themeHook';
import { hapticFeedback } from '@/utils';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BaseModal from './base-modal';
import ModalBtttons from './modal-buttons';

type FeedbackType = 'like' | 'dislike' | 'suggestion' | 'bug';

type ChatFeedbackModalProps = {
  visible: boolean;
  type?: FeedbackType;
  onClose: () => void;
  onSubmit: (feedback?: string, type?: FeedbackType) => void;
  initialFeedback?: string;
  characterLimit?: number;
};

const FEEDBACK_TYPES: Record<
  FeedbackType,
  {
    icon: string;
    title: string;
    placeholder: string;
    color: string;
  }
> = {
  like: {
    icon: 'thumb-up',
    title: 'What did you like?',
    placeholder: 'Tell us what you found helpful...',
    color: 'primaryColor',
  },
  dislike: {
    icon: 'thumb-down',
    title: 'What could be improved?',
    placeholder: 'Let us know how we can improve...',
    color: 'secondaryColor',
  },
  suggestion: {
    icon: 'lightbulb-outline',
    title: 'Share your suggestion',
    placeholder: 'We value your ideas for improvement...',
    color: 'tertiaryColor',
  },
  bug: {
    icon: 'bug-report',
    title: 'Report a bug',
    placeholder: 'Describe the issue you encountered...',
    color: 'errorColor',
  },
};

const ChatFeedbackModal = ({
  visible,
  type = 'like',
  onClose,
  onSubmit,
  initialFeedback = '',
  characterLimit = 500,
}: ChatFeedbackModalProps) => {
  const { Colors } = useAppTheme();
  const [feedback, setFeedback] = useState(initialFeedback);
  const [selectedType, setSelectedType] = useState<FeedbackType>(type);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const lottieRef = useRef<LottieView>(null);

  const currentConfig = FEEDBACK_TYPES[selectedType];
  const charsRemaining = characterLimit - feedback.length;
  const isLimitExceeded = charsRemaining < 0;

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setFeedback(initialFeedback);
      setSelectedType(type);
    }
  }, [visible, initialFeedback, type]);

  // Animation effects
  useEffect(() => {
    if (visible) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }).start();

      // Reset and play animation when modal opens
      if (lottieRef.current) {
        lottieRef.current.reset();
        lottieRef.current.play();
      }
    } else {
      scaleAnim.setValue(0.9);
    }
  }, [visible, scaleAnim]);

  const handleSubmit = () => {
    if (isSubmitting || isLimitExceeded) return;

    setIsSubmitting(true);
    hapticFeedback('impactMedium');

    // Play success animation
    if (lottieRef.current) {
      lottieRef.current.play(30, 75);
    }

    setTimeout(() => {
      onSubmit(feedback.trim(), selectedType);
      setIsSubmitting(false);
      if (!visible) {
        setFeedback('');
      }
    }, 1000);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleTypeChange = (newType: FeedbackType) => {
    if (selectedType === newType) return;

    hapticFeedback('impactLight');
    setSelectedType(newType);
  };

  const buttons = <ModalBtttons onClose={onClose} handleSave={handleSubmit} />;

  return (
    <BaseModal
      isVisible={visible}
      onClose={handleClose}
      title={currentConfig.title}
      buttons={buttons}
    >
      <Animated.View
        style={[styles.contentContainer, { transform: [{ scale: scaleAnim }] }]}
      >
        {selectedType === 'like' && (
          <View style={styles.lottieContainer}>
            <LottieView
              ref={lottieRef}
              source={require('@/assets/animations/success.json')}
              style={styles.lottie}
              loop={false}
              autoPlay={false}
              resizeMode="cover"
            />
          </View>
        )}

        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: Colors.greyColor100,
              color: Colors.textColor,
              borderColor: isLimitExceeded ? Colors.error : Colors.greyColor400,
            },
          ]}
          multiline
          placeholder={currentConfig.placeholder}
          placeholderTextColor={Colors.greyColor600}
          value={feedback}
          onChangeText={setFeedback}
          textAlignVertical="top"
          maxLength={characterLimit}
          editable={!isSubmitting}
          returnKeyType="done"
        />

        <View style={styles.counterContainer}>
          <Text
            style={[
              styles.counterText,
              {
                color: isLimitExceeded ? Colors.error : Colors.greyColor600,
                fontFamily: isLimitExceeded ? 'Nunito-Bold' : 'Nunito-Regular',
              },
            ]}
          >
            {charsRemaining}/{characterLimit}
          </Text>
          {isLimitExceeded && (
            <MaterialIcons
              name="error-outline"
              size={16}
              color={Colors.error}
              style={styles.errorIcon}
            />
          )}
        </View>
      </Animated.View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginBottom: 8,
  },
  lottie: {
    width: 80,
    height: 80,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Medium',
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  button: {
    flex: 1,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
  },
  buttonLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
  },
  cancelButton: {
    marginRight: 12,
  },
  typeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  typeButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  counterText: {
    fontSize: 12,
  },
  errorIcon: {
    marginLeft: 4,
  },
});

export default ChatFeedbackModal;
