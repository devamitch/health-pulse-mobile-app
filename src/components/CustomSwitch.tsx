import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Colors } from '../constants';

interface CustomSwitchProps {
  isOn: boolean;
  onToggle: () => void;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({ isOn, onToggle }) => {
  const [position] = useState(new Animated.Value(isOn ? 1 : 0));

  useEffect(() => {
    Animated.timing(position, {
      toValue: isOn ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isOn]);

  const toggleSwitch = () => {
    Animated.timing(position, {
      toValue: isOn ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      onToggle();
    });
  };

  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 25],
  });

  return (
    <TouchableOpacity onPress={toggleSwitch} style={styles.switchContainer}>
      <Animated.View
        style={[styles.track, isOn ? styles.trackOn : styles.trackOff]}
      />
      <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    width: 55,
    height: 30,
    justifyContent: 'center',
    padding: 2,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  track: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  trackOn: {
    backgroundColor: Colors.primaryColor,
  },
  trackOff: {
    backgroundColor: Colors.greyColor700,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
});

export default CustomSwitch;