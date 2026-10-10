import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
import { SvgProps } from 'react-native-svg';

interface CameraUploadIconProps extends SvgProps {
  width?: number;
  height?: number;
  color?: string;
}

const CameraUploadIcon: React.FC<CameraUploadIconProps> = ({
  width = 24,
  height = 24,
  color = '#141B34',
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
        d="M22 7.499v8c0 2.828 0 4.242-.879 5.121-.878.879-2.293.879-5.121.879H8c-2.828 0-4.243 0-5.121-.879C2 19.741 2 18.327 2 15.5v-2.5c0-2.829 0-4.243.879-5.121.878-.88 2.293-.88 5.121-.88h.4c.626 0 .94 0 1.226-.087a2 2 0 00.539-.26c.248-.168.444-.413.835-.902.391-.49.587-.734.835-.903a2 2 0 01.539-.259A2.3 2.3 0 0113 4.5M16 5h5m-2.5 2.5v-5M5 10h2"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.531 14a4 4 0 11-8 0 4 4 0 018 0z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CameraUploadIcon;
