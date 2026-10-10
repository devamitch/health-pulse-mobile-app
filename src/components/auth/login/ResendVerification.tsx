import { loginStyles } from '@/screens/auth/styles';
import { Text, TouchableOpacity } from 'react-native';

interface ResendVerificationProps {
  onPress: () => void;
}

export const ResendVerification = ({ onPress }: ResendVerificationProps) => {
  return (
    <TouchableOpacity style={loginStyles.resendContainer} onPress={onPress}>
      <Text style={loginStyles.resendText}>Resend Verification Email</Text>
    </TouchableOpacity>
  );
};
