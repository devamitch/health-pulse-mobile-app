import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { ColorScheme, ElevationScheme } from "@/constants/theme";
import { Metrics } from "@/services/mmkv-redux/slices";
import Feather from 'react-native-vector-icons/Feather';
import { useAppSelector } from "@/services/mmkv-redux/hooks";
import { haptic } from "@/utils";
import BaseModal from '../base-modal';
import ModalButtons from '../modal-buttons';

interface MetricsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (metrics: Metrics[]) => void;
  metrics: Metrics[];
  title: string;
  Colors: ColorScheme;
  DEffect: ElevationScheme;
  onMetricsChange: (metrics: Metrics[]) => void;
}

const MetricsModal: React.FC<MetricsModalProps> = ({
  isVisible,
  onClose,
  onSave,
  metrics,
  title,
  Colors,
  DEffect,
  onMetricsChange,
}) => {
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const { haptic_level } = useAppSelector(state => state.message)

  const handleChange = (text: string, index: number) => {
    const updated = [...metrics];
    if(updated[index])
      updated[index].value = text;
    onMetricsChange(updated);
  };

  const styles= createMetricsModalStyle(Colors, DEffect);

  const buttons = <ModalButtons onClose={onClose} handleSave={() => onSave(metrics)} />

  return(
    <BaseModal 
        isVisible={isVisible} 
        onClose={onClose} 
        title={title}
        buttons={buttons}
    >
        <FlatList
          data={metrics}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.metricRow}>
              <Text style={[styles.metricText, {width: '35%', textAlign: 'center'}]}>{item.metric}</Text>
              <Text style={[styles.metricText, {width: '20%', textAlign: 'center'}]}>:</Text>
              {editIndex === index 
              ? <TextInput
                  value={item.value}
                  onChangeText={(text) => handleChange(text, index)}
                  keyboardType="numeric"
                  style={styles.input}
                />
               : <Text style={[styles.metricText, {width: '35%', textAlign: 'center'}]}>{item.value}</Text>
              }

              <TouchableOpacity
                onPress={() => {
                  haptic(haptic_level);
                  setEditIndex(editIndex === index ? null : index);
                }}
              >
                <Feather
                  name={editIndex === index ? 'check' : 'edit'}
                  size={20}
                  color={Colors.primaryColor}
                />
              </TouchableOpacity>
            </View>
          )}
        />
    </BaseModal>
  );
};

const createMetricsModalStyle = (Colors: ColorScheme, DEffect: ElevationScheme) =>
  StyleSheet.create({
    modal: {
      margin: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '90%',
      borderRadius: 20,
      backgroundColor: Colors.white,
      margin: 20,
      flexDirection: 'column',
      padding: 20,
      ...DEffect,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 20,
      textAlign: 'center',
      color: Colors.textColor,
      fontFamily: 'Nunito-Bold',
    },
    metricRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 8,
    },
    metricText: {
      fontSize: 16,
      color: Colors.textColor,
      flex: 1,
      fontFamily: 'Nunito-Bold',
    },
    input: {
      flex: 1,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      color: '#000',
      fontFamily: 'Nunito-Bold',
      width: '35%'
    },
    buttonSpacing: {
      height: 15,
    },
});

export default MetricsModal;