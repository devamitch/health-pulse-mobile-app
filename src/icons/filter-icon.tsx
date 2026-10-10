import Svg, { Path } from 'react-native-svg';

interface FilterIconProps {
  width?: number;
  height?: number;
  color?: string;
}

function FilterIcon({ width = 24, height = 24, color = '#000', ...props }: FilterIconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        d="M14 17H5M19 7h-9M17 20a3 3 0 100-6 3 3 0 000 6zM7 10a3 3 0 100-6 3 3 0 000 6z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default FilterIcon;
