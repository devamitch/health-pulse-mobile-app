import React from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { ColorScheme } from "@/constants/theme";
import BaseModal from './base-modal';

interface PlanMessageModalProps {
  isVisible: boolean;
  onClose: () => void;
  description: string;
  Colors: ColorScheme;
  onShare: () => void;
}

const PlanMessageModal: React.FC<PlanMessageModalProps> = ({
  isVisible,
  onClose,
  description,
  Colors,
  onShare,
}) => {
  const styles = createPlanMessageStyles();

  const buttons = 
    <View style={styles.buttonContainer}> 
        <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: Colors.primaryColor }]}>
            <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity> 
        <TouchableOpacity onPress={onShare} style={[styles.closeButton, { backgroundColor: Colors.secondaryColor }]}>
            <Text style={styles.closeButtonText}>Share</Text>
        </TouchableOpacity>
    </View>

  return(
    <BaseModal 
        isVisible={isVisible} 
        onClose={onClose} 
        title={'Message'}
        buttons={buttons}
    >
        <Text style={styles.modalDescription}>{description}</Text>
    </BaseModal>
  )
};

const createPlanMessageStyles = () => StyleSheet.create({
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
    width: '40%',
    alignSelf: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    alignSelf: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
});

export default PlanMessageModal;