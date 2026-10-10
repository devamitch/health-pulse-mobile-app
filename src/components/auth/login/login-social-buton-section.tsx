import { loginStyles, SKYP_COLORS } from '@/screens/auth/styles';
import { hapticFeedback } from '@/utils';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SocianFullButtons from '../social-buttons-full';

const LoginSocialButtonSection = () => {
  const socialOpacity = useSharedValue(0);

  const navigation = useNavigation();
  useEffect(() => {
    // Social section animation
    socialOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }),
    );
  }, []);

  const socialStyle = useAnimatedStyle(() => {
    return {
      opacity: socialOpacity.value,
    };
  });

  return (
    <Reanimated.View style={[loginStyles.socialSection, socialStyle]}>
      <View style={loginStyles.signUpContainer}>
        <Text style={loginStyles.signUpText}>Don't have an account?</Text>
        <TouchableOpacity
          onPress={() => {
            hapticFeedback('impactLight');
            navigation.navigate('RegisterScreen');
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text
            style={[loginStyles.signUpLink, { color: SKYP_COLORS.primary }]}
          >
            Sign up
          </Text>
        </TouchableOpacity>
      </View>

      <View style={loginStyles.divider}>
        <View style={loginStyles.dividerLine} />
        <Text style={loginStyles.dividerText}>Or continue with</Text>
        <View style={loginStyles.dividerLine} />
      </View>

      <SocianFullButtons />

      <View style={loginStyles.privacyNotice}>
        <MaterialCommunityIcons
          name="shield-check-outline"
          size={18}
          color={SKYP_COLORS.secondary}
        />
        <Text style={loginStyles.privacyText}>
          Your health data is 100% private and secure
        </Text>
      </View>
    </Reanimated.View>
  );
};

export default LoginSocialButtonSection;

const styles = StyleSheet.create({});
