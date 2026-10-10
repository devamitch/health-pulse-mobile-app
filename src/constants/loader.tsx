import BlurView from '@/components/base/BlurView';
import ModalSelector from '@/components/modals/modal-selector';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import LoaderKitView from 'react-native-loader-kit';
import Colors from './colors';

const isIos = Platform.OS === 'ios';

interface LoaderProps {
  loading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ loading }) => {
  return (
    <ModalSelector
      isVisible={loading}
      onClose={() => {
        console.log('close modal');
      }}
    >
      <BlurView blurType="light" blurAmount={5} style={styles.modalBackground}>
        <LoaderKitView
          style={{ width: 50, height: 50 }}
          name={'BallPulse'}
          animationSpeedMultiplier={1.0} // speed up/slow down animation, default: 1.0, larger is faster
          color={Colors.primaryColor}
          // Optional: color can be: 'red', 'green',... or '#ddd', '#ffffff',...
        />
      </BlurView>
    </ModalSelector>
  );
};
export default Loader;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIndicatorWrapperIos: {
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 90,
    paddingRight: 2,
    paddingBottom: 2,
  },
  activityIndicatorWrapper: {
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    padding: 5,
    borderRadius: 90,
  },
});
