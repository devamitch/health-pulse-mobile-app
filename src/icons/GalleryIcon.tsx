import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { SvgProps } from 'react-native-svg';

interface GalleryIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
}

const GalleryIcon: React.FC<GalleryIconProps> = ({
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
        d="M6 17.974c.129 1.309.42 2.19 1.077 2.847C8.256 22 10.154 22 13.949 22s5.693 0 6.872-1.18C22 19.643 22 17.745 22 13.95c0-3.795 0-5.693-1.18-6.872-.656-.657-1.537-.948-2.846-1.077"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M2 10c0-3.771 0-5.657 1.172-6.828C4.343 2 6.229 2 10 2c3.771 0 5.657 0 6.828 1.172C18 4.343 18 6.229 18 10c0 3.771 0 5.657-1.172 6.828C15.657 18 13.771 18 10 18c-3.771 0-5.657 0-6.828-1.172C2 15.657 2 13.771 2 10z"
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M2 11.118a14.608 14.608 0 011.872-.116c2.652-.049 5.239.674 7.3 2.04C13.081 14.31 14.424 16.053 15 18"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Path
        d="M13 7h.009"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default GalleryIcon;
