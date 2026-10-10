import { ColorScheme } from '@/constants/theme';
import { useAppTheme } from '@/hooks/themeHook';
import { useAppDispatch, useAppSelector } from '@/services/mmkv-redux/hooks';
import {
  addPreference,
  clearPreference,
  removePreference,
} from '@/services/mmkv-redux/slices';
import { haptic } from '@/utils';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BaseModal from './modals/base-modal';
import ModalButtons from './modals/modal-buttons';
import { Toast } from '@/utils/toast';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Button from './ui/buttons/button';

interface PreferenceListModalProps {
  visible: boolean;
  onClose: () => void;
  preferences: string[];
  onDeletePress: (item: string) => void;
  Colors: ColorScheme;
  onAdd: () => void;
  onClear: () => void;
}

interface AddNewPreferenceModalProps {
  visible: boolean;
  onClose: () => void;
  Colors: ColorScheme;
  onSave: (preference: string) => void;
}

interface PreferenceModalProps {
  visible: boolean;
  onClose: () => void;
}

const PreferenceListModal: React.FC<PreferenceListModalProps> = ({
  visible,
  onClose,
  preferences,
  onDeletePress,
  Colors,
  onAdd,
  onClear,
}) => {
  const styles = createPreferenceModalListStyle(Colors);

  const buttons = (
    <View style={styles.modalButtonWrapper}>
      <Button
        text="Add"
        variant="outline"
        onPress={onAdd}
      />
      <Button
        text="Clear"
        variant="contained"
        onPress={onClear}
      />
      <Button
        text="Close"
        variant="contained"
        onPress={onClose}
      />
    </View>
  );

  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.preferenceItem}>
      <Text style={styles.preferenceText}>{item}</Text>
      <TouchableOpacity
        onPress={() => onDeletePress(item)}
        style={styles.removePreferenceButton}
      >
        <FontAwesome name="trash" color={'#C22708'} size={20} />
      </TouchableOpacity>
    </View>
  );

  return (
    <BaseModal
      isVisible={visible}
      onClose={onClose}
      title={'Preference'}
      buttons={buttons}
    >
      <FlatList
        data={preferences}
        keyExtractor={(item, index) => `${item}_${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </BaseModal>
  );
};

const AddNewPreferenceModal: React.FC<AddNewPreferenceModalProps> = ({
  visible,
  onClose,
  Colors,
  onSave,
}) => {
  const [preference, setPreference] = useState('');
  const styles = createAddPreferenceModalStyle(Colors);

  return (
    <BaseModal
      isVisible={visible}
      onClose={onClose}
      title={'Add Preference'}
      buttons={
        <ModalButtons onClose={onClose} handleSave={() => onSave(preference)} />
      }
    >
      <TextInput
        multiline
        numberOfLines={5}
        style={styles.input}
        value={preference}
        onChangeText={setPreference}
        placeholder="Enter your preference"
        placeholderTextColor={'#bbb'}
      />
    </BaseModal>
  );
};

const PreferencesModal: React.FC<PreferenceModalProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { Colors } = useAppTheme();
  const { preferences, haptic_level } = useAppSelector(state => state.message);

  const [isAddPreferenceModalVisible, setAddPreferenceModalVisible] =
    useState(false);

  const handleRemovePreference = (item: string) => {
    haptic(haptic_level);
    dispatch(removePreference(item));
  };

  const handleAddPreference = () => {
    haptic(haptic_level);
    setAddPreferenceModalVisible(true);
  };

  const handleClearPreference = () => {
    haptic(haptic_level);
    dispatch(clearPreference());
  };

  const handleSaveNewPreference = (item: string) => {
    haptic(haptic_level);
    if (item.trim()) {
      dispatch(addPreference({ preference: item }));
      setAddPreferenceModalVisible(false);
    } else {
      Toast('No preference found.');
    }
  };

  return (
    <>
      <PreferenceListModal
        visible={visible && !isAddPreferenceModalVisible}
        onClose={onClose}
        preferences={preferences}
        onDeletePress={handleRemovePreference}
        Colors={Colors}
        onAdd={handleAddPreference}
        onClear={handleClearPreference}
      />
      <AddNewPreferenceModal
        visible={isAddPreferenceModalVisible}
        onClose={() => setAddPreferenceModalVisible(false)}
        Colors={Colors}
        onSave={handleSaveNewPreference}
      />
    </>
  );
};

const createAddPreferenceModalStyle = (Colors: ColorScheme) =>
  StyleSheet.create({
    input: {
      borderColor: '#bbb',
      borderWidth: 1,
      padding: 12,
      borderRadius: 10,
      width: '100%',
      minHeight: 120,
      textAlignVertical: 'top',
      fontSize: 16,
      fontFamily: 'Nunito-Regular',
      color: Colors.textColor,
    },
  });

const createPreferenceModalListStyle = (Colors: ColorScheme) =>
  StyleSheet.create({
    preferenceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 5,
    },
    preferenceText: {
      color: Colors.textColor,
      fontSize: 16,
      flex: 1,
      marginRight: 10,
    },
    removePreferenceButton: {
      padding: 8,
      borderColor: '#C22708',
      borderRadius: 10,
      borderWidth: 1,
    },
    modalButtonWrapper: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
  
  });

export default PreferencesModal;
