import Svg, { Path } from 'react-native-svg';

interface PlanIconProps {
  width?: number;
  height?: number;
  size?: number;
  color?: string;
}

function PlanIcon({
  width,
  height,
  size = 20,
  color = '#ADB5BD',
  ...props
}: PlanIconProps) {
  const w = width || size;
  const h = height || size;

  return (
    <Svg width={w} height={h} viewBox="0 0 20 20" fill="none" {...props}>
      <Path
        d="M9.166 5h8.333M9.166 10h8.333M9.166 15h8.333"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Path
        d="M2.5 6.16s.833.543 1.25 1.339c0 0 1.25-3.125 2.917-4.167M2.5 15.327s.833.544 1.25 1.34c0 0 1.25-3.125 2.917-4.167"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default PlanIcon;
