import React from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';

interface CircularProgressProps {
  progress: number; // 0-2 range (supports overflow up to 200%)
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showText?: boolean;
  textColor?: string;
  overflowColor?: string; // Color when progress > 1.0
  displayText?: string; // Custom text to display (e.g., "85/100 pts")
  showPercentage?: boolean; // Whether to show percentage or custom text
  hidePercentageSymbol?: boolean;
  arcCoverage?: number; // 0-1, default 1
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 80,
  strokeWidth = 8,
  color = '#007AFF',
  backgroundColor = '#E5E5E5',
  showText = true,
  textColor = '#333',
  overflowColor,
  displayText,
  showPercentage = true,
  hidePercentageSymbol = false,
  arcCoverage = 1,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const arcLength = circumference * arcCoverage;
  const gapLength = circumference - arcLength;
  const gapAngle = 360 * (1 - arcCoverage);
  const rotation = 90 + gapAngle / 2;

  // Clamp progress between 0 and 2 (200%)
  const clampedProgress = Math.max(0, Math.min(2, progress));

  // Check if we have overflow (progress > 1.0)
  const hasOverflow = clampedProgress > 1.0;
  const baseProgress = Math.min(clampedProgress, 1.0);
  const overflowProgress = hasOverflow ? clampedProgress - 1.0 : 0;

  // Calculate stroke lengths
  const baseStrokeLength = baseProgress * arcLength;
  const overflowStrokeLength = overflowProgress * arcLength;

  // Determine colors
  const baseColor = hasOverflow && overflowColor ? overflowColor : color;
  const displayOverflowColor = overflowColor || color;

  // Determine display text
  let textToDisplay = '';
  if (showText) {
    if (displayText) {
      textToDisplay = displayText;
    } else if (showPercentage) {
      const percentageValue = Math.round(clampedProgress * 100);
      textToDisplay = hidePercentageSymbol
        ? `${percentageValue}`
        : `${percentageValue}%`;
    }
  }


  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          {/* Gradient for overflow effect */}
          <LinearGradient
            id="overflowGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop
              offset="100%"
              stopColor={displayOverflowColor}
              stopOpacity="1"
            />
          </LinearGradient>
        </Defs>

        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={[arcLength, gapLength]}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
        />

        {/* Base Progress Circle (0-100%) */}
        {baseProgress > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={baseColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={[baseStrokeLength, circumference]}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
          />
        )}

        {/* Overflow Progress Circle (100-200%) - with gradient */}
        {hasOverflow && overflowProgress > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#overflowGradient)"
            strokeWidth={strokeWidth + 2}
            fill="transparent"
            strokeDasharray={[overflowStrokeLength, circumference]}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
            opacity={0.8}
          />
        )}

        {/* Text */}
        {showText && textToDisplay && (
          <SvgText
            x={size / 2}
            y={size / 2 + 18 / 3}
            fontSize={18}
            fontFamily="Open Sans"
            fontWeight="600"
            fill={hasOverflow && overflowColor ? overflowColor : textColor}
            textAnchor="middle"
          >
            {textToDisplay}
          </SvgText>
        )}
      </Svg>
    </View>
  );
};

export default CircularProgress;
