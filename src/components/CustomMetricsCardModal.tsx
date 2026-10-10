import React from 'react';
import { logButtonTap } from '../services/analyticsService';
import CustomCheckBox from './CustomCheckBox';
import BaseModal from './modals/base-modal';
import ModalBtttons from './modals/modal-buttons';

interface CustomMetricsCardModalProps {
  isModalVisible: boolean;
  closeModal: () => void;
  handleOk: (value: string) => void;
  selectedChecked: string;
}

const CustomMetricsCardModal: React.FC<CustomMetricsCardModalProps> = ({
  isModalVisible,
  closeModal,
  handleOk,
  selectedChecked,
}) => {
  const [checked, setChecked] = React.useState(selectedChecked);

  const modalButton = 
    <ModalBtttons 
      onClose={async () => {
        await logButtonTap('History Filter Cancel');
        closeModal();
      }}

      handleSave={async () => {
        await logButtonTap('History Filter Save');
        handleOk(checked);
      }}
    />

  return(
    <BaseModal 
      isVisible={isModalVisible} 
      onClose={closeModal}
      showHeader={false}
      buttons={modalButton}
    >
      <CustomCheckBox 
        label='Metrics' 
        checked={checked === '0'}
        onChange={async () => {
          await logButtonTap('History Filter Metrics Check');
          setChecked('0');
        }}
      />
      <CustomCheckBox 
        label='Summary' 
        checked={checked === '1'}
        onChange={async () => {
          await logButtonTap('History Filter Card Check');
          setChecked('1');
        }}
      />
      <CustomCheckBox 
        label='All' 
        checked={checked === '2'}
        onChange={async () => {
          await logButtonTap('History Filter Reset Check');
          setChecked('2');
        }}
        isLastItem={true}
      />
    </BaseModal>
  );
};

export default CustomMetricsCardModal;
