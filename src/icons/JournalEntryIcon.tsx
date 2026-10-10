import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { SvgProps } from 'react-native-svg';

interface JournalEntryIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
}

const JournalEntryIcon: React.FC<JournalEntryIconProps> = ({
  width = 24,
  height = 24,
  color = '#111827',
  ...props
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M18 15V9c0-2.828 0-4.243-.879-5.121C16.243 3 14.828 3 12 3H8c-2.828 0-4.243 0-5.121.879C2 4.757 2 6.172 2 9v6c0 2.828 0 4.243.879 5.121C3.757 21 5.172 21 8 21h12M6 8h8M6 12h8M6 16h4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 8h1c1.414 0 2.121 0 2.56.44.44.439.44 1.146.44 2.56v8a2 2 0 11-4 0V8z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default JournalEntryIcon;
