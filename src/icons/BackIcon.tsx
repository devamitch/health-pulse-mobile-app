import * as React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface BackIconProps {
  width?: number;
  height?: number;
  color?: string;
}

const BackIcon: React.FC<BackIconProps> = ({
  width = 32,
  height = 32,
  color = '#fff',
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
    >
      <Rect x={0.5} y={0.5} width={31} height={31} rx={11.5} stroke={color} />
      <Path
        d="M19 10s-6 4.419-6 6c0 1.581 6 6 6 6"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default BackIcon;
