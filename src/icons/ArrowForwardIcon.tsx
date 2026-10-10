import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ArrowForwardIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const ArrowForwardIcon: React.FC<ArrowForwardIconProps> = ({
  width = 24,
  height = 24,
  color = '#fff',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.5 18s6-4.419 6-6c0-1.581-6-6-6-6M5.5 18s6-4.419 6-6c0-1.581-6-6-6-6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default ArrowForwardIcon;
