import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  title: string;
  color: string;
  progress: number; 
  size?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  title,
  color,
  progress,
  size = 100,
}) => {
  const strokeWidth = size * 0.1; 
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
 const arcCoverage = 0.75;
  const arcLength = circumference * arcCoverage;
  
  const progressValue = Math.max(0, Math.min(1, progress));
  const strokeDashoffset = arcLength * (1 - progressValue);
  
  
  return (
    <View style={styles.container}>
      <View style={[styles.circleContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F0F0F0"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
             strokeLinecap="round"
          />
          
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        
        <View style={styles.textContainer}>
          <Text style={[styles.percentageText, { fontSize: size * 0.2 }]}>
            {Math.round(progressValue * 100)}%
          </Text>
        </View>
      </View>
      
      <Text style={[styles.title, { fontSize: size * 0.133 }]}>
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    margin:4,
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontFamily: 'Nunito-Bold',
    color: '#000000',
    fontWeight: '700',
  },
  title: {
    position: 'absolute',
    bottom: 0,
    fontFamily: 'Nunito-SemiBold',
    color: '#000000',
    marginTop: 8,
    fontWeight: '600',
  },
});

export default CircularProgress;
