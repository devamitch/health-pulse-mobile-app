import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { ColorScheme } from "@/constants/theme";
import { Metrics } from "@/services/mmkv-redux/slices";
import { useAppSelector } from "@/services/mmkv-redux/hooks";
import { haptic } from "@/utils";
import BaseModal from '../base-modal';
import ModalButtons from '../modal-buttons';

interface AddCustomMetricsProps{
  isVisible: boolean;
  onClose: () => void;
  Colors: ColorScheme;
  metrics: Metrics[];
  onMetricChange: (metrics: Metrics[]) => void;
  onSave: (metrics: Metrics[]) => void;
}

const AddCustomMetricsModal: React.FC<AddCustomMetricsProps> = ({
  isVisible,
  onClose,
  metrics,
  onMetricChange,
  onSave,
}) => {
  const styles = createAddMetricsStyle();
  const { haptic_level } = useAppSelector(state => state.message);
  const [errors, setErrors] = useState<{ metric: boolean; value: boolean }[]>([]);

  const validateInputs = () => {
    const newErrors = metrics.map(m => ({
      metric: !m.metric.trim(),
      value: !m.value.trim(),
    }));

    setErrors(newErrors);

    return newErrors.every(err => !err.metric && !err.value);
  };

  const handleInputChange = (index: number, field: keyof Metrics, value: string) => {
    const updatedMetrics = [...metrics];
    if (updatedMetrics[index]) {
      updatedMetrics[index] = { ...updatedMetrics[index], [field]: value };
    }
    onMetricChange(updatedMetrics);

    const updatedErrors = [...errors];
    if (updatedErrors[index]) {
      updatedErrors[index][field as 'metric' | 'value'] = !value.trim();
      setErrors(updatedErrors);
    }
  };

  const handleAddMetric = () => {
    const updatedMetrics = [...metrics, { metric: '', value: '', unit: '' }];
    onMetricChange(updatedMetrics);
    setErrors([...errors, { metric: false, value: false }]);
  };

  const FlatListRender = ({ item, index }: { item: Metrics; index: number }) => {
    const hasMetricError = errors[index]?.metric;
    const hasValueError = errors[index]?.value;

    return (
      <View key={index} style={{ 
        flexDirection: 'row', 
        marginVertical: 5, 
        justifyContent: 'space-around',
        width: '100%' 
      }}>
        <View style={{ flex: 1, width: '30%' }}>
          <TextInput
            value={item.metric}
            placeholder="Metric"
            style={[styles.input, hasMetricError && { borderColor: 'red', borderWidth: 1 }]}
            onChangeText={text => handleInputChange(index, 'metric', text)}
          />
          {hasMetricError && <Text style={{ color: 'red', fontSize: 10 }}>Required</Text>}
        </View>

        <Text style={{ marginHorizontal: 5, alignSelf: 'center' }}>:</Text>

        <View style={{ flex: 1, width: '30%' }}>
          <TextInput
            value={item.value}
            placeholder="Value"
            style={[styles.input, hasValueError && { borderColor: 'red', borderWidth: 1 }]}
            onChangeText={text => handleInputChange(index, 'value', text)}
            keyboardType="numeric"
          />
          {hasValueError && <Text style={{ color: 'red', fontSize: 10 }}>Required</Text>}
        </View>

        <View style={{ flex: 1, width: '30%' }}>
          <TextInput
            value={item.unit}
            placeholder="Unit"
            style={styles.input}
            onChangeText={text => handleInputChange(index, 'unit', text)}
          />
        </View>
      </View>
    );
  };

  const handleSave = () => {
        haptic(haptic_level);
        if (validateInputs()) {
            onSave(metrics);
        }
    }

  const buttons = <ModalButtons onClose={onClose} handleSave={handleSave} />

  return(
    <BaseModal 
        isVisible={isVisible} 
        onClose={onClose} 
        title={'Metrics'}
        rightButtonIcon='add'
        onRightPress={handleAddMetric}
        buttons={buttons}
    >
          <FlatList
            data={metrics}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => FlatListRender({ item, index })}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
    </BaseModal>
  )
};

const createAddMetricsStyle = () => StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalDescription: {
    fontSize: 18,
    fontFamily: 'Nunito-Medium',
    color: '#333',
    textAlign: 'center',
    fontWeight: 'bold',
    width: '100%'
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color: '#000',
    fontFamily: 'Nunito-Bold',
    marginHorizontal: 8,
    width: '100%',
  },
})

export default AddCustomMetricsModal;