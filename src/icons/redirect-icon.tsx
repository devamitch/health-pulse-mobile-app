import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface RedirectIconProps {
  width?: number;
  height?: number;
  color?: string;
}

function RedirectIcon({ width = 20, height = 20, color = '#fff', ...props }: RedirectIconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <Path
        d="M9.265 2.498a7.52 7.52 0 00-6.767 7.484 7.52 7.52 0 0015 .752M17.131 2.911l-7.924 7.971m7.924-7.97c-.411-.413-3.185-.375-3.771-.366m3.771.365c.412.413.374 3.19.365 3.777"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default RedirectIcon;
