import { AnimatedButton } from '@/components/base/AnimatedButton';
import { AuthHeader } from '@/components/auth/auth-components';
import AuthLayout from '@/components/auth/auth-layout';
import { useAuthAnimations } from '@/components/auth/auth-hooks';
import BaseModal from '@/components/modals/base-modal';
import InfoAlertModal from '@/components/modals/info-alert-modal';
import ModalBtttons from '@/components/modals/modal-buttons';
import { ColorScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import { useAppTheme } from '@/hooks/themeHook';
import useAuthentication from '@/hooks/use-authentication';
import { AuthScreens } from '@/navigation/main_route';
import { useAppSelector } from '@/services/mmkv-redux/hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

type DeleteAccountScreenProps = NativeStackScreenProps<
  AuthScreens,
  'DeleteAccountScreen'
>;

const DeleteAccountScreen: React.FC<DeleteAccountScreenProps> = ({
  navigation,
}) => {
  const { userData } = useAppSelector(state => state.user);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);

  const closeModal = () => setModalVisible(false);
  const closeInfoModal = () => setInfoModalVisible(false);

  const { Colors } = useAppTheme();
  const styles = createStyle(Colors);

  const {
    headerOpacity,
    headerTranslateY,
    formOpacity,
    formTranslateY,
    startAnimations,
  } = useAuthAnimations();

  const { ResendDeleteAccountOTP, DeleteAppleAccount } = useAuthentication();

  useEffect(() => {
    startAnimations();
  }, [startAnimations]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const deleteAccount = async () => {
    try {
      if (userData?.providerId === 'apple') {
        await DeleteAppleAccount();
        return;
      }
      await ResendDeleteAccountOTP();
      navigation.navigate('OTPVerifyScreen', {
        email: userData?.email ?? '',
        type: 'delete_account',
      });
    } catch (error) {
      setModalVisible(false);
      setInfoModalVisible(true);
      console.error(error);
    }
  };

  const ModalButton = (
    <ModalBtttons
      onClose={closeModal}
      handleSave={deleteAccount}
      buttonText="Delete Account"
    />
  );

  return (
    <AuthLayout
      header={
        <AuthHeader
          headerStyle={headerStyle}
          title="Delete Account"
          subtitle="Permanently remove your account and all data"
        />
      }
    >
      <Reanimated.View style={[styles.contentContainer, contentStyle]}>
        <View style={styles.iconContainer}>
          <Ionicons name="trash-sharp" size={100} color={Colors.error} />
        </View>

        <Text style={styles.title}>Delete Account</Text>

        <Text style={styles.description}>
          Are you sure you want to delete your account? This action cannot be
          undone and all your data will be permanently removed.
        </Text>

        <View style={styles.buttonContainer}>
          <AnimatedButton
            text="Delete Account"
            onPress={deleteAccount}
            backgroundColor="#1857C1"
            activeBackgroundColor={Colors.isDark ? '#053a70' : '#053a70'}
          />
        </View>
      </Reanimated.View>

      <BaseModal
        isVisible={isModalVisible}
        onClose={closeModal}
        title="Delete Account"
        buttons={ModalButton}
      >
        <Text style={styles.modalText}>
          Are you sure you want to delete your account? This action cannot be
          undone and all your data will be permanently removed.
        </Text>
      </BaseModal>

      <InfoAlertModal
        isVisible={isInfoModalVisible}
        onClose={closeInfoModal}
        description={
          "You'll need to log out and then log back in before deleting your account."
        }
        Colors={Colors}
      />
    </AuthLayout>
  );
};

const createStyle = (Colors: ColorScheme) =>
  StyleSheet.create({
    contentContainer: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
    },
    iconContainer: {
      marginBottom: 10,
    },
    title: {
      color: Colors.textPrimaryColor,
      fontSize: 24,
      fontFamily: FONT_FAMILIES.nunitoBold,
      textAlign: 'center',
    },
    description: {
      color: Colors.textSecondary,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      textAlign: 'center',
      lineHeight: 24,
    },
    buttonContainer: {
      width: '100%',
      marginTop: 20,
    },
    modalText: {
      color: Colors.textPrimaryColor,
      fontSize: 16,
      fontFamily: FONT_FAMILIES.nunitoRegular,
      textAlign: 'center',
      paddingHorizontal: 25,
      lineHeight: 24,
    },
  });

export default DeleteAccountScreen;
