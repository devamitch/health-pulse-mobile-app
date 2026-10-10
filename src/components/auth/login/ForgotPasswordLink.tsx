import { loginStyles } from '@/screens/auth/styles';
import { logButtonTap } from '@/services/analyticsService';
import { hapticFeedback } from '@/utils/haptics';
import { Text, TouchableOpacity } from 'react-native';

interface ForgotPasswordLinkProps {
  navigation: any;
}

export const ForgotPasswordLink = ({ navigation }: ForgotPasswordLinkProps) => {
  return (
    <TouchableOpacity
      style={loginStyles.forgotPasswordContainer}
      onPress={() => {
        hapticFeedback('impactLight');
        logButtonTap('Forgot Password');
        navigation.navigate('ForgotPasswordScreen');
      }}
    >
      <Text style={loginStyles.forgotPasswordText}>Forgot Password?</Text>
    </TouchableOpacity>
  );
};
