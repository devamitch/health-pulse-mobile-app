import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useAppTheme } from '../hooks/themeHook';
import { VitalIcon, VitalIconType } from '@/assets/svg/vitals-icon';

interface VitalCardProps {
  type: string;
  value: string | number;
  unit?: string | undefined;
  onPress: () => void;
  onAddPress: () => void;
}

export const VitalCard: React.FC<VitalCardProps> = ({
  type,
  value,
  unit,
  onPress,
  onAddPress,
}) => {
  const { Colors, DEffect } = useAppTheme();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: Colors.white,
          borderWidth: Colors?.isDark ? 1 : 0,
          borderColor: Colors?.isDark ? Colors.greyColor : 'transparent',
          ...DEffect,
        },
      ]}
      entering={FadeIn.duration(500)}
    >
      <View style={styles.innerContainer}>
        <TouchableOpacity onPress={onPress}>
          <VitalIcon vital={type as VitalIconType} height={65} width={65}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={onAddPress}>
          <Image
            source={require('../assets/icons/plus.png')}
            style={[styles.plusIcon, { tintColor: Colors.textColor }]}
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.typeText, { color: Colors.textColor }]}>{type}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.valueText, { color: Colors.textColor }]}>
          {value}
        </Text>
        {unit && (
          <Text style={[styles.unitText, { color: Colors.textColor }]}>
            {` ${unit}`}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '30%',
    borderRadius: 10,
    flexDirection: 'column',
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
  },
  icon: {
    height: 65,
    width: 65,
    resizeMode: 'contain',
  },
  plusIcon: {
    height: 15,
    width: 15,
    top: 8,
    marginLeft: 8,
    resizeMode: 'contain',
  },
  typeText: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    alignSelf: 'center',
    marginLeft: 10,
    letterSpacing: 0.7,
  },
  valueContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  valueText: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    alignSelf: 'center',
    letterSpacing: 0.7,
  },
  unitText: {
    fontSize: 10,
    fontFamily: 'Nunito-Bold',
    letterSpacing: 0.7,
  },
});
