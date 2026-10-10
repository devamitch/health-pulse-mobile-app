import { loginStyles } from '@/screens/auth/styles';
import { useAppTheme } from '@/hooks/themeHook';
import { logButtonTap } from '@/services/analyticsService';
import { hapticFeedback } from '@/utils/haptics';
import { useNavigation } from '@react-navigation/native';
import { Text, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AnimatedButton } from '../base/AnimatedButton';
import BackButton from '../ui/buttons/back-button';

interface AuthHeaderProps {
  headerStyle?: any;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
}

export const AuthHeader = ({
  headerStyle,
  title = 'Welcome',
  subtitle = 'Continue your health journey with Skyp',
  showBackButton = true,
}: AuthHeaderProps) => {
  const navigation = useNavigation();
  const { Colors } = useAppTheme();

  return (
    <Reanimated.View style={[loginStyles.headerSection, headerStyle]}>
      <View style={loginStyles.headerTopRow}>
        {showBackButton ? (
          <BackButton
            iconColor={Colors.textColor}
            onPress={() => {
              hapticFeedback('impactLight');
              logButtonTap('login_header_back_button');
              navigation.goBack();
            }}
          />
        ) : (
          <View style={loginStyles.backButtonPlaceholder} />
        )}

        <Text style={[loginStyles.headerTitle, { color: Colors.textColor }]}>{title}</Text>

        <View style={loginStyles.headerSpacer} />
      </View>

      {subtitle && <Text style={[loginStyles.headerSubtitle, { color: Colors.textSecondary }]}>{subtitle}</Text>}
    </Reanimated.View>
  );
};

interface AuthFooterProps {
  primaryText: string;
  secondaryText: string;
  onActionPress: () => void;
}

export const AuthFooter = ({
  primaryText,
  secondaryText,
  onActionPress,
}: AuthFooterProps) => {
  const { Colors } = useAppTheme();

  return (
    <View style={loginStyles.footerContainer}>
      <Text style={[loginStyles.footerText ,{color:Colors.textSecondary}]}>{primaryText}</Text>
      <TouchableOpacity onPress={onActionPress}>
        <Text
          style={[loginStyles.footerActionText, { color: Colors.primaryColor }]}
        >
          {secondaryText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

interface AuthDividerProps {
  text?: string;
}

export const AuthDivider = ({
  text = 'Or continue with',
}: AuthDividerProps) => {
  return (
    <View style={loginStyles.divider}>
      <View style={loginStyles.dividerLine} />
      <Text style={loginStyles.dividerText}>{text}</Text>
      <View style={loginStyles.dividerLine} />
    </View>
  );
};

interface PrivacyNoticeProps {
  text?: string;
}

export const PrivacyNotice = ({
  text = 'Your health data is 100% private and secure',
}: PrivacyNoticeProps) => {
  const { Colors } = useAppTheme();

  return (
    <View style={loginStyles.privacyNotice}>
      <MaterialCommunityIcons
        name="shield-check-outline"
        size={18}
        color={Colors.greenColor}
      />
      <Text style={loginStyles.privacyText}>{text}</Text>
    </View>
  );
};

interface SuccessMessageProps {
  icon?: string;
  title: string;
  message: string;
  buttonText?: string;
  onAction?: () => void;
  imageSource?: any;
}

export const SuccessMessage = ({
  icon = 'check-circle-outline',
  title,
  message,
  buttonText = 'Continue',
  onAction,
  imageSource,
}: SuccessMessageProps) => {
  const { Colors } = useAppTheme();

  return (
    <View style={loginStyles.successContainer}>
      {imageSource ? (
        <Image
          source={imageSource}
          style={loginStyles.successImage}
          resizeMode="contain"
        />
      ) : (
        <MaterialCommunityIcons
          name={icon}
          size={60}
          color={Colors.greenColor}
          style={loginStyles.successIcon}
        />
      )}
      <Text style={loginStyles.successTitle}>{title}</Text>
      <Text style={loginStyles.successMessage}>{message}</Text>
      {onAction && (
        <View style={loginStyles.buttonContainer}>
          <AnimatedButton text={buttonText} onPress={onAction} />
        </View>
      )}
    </View>
  );
};
