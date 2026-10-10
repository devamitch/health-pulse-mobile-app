import { useAppTheme } from '@/hooks/themeHook';
import { createStyle } from '@/screens/status_chat/wind_screen';
import { logButtonTap } from '@/services/analyticsService';
import { useKeyboard } from '@react-native-community/hooks';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MedicalDisclaimerModal from '../modals/medical-disclaimer-modal';
import ChatInput from './ChatInput';
import StatusHeader from './status-header';
import Loader from '@/constants/loader';

type Props = {
  title: string;
  subtitle?: string;
  description: string;
  handleNotification?: () => Promise<void>;
  handleClearChat: () => Promise<void>;
  ImageComponent?: any;
  gradientColors?: [string, string];
  children?: React.ReactNode | React.ReactNode[];
  loading?: boolean;
  input?: string;
  setInput?: React.Dispatch<React.SetStateAction<string>>;
  onSend?: () => Promise<void>;
  onStop?: () => Promise<void>;
  angle?: number;
};

const StatusLayout: React.FC<Props> = ({
  title,
  subtitle,
  description,
  handleNotification,
  handleClearChat,
  ImageComponent,
  gradientColors,
  children,
  loading,
  input,
  setInput,
  onSend,
  onStop,
  angle,
}) => {
  const { Colors, DEffect } = useAppTheme();
  const isKeyboardVisible = useKeyboard().keyboardShown;
  const styles = createStyle(Colors, DEffect);

  const navigation = useNavigation();
  const scrollY = useSharedValue(0);
  const inset = useSafeAreaInsets();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const screenHeight = useWindowDimensions().height;

  return (
    <>
      <GestureHandlerRootView style={styles.container}>
        <Loader loading={!!loading} />
        <KeyboardAvoidingView
          style={styles.container}
          keyboardVerticalOffset={
            Platform.OS === 'android' && isKeyboardVisible ? 30 : 0
          }
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        >
          <StatusHeader
            title={title}
            scrollY={scrollY}
            subtitle={subtitle || "Let's get started!"}
            description={description}
            onBackPress={async () => {
              await logButtonTap('Gym Backbutton');
              navigation.goBack();
            }}
            menuItems={[
              {
                title: 'Clear chat',
                onPress: handleClearChat,
                icon: 'trash-outline',
              },
              {
                title: 'Notifications',
                onPress: handleNotification,
                icon: 'notifications-outline',
              },
            ]}
            ImageComponent={ImageComponent}
            imageSize={100}
            styles={{
              // container: {
              //   borderBottomRightRadius: 30,
              //   borderBottomLeftRadius: 30,
              // },
              subtitleText: {
                top: '5%',
                paddingLeft: 20,
                fontFamily: 'Nunito-SemiBold',
                fontSize: 22,
                paddingBottom: 10,
              },
              descriptionText: {
                top: '10%',
                paddingLeft: 20,
                fontSize: 17,
                width: '55%',
              },
              circleContainer: {
                bottom: 0,
                right: -70,
                height: 200,
                width: 200,
              },
            }}
            gradientColors={gradientColors}
            angle={angle}
          />
          <Animated.ScrollView
            style={styles2.scrollView}
            contentContainerStyle={[
              styles2.container,
              {
                paddingBottom: 200 + inset?.bottom + inset?.top,
                minHeight: screenHeight,
              },
            ]}
            showsVerticalScrollIndicator={false}
            bounces={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
          >
            {children}
          </Animated.ScrollView>
          {setInput ? (
            <ChatInput
              value={input}
              onChangeText={setInput}
              onSend={onSend}
              onStop={onStop}
            />
          ) : null}
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
      <MedicalDisclaimerModal />
    </>
  );
};

export default StatusLayout;

const styles2 = StyleSheet.create({
  container: {
    flexGrow: 1,
    // paddingHorizontal: 20,
    gap: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
