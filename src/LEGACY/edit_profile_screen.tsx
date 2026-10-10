import LinearGradient from '@/components/base/LinearGradient';
import { useRef, useState } from 'react';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Loader from '../constants/loader';
import { ColorScheme, ElevationScheme } from '../constants/theme';
import { useAppTheme } from '../hooks/themeHook';
import useNetInfo from '../hooks/use_net_info';
import { useAppDispatch, useAppSelector } from '../services/mmkv-redux/hooks';
import { Toast } from '../utils/toast';
import Button from '@/components/ui/buttons/button';
import { AnimatedInput } from '@/components/base/AnimatedInput';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import { loginStyles } from '@/components/auth/auth-styles';
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from '@/services/mmkv-redux/apis';
import { updateUser, UserData } from '@/services/mmkv-redux/slices';
import { updateCachedImage } from '@/services/image-cache';
import { SKYP_COLORS } from '@/screens/auth/styles';

const EditProfileScreen = (props: any) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState<boolean>(false);
  const { userData } = useAppSelector(state => state.user);

  const { refetch } = useGetUserProfileQuery();

  const [firstName, setFirstName] = useState(userData?.displayName ?? '');
  const [lastName, setLastName] = useState(userData?.lastName ?? '');
  const [telephone, setTelephone] = useState(userData?.phoneNumber ?? '');
  const [image, setImage] = useState<{
    uri: string | undefined;
    type: string | undefined;
    name: string | undefined;
    base64: string | undefined;
  } | null>(null);

  const firstNameInputRef = useRef<any>(null);
  const lasttNameInputRef = useRef<any>(null);
  const telephoneInputRef = useRef<any>(null);

  const [errorObj, setErrorObj] = useState({
    emailError: '',
    firstNameError: '',
    lastNameError: '',
    phoneNumber: '',
  });
  const isConnected = useNetInfo();
  const dispatch = useAppDispatch();

  const [ updateUserProfile ] = useUpdateUserProfileMutation();

  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const validation = () => {
    let isValidate = true;

    if (!isConnected) {
      Toast('No internet connection');
      isValidate = false;
    }
    if (!firstName) {
      isValidate = false;
      errorObj.firstNameError = 'Please enter First Name';
    } else {
      errorObj.firstNameError = '';
    }
    if (!lastName) {
      isValidate = false;
      errorObj.lastNameError = 'Please enter First Name';
    } else {
      errorObj.lastNameError = '';
    }
    if (!telephone) {
      isValidate = false;
      errorObj.phoneNumber = 'Please enter First Name';
    } else {
      errorObj.phoneNumber = '';
    }
    setErrorObj({ ...errorObj });
    if (isValidate) {
      onProfileUpdateCall();
    }
  };

  const onProfileUpdateCall = async () => {
    try {
      setLoading(true);
      const updateProfileParams = new FormData();

      if(firstName !== userData?.displayName) {
        updateProfileParams.append('firstName', firstName);
      }
      if(lastName !== userData?.lastName) {
        updateProfileParams.append('lastName', lastName);
      }
      if(telephone !== userData?.phoneNumber) {
        updateProfileParams.append('mobileNumber', telephone);
      }
      
      if(image?.uri) {
        updateProfileParams.append('profilePhoto', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || 'profile.jpg'
        } as any);
      }

      console.log('Updating profile with:', {
        firstName,
        lastName,
        telephone,
        hasImage: !!image?.uri
      });

      const updateProfileResponse = await updateUserProfile(updateProfileParams).unwrap();
      
      const data = await refetch().unwrap();

      if(data){
        const userData: Partial<UserData> = {
          displayName: data.firstName,
          phoneNumber: data.mobileNumber,
          photoURL: data.profilePhoto ? await updateCachedImage(data.profilePhoto, 'profilePhoto') : null,
        }

        dispatch(updateUser(userData));
      }
      
      Toast(updateProfileResponse.message || 'Profile updated successfully');
      
      setImage(null);
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      const errorMessage = error?.data?.message 
        || error?.message 
        || 'Failed to update profile';
      
      Toast(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openImagePicker = async () => {
    await launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 200,
        maxWidth: 200,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else {
          const selectedImages = response?.assets?.map(asset => ({
            uri: asset.uri,
            type: asset.type || '',
            name: asset.fileName || asset?.uri?.split('/').pop() || '',
            base64: asset.base64,
          }));
          if (selectedImages && selectedImages[0]) {
            setImage(selectedImages[0]);
          }
        }
      },
    );
  };

  return (
    <View style={styles.mainContainer}>
      <Loader loading={loading} />
      {!Colors.isDark ? (
        <StatusBar backgroundColor={Colors.white} barStyle={'dark-content'} />
      ) : (
        <StatusBar backgroundColor={Colors.white} barStyle={'light-content'} />
      )}

      <LinearGradient
        colors={[Colors.gradientColor1, Colors.gradientColor2]}
        style={[styles.linearGradient, { height: 70 + insets.top }]}
      >
        <SafeAreaView />
        <View style={styles.backButtonWrapper}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
          >
            {Platform.OS === 'ios' ? (
              <Ionicons name="chevron-back" size={26} color={Colors.white} />
            ) : (
              <Image
                source={require('./../assets/icons/back.png')}
                style={{ height: 30, width: 30 }}
              />
            )}
          </TouchableOpacity>
          <Text style={styles.secondstyle}>Edit Profile</Text>
        </View>
      </LinearGradient>
      <ScrollView style={{width: '90%', alignSelf: 'center'}}>
        <View style={{ height: 20 }} />
        <View>
          {image || userData?.photoURL ? (
            <Image
              source={
                image?.uri
                  ? { uri: image.uri }
                  : userData?.photoURL
                  ? { uri: userData.photoURL }
                  : undefined
              }
              style={styles.image}
            />
          ) : (
            <MaterialIcons
              name="person"
              size={90}
              color="#ccc"
              style={{ alignSelf: 'center' }}
            />
          )}
          <TouchableOpacity
            onPress={openImagePicker}
            style={styles.cameraButton}
          >
            <Image
              source={require('./../assets/icons/camera.png')}
              style={styles.cameraIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
        <AnimatedInput
          label="First Name"
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={setFirstName}
          error={errorObj.firstNameError}
          index={0}
          leftIcon={
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              color={SKYP_COLORS.textSecondary}
              style={loginStyles.inputIcon}
            />
          }
          returnKeyType="next"
          onSubmitEditing={() => firstNameInputRef.current?.focus()}
          labelBackgroundColor={'transparent'}
          isLabelVisible={false}
          inputFieldColor={'transparent'}
          inputColor={Colors.textColor}
        />
        <AnimatedInput
          label="Last Name"
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={setLastName}
          error={errorObj.lastNameError}
          index={0}
          leftIcon={
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              color={SKYP_COLORS.textSecondary}
              style={loginStyles.inputIcon}
            />
          }
          returnKeyType="next"
          onSubmitEditing={() => lasttNameInputRef.current?.focus()}
          labelBackgroundColor={'transparent'}
          isLabelVisible={false}
          inputFieldColor={'transparent'}
          inputColor={Colors.textColor}
        />
        <AnimatedInput
          label="Phone Number"
          placeholder="Enter your phone number"
          value={telephone}
          onChangeText={setTelephone}
          error={errorObj.phoneNumber}
          index={0}
          leftIcon={
            <Octicons
              name="device-mobile"
              size={20}
              color={SKYP_COLORS.textSecondary}
              style={loginStyles.inputIcon}
            />
          }
          returnKeyType="done"
          onSubmitEditing={() => telephoneInputRef.current?.focus()}
          labelBackgroundColor={'transparent'}
          isLabelVisible={false}
          inputFieldColor={'transparent'}
          inputColor={Colors.textColor}
        />
        <Button
          onPress={validation}
          text="Save Profile"
          variant="contained"
        />
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors.white,
    },
    linearGradient: {
      height: 80,
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
    },
    backButtonWrapper: {
      flexDirection: 'row',
      marginTop: 20,
      marginHorizontal: 20,
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 145,
      alignSelf: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.primaryColor,
      height: 30,
      width: 30,
      borderRadius: 100,
    },
    cameraIcon: {
      height: 18,
      width: 18,
      left: 6,
      tintColor: 'white',
    },
    image: {
      width: 90,
      height: 90,
      borderRadius: 100,
      resizeMode: 'cover',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    dividerStyle: {
      height: 1.5,
      width: '90%',
      alignSelf: 'center',
      marginVertical: 10,
      backgroundColor: Colors.greyColor,
    },
    iconStyle: {
      height: 20,
      width: 20,
    },
    labelWrapper: {
      flexDirection: 'row',
      marginLeft: 20,
      marginRight: 20,
    },
    labeltext: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      letterSpacing: 0.7,
    },
    contentContainerTextStyle: {
      color: Colors.textColor,
      fontSize: 17,
      fontFamily: 'Nunito-Medium',
      alignSelf: 'center',
      letterSpacing: 0.7,
      flex: 1,
    },
    container: {
      borderRadius: 20,
      backgroundColor: Colors.white,
      flexDirection: 'column',
      alignItems: 'center',
      padding: 15,
      elevation: 5,
    },
    imageStyle: {
      height: 50,
      width: 50,
      resizeMode: 'contain',
    },
    textstyle: {
      color: Colors.textColor,
      fontSize: 16,
      marginHorizontal: 20,
      fontFamily: 'Nunito-Bold',
      textAlign: 'justify',
      letterSpacing: 0.8,
    },
    secondstyle: {
      color: Colors.white,
      fontSize: 20,
      left: 10,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
      letterSpacing: 0.7,
    },
    threestyle: {
      color: Colors.textColor,
      fontSize: 20,
      marginHorizontal: 20,
      fontFamily: 'Nunito-Bold',
      alignSelf: 'flex-start',
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

export default EditProfileScreen;
