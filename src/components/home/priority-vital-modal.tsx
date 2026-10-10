import { ColorScheme, ElevationScheme } from '@/constants/theme';
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import TextBox from '../TextBox';
import { useAppTheme } from '@/hooks/themeHook';
import BaseModal from '../modals/base-modal';
import Button from '../ui/buttons/button';

type PriorityVitalsModalProps = {
  visible: boolean;
  onClose: () => void;
  priorityVital: {
    title: string;
    metrics: { metric: string; unit?: string }[];
  } | null;
  metrics: Record<string, string>;
  setMetrics: (metrics: Record<string, string>) => void;
  saveVitals: () => void;
};

const PriorityVitalsModal: React.FC<PriorityVitalsModalProps> = ({
  visible,
  onClose,
  priorityVital,
  metrics,
  setMetrics,
  saveVitals,
}) => {
  const { Colors, DEffect } = useAppTheme();
  const styles = createStyle(Colors, DEffect);

  const title = priorityVital?.title === 'BP'
      ? 'Blood Pressure'
      : priorityVital?.title

  return(
    <BaseModal 
      isVisible={visible} 
      onClose={onClose} 
      title={title ?? 'Vital'}
      buttons={
        <Button
          onPress={saveVitals}
          text="Save"
          variant="contained"
        />
      }
    >
      {priorityVital?.metrics.map(item => (
        <View key={item.metric}>
          <View style={styles.modalTextViewLabelWrapper}>
            <Text style={styles.labeltext}>
              {`${item.metric}${item.unit ? ` ( ${item.unit} )` : ''}`}
            </Text>
          </View>
          <View style={{ height: 10 }} />
          <TextBox
            value={metrics[item.metric] ?? ''}
            onChangeText={text => {
              const met = { ...metrics };
              met[item.metric] = text;
              setMetrics(met);
            }}
            keyboardType="number-pad"
            style={{width: '100%'}}
          />
          <View style={{ height: 20 }} />
        </View>
      ))}
    </BaseModal>
  );
};

const createStyle = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '90%',
      borderRadius: 20,
      backgroundColor: Colors.white,
      padding: 20,
      ...DEffect,
    },
    modalTextViewTitleWrapper: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 10,
    },
    modalTextViewLabelWrapper: {
      flexDirection: 'row',
      marginLeft: 10,
      marginRight: 10,
      marginBottom: 5,
    },
    labeltext: {
      color: Colors.textColor,
      fontSize: 16,
      fontFamily: 'Nunito-Bold',
      letterSpacing: 0.7,
    },
  });

export default PriorityVitalsModal;
