import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ColorScheme } from "@/constants/theme";
import BaseModal from './base-modal';

interface InfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  description: string;
  Colors: ColorScheme
}

const InfoModal: React.FC<InfoModalProps> = ({
  isVisible,
  onClose,
  description,
  Colors
}) => {
  const styles = createInfoStyles();

  const closeButton = 
        <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: Colors.primaryColor }]}>
            <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>

  return(
    <BaseModal 
        isVisible={isVisible} 
        onClose={onClose} 
        title={'Message'}
        buttons={[closeButton]}
    >
        <Text style={styles.modalDescription}>{description}</Text>
    </BaseModal>
  )
};

const createInfoStyles = () => StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTextContainer: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
  },
  modalDescription: {
    fontSize: 18,
    fontFamily: 'Nunito-Medium',
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#fe0a83',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    width: '100%',
    alignSelf: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    alignSelf: 'center',
  },
});

export default InfoModal;