import { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Loader from '@/constants/loader';
import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import useNetInfo from '@/hooks/use_net_info';
import { logButtonTap } from '@/services/analyticsService';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { Toast } from '@/utils/toast';
import { useUpdatePasswordMutation } from '@/services/mmkv-redux/apis/auth';
import { AnimatedInput } from '@/components/base/AnimatedInput';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { loginStyles } from '../../auth/styles';
import BackButton from '@/components/ui/buttons/back-button';
import Button from '@/components/ui/buttons/button';
import { FONT_FAMILIES } from '@/constants/typography';

const ChangePasswordScreen = ({ navigation }: any) => {
  const { token, userData } = useAppSelector(state => state.user);
  const [loading, setLoading] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setNewConfirmPassword] = useState('');
  const [errorObj, setErrorObj] = useState({
    passwordError: '',
    newPasswordError: '',
    confirmPasswordError: '',
  });
  const isConnected = useNetInfo();

  const [updatePassword] = useUpdatePasswordMutation();

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const oldPasswordInputRef = useRef<any>(null);
  const newPasswordInputRef = useRef<any>(null);
  const confirmNewPasswordRef = useRef<any>(null);

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmNewPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => setPasswordVisible(prev => !prev)
  const toggleNewPasswordVisibility = () => setNewPasswordVisible(prev => !prev);
  const toggleConfirmPasswordVisibility = () => setConfirmNewPasswordVisible(prev => !prev);

  const validation = () => {
    let isValidate = true;
    if (!isConnected) {
      Toast('No internet connection');
      isValidate = false;
    }
    if (!oldPassword) {
      isValidate = false;
      errorObj.passwordError = 'Please enter Password';
    } else {
      errorObj.passwordError = '';
    }
    if (!confirmNewPassword) {
      isValidate = false;
      errorObj.confirmPasswordError = 'Please enter Confirm Password';
    } else {
      errorObj.confirmPasswordError = '';
    }
    if (!newPassword) {
      isValidate = false;
      errorObj.newPasswordError = 'Please enter New Password';
    } else {
      errorObj.newPasswordError = '';
    }
    if (newPassword !== confirmNewPassword) {
      isValidate = false;
      errorObj.confirmPasswordError = 'Password not match';
    } else {
      errorObj.confirmPasswordError = '';
    }
    setErrorObj({ ...errorObj });
    if (isValidate) {
      onCompleteCall();
    }
  };

  const onCompleteCall = async () => {
    setLoading(true);
    try {
      if(userData?.email){
          const res = await updatePassword({
            oldPassword,
            newPassword,
          }).unwrap();
          Toast(res?.message);
        }
    } catch (error: any) {
      Toast(error?.data?.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <Loader loading={loading} />
      {!Colors.isDark ? (
        <StatusBar
          backgroundColor={Colors.backgroundColor}
          barStyle={'dark-content'}
        />
      ) : (
        <StatusBar backgroundColor={Colors.white} barStyle={'light-content'} />
      )}
      {Platform.OS === 'ios' && (
        <BackButton
          onPress={async () => {
            await logButtonTap('Change Password Backbutton');
            navigation.goBack();
          }}
        />
      )}
      {/* <View style={{ height: 10 }} /> */}
      <Image
        source={require('@/assets/images/password.png')}
        style={styles.image}
      />
      {/* <View style={{ height: 10 }} /> */}
      <Text style={styles.textstyle}>{`Change Password`}</Text>
      <View style={{ height: 30 }} />
      <View style={{width: '90%', alignSelf: 'center'}}>
        <AnimatedInput
          ref={oldPasswordInputRef}
          label="Old Password"
          placeholder="Enter your old password"
          value={oldPassword}
          onChangeText={setOldPassword}
          secureTextEntry={!passwordVisible}
          error={errorObj.passwordError}
          index={3}
          leftIcon={
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={Colors.text}
              style={loginStyles.inputIcon}
            />
          }
          rightIcon={
            <MaterialCommunityIcons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.text}
            />
          }
          onRightIconPress={togglePasswordVisibility}
          returnKeyType="next"
          onSubmitEditing={() => newPasswordInputRef.current?.focus()}
          labelBackgroundColor={'transparent'}
          isLabelVisible={false}
          inputFieldColor={'transparent'}
          inputColor={Colors.textColor}
          // showPasswordStrength={true}
        />
        
        <AnimatedInput
          ref={newPasswordInputRef}
          label="New Password"
          placeholder="Enter your new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!newPasswordVisible}
          error={errorObj.confirmPasswordError}
          index={4}
          leftIcon={
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={Colors.textColor}
              style={loginStyles.inputIcon}
            />
          }
          rightIcon={
            <MaterialCommunityIcons
              name={newPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textColor}
            />
          }
          onRightIconPress={toggleNewPasswordVisibility}
          returnKeyType="next"
          onSubmitEditing={() => confirmNewPasswordRef.current?.focus()}
          labelBackgroundColor={'transparent'}
          isLabelVisible={false}
          inputFieldColor={'transparent'}
          inputColor={Colors.textColor}
        />
        
        <AnimatedInput
          ref={confirmNewPasswordRef}
          label="Confirm New Password"
          placeholder="Confirm your new password"
          value={confirmNewPassword}
          onChangeText={setNewConfirmPassword}
          secureTextEntry={!confirmPasswordVisible}
          error={errorObj.confirmPasswordError}
          index={4}
          leftIcon={
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={Colors.textColor}
              style={loginStyles.inputIcon}
            />
          }
          rightIcon={
            <MaterialCommunityIcons
              name={confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textColor}
            />
          }
          onRightIconPress={toggleConfirmPasswordVisibility}
          returnKeyType="done"
          onSubmitEditing={validation}
          labelBackgroundColor={'transparent'}
          isLabelVisible={false}
          inputFieldColor={'transparent'}
          inputColor={Colors.textColor}
        />
      </View>
      <View style={{ flex: 1 }} />
      <Button
        onPress={validation}
        text="Complete"
        variant="contained"
      />
      <View style={{ height: 30 }} />
    </KeyboardAvoidingView>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 20,
      backgroundColor: Colors.white,
    },
    textstyle: {
      color: Colors.textColor,
      fontSize: 30,
      fontFamily: FONT_FAMILIES.nunitoBold,
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      marginLeft: 20,
      marginRight: 20,
    },
    texttwostyle: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      textAlign: 'justify',
      letterSpacing: 0.7,
    },
    image: {
      width: '20%',
      height: '20%',
      alignSelf: 'center',
      resizeMode: 'contain',
    },
    textFieldLabelWrapper: {
      flexDirection: 'row',
      marginBottom: 10,
      marginHorizontal: 20,
    },
    icon: {
      height: 20,
      width: 20,
      tintColor: Colors.textColor,
    },
    labeltext: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoBold,
      letterSpacing: 0.7,
    },
    errText: {
      fontSize: 12,
      fontWeight: '400',
      color: Colors.red,
      alignSelf: 'flex-start',
      marginLeft: 20,
      marginTop: 5,
    },
  });
};

export default ChangePasswordScreen;
