import { ColorScheme, ElevationScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { PriorityVital } from '@/services/mmkv-redux/slices';
import { StyleSheet, Text, View } from 'react-native';
import BaseModal from './modals/base-modal';
import Button from './ui/buttons/button';

interface VitalModalProps {
  vital: PriorityVital;
  visible: boolean;
  values: string[];
  onRequestClose: () => void;
}

const VitalModal: React.FC<VitalModalProps> = ({
  vital,
  visible,
  values,
  onRequestClose,
}) => {
  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  return(
    <BaseModal 
      isVisible={visible} 
      onClose={onRequestClose} 
      title={vital.title}
      buttons={
        <Button
          text="Close"
          variant="contained"
          onPress={onRequestClose}
         />
      }
    >
      {vital.metrics.map((item, index) => (
        <View style={styles.modalTextViewLabelWrapper}>
          <Text
            style={[
              styles.labeltext,
              { textAlign: 'center', width: '50%' },
            ]}
          >{`${item.metric}`}</Text>
          <Text style={styles.labeltext}>:</Text>
          <Text
            style={[
              styles.labeltext,
              { textAlign: 'center', width: '50%' },
            ]}
          >{`${values[index]} ${item?.unit}`}</Text>
        </View>
      ))}
    </BaseModal>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) => {
  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalButton: {
      borderRadius: 8,
      width: '100%',
    },
    container: {
      borderRadius: 20,
      backgroundColor: Colors.white,
      flexDirection: 'column',
      padding: 15,
      width: '80%',
      ...DEffect,
    },
    modalTextViewTitleWrapper: {
      flexDirection: 'row',
      marginLeft: 20,
      marginRight: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    labeltext: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      letterSpacing: 0.7,
    },
    modalTextViewLabelWrapper: {
      marginLeft: 20,
      marginRight: 20,
      flexDirection: 'row',
    },
  });
};

export default VitalModal;
