import { ColorScheme } from '@/constants/theme';
import { FONT_FAMILIES } from '@/constants/typography';
import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import CircularProgress from './CircularProgress';

export interface GoalProgressItem {
  label: string;
  progress: number;
  percentage: number;
  color: string;
  background: string;
  colorKey: string;
  gradientColors: string[];
  glowColor: string;
  onPress: () => void;
}

export interface GoalProgressCardProps {
  progressData: GoalProgressItem[];
  Colors: ColorScheme;
}

const GoalProgressCard: React.FC<GoalProgressCardProps> = React.memo(
  ({ progressData, Colors }) => {
    const screenWidth = useWindowDimensions().width;
    const itemWidth = screenWidth / 3.5;
    const circleSize = Math.min(itemWidth * 0.95, 110);

    const styles = useMemo(
      () => createStyles(Colors, circleSize),
      [Colors, circleSize],
    );

    if (progressData.length === 0) {
      return null;
    }

    return (
      <View style={styles.container}>
        {progressData.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            activeOpacity={0.7}
            style={styles.progressItem}
          >
            <CircularProgress
              progress={Math.max(0, Math.min(1, item.progress))}
              size={circleSize}
              strokeWidth={8}
              color={item.color}
              backgroundColor={
                Colors.isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(240, 240, 240, 1)'
              }
              showText={true}
              textColor={Colors.textColor}
              showPercentage={true}
              hidePercentageSymbol={false}
              arcCoverage={0.75}
            />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  },
);

const createStyles = (Colors: ColorScheme, circleSize: number) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      // paddingHorizontal: 8,
      paddingBottom: 16,
      alignItems: 'center',

      gap: 16,
    },
    progressItem: {
      alignItems: 'center',
      // flex: 1,
      marginBottom: 12,
    },
    label: {
      fontSize: 12.5,
      fontFamily: FONT_FAMILIES.nunitoSemiBold,
      color: Colors.textColor,
      textAlign: 'center',
      marginTop: -18,
    },
  });

export default GoalProgressCard;
