import React, { useEffect, useState, useRef } from 'react';
import { Animated, Text, TextStyle, View, Dimensions } from 'react-native';

interface SlidingTextProps {
  textList: string[];
  style?: TextStyle;
  sharedIndex: number; // Shared index for syncing
  setSharedIndex: (index: number) => void; // Function to update index
}

const SlidingText: React.FC<SlidingTextProps> = ({
  textList,
  style = { color: 'white', fontFamily: 'Nunito-Bold', fontSize: 17 },
  sharedIndex,
  setSharedIndex,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const translateX = useRef(new Animated.Value(-screenWidth)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const animateText = () => {
    translateX.setValue(-screenWidth);
    opacity.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1500),

      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSharedIndex((sharedIndex + 1) % textList.length);
    });
  };

  useEffect(() => {
    animateText();
  }, [sharedIndex]); // Sync based on shared index

  return (
    <View style={{ overflow: 'hidden' }}>
      <Animated.Text style={[style, { transform: [{ translateX }], opacity }]}>
        {textList[sharedIndex]}
      </Animated.Text>
    </View>
  );
};

export default SlidingText;
