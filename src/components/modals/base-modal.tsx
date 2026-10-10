import { ColorScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { BlurView as RNBlurView } from '@react-native-community/blur';
import React from 'react';
import {
  ColorValue,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  GestureHandlerRootView,
  RectButton,
} from 'react-native-gesture-handler';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ModalSelector from './modal-selector';
import BackButton from '../ui/buttons/back-button';

interface BaseChatModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  showBackButton?: boolean;
  buttons?: React.ReactNode;
  children: React.ReactNode;
  rightButtonIcon?: string;
  onRightPress?: () => void;
  animationType?: 'slide' | 'fade' | 'none';
  avoidKeyboard?: boolean;
  swipeDirection?: 'up' | 'down' | 'left' | 'right';
  onSwipeComplete?: () => void;
  backdropOpacity?: number;
  testID?: string;
  showHeader?: boolean;
  rightIconColor?: ColorValue;
}

const BaseModal: React.FC<BaseChatModalProps> = ({
  isVisible,
  onClose,
  title = '',
  showBackButton = true,
  buttons,
  children,
  rightButtonIcon,
  onRightPress,
  animationType = 'fade',
  avoidKeyboard = true,
  swipeDirection,
  onSwipeComplete,
  backdropOpacity = 0.5,
  testID,
  showHeader = true,
  rightIconColor,
}) => {
  const { Colors } = useAppTheme();
  const theme = useAppSelector(state => state.theme);
  const styles = createBaseStyles(Colors, theme.colorScheme === 'dark');

  const handleBackdropPress = () => {
    onClose();
  };

  const handleSwipeComplete = () => {
    if (onSwipeComplete) {
      onSwipeComplete();
    } else {
      onClose();
    }
  };

  return (
    <ModalSelector
      isVisible={isVisible}
      onClose={onClose}
      animationType={animationType}
      avoidKeyboard={avoidKeyboard}
      {...(swipeDirection ? { swipeDirection } : {})}
      onSwipeComplete={handleSwipeComplete}
      backdropOpacity={backdropOpacity}
    >
      {isVisible ? (
        <Animated.View
          style={[{ flex: 1 }]}
          entering={FadeIn}
          exiting={FadeOut}
        >
          <GestureHandlerRootView
            style={styles.gestureContainer}
            testID={testID}
          >
            {isVisible && (
              <Animated.View
                style={styles.absolute}
                entering={FadeIn}
                exiting={FadeOut}
              >
                <RNBlurView
                  style={styles.absolute}
                  blurType={'dark'}
                  blurAmount={10}
                />

                <RectButton
                  style={styles.absolute}
                  onPress={handleBackdropPress}
                  rippleColor="transparent"
                  underlayColor="transparent"
                >
                  <View />
                </RectButton>
              </Animated.View>
            )}

            {/* Modal Content */}
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.modalContainer}>
                {showHeader && (
                  <View style={styles.modalHeader}>
                    {showBackButton ? (
                      <BackButton onPress={onClose} iconColor={Colors.primaryColor} />
                    ) : rightButtonIcon ? (
                      <View style={styles.headerSpacer} />
                    ) : null}

                    <Text style={styles.modalTitle}>{title}</Text>

                    {rightButtonIcon ? (
                      <TouchableOpacity
                        style={styles.backButton}
                        onPress={onRightPress}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={rightButtonIcon}
                          size={30}
                          color={rightIconColor ?? Colors.textPrimaryColor}
                          accessibilityLabel="Right action"
                        />
                      </TouchableOpacity>
                    ) : showBackButton ? (
                      <View style={styles.headerSpacer} />
                    ) : null}
                  </View>
                )}

                <View style={styles.contentContainer}>{children}</View>

                {buttons && (
                  <View style={styles.buttonContainer}>{buttons}</View>
                )}
              </View>
            </SafeAreaView>
          </GestureHandlerRootView>
        </Animated.View>
      ) : null}
    </ModalSelector>
  );
};

const createBaseStyles = (Colors: ColorScheme, isDark: boolean) =>
  StyleSheet.create({
    gestureContainer: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      // backgroundColor: 'red',
    },
    absolute: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },

    safeArea: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxWidth: 400,
      maxHeight: '80%',
      backgroundColor: isDark
        ? 'rgba(35, 35, 35, 0.95)'
        : 'rgba(255, 255, 255, 0.98)',
      borderRadius: 24,
      // elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      overflow: 'hidden',
    },
    modalHeader: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      paddingBottom: 16,
      minHeight: 60,
    },
    backButton: {
      padding: 8,
      minWidth: 40,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Nunito-Bold',
      color: Colors.textColor,
      textAlign: 'center',
      letterSpacing: 0.3,
      flex: 1,
      marginHorizontal: 6,
    },
    headerSpacer: {
      width: 40,
    },
    contentContainer: {
      padding: 20,
      paddingVertical: 16,
      flexGrow: 1,
      flexShrink: 1,
      minHeight: 100,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 12,
      gap: 6,
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.02)',
    },
  });

export default React.memo(BaseModal);
