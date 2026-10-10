import * as React from "react"
import Svg, { Path } from "react-native-svg"

interface ComparisonIconProps {
  width?: number;
  height?: number;
  color?: string;
}

function ComparisonIcon({ width = 24, height = 24, color = "#292524", ...props }: ComparisonIconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M19 17v-6c0-2.828 0-4.243-.879-5.121C17.243 5 15.828 5 13 5h-3m0 0c0-.7 1.994-2.008 2.5-2.5M10 5c0 .7 1.994 2.008 2.5 2.5M5 7.5v6c0 2.828 0 4.243.879 5.121.878.879 2.293.879 5.121.879h3m0 0c0 .7-1.994 2.009-2.5 2.5m2.5-2.5c0-.7-1.994-2.009-2.5-2.5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 21a2 2 0 100-4 2 2 0 000 4zM5 7a2 2 0 100-4 2 2 0 000 4z"
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  )
}

export default ComparisonIcon
