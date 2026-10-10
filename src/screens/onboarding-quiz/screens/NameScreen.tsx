// ============================================
// NameScreen - Welcome Card
// ============================================

import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { memo } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import QuestionnaireButton from '../components/QuestionnaireButton';

const NameScreen = memo(({ handleNext }: { handleNext: () => void }) => {
  const userData = useAppSelector(state => state.user.userData);
  const { Colors } = useAppTheme();
  const displayName = userData?.displayName || '';
  const lastName = userData?.lastName || '';
  const fullName = `${displayName} ${lastName}`.trim() || 'John Doe';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Card Container */}
          <Animated.View
            entering={FadeInUp.delay(100).duration(500)}
            style={[styles.card, { backgroundColor: Colors.surface }]}
          >
            {/* Title */}
            <Animated.Text
              entering={FadeInUp.delay(150).duration(500)}
              style={styles.title}
            >
              Welcome {fullName}!
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text
              entering={FadeInDown.delay(200).duration(500)}
              style={[styles.subtitle, { color: Colors.textSecondary }]}
            >
              You're one of a kind.
            </Animated.Text>

            {/* Description - First Paragraph */}
            <Animated.Text
              entering={FadeInDown.delay(250).duration(500)}
              style={[styles.description, { color: Colors.textSecondary }]}
            >
              Your goals, lifestyle, and habits help us create an experience
              just for you.
            </Animated.Text>

            {/* Description - Second Paragraph */}
            <Animated.Text
              entering={FadeInDown.delay(300).duration(500)}
              style={[styles.description, { color: Colors.textSecondary }]}
            >
              This will take about 5 minutes. We'll ask a few simple questions
              to personalize your health companion.
            </Animated.Text>

            {/* Description - Third Paragraph */}
            <Animated.Text
              entering={FadeInDown.delay(350).duration(500)}
              style={[styles.descriptionBold, { color: Colors.textColor }]}
            >
              Let's start building a stronger, healthier you step by step.
            </Animated.Text>

            <QuestionnaireButton
              onPress={handleNext}
              isLastStep={false}
              label={"Let's Begin"}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

NameScreen.displayName = 'NameScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 120,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: FONT_FAMILIES.nunitoBold,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
    color: '#1857C1',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILIES.nunitoBold,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  description: {
    fontSize: 15,
    fontFamily: FONT_FAMILIES.nunitoRegular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  descriptionBold: {
    fontSize: 15,
    fontFamily: FONT_FAMILIES.nunitoSemiBold,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
  },
});

export default NameScreen;
