import { loginStyles } from '@/screens/auth/styles';
import { useAppTheme } from '@/hooks/themeHook';
import { logButtonTap } from '@/services/analyticsService';
import { hapticFeedback } from '@/utils/haptics';
import { useNavigation } from '@react-navigation/native';
import { Text, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BackButton from '@/components/ui/buttons/back-button';

interface LoginHeaderProps {
  headerStyle: any;
  title?: string;
  subtitle?: string;
}

export const LoginHeader = ({
  headerStyle,
  title = 'Welcome Back',
  subtitle = 'Sign in to continue your health journey with Skyp',
}: LoginHeaderProps) => {
  const navigation = useNavigation();
  const { Colors } = useAppTheme();

  return (
    <Reanimated.View style={[loginStyles.headerSection, headerStyle]}>
      <View style={loginStyles.headerTopRow}>
     <BackButton
     iconColor={Colors.textColor}
          onPress={() => {
            hapticFeedback('impactLight');
            logButtonTap('login_header_back_button');
            navigation.goBack();
          }}
        />
        <Text style={[loginStyles.headerTitle , {
          color: Colors.textColor
        }]}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={[loginStyles.headerSubtitle, { color: Colors.textSecondary }]}>{subtitle}</Text>
    </Reanimated.View>
  );
};
