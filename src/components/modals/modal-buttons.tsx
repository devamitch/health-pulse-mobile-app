import { ColorScheme } from '@/constants/theme';
import {  StyleSheet } from 'react-native';
import Button from '../ui/buttons/button';

const ModalBtttons = ({
  onClose,
  handleSave,
  buttonText = 'Save'
}: {
  onClose: () => void;
  handleSave: () => void;
  buttonText?: string;
}) => {

  return (
    <>
      <Button
        text="Cancel"
        variant="contained"
        onPress={onClose}
      />
      <Button
        text={buttonText}
        variant="outline"
        onPress={handleSave}
       />
    </>
  );
};

export default ModalBtttons;
