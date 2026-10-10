import Svg, { Path } from 'react-native-svg';

interface HistoryIconProps {
  width?: number;
  height?: number;
  size?: number;
  color?: string;
}

function HistoryIcon({
  width,
  height,
  size = 20,
  color = '#ADB5BD',
  ...props
}: HistoryIconProps) {
  const w = width || size;
  const h = height || size;

  return (
    <Svg width={w} height={h} viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        d="M15.833 8.751v-.416c0-3.143 0-4.714-.976-5.69-.976-.977-2.548-.977-5.69-.977-3.143 0-4.714 0-5.69.976-.977.977-.977 2.548-.977 5.69v3.75c0 2.74 0 4.11.757 5.032.138.169.293.323.462.462.922.757 2.291.757 5.03.757M5.834 5.834h6.667M5.834 9.167h3.333"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15 15.415l-1.25-.458v-2.042M10 14.582a3.75 3.75 0 107.5 0 3.75 3.75 0 00-7.5 0z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default HistoryIcon;
