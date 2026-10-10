import { ColorScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import { acceptDisclaimer } from '@/services/mmkv-redux/slices';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native-gesture-handler';
import BaseModal from './base-modal';
import ModalBtttons from './modal-buttons';

const MedicalDisclaimerModal = () => {
  const { Colors } = useAppTheme();
  const styles = createStyles(Colors);
  const dispatch = useAppDispatch();

  const { accepted, dontShowAgain: savedDontShowAgain } = useAppSelector(
    state => state?.user?.disclaimerSettings || {},
  );

  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!(accepted && savedDontShowAgain));
  }, [accepted, savedDontShowAgain]);

  const handleAccept = () => {
    dispatch(acceptDisclaimer({ dontShowAgain }));
    setIsVisible(false);
  };

  const handleClose = () => setIsVisible(false);

  const keyPoints = [
    'AI-generated content may not always be accurate',
    'Not a substitute for professional advice',
    'Avoid sharing sensitive personal information',
    'Use your best judgment when following suggestions',
  ];

  return (
    <BaseModal
      isVisible={isVisible}
      onClose={handleClose}
      title="AI Assistant Notice"
      showBackButton={false}
      buttons={<ModalBtttons onClose={handleClose} handleSave={handleAccept} />}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text style={styles.description}>
            This AI assistant provides computer-generated responses. While we
            aim for accuracy, please verify important information independently.
          </Text>

          <View style={styles.pointsContainer}>
            {keyPoints.map((point, index) => (
              <View key={index} style={styles.pointItem}>
                <View style={styles.bullet} />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>

          <View style={styles.setting}>
            <Text style={styles.settingText}>
              Don't show this message again
            </Text>
            <Switch
              value={dontShowAgain}
              onValueChange={setDontShowAgain}
              trackColor={{
                false: Colors.greyColor400,
                true: Colors.primaryColor,
              }}
              thumbColor={Colors.white}
            />
          </View>
        </View>
      </ScrollView>
    </BaseModal>
  );
};

const createStyles = (Colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
    },
    content: {
      paddingBottom: 10,
    },
    description: {
      fontFamily: 'Nunito-Regular',
      fontSize: 15,
      color: Colors.textColor,
      lineHeight: 22,
      marginBottom: 20,
    },
    pointsContainer: {
      marginBottom: 20,
    },
    pointItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: Colors.primaryColor,
      marginTop: 8,
      marginRight: 12,
    },
    pointText: {
      fontFamily: 'Nunito-Regular',
      fontSize: 14,
      color: Colors.textColor,
      flex: 1,
      lineHeight: 20,
    },
    setting: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: Colors.greyColor200,
    },
    settingText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 14,
      color: Colors.textPrimaryColor,
    },
  });

export default MedicalDisclaimerModal;
