import { AnimatedLoader } from '@/components/base/AnimatedLoader';
import {
  AnimatedSocialButton,
  SocialButton,
} from '@/components/base/AnimatedSocialButton';
import useAuthentication from '@/hooks/use-authentication';
import useSocialAuth from '@/hooks/use-social-auth'; // Import the new hook
import { isAppleSupported } from '@/services/auth/social-auth';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

type SocianButtonProps = {
  fullWidth?: boolean;
};

const SocianFullButtons: React.FC<SocianButtonProps> = ({ fullWidth }) => {
  const { error, onGooglePress, onApplePress, clearError } =
    useSocialAuth();

  const {
    GoogleSignIn,
    AppleSignIn,
    loading
  } = useAuthentication();

  return (
    <>
      <AnimatedLoader loading={loading} />

      {fullWidth ? (
        // Platform.OS === 'ios' && isAppleSupported ? (
          <View style={[{ gap: 16 }]}>
            <AnimatedSocialButton
              onPress={AppleSignIn}
              text="Continue with Apple"
              icon={require('@/assets/images/apple.png')}
              iconTintColor="#FFFFFF"
              backgroundColor="#000000"
              contentBackgroundColor="#000000"
              iconBackgroundColor="#000000"
              type="apple"
              style={styles.socialButton}
              textStyle={{
                fontSize: 16,
                fontWeight: '700',
              }}
              height={48}
              borderRadius={24}
            />
            <AnimatedSocialButton
              onPress={GoogleSignIn}
              text="Sign in with Google"
              icon={require('@/assets/images/google.png')}
              backgroundColor="#F2F2F2"
              contentBackgroundColor="#F2F2F2"
              iconBackgroundColor="#F2F2F2"
              textStyle={{
                color: '#1F1F1F',
                fontSize: 16,
                fontWeight: '700',
              }}
              style={styles.socialButton}
              height={48}
              borderRadius={24}
            />
          </View>
        // ) : (
        //   <View style={[styles.socialButtonsContainer, styles.socialButton]}>
        //     <AnimatedSocialButton
        //       onPress={GoogleSignIn}
        //       text="Sign in with Google"
        //       icon={require('@/assets/images/google.png')}
        //       backgroundColor="#F2F2F2"
        //       contentBackgroundColor="#F2F2F2"
        //       iconBackgroundColor="#F2F2F2"
        //       textStyle={{
        //         color: '#1F1F1F',
        //         fontSize: 16,
        //         fontWeight: '700',
        //       }}
        //       style={styles.socialButton}
        //       height={48}
        //     />
        //   </View>
        // )
      ) : (
        <View style={styles.socialButtonsContainer}>
          {/* {Platform.OS === 'ios' && isAppleSupported ? ( */}
            <>
              <SocialButton
                icon={<FontAwesome name="apple" size={22} color="#FFFFFF" />}
                text="Sign in with Apple"
                onPress={AppleSignIn}
                backgroundColor="#000000"
                textColor="#FFFFFF"
                borderColor="#000000"
                index={1}
              />
              <SocialButton
                icon={
                  <Image
                    source={require('@/assets/images/google.png')}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                }
                text="Sign in with Google"
                onPress={GoogleSignIn}
                backgroundColor="#F2F2F2"
                textColor="#272727"
                borderColor="#F2F2F2"
                index={0}
              />
            </>
          {/* ) : (
            <SocialButton
              icon={
                <Image
                  source={require('@/assets/images/google.png')}
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
              }
              text="Sign in with Google"
              onPress={GoogleSignIn}
              backgroundColor="#F2F2F2"
              textColor="#272727"
              borderColor="#F2F2F2"
              index={0}
            />
          )} */}
        </View>
      )}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </>
  );
};

export default SocianFullButtons;

const styles = StyleSheet.create({
  socialButton: {
    // marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 0.5,
      },
    }),
  },
  // Error styles
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 24,
    overflow: 'hidden',
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
});
